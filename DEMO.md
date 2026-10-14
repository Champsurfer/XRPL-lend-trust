# XRPLendTrust — Demo Video Plan

This is the script, storyboard, shot list, and production order for a short
demo video of XRPLendTrust. It is written for the person who will record and
edit the video. It assumes no video experience. Every step is something a
first-time recorder can do with free tools already on a Windows PC.

## Purpose

This demo shows judges and reviewers what XRPLendTrust is: a working
integration for the XRP Ledger Lending Protocol, running end to end on the
XRPL Devnet with real transactions and live ledger state. It is a proof, not
a pitch. A viewer should finish the video able to clone the repo and verify
every transaction hash for themselves.

## Length

2 to 3 minutes. Hard ceiling: 3:00. Read the voiceover calmly; it is about
two minutes and fifteen seconds of speaking, with the rest of the time given
to live screen actions and quiet moments.

## The Voiceover Script

Read this aloud, one paragraph per segment. Word counts and timing are at
130 words per minute (a calm pace).

### Segment 1 — INTRO (0:00–0:20) — 44 words
This is XRPLendTrust. It is a working integration for the XRP Ledger
Lending Protocol — vaults, loan brokers, loans, and settlement, running end
to end on the XRPL Devnet. It is built for the Lending and Borrowing track
of the AI and Fintech XRPL Hackathon.

### Segment 2 — THE PROBLEM (0:20–0:40) — 46 words
Why does this matter? The XRP Ledger Lending Protocol — XLS-65 and XLS-66 —
is the first native, uncollateralized credit rail on a public blockchain. It
is in validator voting now, before the amendments go live. When it
activates, anyone can lend and borrow on-chain, without a bank.

### Segment 3 — THE DEMO (0:40–1:50) — 104 words
Here it is running. I connect to the XRPL Devnet and read the current ledger
state. I open a single-asset vault and fund it, and the vault balance
updates from the ledger, not from a local guess. Next I create a loan broker
with first-loss capital. A borrower requests a loan; both signatures are
written on-chain. The borrower repays; the loan pays down and closes clean.
Every step returns a real transaction hash. Watch this one — I copy the
hash, open devnet.xrpl.org, paste it in, and the explorer confirms it
Validated. Nothing here is mocked. Every state on screen is read live from
Devnet.

### Segment 4 — THE PROOF (1:50–2:30) — 52 words
The whole system is open. This is the public repo on GitHub. The README
explains what it is. The architecture document shows how it works. The
testing guide shows how to verify it. And in the proof folder, every Devnet
transaction hash is listed. Clone it. Run it. Verify every hash yourself.

### Segment 5 — CLOSE (2:30–3:00) — 47 words
Trust, on the ledger. XRPLendTrust is a working proof of the XRP Ledger
Lending Protocol, built in South Africa for the AI and Fintech XRPL
Hackathon, Lending and Borrowing track. The repo is on GitHub. Clone it. Run
it. Verify every hash yourself. I'm Warren. Thank you.

**Script totals:** 293 words. At 130 words per minute that is about 135
seconds (2:15) of speaking, which leaves room inside the 2–3 minute window
for live screen actions and short pauses.

## The Storyboard

One row per beat. Read down the list. Time, what is on screen, what you say
(or "silence"), and the tool that makes that beat.

1. 0:00–0:08 — Title card: "XRPLendTrust" with the subtitle "Trust, on the
   ledger." on a dark background. — Voiceover reads Segment 1, first half.
   Tool: title-card image (Google Flow/Veo 3.1 still, or a plain text card
   made in Clipchamp).

2. 0:08–0:20 — The app home screen, running against Devnet. — Voiceover
   reads Segment 1, second half (what it is, which track). Tool: screen
   recording.

3. 0:20–0:40 — A short text overlay naming the protocol: "XLS-65 + XLS-66 —
   in validator voting." Then back to the app. — Voiceover reads Segment 2.
   Tool: screen recording plus a text overlay in the editor.

4. 0:40–1:10 — Screen recording: connect to Devnet, open a vault, fund it,
   the balance updates live. — Voiceover reads Segment 3, first half; leave
   gaps of silence while the numbers change on screen. Tool: screen
   recording.

5. 1:10–1:35 — Screen recording: create a loan broker, write a loan, repay
   it, watch the loan close. Transaction hashes appear as each step settles.
   — Voiceover reads Segment 3, middle. Tool: screen recording.

6. 1:35–1:50 — Screen recording: copy a transaction hash, open
   devnet.xrpl.org in a browser, paste the hash, the explorer shows
   "Validated." — Voiceover reads Segment 3, final lines ("Nothing here is
   mocked..."). Tool: screen recording plus a browser window.

7. 1:50–2:30 — Browser on the public GitHub repo: README, then
   ARCHITECTURE, then TESTING, then the proof folder listing the Devnet
   hashes. — Voiceover reads Segment 4. Tool: screen recording of the
   browser.

8. 2:30–3:00 — Closing title card: the tagline "Trust, on the ledger," the
   repo URL, your first name, South Africa, and the challenge name. —
   Voiceover reads Segment 5, then silence for the last two seconds. Tool:
   closing title card made in the editor.


## The Shot List

Record these in order. Do each one as a single clean take. If a take fails,
redo just that shot — you do not need to start over.

1. App: connect to Devnet and open/fund a vault.
   - Window layout: one screen, app window fills most of it. Close extra
     apps and turn notifications off first.
   - Test data: XRPL Devnet; a fresh Devnet wallet funded from the faucet;
     one single-asset vault; a small deposit.
   - Expected outcome: the vault balance appears and updates on screen.
   - Fallback: if the vault will not fund, restart the app and reconnect to
     Devnet; if it still fails, fund the wallet from the Devnet faucet in a
     browser and show that confirmation instead.

2. App: create a loan broker, write a loan, repay it, watch it close.
   - Window layout: same single screen as Shot 1.
   - Test data: a loan broker with first-loss capital; one borrower loan;
     one repayment.
   - Expected outcome: the loan moves through request, signature, and
     repayment, and ends closed, with a transaction hash shown at each step.
   - Fallback: if a step stalls, keep recording and narrate the state; the
     closing beat still proves the ledger is real. Re-shoot only the failed
     click if needed.

3. Explorer: paste a transaction hash into devnet.xrpl.org.
   - Window layout: single screen. Copy the hash from the app, then bring
     the browser to the front and paste.
   - Test data: a real Devnet transaction hash from Shot 2.
   - Expected outcome: the explorer opens the transaction and shows
     "Validated."
   - Fallback: if the page is slow, wait for the Validated result on camera;
     if a hash does not validate, use an earlier hash from the same run that
     does.

4. Browser: open the public GitHub repo and walk through it.
   - Window layout: single screen, browser full width.
   - Test data: the repo URL; the README, ARCHITECTURE.md, TESTING.md, and
     the proof folder with the Devnet hashes.
   - Expected outcome: each file opens and scrolls so a viewer can read the
     headings and see the hash list.
   - Fallback: if a file is missing on the day, open the README and the
     proof folder at minimum; narrate that the rest is in the repo.


## The Production Order

Follow these steps in order. Each step names its tool.

- Step 1 — Record the app demo. Use Windows Game Bar (press Win+Alt+R) or
  OBS Studio (free). Record Shots 1, 2, and 3 in one sitting.

- Step 2 — Record the proof browser session. Same recorder. Record Shot 4:
  the GitHub repo, README, ARCHITECTURE.md, TESTING.md, and the proof folder.

- Step 3 — Make the title card and the closing card. One or two images only.
  Use Google Flow with Veo 3.1 (free tier), or just build a plain dark text
  card inside the editor. AI tools make the cards only — never the demo.

- Step 4 — Record the voiceover. Read the script into your phone voice-memo
  app or your laptop microphone, in a quiet room. One paragraph per take is
  fine; you will trim them together in the editor.

- Step 5 — Edit. Use Clipchamp (built into Windows 11) or DaVinci Resolve
  (free). Lay the clips in storyboard order, drop the voiceover on the audio
  track, add the title card at the start, the text overlay in Segment 2, and
  the closing card at the end.

- Step 6 — Export. Export at 1080p, H.264, under 200 MB.

- Step 7 — Upload. Upload to YouTube as Unlisted. Title it "XRPLendTrust —
  AI & Fintech XRPL Hackathon Submission."

- Step 8 — Link it. Paste the YouTube URL into README.md (in the Demo
  section) and into the hackathon submission form.


## The Tool Notes

Why these tools, and nothing more:

- Screen recording: Windows Game Bar (already on Windows — press Win+G to
  open, Win+Alt+R to record) or OBS Studio (free). No install if you use
  Game Bar.

- Title cards: Google Flow with Veo 3.1 on the free tier makes one or two
  still images a day. Use it for the opening and closing cards only. Backup:
  make a plain dark card with text in the editor — that needs no AI tool at
  all.

- Voiceover: any phone voice-memo app, or the laptop's built-in microphone.
  A quiet room matters more than a good mic. No studio needed.

- Editing: Clipchamp, already on Windows 11. If it is not there, DaVinci
  Resolve free is the backup. Keep edits simple: cut, order, voiceover, two
  cards, one overlay.

- Upload: YouTube, set to Unlisted, exported at 1080p H.264.

## Honest Notes

What this plan assumes, what could go wrong, and the fallback.

- It assumes the XRPLendTrust app builds and runs against Devnet on the day.
  Record against Devnet, never Mainnet. No real funds, ever.

- It assumes the Lending Protocol is live on Devnet. It is, today. If a
  Devnet endpoint is down on the day, retry; if it stays down, pause and
  record once it is back — do not fake anything on camera.

- The single biggest risk is a transaction that will not settle during the
  recording. The fallback is Shot 3: even if the full lifecycle is not
  perfect on camera, one real Devnet hash shown Validated in the explorer is
  the proof. One true hash beats a flawless mock.

- If the demo cannot be recorded live at all, the honest fallback is to
  record whatever runs (even a single vault open), show the repo and the
  proof folder of Devnet hashes, and say plainly in the voiceover what was
  captured. Do not present a simulation as a live run.

- The demo shown here is the XRPLendTrust lending lifecycle — vault, broker,
  loan, pay — plus a Devnet hash in the explorer. If you also want to show
  the separate CaptureDesk downloader (paste URL, choose 720p MP4, download
  to a captures folder), that is a different app and belongs in its own
  short video, not this one.

- Location shown is "South Africa," taken from the project README. Replace
  it with your city if you prefer. No email, phone, or address appears in
  this plan or in the video — keep it that way.

