import { describe, expect, it } from "vitest";
import { STARTER_FACILITIES, CITY_SIZE } from "@/lib/city-layout";

describe("Approved starter city", () => {
  it("contains only the four requested facilities", () => {
    expect(STARTER_FACILITIES.map((f) => f.id)).toEqual(["commercial", "recruitment", "forest", "quarry"]);
  });
  it("places the commercial center in the middle of the land", () => {
    expect(STARTER_FACILITIES.find((f) => f.id === "commercial")).toMatchObject({ x: 0, z: 0 });
  });
  it("keeps all starter facilities inside the large city", () => {
    expect(CITY_SIZE).toBeGreaterThan(150);
    for (const facility of STARTER_FACILITIES) {
      expect(Math.abs(facility.x)).toBeLessThan(CITY_SIZE / 2);
      expect(Math.abs(facility.z)).toBeLessThan(CITY_SIZE / 2);
    }
  });
});