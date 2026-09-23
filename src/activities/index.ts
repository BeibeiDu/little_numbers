import { random } from "../logic/questions";
export const templates = [
  {
    id: "detective",
    name: "Number Detective",
    icon: "⌕",
    color: "peach",
    summary: "Find the maths hiding around your home.",
    materials: "Your curious eyes",
    steps: (n: number) => [
      "Find three 2-digit numbers around your home.",
      "Say how many tens and ones are in each.",
      "Make each number 10 bigger.",
      "Put your numbers in order.",
      `Bonus: can you find a number greater than ${n}?`,
    ],
  },
  {
    id: "shop",
    name: "Kitchen Shop",
    icon: "◉",
    color: "lavender",
    summary: "Turn the kitchen into a little shop.",
    materials: "3 objects · pretend coins",
    steps: (n: number) => [
      `Give three things prices: ${n}p, ${n + 7}p and ${n + 12}p.`,
      "Draw or find pretend 10p and 1p coins.",
      "Make each price using your coins.",
      "Which item costs the most?",
    ],
  },
  {
    id: "make",
    name: "Make the Number",
    icon: "▦",
    color: "sage",
    summary: "Build tens and ones with things you love.",
    materials: "Lego, counters or paper",
    steps: (n: number) => [
      `Your number is ${n}.`,
      "Make groups of 10 with your objects.",
      "Add the extra ones.",
      "Show the same number with a drawing.",
    ],
  },
  {
    id: "day",
    name: "Number of the Day",
    icon: "☀",
    color: "butter",
    summary: "One number. So many ways to explore.",
    materials: "Paper · a pencil",
    steps: (n: number) => [
      `Meet today's number: ${n}.`,
      "How many tens? How many ones?",
      "Find 1 more and 1 less.",
      "Find 10 more and 10 less.",
      "Draw a picture of your number.",
    ],
  },
  {
    id: "train",
    name: "Ordering Train",
    icon: "↔",
    color: "blue",
    summary: "All aboard, from small to tall.",
    materials: "5 pieces of paper",
    steps: (n: number) => [
      `Write ${n}, ${n + 12}, ${n - 7}, ${n + 4} and ${n + 20} on separate pieces of paper.`,
      "Make a train from smallest to greatest.",
      "Now reverse your train.",
      "Tell someone how you chose the first number.",
    ],
  },
];
export function activityNumber(seed: number) {
  return 20 + Math.floor(random(seed)() * 50);
}
