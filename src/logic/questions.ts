import type { Question } from "../types";
export function random(seed: number) {
  let n = seed >>> 0;
  return () => {
    n = (Math.imul(1664525, n) + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
export function generate(
  skill: string,
  difficulty: number,
  seed: number,
): Question {
  const rng = random(seed),
    pick = (min: number, max: number) =>
      min + Math.floor(rng() * (max - min + 1));
  const n = pick(
      12,
      skill === "represent"
        ? Math.min(89, difficulty === 1 ? 49 : 89)
        : [49, 79, 89, 189, 489][Math.max(0, Math.min(4, difficulty - 1))],
    ),
    tens = Math.floor(n / 10),
    ones = n % 10;
  const q: Question = {
    skill,
    difficulty,
    prompt: "",
    answer: 0,
    explanation: "",
  };
  const shuffle = (values: number[]) => {
    for (let i = values.length - 1; i > 0; i--) {
      const j = pick(0, i);
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };
  const choice = (answer: number) => {
    q.answer = answer;
    q.options = shuffle([
      ...new Set([answer, answer + 1, Math.max(0, answer - 1), answer + 2]),
    ]);
  };
  if (skill === "tens") {
    q.prompt = `How many tens are in ${n}?`;
    choice(tens);
    q.explanation = `${n} = ${tens * 10} + ${ones}. That is ${tens} tens and ${ones} ones.`;
  } else if (skill === "represent") {
    q.prompt = "What number have we made?";
    q.visual = { tens, ones };
    q.answer = n;
    q.explanation = `${tens} tens make ${tens * 10}. Add ${ones} ones to make ${n}.`;
  } else if (skill === "partition") {
    q.prompt = `${n} = ${tens * 10} + ?`;
    q.answer = ones;
    q.explanation = `Split ${n} into ${tens} tens (${tens * 10}) and ${ones} ones.`;
  } else if (skill === "compare") {
    const other = n + pick(1, 9);
    q.prompt = "Which number is greater?";
    choice(other);
    q.options = shuffle([n, other]);
    q.explanation = `${other} is further along the number line than ${n}, so it is greater.`;
  } else if (skill === "order") {
    const nums = [n, n + pick(1, 4), n + pick(5, 9)];
    q.prompt = "Tap the numbers from smallest to greatest.";
    q.answer = nums;
    q.options = [nums[1], nums[2], nums[0]];
    q.explanation = `Start with the smallest: ${nums.join(" → ")}.`;
  } else if (["one-more", "one-less", "ten-more", "ten-less"].includes(skill)) {
    const change =
      (skill.startsWith("ten") ? 10 : 1) * (skill.endsWith("less") ? -1 : 1);
    q.prompt = `What is ${Math.abs(change)} ${change > 0 ? "more" : "less"} than ${n}?`;
    q.answer = n + change;
    q.explanation = `${n} ${change > 0 ? "+" : "−"} ${Math.abs(change)} = ${n + change}. ${Math.abs(change) === 10 ? "Change the tens; the ones stay the same." : "Move one step along the number line."}`;
  } else if (skill.startsWith("count-")) {
    const step = Number(skill.split("-")[1]),
      start = pick(0, difficulty === 1 ? 3 : 10) * step;
    q.prompt = `${start}, ${start + step}, ${start + step * 2}, … what comes next?`;
    q.answer = start + step * 3;
    q.explanation = `Add ${step} each time. ${start + step * 2} + ${step} = ${q.answer}.`;
  } else if (skill === "money") {
    q.prompt = `Make ${n}p with ${tens} ten-pence coins. How many 1p coins do you need?`;
    q.answer = ones;
    q.explanation = `${tens} × 10p = ${tens * 10}p. Add ${ones} × 1p to make ${n}p.`;
  } else if (skill === "real") {
    q.prompt = `A house has the number ${n}. What is its ones digit?`;
    choice(ones);
    q.explanation = `The right-hand digit tells us the ones. In ${n}, that is ${ones}.`;
  } else if (skill === "flexible") {
    const big = 100 + n;
    q.prompt = `${big} = ? tens + ${ones} ones`;
    q.answer = 10 + tens;
    q.explanation = `100 is 10 tens. ${big} = ${10 + tens} tens + ${ones} ones.`;
  } else throw new Error("Unknown skill");
  return q;
}
export function isCorrect(q: Question, answer: number | number[]) {
  return Array.isArray(q.answer)
    ? Array.isArray(answer) &&
        q.answer.length === answer.length &&
        q.answer.every((x, i) => x === answer[i])
    : q.answer === answer;
}
