export const CITY_SIZE = 210;
export const STARTER_FACILITIES = [
  { id: "commercial", label: "المركز التجاري", x: 0, z: 0 },
  { id: "recruitment", label: "مركز توظيف العمال", x: -16, z: 4 },
  { id: "forest", label: "الغابة", x: -38, z: -31 },
  { id: "quarry", label: "المحجرة", x: 35, z: -28 },
] as const;
export type CityFocus = "all" | typeof STARTER_FACILITIES[number]["id"];