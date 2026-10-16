import pkg from 'xrpl';
import { readFileSync, writeFileSync } from 'node:fs';
const { Client, Wallet, LoanPayFlags, signLoanSetByCounterparty } = pkg;

// Staged, resumable A4 runner. Usage: node a4_stage_loan.mjs [broker|loan|all]
// Each stage stays under the 30s command timeout (max 2 transactions).
// Every step is idempotent: re-running resumes from on-ledger truth.
const STAGE = process.argv[2] || 'all';
const STATE_FILE = 'a4_state.json';

function loadState() { return JSON.parse(readFileSync(STATE_FILE, 'utf8')); }
function saveState(patch) { writeFileSync(STATE_FILE, JSON.stringify({ ...loadState(), ...patch }, null, 2)); }

async function main() {
  const state = loadState();
  const VAULT_ID = state.vaultId;
  if (!VAULT_ID) throw new Error('a4_state.json has no vaultId — run a4_stage_vault.mjs first');
  const client = new Client('wss://s.devnet.rippletest.net:51233', { connectionTimeout: 30000 });
  await client.connect();
  try {
    const w = Wallet.fromSeed('sEd7RUB6CqScoQAfYckRXEjN9AYxiUj');
    const bw = Wallet.fromSeed('sEd7osubCSfbHvwNSTrhiFVYz8ukQnf');
    const v = (await client.request({ command: 'ledger_entry', index: VAULT_ID, ledger_index: 'validated' })).result.node;
    const rip = Math.floor(Date.now() / 1000) - 946684800;
    console.log('VAULT ' + VAULT_ID + ' NOW_R ' + rip + ' SUB ' + v.SubscriptionDate + ' REDEM ' + v.RedemptionDate + ' ASSETS ' + v.AssetsTotal);
    if (rip < v.SubscriptionDate) { console.log('RETRY_AFTER ' + (v.SubscriptionDate - rip) + ' (investment phase opens then)'); process.exit(7); }
    if (rip >= v.RedemptionDate) throw new Error('vault past RedemptionDate — new vault needed');

    const findBroker = async () => {
      const objs = (await client.request({ command: 'account_objects', account: w.classicAddress })).result.account_objects;
      for (const o of objs) { if (o.LedgerEntryType === 'LoanBroker' && o.VaultID === VAULT_ID) return o; }
      return null;
    };

    // ---- stage: broker (LoanBrokerSet + cover, idempotent) ----
    if (STAGE === 'broker' || STAGE === 'all') {
      let b = await findBroker();
      let bid = b ? (b.index || '') : '';
      if (b) {
        console.log('BROKER_REUSE ' + bid + ' DEBT_MAX ' + b.DebtMaximum + ' COVER ' + b.CoverAvailable);
      } else {
        const setTx = { TransactionType: 'LoanBrokerSet', Account: w.classicAddress, VaultID: VAULT_ID, DebtMaximum: '10000000' };
        const sres = await client.submitAndWait(w.sign((await client.autofill(setTx))).tx_blob);
        console.log('BRK_ENGINE ' + sres.result.meta.TransactionResult + ' BRK_HASH ' + sres.result.hash);
        if (sres.result.meta.TransactionResult !== 'tesSUCCESS') throw new Error('broker set failed');
        for (const n of (sres.result.meta.AffectedNodes || [])) { const c = n.CreatedNode; if (c && c.LedgerEntryType === 'LoanBroker' && c.LedgerIndex) { bid = c.LedgerIndex; break; } }
        console.log('BROKER_ID ' + bid);
      }
      if (!bid) throw new Error('no broker id for vault');
      b = b || (await findBroker());
      if (Number(b.CoverAvailable || 0) < 1000000) {
        const cov = { TransactionType: 'LoanBrokerCoverDeposit', Account: w.classicAddress, LoanBrokerID: bid, Amount: '1000000' };
        const cres = await client.submitAndWait(w.sign((await client.autofill(cov))).tx_blob);
        console.log('COV_ENGINE ' + cres.result.meta.TransactionResult + ' COV_HASH ' + cres.result.hash);
        if (cres.result.meta.TransactionResult !== 'tesSUCCESS') throw new Error('cover deposit failed');
      } else { console.log('COVER_OK ' + b.CoverAvailable); }
      saveState({ brokerId: bid });
      console.log('STAGE_BROKER_DONE');
      if (STAGE === 'broker') return;
    }
    // ---- stage: loan (fit + LoanSet + LoanPay, idempotent) ----
    if (STAGE === 'loan' || STAGE === 'all') {
      const fresh = loadState();
      const bid = fresh.brokerId || (await findBroker())?.index;
      if (!bid) throw new Error('no broker — run broker stage first');

      // Existing loan for this broker? (Borrower owns the Loan owner node.)
      let lid = fresh.loanId || '';
      if (!lid) {
        const bobjs = (await client.request({ command: 'account_objects', account: bw.classicAddress })).result.account_objects;
        for (const o of bobjs) { if (o.LedgerEntryType === 'Loan' && o.LoanBrokerID === bid) { lid = o.index || ''; break; } }
      }

      // SCHEDULE FIT — tecNO_PERMISSION cause 3 (xrpl.org + PR #8151):
      // finalPayment = start + interval * total must satisfy
      // finalPayment + 60 <= RedemptionDate. Shorten term first, then
      // interval (validator MIN 60); GracePeriod <= PaymentInterval.
      const guard = 60;
      const usable = v.RedemptionDate - 60 - rip - guard;
      let interval = 2592000;
      let total = 4;
      if (rip + guard + interval * total >= v.RedemptionDate - 60) {
        const maxTotal = Math.floor(usable / interval);
        if (maxTotal >= 1) {
          total = Math.min(total, maxTotal);
        } else {
          interval = Math.floor(usable / Math.max(total, 1));
          if (interval < 60) { interval = 60; total = Math.floor(usable / 60); }
          if (interval < 60 || total < 1) throw new Error('window too short for any legal schedule — new vault needed');
          if (total > 4) total = 4;
        }
      }
      const grace = Math.min(86400, interval);
      console.log('SCHEDULE interval ' + interval + ' total ' + total + ' grace ' + grace + ' final_in_s ' + (interval * total) + ' fits ' + (rip + guard + interval * total <= v.RedemptionDate - 60));

      if (!lid) {
        const base = { TransactionType: 'LoanSet', Account: w.classicAddress, LoanBrokerID: bid, PrincipalRequested: '1000000', Counterparty: bw.classicAddress, InterestRate: 500, PaymentTotal: total, PaymentInterval: interval, GracePeriod: grace };
        const cps = signLoanSetByCounterparty(bw, w.sign((await client.autofill(base))).tx_blob);
        const lres = await client.submitAndWait(cps.tx_blob);
        console.log('SET_ENGINE ' + lres.result.meta.TransactionResult + ' SET_HASH ' + lres.result.hash);
        if (lres.result.meta.TransactionResult !== 'tesSUCCESS') throw new Error('LoanSet failed: ' + lres.result.meta.TransactionResult);
        for (const n of (lres.result.meta.AffectedNodes || [])) { const c = n.CreatedNode; if (c && c.LedgerEntryType === 'Loan' && c.LedgerIndex) { lid = c.LedgerIndex; break; } }
        console.log('LOAN_ID ' + lid);
        saveState({ loanId: lid, setHash: lres.result.hash, schedule: { interval, total, grace } });
      } else {
        console.log('LOAN_REUSE ' + lid);
      }

      // Full payoff — skip if already settled.
      const ln = (await client.request({ command: 'ledger_entry', index: lid, ledger_index: 'validated' })).result.node;
      const out = String(ln.TotalValueOutstanding ?? ln.TotalAmountOutstanding ?? '0');
      if (Number(out) > 0) {
        const pres = await client.submitAndWait(bw.sign(await client.autofill({ TransactionType: 'LoanPay', Account: bw.classicAddress, LoanID: lid, Amount: out, Flags: LoanPayFlags.tfLoanFullPayment })).tx_blob);
        console.log('PAY_ENGINE ' + pres.result.meta.TransactionResult + ' PAY_HASH ' + pres.result.hash);
        if (pres.result.meta.TransactionResult !== 'tesSUCCESS') throw new Error('LoanPay failed');
        saveState({ payHash: pres.result.hash });
      } else { console.log('PAY_SKIP already settled'); }
      console.log('A4_DONE LOAN ' + lid + ' BROKER ' + bid);
    }
  } catch (e) { console.error('ERROR ' + (e && e.message ? e.message : e)); process.exitCode = 1; }
  finally { await client.disconnect(); }
}
main();