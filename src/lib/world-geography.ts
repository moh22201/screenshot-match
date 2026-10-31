export const WORLD_WIDTH = 36;
export const WORLD_DEPTH = 18;
export const WORLD_COLUMNS = 20;
export const WORLD_ROWS = 12;

export function geographicPosition(x: number, y: number) {
  return {
    longitude: ((x + 0.5) / WORLD_COLUMNS) * 360 - 180,
    latitude: 90 - ((y + 0.5) / WORLD_ROWS) * 180,
    x: ((x + 0.5) / WORLD_COLUMNS - 0.5) * WORLD_WIDTH,
    z: ((y + 0.5) / WORLD_ROWS - 0.5) * WORLD_DEPTH,
  };
}

export function worldCell(u: number, v: number) {
  return {
    grid_x: Math.min(WORLD_COLUMNS - 1, Math.max(0, Math.floor(u * WORLD_COLUMNS))),
    grid_y: Math.min(WORLD_ROWS - 1, Math.max(0, Math.floor((1 - v) * WORLD_ROWS))),
  };
}

export function locationLabel(x: number, y: number) {
  const { longitude, latitude } = geographicPosition(x, y);
  return `${Math.abs(latitude).toFixed(1)}° ${latitude >= 0 ? "شمالاً" : "جنوباً"} · ${Math.abs(longitude).toFixed(1)}° ${longitude >= 0 ? "شرقاً" : "غرباً"}`;
}