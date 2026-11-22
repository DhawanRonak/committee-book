# Committee Book

A shared ledger for committee, kitty and bhishi savings circles. Members record contributions, receivers confirm receipts, and everyone can follow the rotation and balances.

## Features

- Create a committee with 3–20 members, a monthly contribution and a first due date.
- Try an eight-member example without entering data.
- Record an external payment, confirm receipt as the receiver, or dispute a missing payment. Full confirmation opens the next round automatically.
- Follow the complete monthly timeline, request future-turn swaps and accept or decline as the other member. Conflicting requests are blocked and stale requests expire.
- View confirmed contributions, receipts, net balances and on-time rates.
- Switch member / organizer views, review rules and ledger activity, or reset the ledger.
- Browser persistence and a skippable four-step first-visit tour, reopened with **How it works**.
- Separate [research workspace](research.html) with five tasks, timing, interaction counts, ease ratings and CSV export. Research uses an isolated ledger.

## Run and test

No dependencies, framework or build step. Serve the folder:

```sh
python -m http.server 8080
```

Open `http://localhost:8080`. Research needs HTTP so its same-origin embedded ledger can communicate with the task runner.

```sh
node test/logic.test.mjs
node --check app.js
node --check research.js
```

Tests cover payment transitions, receiver guards, creation validation, month-end dates, balances, complete cycles and swap consent/conflicts/expiry. Logic remains usable with `require('./logic.js')` in Node.

## Deploy on Cloudflare Pages

Connect this repository to Pages. Select no framework, set build command to `exit 0`, and output directory to `/` (the repository root). Deploy the static files. There are no environment variables or API keys to configure.

## What is real and what is not

The ledger rules, local persistence, role-specific actions, research task checks and CSV downloads work. Example names and transactions are fictional. No money moves through the app; a recorded payment is a member’s claim until its receiver confirms it.

This version stores data only in the current browser. It has no server synchronization, invitations, authentication, bank verification, notifications or access control. The view switch lets one browser explore or record each role; it does not prove identity. Research data and ledgers can be lost if browser storage is cleared; results can be exported on the research page. On-time rates include confirmed payments only.

No AI endpoint is required or present. No legal review has been performed. The rules describe the ledger convention and do not establish legal compliance or member agreement. Product hypotheses and success metrics in [PRD.md](PRD.md) are proposals, not measured outcomes.

## Files

- `index.html`, `base.css`, `app.js`: product interface and tour.
- `logic.js`: pure ledger functions.
- `research.html`, `research.js`: isolated usability tasks and CSV export.
- `test/logic.test.mjs`: Node assertions.
- `PRD.md`: requirements, hypotheses and research plan.

## Verification

The Node logic suite and JavaScript syntax checks pass. Static files were served locally and checked over HTTP. Browser rendering and interactive checks at 375px and 1280px could not be completed in this environment: Playwright is not installed and the browser host is unavailable. Responsive styles target those widths, but visual verification remains outstanding.
