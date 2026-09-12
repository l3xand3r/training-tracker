/* Regression check for this UI-only refactor, using the original commit as oracle. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baseline = '8028d1f2b9d31dffd7f59e4f81962eb80bfa68cd';
const oldFile = file => execFileSync('git', ['show', `${baseline}:${file}`], {cwd: root, encoding: 'utf8'});
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const original = oldFile('src/app/page.tsx');
const hook = read('src/hooks/use-training-state.ts');
const course = read('src/lib/training-course.ts');
const courseBody = original.slice(original.indexOf('const STORAGE_KEY'), original.indexOf('const TAB_ITEMS'));
assert.equal(course.slice(course.indexOf('const STORAGE_KEY'), course.indexOf('\nexport {')).trim(), courseBody.trim(), 'Course, repetitions, pairs, queue, labels and storage key must be verbatim');
const stateStart = original.indexOf('  const flatCourse =');
const stateBody = original.slice(stateStart, original.indexOf('\n  return (\n    <div', stateStart));
assert.equal(hook.slice(hook.indexOf('  const flatCourse ='), hook.indexOf('\n  return {')), stateBody, 'All state, persistence, derivations and handlers must be verbatim');
for (const file of ['src/lib/cycle-weights.ts','src/components/sw-register.tsx','src/app/manifest.ts','src/app/layout.tsx','public/sw.js','public/offline.html','package.json','package-lock.json']) {
  assert.equal(read(file), oldFile(file), `${file} must remain untouched`);
}
console.log('PASS: immutable course/state/weight/storage/PWA/dependency boundaries');

// Execute both versions with a deterministic hook scheduler and independent storage.
// This exercises the original handlers without a browser or user data.
const returnBody = hook.slice(hook.indexOf('\n  return {'), hook.indexOf('\nexport type TrainingState'));
const sourceBefore = original.slice(original.indexOf('const STORAGE_KEY'), original.indexOf('const TAB_ITEMS')) + '\nexport function useTrainingState() {\n' + stateBody + returnBody;
function createHarness(source, seed) {
  const slots = [];
  let cursor = 0, dirty = false, effects = [], model;
  const saved = new Map(seed ? [['training-tracker-v3', JSON.stringify(seed)]] : []);
  const same = (a,b) => a && b && a.length === b.length && a.every((v,i) => Object.is(v,b[i]));
  const react = {
    useState(initial) { const i=cursor++; if (!(i in slots)) slots[i]=typeof initial==='function'?initial():initial; return [slots[i], next => { const v=typeof next==='function'?next(slots[i]):next; if(!Object.is(v,slots[i])) {slots[i]=v;dirty=true;} }]; },
    useMemo(fn,deps) { const i=cursor++; if(!slots[i] || !same(slots[i].deps,deps)) slots[i]={value:fn(),deps}; return slots[i].value; },
    useEffect(fn,deps) { const i=cursor++; if(!slots[i] || !same(slots[i].deps,deps)) {slots[i]={deps};effects.push(fn);} },
  };
  let acceptConfirm = true;
  const context = {console, ...react, localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v)},window:{confirm:()=>acceptConfirm},Date:class extends Date {constructor(...args){super(...(args.length?args:['2026-09-12T12:00:00.000Z']));}}};
  const modules = {};
  function evaluate(code,id) {
    const evaluatedModule={exports:{}};
    const transpiled=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInNewContext(transpiled,{...context,module:evaluatedModule,exports:evaluatedModule.exports,require:name=>name==='react'?react:modules[name]}, {filename:id});
    return evaluatedModule.exports;
  }
  modules['@/lib/cycle-weights']=evaluate(read('src/lib/cycle-weights.ts'),'cycle-weights');
  modules['@/lib/training-course']=evaluate(course,'course');
  Object.assign(context,modules['@/lib/cycle-weights']);
  const fn=evaluate(source,'state').useTrainingState;
  function render() {for(let n=0;n<30;n++){dirty=false;cursor=0;effects=[];model=fn();effects.forEach(f=>f());if(!dirty)return model;}throw Error('Unstable hook render');}
  render();
  return { get model(){return model;}, act(name,...args){model[name](...args);render();}, saved:()=>JSON.parse(saved.get('training-tracker-v3')), confirm(value){acceptConfirm=value;} };
}
function pair(seed) {
  const a=createHarness(sourceBefore,seed),b=createHarness(hook,seed);
  function equal() {assert.equal(JSON.stringify(a.saved()),JSON.stringify(b.saved())); assert.equal(JSON.stringify(a.model),JSON.stringify(b.model));}
  equal();
  return {a,b,act(name,...args){a.act(name,...args);b.act(name,...args);equal();}};
}
let p=pair();
assert.equal(p.b.model.flatCourse.length,692);
assert.equal(p.b.model.flatCourse.some(s=>s.week===7&&s.session===1),false);
assert.equal(p.b.model.workoutGroups[6].sessions[0].status,'rest');
p.act('adjustCurrentWeight',0.5); p.act('markCurrentDone'); p.act('undoLastDone');
p.act('moveToAdjacentStep',1); p.act('moveToAdjacentStep',-1);
const chosen=p.b.model.groupedExercises[2].id;
p.act('chooseExerciseStep',chosen);assert.equal(p.b.model.current.exerciseId,chosen);
p.act('markCurrentDone');assert.equal(p.b.model.overrideStepKey,null);
p=pair(p.b.saved());
p.act('openWorkoutReview',4,2); p.act('returnToCurrentWorkout'); p.act('openWorkoutReview',4,2); p.act('activateReviewedWorkout');
assert.equal(p.b.model.current.week,4);assert.equal(p.b.model.current.session,2);
p.a.confirm(false);p.b.confirm(false);p.act('requestStartNextCycle');assert.equal(p.b.model.cycleNumber,1);
p.a.confirm(true);p.b.confirm(true);p.act('requestStartNextCycle');assert.equal(p.b.model.cycleNumber,2);
p.act('markCurrentDone');p.act('adjustCurrentWeight',1);p.act('switchToCycle',1);p.act('switchToCycle',2);
p=pair(p.b.saved());
p.act('setCompactMode',true);p.act('setActiveTab','weights');p.act('setSelectedExerciseId',p.b.model.exerciseCatalog[2].id);
p.act('setWeightRules',{[`${p.b.model.exerciseCatalog[2].id}::0`]:[{fromIndex:0,weight:19.5}]});
p.act('resetAll');assert.equal(p.b.model.doneKeys.length,0);assert.equal(p.b.model.cycleNumber,1);
console.log('PASS: weight +/-; done/undo; adjacent steps; exercise override; reload; review/future activation; cycle cancel/start/return; weights; density; reset');
for(let i=0;i<30;i++) p.act('markCurrentDone');
p.act('openWorkoutReview',1,1);assert.equal(p.b.model.reviewWorkoutCompleted,true);
p.act('activateReviewedWorkout');assert.equal(p.b.model.doneKeys.length,0);
const flat=p.b.model.flatCourse;
const endSeed={...p.b.saved(),doneKeys:flat.map(s=>s.key),history:flat.map(s=>s.key),currentIndex:flat.length};
p=pair(endSeed);assert.equal(p.b.model.current,null);p.act('startNextCycle');assert.equal(p.b.model.cycleNumber,2);p.act('switchToCycle',1);assert.equal(p.b.model.current,null);
p.act('undoLastDone');assert.equal(p.b.model.current.key,flat[flat.length-1].key);
const weightless=flat.find(s=>s.defaultWeight===null);
p.act('resetAll');p.act('jumpToStep',weightless.key);const rules=JSON.stringify(p.b.model.weightRules);p.act('adjustCurrentWeight',0.5);assert.equal(JSON.stringify(p.b.model.weightRules),rules);
console.log('PASS: completed workout replay; completed cycle transition/restore/undo; weightless sets; 692-step course with week 7 rest');
