import { skills } from "../skills";
export const themes = [
  {
    id: "place-value",
    name: "Place Value",
    description: "Big discoveries with tens and ones.",
    skills: skills.map((s) => s.id),
  },
];
export function makeTheme(
  start = new Date().toISOString().slice(0, 10),
  id = "place-value",
) {
  const theme = themes.find((t) => t.id === id)!;
  const end = new Date(start + "T12:00:00");
  end.setDate(end.getDate() + 13);
  return {
    id: theme.id,
    name: theme.name,
    start,
    end: end.toISOString().slice(0, 10),
    skills: theme.skills,
  };
}
