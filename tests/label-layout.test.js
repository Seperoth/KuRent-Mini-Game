import test from "node:test";
import assert from "node:assert/strict";
import { arrangeLabels, overlaps } from "../src/label-layout.js";

for (const [width, height] of [
  [1440, 900],
  [1024, 650],
]) {
  test(`repair labels separate a crowded row at ${width}×${height}`, () => {
    const labels = Array.from({ length: 6 }, (_, i) => ({
      id: String(i),
      x: width * 0.57 + i * 28,
      y: height * 0.46 + (i % 2) * 12,
      width: 125,
      height: 45,
    }));
    const original = JSON.stringify(labels);
    const reserved = [
      { x: width - 80, y: height * 0.4, width: 60, height: 200 },
    ];
    const result = arrangeLabels(labels, { width, height }, reserved);
    assert.equal(
      JSON.stringify(labels),
      original,
      "label placement preserves the input appliance anchors",
    );
    for (const [i, a] of result.entries()) {
      assert.ok(
        a.x >= 12 &&
          a.x + a.width <= width - 12 &&
          a.y >= 120 &&
          a.y + a.height <= height - 92,
      );
      for (const b of [...result.slice(i + 1), ...reserved])
        assert.equal(
          overlaps(a, b),
          false,
          `${a.id} overlaps another label or the map`,
        );
    }
  });
}
