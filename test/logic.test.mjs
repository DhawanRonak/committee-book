// node test/logic.test.mjs
import { createRequire } from 'module'; import assert from 'assert'; const require = createRequire(import.meta.url);
const C = require('../logic.js'); let s = C.seed();
assert.equal(C.pot(s), 14000); let sum = C.summary(s);
assert.deepEqual([sum.confirmed, sum.awaiting, sum.pending], [[1, 2, 8], [5], [3, 6, 7]]); assert.equal(sum.collected, 6000);
const st = Object.fromEntries(C.standing(s).map(x => [x.name, x]));
assert.equal(st.Asha.received, 14000); assert.equal(st.Asha.paidIn, 6000); assert.equal(st.Asha.net, 8000); // received early, still owes later months
assert.equal(st.Deepa.net, -8000); assert.equal(st.Sunil.onTime, 33); assert.equal(st.Farah.received, 6000);
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

// Creation, role guards, immutable transitions, date boundaries and complete cycles.
assert.throws(()=>C.create('',2000,['A','B','C'],'2026-01-01'));
assert.throws(()=>C.create('Circle',1,['A','a','C'],'2026-01-01'));
assert.throws(()=>C.create('Circle',1.5,['A','B','C'],'2026-01-01'));
let fresh=C.create('Circle',100,['A','B','C'],'2026-01-31');
assert.equal(C.dueDate(fresh,2),'2026-02-28');
assert.equal(C.pot(fresh),200);
assert.equal(C.confirm(C.pay(fresh,2),2,3).rounds[0].pay[2].status,'paid');
let overlap=C.requestSwap(s,6,5);
assert.equal(C.requestSwap(overlap,7,5),overlap);
assert.equal(C.answerSwap(overlap,1,true,7),overlap);
assert.deepEqual(s.order,[1,2,3,4,5,6,7,8]);
let disputed=C.dispute(C.pay(fresh,2),2,1);
assert.equal(C.round(C.pay(disputed,2)).pay[2].disputed,false);
for(let n=1;n<=3;n++){for(const id of Object.keys(C.round(fresh).pay).map(Number)){fresh=C.pay(fresh,id);fresh=C.confirm(fresh,id)}}
assert.equal(fresh.current,3);assert.ok(C.summary(fresh).complete);assert.equal(fresh.rounds.length,3);
assert.equal(C.standing(fresh).reduce((a,x)=>a+x.net,0),0);
console.log('Creation, authorization, swap conflicts and complete-cycle tests passed');
assert.throws(()=>C.create('Circle',100,['A','B','C'],'2026-02-31'));
let exp=C.requestSwap(s,6,5);for(const id of [3,6,7])exp=C.pay(exp,id);for(const id of [3,5,6,7])exp=C.confirm(exp,id);
assert.equal(exp.swaps[0].status,'expired');
