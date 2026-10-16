import pkg from 'xrpl';
import { readFileSync } from 'node:fs';
const { Client, Wallet } = pkg;
const VAULT_ID = JSON.parse(readFileSync('a4_state.json', 'utf8')).vaultId;
async function main() {
  const client = new Client('wss://s.devnet.rippletest.net:51233', { connectionTimeout: 30000 });
  await client.connect();
  try {
    const uni = Math.floor(Date.now() / 1000);
    const rip = uni - 946684800;
    const v = (await client.request({ command: 'ledger_entry', index: VAULT_ID, ledger_index: 'validated' })).result.node;
    console.log('VAULT_READ SUB ' + v.SubscriptionDate + ' REDEM ' + v.RedemptionDate + ' ASSETS ' + v.AssetsTotal);
    const lnid = process.argv[2];
    if (lnid) {
      const ln = (await client.request({ command: 'ledger_entry', index: lnid, ledger_index: 'validated' })).result.node;
      console.log('LOAN_RAW ' + JSON.stringify(ln));
    }
    // Schedule check: final payment = LoanSet_time + PaymentInterval * PaymentTotal
    // must be < RedemptionDate - 60 (tecNO_PERMISSION third cause).
    const INTERVAL = 2592000;
    const TOTAL = 4;
    console.log('OLD_SCHEDULE final_in_' + (INTERVAL * TOTAL) + 's buffer_ok ' + (rip + INTERVAL * TOTAL < v.RedemptionDate - 60));
    // Max TOTAL that fits for a given interval, at this moment:
    const maxTotal = Math.floor((v.RedemptionDate - 60 - rip) / INTERVAL);
    console.log('MAX_TOTAL_AT_INTERVAL_2592000 ' + maxTotal);
    // With validator MIN interval 60s: how much room?
    console.log('WINDOW_REMAINING_S ' + (v.RedemptionDate - rip) + ' BUFFER_S 60 USABLE_S ' + (v.RedemptionDate - 60 - rip));
    // Broker state on this vault (owner from a4_stage_loan.mjs wallet).
    const w = Wallet.fromSeed('sEd7RUB6CqScoQAfYckRXEjN9AYxiUj');
    const objs = (await client.request({ command: 'account_objects', account: w.classicAddress })).result.account_objects;
    for (const o of objs) {
      if (o.LedgerEntryType === 'LoanBroker' && o.VaultID === VAULT_ID) {
        console.log('BROKER_FOUND id=' + (o.index || '?') + ' DebtMaximum=' + o.DebtMaximum + ' CoverAvailable=' + o.CoverAvailable);
      }
      if (o.LedgerEntryType === 'Loan') {
        console.log('LOAN_FOUND id=' + (o.index || '?') + ' BrokerID=' + o.LoanBrokerID + ' Outstanding=' + String(o.TotalValueOutstanding ?? o.TotalAmountOutstanding ?? 'n/a'));
      }
    }
  } catch (e) { console.error('ERROR ' + (e && e.message ? e.message : e)); }
  finally { await client.disconnect(); }
}
main();