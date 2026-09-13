import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function evaluate(source, filename) {
  const evaluatedModule = { exports: {} };
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  vm.runInNewContext(
    compiled,
    { module: evaluatedModule, exports: evaluatedModule.exports },
    { filename }
  );
  return evaluatedModule.exports;
}

const { COURSE, buildFlatCourse } = evaluate(
  read("src/lib/training-course.ts"),
  "training-course.ts"
);
const { getEffectiveReps } = evaluate(
  read("src/lib/cycle-reps.ts"),
  "cycle-reps.ts"
);
const flatCourse = buildFlatCourse(COURSE);
const pushUpId = "отжимания";

const pushUpsByWeek = (week) => {
  const sessions = new Map();
  flatCourse
    .filter((step) => step.week === week && step.exerciseId === pushUpId)
    .forEach((step) => {
      if (!sessions.has(step.session)) sessions.set(step.session, []);
      sessions.get(step.session).push(step);
    });
  return [...sessions.values()];
};

for (const step of flatCourse) {
  assert.equal(
    getEffectiveReps(step, 1),
    step.reps,
    `Cycle 1 changed ${step.key}`
  );
}
for (const session of pushUpsByWeek(1)) {
  assert.deepEqual(session.map((step) => step.reps), ["5", "11", "12", "12"]);
}
for (const session of pushUpsByWeek(12)) {
  assert.deepEqual(session.map((step) => step.reps), [
    "6 с колен",
    "6 с прямых",
    "7 с прямых",
    "6 с прямых",
  ]);
}
console.log("PASS: Cycle 1 uses every author repetition unchanged");

const cycle2Distributions = [
  [6, 7, 6],
  [7, 7, 7],
  [7, 8, 8],
  [8, 9, 8],
  [9, 9, 9],
  [9, 10, 10],
  [7, 7, 7],
  [9, 10, 10],
  [10, 11, 10],
  [11, 11, 11],
  [11, 12, 12],
  [12, 13, 12],
];
const expectedCycle2Totals = [19, 21, 23, 25, 27, 29, 21, 29, 31, 33, 35, 37];

cycle2Distributions.forEach((distribution, weekIndex) => {
  const sessions = pushUpsByWeek(weekIndex + 1);
  assert.equal(sessions.length, weekIndex === 6 ? 1 : 2);
  for (const session of sessions) {
    const effective = session.map((step) => getEffectiveReps(step, 2));
    assert.deepEqual(effective, [
      "6 с колен",
      ...distribution.map((reps) => `${reps} с прямых`),
    ]);
    assert.equal(
      effective.slice(1).reduce((sum, reps) => sum + Number.parseInt(reps, 10), 0),
      expectedCycle2Totals[weekIndex]
    );
  }
});
console.log("PASS: Cycle 2 push-up distributions and all weekly totals");

const cycle3Totals = new Map([
  [1, 37],
  [6, 47],
  [7, 39],
  [8, 47],
  [12, 55],
]);
for (const [week, total] of cycle3Totals) {
  for (const session of pushUpsByWeek(week)) {
    const effective = session.map((step) => getEffectiveReps(step, 3));
    assert.equal(
      effective.slice(1).reduce((sum, reps) => sum + Number.parseInt(reps, 10), 0),
      total
    );
  }
}
console.log("PASS: Cycle 3 start, peak, deload, return and handoff totals");

const straightTotal = (cycleNumber, week) => pushUpsByWeek(week)[0]
  .map((step) => getEffectiveReps(step, cycleNumber))
  .slice(1)
  .reduce((sum, reps) => sum + Number.parseInt(reps, 10), 0);
for (let cycleNumber = 2; cycleNumber <= 6; cycleNumber += 1) {
  assert.equal(straightTotal(cycleNumber, 12), straightTotal(cycleNumber + 1, 1));
}
console.log("PASS: Week 12 hands off exactly to Week 1 of the next cycle");

for (const step of flatCourse.filter((item) => item.exerciseId !== pushUpId)) {
  for (const cycleNumber of [2, 3, 8]) {
    assert.equal(getEffectiveReps(step, cycleNumber), step.reps);
  }
}
console.log("PASS: repetitions of every other exercise stay isolated");
