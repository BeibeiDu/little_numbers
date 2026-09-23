import { describe, it, expect } from "vitest";
import { generate, isCorrect } from "./questions";
import { emptyMastery, updateMastery, selectSkill } from "./mastery";
import { skills } from "../skills";
import { freshState, validate } from "../storage";
import { makeTheme } from "../themes";
describe("generated questions", () => {
  it("are deterministic and accept only the right answer for every skill and level", () => {
    for (const s of skills)
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 100; seed++) {
          const q = generate(s.id, level, seed);
          expect(q).toEqual(generate(s.id, level, seed));
          expect(isCorrect(q, q.answer)).toBe(true);
          expect(
            isCorrect(
              q,
              Array.isArray(q.answer) ? [...q.answer].reverse() : q.answer + 1,
            ),
          ).toBe(false);
          if (q.options && !Array.isArray(q.answer)) {
            expect(q.options).toContain(q.answer);
            expect(new Set(q.options).size).toBe(q.options.length);
          }
          if (q.visual)
            expect(q.answer).toBe(q.visual.tens * 10 + q.visual.ones);
        }
  });
  it("has independently correct arithmetic and partitioning", () => {
    for (let seed = 0; seed < 100; seed++) {
      for (const id of ["one-more", "one-less", "ten-more", "ten-less"]) {
        const q = generate(id, 3, seed),
          nums = q.prompt.match(/\d+/g)!.map(Number);
        expect(q.answer).toBe(
          nums[1] + nums[0] * (id.endsWith("less") ? -1 : 1),
        );
      }
      const q = generate("partition", 3, seed),
        nums = q.prompt.match(/\d+/g)!.map(Number);
      expect(q.answer).toBe(nums[0] - nums[1]);
      const f = generate("flexible", 5, seed),
        ns = f.prompt.match(/\d+/g)!.map(Number);
      expect(Number(f.answer) * 10 + ns[1]).toBe(ns[0]);
    }
  });
});
describe("mastery", () => {
  it("does not advance from one answer, or secure a skill in one session", () => {
    let m = updateMastery(emptyMastery(), true, "a", new Date().toISOString());
    expect(m.difficulty).toBe(1);
    expect(m.status).not.toBe("secure");
    for (let i = 0; i < 20; i++)
      m = updateMastery(m, true, "a", new Date().toISOString());
    expect(m.status).not.toBe("secure");
    m = updateMastery(m, true, "b", new Date().toISOString());
    m = updateMastery(m, true, "c", new Date().toISOString());
    expect(m.status).toBe("secure");
  });
  it("lowers difficulty when a child struggles", () => {
    let m = { ...emptyMastery(), difficulty: 3 };
    m = updateMastery(m, false, "a", new Date().toISOString());
    m = updateMastery(m, false, "a", new Date().toISOString());
    expect(m.difficulty).toBe(2);
  });
  it("selects available skills with safe fallbacks and repeats a struggling concept", () => {
    const s = freshState();
    for (let i = 0; i < 100; i++)
      expect(skills.some((k) => k.id === selectSkill(s, i, i))).toBe(true);
    expect(selectSkill(s, 2, 3, "tens")).toBe("tens");
  });
});
describe("backups", () => {
  it("round-trips all progress data", () => {
    const s = freshState();
    s.nickname = "Robin";
    s.mastery.tens = updateMastery(
      emptyMastery(),
      true,
      "a",
      new Date().toISOString(),
    );
    expect(validate(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it("rejects malformed and unsupported backups before writing", () => {
    const s = freshState();
    for (const bad of [
      null,
      {},
      { ...s, version: 2 },
      { ...s, nickname: 8 },
      { ...s, theme: { ...s.theme, skills: ["unknown"] } },
      { ...s, mastery: { tens: { ...emptyMastery(), score: 999 } } },
      { ...s, attempts: [{ skill: "tens" }] },
      { ...s, feedback: [{ rating: "oops" }] },
      { ...s, sessions: [{ count: -1 }] },
    ])
      expect(() => validate(bad)).toThrow();
  });
  it("makes a 14-day inclusive theme across month boundaries", () => {
    expect(makeTheme("2026-01-27").end).toBe("2026-02-09");
  });
});
