export function overlaps(a, b, gap = 8) {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

// Move only the repair labels. Click/hold targets stay attached to the 3D model.
export function arrangeLabels(labels, viewport, reserved = []) {
  const occupied = [...reserved];
  return [...labels]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .map((label) => {
      const clamp = (x, y) => ({
        ...label,
        x: Math.max(12, Math.min(viewport.width - label.width - 12, x)),
        y: Math.max(
          viewport.top ?? 120,
          Math.min(viewport.height - label.height - 92, y),
        ),
      });
      const candidates = [];
      // Search near the preferred position first, with room to separate crowded rows.
      for (const dy of [
        0,
        -label.height - 12,
        label.height + 12,
        -2 * (label.height + 12),
        2 * (label.height + 12),
      ]) {
        for (const dx of [
          0,
          -label.width - 12,
          label.width + 12,
          -2 * (label.width + 12),
          2 * (label.width + 12),
        ])
          candidates.push(clamp(label.x + dx, label.y + dy));
      }
      const free = candidates.filter(
        (candidate) => !occupied.some((rect) => overlaps(candidate, rect)),
      );
      free.sort(
        (a, b) =>
          Math.hypot(a.x - label.x, a.y - label.y) -
          Math.hypot(b.x - label.x, b.y - label.y),
      );
      const placed = free[0] || clamp(label.x, label.y);
      occupied.push(placed);
      return placed;
    });
}
