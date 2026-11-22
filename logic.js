// Committee Book logic: a rotating savings group (committee / kitty / bhishi) as a shared ledger.
// The app never holds money: each member pays the month's receiver directly, and the receiver confirms.
// Pure functions that return new state. All people and amounts are fictional.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Committee = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const NAMES = ['Asha', 'Meena', 'Ravi', 'Farah', 'Joseph', 'Kiran', 'Sunil', 'Deepa'];
  const clone = s => JSON.parse(JSON.stringify(s));
  function newRound(s, n, dueInDays) {
    const receiver = s.order[n - 1], pay = {};
    s.members.forEach(m => { if (m.id !== receiver) pay[m.id] = { status: 'pending', late: false }; });
    return { n, receiver, dueInDays, pay };
  }
  function seed() {
    const s = { name: 'Building 4 Committee', contribution: 2000, organiser: 1, members: NAMES.map((name, i) => ({ id: i + 1, name })), order: [1, 2, 3, 4, 5, 6, 7, 8], current: 4, rounds: [], swaps: [], nextSwapId: 1 };
    for (let n = 1; n <= 3; n++) { const r = newRound(s, n, 0); for (const id in r.pay) r.pay[id].status = 'confirmed'; s.rounds.push(r); }
    s.rounds[0].pay[7].late = true; s.rounds[2].pay[7].late = true; s.rounds[1].pay[6].late = true;
    const r4 = newRound(s, 4, 3); [1, 2, 8].forEach(id => r4.pay[id].status = 'confirmed'); r4.pay[5].status = 'paid'; s.rounds.push(r4);
    return s;
  }
  const member = (s, id) => s.members.find(m => m.id === id);
  const pot = s => (s.members.length - 1) * s.contribution;
  const round = (s, n) => s.rounds.find(r => r.n === (n || s.current));
  function summary(s, n) {
    const r = round(s, n), ids = Object.keys(r.pay).map(Number), by = st => ids.filter(id => r.pay[id].status === st);
    return { round: r, confirmed: by('confirmed'), awaiting: by('paid'), pending: by('pending'), collected: by('confirmed').length * s.contribution, complete: by('confirmed').length === ids.length };
  }
  function pay(s, memberId) { const t = clone(s), p = round(t).pay[memberId]; if (!p || p.status !== 'pending') return s; p.status = 'paid'; p.disputed = false; if (round(t).dueInDays < 0) p.late = true; return t; }
  function confirm(s, payerId, actor = round(s).receiver) { if (actor !== round(s).receiver) return s;
    const t = clone(s), p = round(t).pay[payerId]; if (!p || p.status !== 'paid') return s; p.status = 'confirmed';
    if (summary(t).complete && t.current < t.members.length) { t.current++; t.rounds.push(newRound(t, t.current, 30)); t.swaps.forEach(w => { if (w.status === 'pending' && (turnOf(t,w.from) <= t.current || turnOf(t,w.to) <= t.current)) w.status = 'expired'; }); }
    return t;
  }
  function dispute(s, payerId, actor = round(s).receiver) { if (actor !== round(s).receiver) return s; const t = clone(s), p = round(t).pay[payerId]; if (!p || p.status !== 'paid') return s; p.status = 'pending'; p.disputed = true; return t; }
  // Where everyone stands: money put in, money received, and reliability. This is the trust view.
  function standing(s) {
    return s.members.map(m => {
      let paidIn = 0, due = 0, late = 0;
      for (const r of s.rounds) { const p = r.pay[m.id]; if (!p) continue; if (p.status === 'confirmed') { due++; paidIn += s.contribution; if (p.late) late++; } }
      const turn = s.order.indexOf(m.id) + 1, r = s.rounds.find(x => x.n === turn);
      const received = r ? Object.values(r.pay).filter(p => p.status === 'confirmed').length * s.contribution : 0;
      return { id: m.id, name: m.name, turn, paidIn, received, net: received - paidIn, onTime: due ? Math.round((1 - late / due) * 100) : 100 };
    });
  }
  // Turn swaps: only between two members whose turns are both still in the future, and only if the other agrees.
  const turnOf = (s, id) => s.order.indexOf(id) + 1;
  const canSwap = (s, a, b) => a !== b && turnOf(s, a) > s.current && turnOf(s, b) > s.current && !s.swaps.some(w => w.status === 'pending' && (w.from === a || w.to === a || w.from === b || w.to === b));
  function requestSwap(s, from, to) { if (!canSwap(s, from, to)) return s; const t = clone(s); t.swaps.push({ id: t.nextSwapId++, from, to, status: 'pending' }); return t; }
  function answerSwap(s, swapId, approve, actor) {
    const t = clone(s), w = t.swaps.find(x => x.id === swapId); if (!w || w.status !== 'pending' || (actor !== undefined && actor !== w.to)) return s;
    if (approve && turnOf(t, w.from) > t.current && turnOf(t, w.to) > t.current) { const i = t.order.indexOf(w.from), j = t.order.indexOf(w.to); [t.order[i], t.order[j]] = [t.order[j], t.order[i]]; w.status = 'approved'; }
    else w.status = 'declined';
    return t;
  }
  const RULES = [
    'Everyone except the month’s receiver pays the receiver directly by UPI. The app never holds money.',
    'A payment counts only when the receiver confirms it.',
    'Late payments are shown to the whole group. Nothing is hidden from members.',
    'Turns can be swapped only if both members agree, and only for turns that have not come yet.',
    'If someone misses two months, the organiser calls a group decision. The app records it; it does not enforce it.',
    'No interest, bidding or commission. This is a savings circle among people who know each other.'
  ];
  const TASKS = [
    { id: 'T1', as: 3, text: 'You are Ravi. Pay this month’s contribution.', done: s => { const r = s.rounds.find(x => x.n === 4); return r.pay[3].status !== 'pending'; } },
    { id: 'T2', as: 4, text: 'You are Farah, this month’s receiver. Joseph says he has paid you. Confirm you received it.', done: s => s.rounds.find(x => x.n === 4).pay[5].status === 'confirmed' },
    { id: 'T3', as: 8, text: 'You are Deepa. Find out which month you will receive the money.', done: (s, ev) => ev.some(e => e.name === 'open_tab' && e.detail === 'turns') },
    { id: 'T4', as: 6, text: 'You are Kiran and need the money sooner. Ask Joseph to swap turns with you.', done: s => s.swaps.some(w => w.from === 6 && w.to === 5 && w.status === 'pending') },
    { id: 'T5', as: 1, text: 'You are Asha, the organiser. Find who has received more than they have put in so far.', done: (s, ev) => ev.some(e => e.name === 'open_tab' && e.detail === 'standing') }
  ];
  function create(name, contribution, names, startDate) {
    if (!name.trim() || name.trim().length > 80 || !Number.isInteger(contribution) || contribution < 1 || contribution > 1000000) throw new Error('Enter a name and a whole-rupee contribution between 1 and 10,00,000.');
    names = names.map(n => n.trim());
    if (names.length < 3 || names.length > 20 || names.some(n => !n || n.length > 40) || new Set(names.map(n => n.toLowerCase())).size !== names.length) throw new Error('Add 3�20 distinct member names, one per line (up to 40 characters each).');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || (!Number.isFinite(Date.parse(startDate)) || new Date(startDate).toISOString().slice(0,10) !== startDate)) throw new Error('Choose a valid first due date.');
    const s = {name:name.trim(), contribution, organiser:1, members:names.map((name,i)=>({id:i+1,name})), order:names.map((_,i)=>i+1), current:1, rounds:[], swaps:[], nextSwapId:1, startDate};
    s.rounds.push(newRound(s,1,0)); return s;
  }
  function dueDate(s,n=s.current) { const d = new Date((s.startDate || new Date().toISOString().slice(0,10))+'T12:00:00Z'); const day=d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth()+n-1); const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate(); d.setUTCDate(Math.min(day,last)); return d.toISOString().slice(0,10); }
  return { create, dueDate, seed, member, pot, round, summary, pay, confirm, dispute, standing, turnOf, canSwap, requestSwap, answerSwap, RULES, TASKS };
});
