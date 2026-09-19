const round2 = (num) => Math.round((Number(num) + Number.EPSILON) * 100) / 100;

const add = (a, b) => round2(Number(a) + Number(b));
const sub = (a, b) => round2(Number(a) - Number(b));
const mul = (a, b) => round2(Number(a) * Number(b));
const div = (a, b) => round2(Number(a) / Number(b));

const gt = (a, b) => Number(a) > Number(b);
const lt = (a, b) => Number(a) < Number(b);
const gte = (a, b) => Number(a) >= Number(b);
const lte = (a, b) => Number(a) <= Number(b);
const eq = (a, b) => Number(a) === Number(b);

module.exports = { round2, add, sub, mul, div, gt, lt, gte, lte, eq };
