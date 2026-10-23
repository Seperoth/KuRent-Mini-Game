import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  formatTime,
  readScores,
  saveScore,
  LIMIT,
} from "../src/engine.js";

const start = (random = () => 0.25) => {
  const game = createGame(random);
  game.start();
  return game;
};
const firstFault = (game) => game.state.appliances.find((a) => a.fault);

test("a new house has three randomized appliances in each indoor room", () => {
  const game = createGame(() => 0.25);
  assert.equal(game.state.appliances.length, 9);
  for (const room of ["living", "dining", "bedroom"]) {
    const appliances = game.state.appliances.filter((a) => a.room === room);
    assert.equal(appliances.length, 3);
    assert.equal(new Set(appliances.map((a) => a.kind)).size, 3);
  }
  assert.equal(game.state.room, 0);
  assert.equal(game.state.tool, null);
  assert.equal(game.state.status, "ready");
});

test("tools can only be swapped outside, and room movement stays inside the house", () => {
  const game = start();
  assert.equal(game.equip("pliers"), true);
  game.move(1);
  assert.equal(game.equip("gloves"), false);
  assert.equal(game.state.tool, "pliers");
  assert.equal(game.move(4), false);
  assert.equal(game.move(-1), false);
  assert.equal(game.move(1.5), false);
  assert.equal(game.state.room, 1);
  game.move(0);
  assert.equal(game.equip("gloves"), true);
});

test("a fault appears after the opening interval with a full 60-second grace period", () => {
  const game = start();
  game.tick(7);
  assert.equal(firstFault(game), undefined);
  game.tick(1);
  assert.equal(firstFault(game).fault.deadline, 68);
  assert.equal(game.state.bill, 0);
});

test("click repairs require gloves, the right room, and the full number of clicks", () => {
  const game = start();
  game.tick(8);
  const item = firstFault(game);
  assert.equal(item.fault.method, "click");
  assert.equal(game.interact(item.id, "click"), "unavailable");
  game.move(["outside", "living", "dining", "bedroom"].indexOf(item.room));
  assert.equal(game.interact(item.id, "click"), "gloves");
  game.move(0);
  game.equip("gloves");
  game.move(["outside", "living", "dining", "bedroom"].indexOf(item.room));
  const required = item.fault.required;
  for (let i = 0; i < required - 1; i++)
    assert.equal(game.interact(item.id, "click"), "clicked");
  assert.equal(game.interact(item.id, "click"), "repaired");
  assert.equal(item.fault, null);
  assert.equal(game.state.repaired, 1);
});

test("hold repairs require pliers and reset if released or if the player changes floors", () => {
  const game = start(() => 0.9);
  game.tick(8);
  const item = firstFault(game);
  assert.equal(item.fault.method, "hold");
  game.move(["outside", "living", "dining", "bedroom"].indexOf(item.room));
  assert.equal(game.interact(item.id, "hold"), "pliers");
  game.move(0);
  game.equip("pliers");
  game.move(["outside", "living", "dining", "bedroom"].indexOf(item.room));
  game.interact(item.id, "hold");
  game.tick(1);
  assert.equal(item.fault.progress, 1);
  game.cancelHold();
  assert.equal(item.fault.progress, 0);
  game.interact(item.id, "hold");
  game.tick(1);
  game.move(0);
  assert.equal(item.fault.progress, 0);
  game.move(["outside", "living", "dining", "bedroom"].indexOf(item.room));
  game.interact(item.id, "hold");
  game.tick(item.fault.required);
  assert.equal(item.fault, null);
  assert.equal(game.state.repaired, 1);
});

test("a fault adds exactly ₱1 per second only after its grace period", () => {
  const game = start();
  game.tick(8);
  game.state.nextFault = Infinity;
  game.tick(59);
  assert.equal(game.state.bill, 0);
  game.tick(1);
  assert.equal(game.state.bill, 0);
  game.tick(2.5);
  assert.equal(game.state.bill, 2.5);
});

test("overdue faults accumulate independently and repairs stop future consumption", () => {
  const game = start();
  game.state.nextFault = Infinity;
  const [a, b] = game.state.appliances;
  a.fault = { method: "click", deadline: 0, progress: 0, required: 1 };
  b.fault = { method: "click", deadline: 1, progress: 0, required: 2 };
  game.tick(3);
  assert.equal(game.state.bill, 5);
  game.equip("gloves");
  game.move(1);
  assert.equal(game.interact(a.id, "click"), "repaired");
  game.tick(3);
  assert.equal(game.state.bill, 8);
});

test("the run ends exactly at the ₱20,000 limit", () => {
  const game = start();
  game.state.bill = LIMIT - 0.5;
  game.state.appliances[0].fault = {
    method: "click",
    deadline: 0,
    progress: 0,
    required: 1,
  };
  game.tick(1);
  assert.equal(game.state.bill, LIMIT);
  assert.equal(game.state.status, "over");
  const time = game.state.time;
  game.tick(10);
  assert.equal(game.state.time, time);
});

test("pausing freezes the timer, consumption, fault generation, and repair progress", () => {
  const game = start();
  game.tick(8);
  game.pause();
  game.tick(100);
  assert.equal(game.state.time, 8);
  assert.equal(game.state.bill, 0);
  assert.equal(game.state.appliances.filter((a) => a.fault).length, 1);
  game.resume();
  game.tick(1);
  assert.equal(game.state.time, 9);
});

test("difficulty increases every two minutes and new appliances cap at six per room", () => {
  const game = start();
  game.tick(119);
  assert.equal(game.state.level, 1);
  assert.equal(game.state.appliances.length, 9);
  game.tick(1);
  assert.equal(game.state.level, 2);
  assert.equal(game.state.appliances.length, 12);
  game.tick(120);
  assert.equal(game.state.appliances.length, 15);
  game.tick(120);
  assert.equal(game.state.appliances.length, 18);
  game.tick(120);
  assert.equal(game.state.level, 5);
  assert.equal(game.state.appliances.length, 18);
});

test("early holds are shorter and late holds never exceed seven seconds", () => {
  const early = start(() => 0.9);
  early.tick(8);
  assert.ok(
    firstFault(early).fault.required >= 3 &&
      firstFault(early).fault.required < 4,
  );
  const late = start(() => 0.9);
  late.state.time = 1200;
  late.tick(1);
  assert.ok(
    firstFault(late).fault.required >= 6 &&
      firstFault(late).fault.required <= 7,
  );
});

test("survival time handles minutes and hours without wrapping", () => {
  assert.equal(formatTime(0), "00:00");
  assert.equal(formatTime(125.8), "02:05");
  assert.equal(formatTime(3661), "01:01:01");
});

test("leaderboard storage sorts runs, keeps ten, and handles unavailable or corrupt storage", () => {
  const data = new Map();
  const storage = {
    getItem: (k) => data.get(k),
    setItem: (k, v) => data.set(k, v),
  };
  for (let i = 0; i < 12; i++)
    saveScore(storage, { time: i * 100, repairs: i, date: "2026-10-23" });
  const scores = readScores(storage);
  assert.equal(scores.length, 10);
  assert.equal(scores[0].time, 1100);
  assert.equal(scores[9].time, 200);
  storage.setItem("kurent-scores", "{broken");
  assert.deepEqual(readScores(storage), []);
  storage.setItem("kurent-scores", '{"time":5}');
  assert.deepEqual(readScores(storage), []);
  const unavailable = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  assert.deepEqual(readScores(unavailable), []);
  assert.equal(saveScore(unavailable, { time: 50, repairs: 1 }).length, 1);
});
