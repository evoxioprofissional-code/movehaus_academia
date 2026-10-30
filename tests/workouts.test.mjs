import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import crypto from "node:crypto";
import ts from "typescript";

function load(name, deps = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(`src/lib/coaching/${name}.ts`, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const req = key => key === "node:crypto" ? crypto : deps[key] ?? (() => { throw new Error(key); })();
  vm.runInNewContext("(function(require,exports){" + code + "\n})", { Date, Intl })(req, exports);
  return exports;
}
const rules = load("workout-rules");
const ids = load("event-id");
const exercises = [{ id: "exercise", name: "Remada", sets: 2 }];
const logs = [1, 2].map(set_number => ({ exercise_id: "exercise", set_number, reps_done: 10, load_used: 20 }));

test("completion requires every prescribed set, with trusted exercise names", () => {
  assert.equal(rules.validateWorkoutLogs(JSON.stringify(logs), exercises).length, 2);
  assert.throws(() => rules.validateWorkoutLogs(JSON.stringify(logs.slice(0, 1)), exercises));
  assert.throws(() => rules.validateWorkoutLogs("[]", []));
  assert.equal(rules.validateWorkoutLogs(JSON.stringify(logs.map(log => ({ ...log, exercise_name: "fake" }))), exercises)[0].exercise_name, "Remada");
});

test("foreign exercises, duplicate sets and invalid values cannot complete workouts", () => {
  for (const bad of [
    [{ ...logs[0], exercise_id: "another" }, logs[1]],
    [logs[0], logs[0]],
    [{ ...logs[0], reps_done: 0 }, logs[1]],
    [{ ...logs[0], load_used: -10 }, logs[1]],
    [{ ...logs[0], load_used: "NaN" }, logs[1]],
  ]) assert.throws(() => rules.validateWorkoutLogs(JSON.stringify(bad), exercises));
});

test("bodyweight exercises are allowed without a load", () => {
  assert.equal(rules.validateWorkoutLogs(JSON.stringify(logs.map(log => ({ ...log, load_used: null }))), exercises)[0].load_used, null);
});

test("training dates follow Sao Paulo midnight rather than server UTC", () => {
  assert.equal(rules.trainingDate("2026-10-30T02:59:59Z"), "2026-10-29");
  assert.equal(rules.trainingDate("2026-10-30T03:00:00Z"), "2026-10-30");
  assert.equal(rules.trainingDayStart("2026-10-30T02:59:59Z"), "2026-10-29T00:00:00-03:00");
});

test("stable event IDs distinguish days and users", () => {
  assert.equal(ids.eventId("user:2026-10-29"), ids.eventId("user:2026-10-29"));
  assert.notEqual(ids.eventId("user:2026-10-29"), ids.eventId("user:2026-10-30"));
  assert.notEqual(ids.eventId("user:2026-10-29"), ids.eventId("another:2026-10-29"));
});

function pointsHarness(legacy = false) {
  const tables = {
    workout_sessions: [
      { id: "first", user_id: "user", finished_at: "2026-10-29T12:00:00Z" },
      { id: "second", user_id: "user", finished_at: "2026-10-29T20:00:00Z" },
      { id: "third", user_id: "user", finished_at: "2026-10-30T12:00:00Z" },
      { id: "unfinished", user_id: "user", finished_at: null },
      { id: "foreign", user_id: "other", finished_at: "2026-10-29T12:00:00Z" },
    ],
    points_ledger: legacy ? [{ id: "legacy", user_id: "user", points: 10, reason: "Treino concluído", created_at: "2026-10-29T10:00:00Z" }] : [],
    achievements: [],
  };
  class Query {
    constructor(table) { this.table = table; this.filters = []; }
    select() { return this; }
    eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    not(key) { this.filters.push(row => row[key] != null); return this; }
    gte(key, value) { this.filters.push(row => Date.parse(row[key]) >= Date.parse(value)); return this; }
    lt(key, value) { this.filters.push(row => Date.parse(row[key]) < Date.parse(value)); return this; }
    limit() { return this; }
    upsert(value) { this.values = Array.isArray(value) ? value : [value]; return this; }
    result() {
      const table = tables[this.table];
      if (this.values) for (const row of this.values) if (!table.some(old => row.id ? old.id === row.id : old.user_id === row.user_id && old.code === row.code)) table.push(structuredClone(row));
      const data = table.filter(row => this.filters.every(filter => filter(row)));
      return { data, count: data.length, error: null };
    }
    async maybeSingle() { const result = this.result(); return { ...result, data: result.data[0] ?? null }; }
    then(resolve, reject) { return Promise.resolve().then(() => this.result()).then(resolve, reject); }
  }
  const db = { from: name => new Query(name) };
  const points = load("gamification", { "@/lib/coaching/event-id": ids, "@/lib/coaching/workout-rules": rules, "@/lib/supabase/server": { createAdminClient: () => db } });
  return { points, tables };
}

test("concurrent/repeated completions grant 10 points per day, not per session", async () => {
  const { points, tables } = pointsHarness();
  await Promise.all([points.awardWorkoutCompletion("user", "first"), points.awardWorkoutCompletion("user", "first"), points.awardWorkoutCompletion("user", "second")]);
  assert.equal(tables.points_ledger.reduce((total, row) => total + row.points, 0), 10);
  await points.awardWorkoutCompletion("user", "third");
  assert.equal(tables.points_ledger.reduce((total, row) => total + row.points, 0), 20);
});

test("legacy credits are preserved and already satisfy the daily cap", async () => {
  const { points, tables } = pointsHarness(true);
  await points.awardWorkoutCompletion("user", "first");
  assert.equal(tables.points_ledger.length, 1);
});

test("unfinished sessions and another user's sessions cannot earn points", async () => {
  const { points, tables } = pointsHarness();
  await assert.rejects(points.awardWorkoutCompletion("user", "unfinished"));
  await assert.rejects(points.awardWorkoutCompletion("user", "foreign"));
  assert.equal(tables.points_ledger.length, 0);
});
