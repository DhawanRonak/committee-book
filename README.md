# Committee Book

**A shared ledger for committee, kitty and bhishi savings circles.**

> Independent concept prototype for a product-management case study. Not affiliated with any company; all data is made up.

**Live demo:** _add your `pages.dev` link here after deploying_  
**Product spec:** [PRD.md](PRD.md)

## The problem

Rotating savings circles run on a WhatsApp group, UPI screenshots and one organiser's notebook. Committee Book is a ledger, not a wallet: each member pays the month's receiver directly, the receiver confirms, and everyone sees the same picture of who has paid, whose turn is next, and who has received more than they have put in so far.

## What the prototype does

- This month: who receives, what is confirmed, each member's status; pay, confirm, or mark not received.
- Turns, with swaps that need the other member's consent and only for future turns.
- Standing: put in, received, ahead or behind, and on-time rate for every member.
- Organiser reminders, a rules page, and undo on every action.
- Built-in usability test: five tasks, each as a different member, with success checked from the ledger and CSV export.

## Run it

No build step and no dependencies. Open `index.html` in a browser.

Tests need Node 18 or later:

```
node test/logic.test.mjs
```

## Deploy (Cloudflare Pages, free)

1. In the [Cloudflare dashboard](https://dash.cloudflare.com), go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repository.
2. Build settings: framework preset **None**, build command `exit 0`, build output directory `/`. Save and deploy.
3. You get a link like `committee-book.pages.dev`. Every push to `main` redeploys automatically.

Then paste the live link at the top of this README.

## Files

| File | What it is |
|---|---|
| `logic.js` | Rounds, payments, swaps and standing (pure functions; all people fictional) |
| `index.html` | The prototype and usability test |
| `test/logic.test.mjs` | Logic tests |
| `PRD.md` | Product requirements: problem, hypotheses, requirements, metrics, evaluation plan, risks |
| `base.css` | Shared styles |

## What is real and what is not

- People and amounts are made up, and no money moves.
- **No legal review.** Rotating savings schemes can fall under India's chit-fund laws. The design avoids pooled money, interest, bidding and commission, but a real product would need legal sign-off first. See the PRD's risks section.

## Author

Ronak Dhawan · product management portfolio
