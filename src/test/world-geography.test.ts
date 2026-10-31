import { describe, expect, it } from "vitest";
import { worldCell, geographicPosition } from "@/lib/world-geography";

describe("Invisible geographic reservation areas", () => {
  it("maps all 240 existing regions to their same selectable world area", () => {
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 20; x++) {
        expect(worldCell((x + 0.5) / 20, 1 - (y + 0.5) / 12)).toEqual({ grid_x: x, grid_y: y });
      }
    }
  });
  it("keeps edge clicks inside the original region bounds", () => {
    expect(worldCell(1, 0)).toEqual({ grid_x: 19, grid_y: 11 });
    expect(worldCell(0, 1)).toEqual({ grid_x: 0, grid_y: 0 });
  });
  it("places the northwest area in the northern and western hemispheres", () => {
    expect(geographicPosition(0, 0)).toEqual({ longitude: -171, latitude: 82.5, x: -17.099999999999998, z: -8.25 });
  });
});