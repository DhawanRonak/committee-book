# PRD: Committee Book — a shared ledger for savings circles

Author: Ronak Dhawan · Status: concept, pre-research, no legal review · Last updated: 16 Nov 2026
Product area this maps to: groups inside a UPI payment app (for example Google Pay). Independent concept, fictional people, no company branding.

## 1. Problem
Across India, neighbours, colleagues and relatives run rotating savings circles, known as a committee, kitty or bhishi. Each month every member puts in a fixed amount and one member takes the pot, until everyone has had a turn. It is how many households fund a wedding, a fee or a deposit without a loan.

These circles run on a WhatsApp group, UPI screenshots and one organiser's notebook. That creates three recurring problems:
1. **"Did you pay?"** Proof is a forwarded screenshot, and the organiser chases people one by one.
2. **Nobody can see the whole picture.** A member who received the pot early still owes the group for months. That exposure sits in one person's notebook.
3. **Disputes are personal.** Whose turn it is, who was late and who swapped depends on memory.

Payment apps already have groups, but for a different job: Google Pay's group feature splits a one-off bill and requests money for it. It has no recurring cycle, no rotation and no receiver confirmation.

Source: https://support.google.com/pay/india/answer/11420982

## 2. Who it is for
- Organiser: usually one trusted person who starts the circle and carries the social risk.
- Members: 6–20 people who know each other, paying ₹500–₹10,000 a month.

## 3. Hypotheses (to be tested)
- H1. The organiser's biggest cost is chasing and proving payments, not collecting money.
- H2. Members will accept a shared ledger only if the app never holds the money.
- H3. Showing who is "ahead" (has received more than paid in) raises trust and does not embarrass people. This could be wrong, and matters most.
- H4. Late payment visible to the whole group is a stronger nudge than a reminder.

## 4. Principles
1. **A ledger, not a wallet.** Each member pays the month's receiver directly by UPI. The product records and confirms; it never pools or holds funds.
2. **Two-sided proof.** A payment counts only when the receiver confirms it.
3. **Same ledger for everyone.** No member, including the organiser, sees more than another.
4. **Rules agreed up front**, shown inside the group, never enforced by the app.

## 5. Features (all in the prototype)
- **This month**: who receives, how much is confirmed, each member's status (not paid, paid awaiting confirmation, received).
- **Pay** the receiver directly; **receiver confirms** or marks "not received", which returns it to unpaid and tells the payer.
- **Organiser reminder** to everyone still unpaid, in one tap.
- **Turns**: the full order; a member can ask another to swap future turns, and the swap happens only if the other agrees.
- **Standing**: for every member, amount put in, amount received, ahead or behind, and on-time rate.
- **Rules** page.
- Undo on every action.

## 6. Requirements
P0: create a circle (members, amount, order); monthly round opens automatically when the last one is fully confirmed; pay, confirm, dispute; standing table; turn swaps with consent; reminders.
P1: draw the order at random with everyone watching; payment auto-matched from the UPI transaction so confirmation is one tap; exit rules when someone leaves.
P2: exportable history as proof of a savings habit.

## 7. Success metrics
- North star: circles that complete a full cycle with every month fully confirmed.
- Activation: share of members who confirm or pay in the app in month one.
- Efficiency: hours from due date to fully confirmed; reminders sent per month.
- Guardrails: disputes per 100 payments; members who leave mid-cycle.

## 8. Usability test (built in)
Five tasks, each as a different member: pay this month; confirm a payment as receiver; find your turn; ask to swap turns; find who is ahead of the group. Success is checked from the ledger; time, taps and a 1–7 ease rating are recorded and exported.

## 9. Risks (this section matters more than usual)
- **Law and regulation.** Rotating savings schemes can fall under India's chit-fund laws, and some money-circulation schemes are banned. This concept has had no legal review, and I am not a lawyer. The design choices that reduce risk are: no pooled money, no interest, no bidding, no commission, closed groups of people who know each other. A real product would need legal sign-off before any launch, and may need to cap group size and amount.
- **Fraud.** A stranger-run circle is a classic scam. Mitigation: invite-only among existing contacts; no public discovery; warnings when an organiser runs many circles.
- **Default after receiving.** The app cannot recover money. Mitigation: the standing view makes exposure visible before it happens; the rules are explicit.
- **Social harm from public lateness.** Mitigation: test H3 and H4 carefully; consider showing lateness only after a grace period.

## 10. Open questions
- Should the receiver also contribute in their own month? (Here they do not; many circles differ.)
- Fixed order, lucky draw, or need-based?
- What should happen in the product when someone misses two months?

## 11. Research script (20 minutes, people who are in a circle today)
1. Walk me through last month in your committee. Who paid when? How did the organiser know?
2. Has there ever been a disagreement? What was it about?
3. (Show the Standing tab.) How would your group react to seeing this?
4. Would you use this if the app held the money? If it did not?
5. What rule does your group have that this does not?

## Implementation update — 22 November 2026

The shipped static app supports local committee creation (3–20 members), an explicit example loader, four-step guided onboarding, browser persistence and reset. Monthly dates are based on the first due date, clamped at month end. The receiver does not contribute during their own round.

Payment actions record an external payment claim; they do not initiate UPI transfers. Only the selected receiver can confirm or dispute in the interface. Organizer view selects the organizer identity; everyone can inspect the same ledger. View switching is a local interaction model with no authentication or shared server storage.

Future-turn swaps require recipient consent. Requests involving either participant cannot overlap and expire when a turn becomes current. On-time percentages use confirmed contributions only. Completion retains the final round, timeline and standings.

Research tasks and CSV export now live on `research.html`, using a separate example ledger and local results. Navigation tasks detect opening the relevant section, not comprehension. There is no messaging service, so simulated reminder delivery has been removed. Universal undo is no longer promised; creation/replacement and reset have explicit confirmation dialogs. Activity records payment and swap changes. This update supersedes the earlier prototype feature and reminder/undo claims above.
