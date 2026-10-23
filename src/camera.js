// Fixed forward-facing views along one continuous house. W moves deeper inside.
export const CAMERA_STOPS = [
  { position: [0, 3.25, 21], target: [0, 2.8, 5], fov: 62 },
  { position: [0, 3.15, 5.5], target: [0, 2.65, -5.8], fov: 66 },
  { position: [0, 3.15, -8.5], target: [0, 2.65, -19.8], fov: 66 },
  { position: [0, 3.15, -22.5], target: [0, 2.65, -33.8], fov: 66 },
];
export const MENU_CAMERA = {
  position: [3, 6.8, 27],
  target: [0, 3.5, 7],
  fov: 48,
};
const copy = (pose) => ({
  position: [...pose.position],
  target: [...pose.target],
  fov: pose.fov,
});
const mix = (a, b, t) => a + (b - a) * t;

export class HouseCamera {
  constructor(reducedMotion = false) {
    this.pose = copy(MENU_CAMERA);
    this.reducedMotion = reducedMotion;
    this.transition = null;
    this.room = 0;
    this.menu = true;
  }
  travel(room, now = performance.now(), instant = false) {
    if (!Number.isInteger(room) || room < 0 || room > 3) return false;
    this.room = room;
    this.menu = false;
    this.moveTo(CAMERA_STOPS[room], now, instant);
    return true;
  }
  showMenu(now = performance.now(), instant = false) {
    this.menu = true;
    this.moveTo(MENU_CAMERA, now, instant);
  }
  moveTo(destination, now, instant) {
    if (instant || this.reducedMotion) {
      this.pose = copy(destination);
      this.transition = null;
      return;
    }
    this.transition = {
      from: copy(this.pose),
      to: copy(destination),
      started: now,
      duration: 1050,
    };
  }
  update(now) {
    if (!this.transition) return this.pose;
    const { from, to, started, duration } = this.transition;
    const t = Math.max(0, Math.min(1, (now - started) / duration));
    const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    this.pose = {
      position: from.position.map((value, i) =>
        mix(value, to.position[i], eased),
      ),
      target: from.target.map((value, i) => mix(value, to.target[i], eased)),
      fov: mix(from.fov, to.fov, eased),
    };
    if (t === 1) {
      this.pose = copy(to);
      this.transition = null;
    }
    return this.pose;
  }
}
