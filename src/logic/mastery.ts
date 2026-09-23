import type { Mastery, State } from "../types";
import { skills } from "../skills";
export const emptyMastery = (): Mastery => ({
  score: 0,
  securedAt: null,
  attempts: 0,
  correct: 0,
  recent: [],
  sessions: [],
  lastPractised: null,
  difficulty: 1,
  status: "new",
});
export function updateMastery(
  old: Mastery,
  correct: boolean,
  session: string,
  date: string,
): Mastery {
  const recent = [...old.recent, correct].slice(-10),
    attempts = old.attempts + 1,
    sessions = [...new Set([...old.sessions, session])];
  const score = Math.round(
    (recent.filter(Boolean).length / recent.length) *
      100 *
      Math.min(1, attempts / 8),
  );
  const secure = score >= 80 && attempts >= 10 && sessions.length >= 3;
  const difficulty = Math.min(
    5,
    Math.max(
      1,
      old.difficulty +
        (recent.length >= 4 &&
        recent.slice(-4).every(Boolean) &&
        attempts % 4 === 0
          ? 1
          : recent.slice(-2).length === 2 && recent.slice(-2).every((x) => !x)
            ? -1
            : 0),
    ),
  );
  return {
    score,
    securedAt: old.securedAt ?? (secure ? date : null),
    attempts,
    correct: old.correct + Number(correct),
    recent,
    sessions,
    lastPractised: date,
    difficulty,
    status: secure ? "secure" : score >= 55 ? "developing" : "learning",
  };
}
export function selectSkill(
  state: State,
  index: number,
  seed: number,
  repeat?: string,
) {
  if (repeat) return repeat;
  const eligible = skills.filter((s) =>
    s.prerequisites.every((p) => (state.mastery[p]?.score ?? 0) >= 40),
  );
  const current = eligible.filter((s) => state.theme.skills.includes(s.id));
  const revision = skills
    .filter((s) => state.mastery[s.id]?.attempts > 0)
    .sort((a, b) =>
      (state.mastery[a.id].lastPractised || "").localeCompare(
        state.mastery[b.id].lastPractised || "",
      ),
    );
  const stretch = skills.filter(
    (s) =>
      !eligible.includes(s) &&
      s.prerequisites.every((p) => (state.mastery[p]?.attempts ?? 0) > 0),
  );
  const pool =
    index % 10 === 9 && stretch.length
      ? stretch
      : index % 10 >= 7 && index % 10 <= 8 && revision.length
        ? revision.slice(0, 4)
        : current.length
          ? current
          : eligible;
  const weighted = pool.flatMap((s) =>
    Array.from(
      { length: state.mastery[s.id]?.status === "secure" ? 1 : 3 },
      () => s.id,
    ),
  );
  return weighted[(seed >>> 0) % weighted.length];
}
