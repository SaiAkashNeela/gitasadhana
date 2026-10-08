/** Wisdom themes from the original app; titles are the i18n keys t1…t6. */
export const wisdomThemes = [
  { id: "t1", query: "duty", scene: 0 },
  { id: "t2", query: "detachment", scene: 2 },
  { id: "t3", query: "devotion", scene: 4 },
  { id: "t4", query: "meditation", scene: 6 },
  { id: "t5", query: "soul", scene: 7 },
  { id: "t6", query: "liberation", scene: 8 },
] as const;

export type WisdomTheme = (typeof wisdomThemes)[number];
