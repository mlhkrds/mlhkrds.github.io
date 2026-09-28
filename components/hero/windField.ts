const COLUMNS = 32;
const ROWS = 20;
/** How far a gust reaches from the pointer, in CSS px. */
const REACH = 170;
// A heavy, critically damped spring (0.3 Hz): stars lean over about half a second, then settle back over
// two or three without bouncing.
const STIFFNESS = 3.55;
const DAMPING = 3.77;
const GAIN = 4.7;
const LIMIT = 1.49;

/**
 * The pointer's wind as a coarse grid of springs over the viewport. Moving the pointer pushes the cells near
 * it the way it moved, harder the faster it goes; each cell then eases out and back to rest. The shader
 * samples the grid as a texture, encoded around 128 so that rest is exactly zero.
 */
export class WindField {
  readonly columns = COLUMNS;
  readonly rows = ROWS;
  readonly data = new Uint8Array(COLUMNS * ROWS * 4).fill(128);
  active = false;
  private readonly offset = new Float32Array(COLUMNS * ROWS * 2);
  private readonly velocity = new Float32Array(COLUMNS * ROWS * 2);

  /** A pointer move of (dx, dy) px ending at (x, y), at `speed` px/s, over a width × height viewport. */
  blow(x: number, y: number, dx: number, dy: number, speed: number, width: number, height: number) {
    const push = (GAIN / 100) * Math.min(1, Math.max(0.15, speed / 900));
    const cellWidth = width / COLUMNS;
    const cellHeight = height / ROWS;
    for (let row = 0; row < ROWS; row++) {
      const cy = (row + 0.5) * cellHeight;
      if (Math.abs(cy - y) >= REACH) continue;
      for (let column = 0; column < COLUMNS; column++) {
        const distance = Math.hypot((column + 0.5) * cellWidth - x, cy - y);
        if (distance >= REACH) continue;
        const weight = (1 - distance / REACH) ** 2 * push;
        const k = (row * COLUMNS + column) * 2;
        this.velocity[k] += dx * weight;
        this.velocity[k + 1] += dy * weight;
      }
    }
    this.active = true;
  }

  /** Advances the springs by `dt` seconds and refreshes the texture data. */
  step(dt: number) {
    let energy = 0;
    for (let k = 0; k < this.offset.length; k++) {
      this.velocity[k] += (-STIFFNESS * this.offset[k] - DAMPING * this.velocity[k]) * dt;
      this.offset[k] = Math.min(LIMIT, Math.max(-LIMIT, this.offset[k] + this.velocity[k] * dt));
      energy = Math.max(energy, Math.abs(this.offset[k]) + Math.abs(this.velocity[k]));
    }
    if (energy < 0.002) {
      this.offset.fill(0);
      this.velocity.fill(0);
      this.active = false;
    }
    for (let cell = 0; cell < COLUMNS * ROWS; cell++) {
      this.data[cell * 4] = Math.round(this.offset[cell * 2] * 85 + 128);
      this.data[cell * 4 + 1] = Math.round(this.offset[cell * 2 + 1] * 85 + 128);
    }
  }
}
