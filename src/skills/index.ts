import type { Skill } from "../types";
const rows: [string, string, number, string[]][] = [
  ["tens", "Tens and ones", 1, []],
  ["represent", "Build a number", 1, []],
  ["partition", "Split a number", 2, ["tens"]],
  ["compare", "Compare numbers", 3, ["tens"]],
  ["order", "Order numbers", 3, ["compare"]],
  ["one-more", "1 more", 4, ["tens"]],
  ["one-less", "1 less", 4, ["tens"]],
  ["ten-more", "10 more", 4, ["partition"]],
  ["ten-less", "10 less", 4, ["partition"]],
  ["count-2", "Count in 2s", 2, []],
  ["count-3", "Count in 3s", 3, ["count-2"]],
  ["count-5", "Count in 5s", 2, []],
  ["count-10", "Count in 10s", 1, []],
  ["money", "Tens and ones with money", 3, ["partition"]],
  ["real", "Numbers around us", 2, ["tens"]],
  ["flexible", "Hundreds and flexible splits", 5, ["partition", "ten-more"]],
];
export const skills: Skill[] = rows.map(([id, name, level, prerequisites]) => ({
  id,
  name,
  level,
  prerequisites,
  theme: "place-value",
}));
