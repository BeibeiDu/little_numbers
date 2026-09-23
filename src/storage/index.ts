import { openDB } from "idb";
import type { State } from "../types";
import { makeTheme } from "../themes";
import { skills } from "../skills";
import { templates } from "../activities";
export const freshState = (): State => ({
  version: 1,
  nickname: "",
  avatar: "🌱",
  theme: makeTheme(),
  mastery: {},
  attempts: [],
  sessions: [],
  feedback: [],
  settings: { sound: false },
});
const db = () =>
  openDB("little-numbers", 1, {
    upgrade(db) {
      db.createObjectStore("progress");
    },
  });
export async function readState() {
  const data = await (await db()).get("progress", "child");
  return data ? validate(data) : freshState();
}
export async function saveState(state: State) {
  await (await db()).put("progress", state, "child");
}
export function validate(value: unknown): State {
  const fail = () => {
    throw new Error(
      "This is not a valid Little Numbers backup. Your progress has not changed.",
    );
  };
  if (!value || typeof value !== "object") return fail();
  const s = value as State,
    num = (x: unknown) => typeof x === "number" && Number.isFinite(x) && x >= 0,
    date = (x: unknown) =>
      typeof x === "string" && Number.isFinite(Date.parse(x)),
    id = (x: string) => skills.some((k) => k.id === x);
  if (
    s.version !== 1 ||
    typeof s.nickname !== "string" ||
    s.nickname.length > 30 ||
    !["🌱", "🐻", "🐰", "🦊", "🐼"].includes(s.avatar) ||
    !s.theme ||
    s.theme.id !== "place-value" ||
    s.theme.name !== "Place Value" ||
    !date(s.theme.start) ||
    !date(s.theme.end) ||
    !Array.isArray(s.theme.skills) ||
    !s.theme.skills.length ||
    !s.theme.skills.every(id) ||
    !s.mastery ||
    typeof s.mastery !== "object" ||
    Array.isArray(s.mastery) ||
    !Array.isArray(s.attempts) ||
    !Array.isArray(s.sessions) ||
    !Array.isArray(s.feedback) ||
    typeof s.settings?.sound !== "boolean"
  )
    return fail();
  if (
    new Date(s.theme.end).getTime() - new Date(s.theme.start).getTime() !==
    13 * 86400000
  )
    return fail();
  for (const [key, m] of Object.entries(s.mastery)) {
    if (
      !id(key) ||
      !m ||
      !(m.securedAt === null || date(m.securedAt)) ||
      !num(m.score) ||
      m.score > 100 ||
      !Number.isInteger(m.attempts) ||
      m.attempts < 0 ||
      !Number.isInteger(m.correct) ||
      m.correct < 0 ||
      m.correct > m.attempts ||
      !Array.isArray(m.recent) ||
      m.recent.length > 10 ||
      !m.recent.every((x) => typeof x === "boolean") ||
      !Array.isArray(m.sessions) ||
      !m.sessions.every((x) => typeof x === "string") ||
      !(m.lastPractised === null || date(m.lastPractised)) ||
      !Number.isInteger(m.difficulty) ||
      m.difficulty < 1 ||
      m.difficulty > 5 ||
      !["new", "learning", "developing", "secure"].includes(m.status)
    )
      return fail();
  }
  if (
    !s.attempts.every(
      (a) =>
        a &&
        id(a.skill) &&
        typeof a.correct === "boolean" &&
        date(a.date) &&
        typeof a.session === "string" &&
        Number.isInteger(a.difficulty) &&
        a.difficulty >= 1 &&
        a.difficulty <= 5,
    ) ||
    !s.sessions.every(
      (a) =>
        a &&
        typeof a.id === "string" &&
        date(a.date) &&
        Number.isInteger(a.count) &&
        a.count >= 0 &&
        Number.isInteger(a.correct) &&
        a.correct >= 0 &&
        a.correct <= a.count,
    ) ||
    !s.feedback.every(
      (a) =>
        a &&
        templates.some((t) => t.id === a.template) &&
        ["Easy", "About right", "Tricky"].includes(a.rating) &&
        date(a.date),
    )
  )
    return fail();
  return structuredClone(s);
}
export function download(state: State) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `little-numbers-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
