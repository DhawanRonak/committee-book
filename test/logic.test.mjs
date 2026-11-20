// node test/logic.test.mjs
import { createRequire } from 'module'; import assert from 'assert'; const require = createRequire(import.meta.url);
const C = require('../logic.js'); let s = C.seed();
assert.equal(C.pot(s), 14000); let sum = C.summary(s);
assert.deepEqual([sum.confirmed, sum.awaiting, sum.pending], [[1, 2, 8], [5], [3, 6, 7]]); assert.equal(sum.collected, 6000);
const st = Object.fromEntries(C.standing(s).map(x => [x.name, x]));
assert.equal(st.Asha.received, 14000); assert.equal(st.Asha.paidIn, 6000); assert.equal(st.Asha.net, 8000); // received early, still owes later months
assert.equal(st.Deepa.net, -8000); assert.equal(st.Sunil.onTime, 50); assert.equal(st.Farah.received, 6000);
// pay -> confirm; a payment counts only after the receiver confirms
let t = C.pay(s, 3); assert.equal(C.round(t).pay[3].status, 'paid'); assert.equal(C.summary(t).collected, 6000);
t = C.confirm(t, 3); assert.equal(C.summary(t).collected, 8000);
assert.equal(C.confirm(s, 6), s); // cannot confirm someone who has not paid
t = C.dispute(C.pay(s, 6), 6); assert.equal(C.round(t).pay[6].status, 'pending'); assert.ok(C.round(t).pay[6].disputed);
// round closes and the next opens when everyone is confirmed
t = s; for (const id of [3, 6, 7]) t = C.pay(t, id); for (const id of [3, 5, 6, 7]) t = C.confirm(t, id);
assert.equal(t.current, 5); assert.equal(C.round(t).receiver, 5); assert.equal(C.summary(t).pending.length, 7);
// swaps: only future turns, only with consent
assert.ok(!C.canSwap(s, 6, 4)); assert.ok(!C.canSwap(s, 2, 6)); assert.ok(C.canSwap(s, 6, 5));
t = C.requestSwap(s, 6, 5); assert.equal(t.swaps[0].status, 'pending'); assert.deepEqual(t.order, s.order);
const yes = C.answerSwap(t, 1, true); assert.equal(C.turnOf(yes, 6), 5); assert.equal(C.turnOf(yes, 5), 6);
const no = C.answerSwap(t, 1, false); assert.deepEqual(no.order, s.order);
assert.equal(C.seed().current, 4); assert.ok(C.TASKS[3].done(t, [])); assert.ok(C.TASKS[0].done(C.pay(s, 3), []));
console.log('Committee Book logic: all tests passed');
