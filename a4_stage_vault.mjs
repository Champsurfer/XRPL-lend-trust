import pkg from 'xrpl';
const { Client, Wallet } = pkg;
// Fresh vault per ruling: 1-hour Redemption window instead of 30 minutes,
// so the loan schedule can fit with the 60s buffer (tecNO_PERMISSION cause 3).
// SUB must be AHEAD of the parent ledger's close time at validation or
// VaultCreate returns tecEXPIRED (xrpl.org VaultCreate Error Cases) —
// +60s covers autofill + submit latency (~6s observed on Devnet).
const SUB = Math.floor(Date.now() / 1000) - 946684800 + 60;
const REDEM = SUB + 3600; // one hour
async function main() {
  const client = new Client('wss://s.devnet.rippletest.net:51233', { connectionTimeout: 30000 });
  await client.connect();
  try {
    const w = Wallet.fromSeed('sEd7RUB6CqScoQAfYckRXEjN9AYxiUj');
    console.log('SUB ' + SUB + ' REDEM ' + REDEM);
    const tx = { TransactionType: 'VaultCreate', Account: w.classicAddress, Asset: { currency: 'XRP' }, VaultKind: 1, SubscriptionDate: SUB, RedemptionDate: REDEM };
    const prep = await client.autofill(tx);
    const res = await client.submitAndWait(w.sign(prep).tx_blob);
    const meta = res.result.meta;
    console.log('VAULT_ENGINE ' + meta.TransactionResult);
    console.log('VAULT_HASH ' + res.result.hash);
    console.log('VAULT_URL https://devnet.xrpl.org/transactions/' + res.result.hash);
    let vid = '';
    for (const n of (meta.AffectedNodes || [])) { const c = n.CreatedNode; if (c && c.LedgerEntryType === 'Vault' && c.LedgerIndex) { vid = c.LedgerIndex; break; } }
    console.log('VAULT_ID ' + vid);
    if (meta.TransactionResult !== 'tesSUCCESS' || !vid) throw new Error('vault create not validated');
    // Persist immediately — if a later step times out, the id survives.
    const { writeFileSync } = await import('node:fs');
    writeFileSync('a4_state.json', JSON.stringify({ vaultId: vid, sub: SUB, redem: REDEM, createdAt: new Date().toISOString() }, null, 2));
    console.log('STATE_WRITTEN a4_state.json INVEST_AT_R ' + SUB);
    const dep = { TransactionType: 'VaultDeposit', Account: w.classicAddress, VaultID: vid, Amount: '10000000' };
    const dprep = await client.autofill(dep);
    const dres = await client.submitAndWait(w.sign(dprep).tx_blob);
    console.log('DEP_ENGINE ' + dres.result.meta.TransactionResult);
    console.log('DEP_HASH ' + dres.result.hash);
    console.log('DEP_URL https://devnet.xrpl.org/transactions/' + dres.result.hash);
    const chk = await client.request({ command: 'ledger_entry', index: vid, ledger_index: 'validated' });
    console.log('ASSETS_TOTAL ' + (chk.result.node.AssetsTotal || 'missing') + ' AVAIL ' + (chk.result.node.AssetsAvailable || 'missing'));
    console.log('A4_STAGE VAULT_DEPOSIT_DONE NEWVID ' + vid);
  } catch (e) { console.error('ERROR ' + (e && e.message ? e.message : e)); }
  finally { await client.disconnect(); }
}
main();