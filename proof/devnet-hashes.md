# Devnet Integration Test Hashes — Chamber B2

**Run date:** 2026-10-21  
**Network:** Devnet (wss://s.devnet.rippletest.net:51233)  
**Status:** Integration tests could not complete — Devnet endpoint unreachable in this environment

The integration test suite was prepared and is structurally complete:
- `tests/integration/vault.integration.test.ts` — VaultCreate on Devnet
- `tests/integration/broker.integration.test.ts` — LoanBrokerSet on Devnet
- `tests/integration/loan.integration.test.ts` — createLoan with schedule fit on Devnet
- `tests/integration/client.integration.test.ts` — Devnet connection and payment
- `tests/integration/wallet.integration.test.ts` — Wallet from seed on Devnet

**Test infrastructure:** Vitest (@vitest/coverage-v8) configured, test script `vitest run` in package.json

**What was attempted:**
- All 5 integration tests were reviewed — each connects to Devnet, autofills builder envelopes, signs with Devnet-funded test seeds, submits and waits for results, and asserts `tesSUCCESS` or appropriate meta validation.

**Why no hashes:**
- Devnet endpoint `wss://s.devnet.rippletest.net:51233` is not accessible from this environment. All tests timeout when attempting to connect.
- The test seeds (`sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcdcefg`, `sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcd2`) are well-known Devnet-funded accounts, but cannot be used without a reachable Devnet node.

**Test count:** 5 test files, 25 individual `it()` blocks across all integration tests.

**Proof folder location:** `proof/devnet-hashes.md`

---

*This chamber (B2) documents the integration test infrastructure prepared for XLS-66 lifecycle proof on Devnet. The actual Devnet run could not be completed due to network limitations. Chamber B3 (The Video Script) will address video documentation of the full lifecycle.*