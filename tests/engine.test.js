import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  formatTime,
  readScores,
  saveScore,
  LIMIT,
  graceForLevel,
  leakRate,
} from "../src/engine.js";

const start = (random = () => 0.25) => {
  const game = createGame(random);
  game.start();
  return game;
};
const spawnFirst = (game) => game.tick(game.state.nextFault - game.state.time);
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

test("level 1 faults start in 10-12 seconds with a 20-second repair window", () => {
  const game = start();
  game.tick(10);
  assert.equal(firstFault(game), undefined);
  game.tick(0.5);
  assert.equal(firstFault(game).fault.deadline, 30.5);
  assert.equal(game.state.bill, 0);
});

test("click repairs require gloves, the right room, and the full number of clicks", () => {
  const game = start();
  spawnFirst(game);
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
  spawnFirst(game);
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

test("a fault charges only after its deadline and uses the current level rate", () => {
  const game = start();
  spawnFirst(game);
  game.state.nextFault = Infinity;
  game.tick(19);
  assert.equal(game.state.bill, 0);
  game.tick(1);
  assert.equal(game.state.bill, 0);
  game.tick(2.5);
  assert.equal(game.state.bill, 15);
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

test("the run ends exactly at the ₱5,000 limit", () => {
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
  spawnFirst(game);
  game.pause();
  game.tick(100);
  assert.equal(game.state.time, 10.5);
  assert.equal(game.state.bill, 0);
  assert.equal(game.state.appliances.filter((a) => a.fault).length, 1);
  game.resume();
  game.tick(1);
  assert.equal(game.state.time, 11.5);
});

test("difficulty increases every 30 seconds and new appliances cap at six per room", () => {
  const game = start();
  game.state.nextFault = Infinity;
  game.tick(29);
  assert.equal(game.state.level, 1);
  assert.equal(game.state.appliances.length, 9);
  game.tick(1);
  assert.equal(game.state.level, 2);
  assert.equal(game.state.appliances.length, 12);
  game.tick(30);
  assert.equal(game.state.appliances.length, 15);
  game.tick(30);
  assert.equal(game.state.appliances.length, 18);
  game.tick(30);
  assert.equal(game.state.level, 5);
  assert.equal(game.state.appliances.length, 18);
});

test("holds start at 2-3 seconds, add 0.2 seconds per level and retain the seven-second cap", () => {
  const cases = [
    [1, 0.51, 2.51],
    [1, 0.999999, 2.999999],
    [1, 0.9, 2.9],
    [2, 0.9, 3.1],
    [3, 0.9, 3.3],
    [10, 0.9, 4.7],
    [21, 0.9, 6.9],
    [26, 0.9, 7],
    [41, 0.9, 7],
  ];
  for (const [level, random, expected] of cases) {
    const game = start(() => random);
    game.state.time = (level - 1) * 30;
    game.state.nextFault = game.state.time;
    game.tick(0.001);
    assert.ok(Math.abs(firstFault(game).fault.required - expected) < 1e-9);
  }
});

test("fault windows decrease by 1-2 seconds each level, with a two-second floor", () => {
  const game = start(() => 0.25);
  assert.equal(game.state.nextFault, 10.5);
  game.state.nextFault = Infinity;
  let previous = 0;
  for (let level = 2; level <= 12; level++) {
    game.tick(30);
    assert.equal(game.state.level, level);
    assert.ok(
      game.state.faultReduction - previous >= 1 &&
        game.state.faultReduction - previous <= 2,
    );
    previous = game.state.faultReduction;
  }
  game.state.nextFault = game.state.time;
  game.tick(0.001);
  assert.ok(
    Math.abs(game.state.nextFault - (game.state.time - 0.001) - 2) < 1e-8,
  );
  assert.equal(firstFault(game).fault.deadline - (game.state.time - 0.001), 4);
});

test("repair windows fall by two seconds per level and stop at four seconds", () => {
  assert.deepEqual(
    [1, 2, 3, 4, 8, 9, 30].map(graceForLevel),
    [20, 18, 16, 14, 6, 4, 4],
  );
});

test("leak rates include the current level and each appliance's own overdue age", () => {
  const item = { fault: { deadline: 5 } };
  assert.equal(leakRate(item, 4.99, 1), 0);
  assert.equal(leakRate(item, 5, 1), 1);
  assert.equal(leakRate(item, 14.99, 1), 1);
  assert.equal(leakRate(item, 15, 1), 3);
  assert.equal(leakRate(item, 25, 2), 10);
  assert.equal(leakRate({ fault: null }, 100, 8), 0);
  const game = start();
  game.state.nextFault = Infinity;
  game.state.appliances[0].fault = {
    method: "click",
    deadline: 0,
    progress: 0,
    required: 1,
  };
  game.state.appliances[1].fault = {
    method: "click",
    deadline: 5,
    progress: 0,
    required: 1,
  };
  game.tick(20);
  assert.equal(game.state.bill, 65);
  game.tick(10);
  assert.equal(game.state.bill, 155);
  game.tick(10);
  assert.equal(game.state.bill, 385);
});

test("large and small time steps charge the same leaks and stop at the exact loss time", () => {
  const big = start(() => 0.25),
    small = start(() => 0.25);
  big.tick(200);
  for (let i = 0; i < 2000; i++) small.tick(0.1);
  assert.equal(big.state.status, "over");
  assert.equal(big.state.bill, 5000);
  assert.ok(Math.abs(big.state.time - small.state.time) < 1e-6);
  assert.equal(big.state.level, small.state.level);
  assert.equal(
    big.state.appliances.filter((a) => a.fault).length,
    small.state.appliances.filter((a) => a.fault).length,
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
