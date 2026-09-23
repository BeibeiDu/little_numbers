import { useEffect, useRef, useState } from "react";
import type { Question, State } from "./types";
import { skills } from "./skills";
import { themes, makeTheme } from "./themes";
import { templates, activityNumber } from "./activities";
import { emptyMastery, selectSkill, updateMastery } from "./logic/mastery";
import { generate, isCorrect } from "./logic/questions";
import {
  download,
  freshState,
  readState,
  saveState,
  validate,
} from "./storage";
import { NumberBlocks } from "./components/NumberBlocks";
import "./style.css";

type Screen =
  "home" | "questions" | "activities" | "progress" | "parents" | "privacy";
const seed = () => crypto.getRandomValues(new Uint32Array(1))[0];
export default function App() {
  const [data, setData] = useState<State | null>(null),
    [screen, setScreen] = useState<Screen>("home"),
    [error, setError] = useState(""),
    [name, setName] = useState(""),
    [avatar, setAvatar] = useState("🌱");
  const [gate, setGate] = useState(false),
    [unlocked, setUnlocked] = useState(false),
    [holding, setHolding] = useState(false),
    hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [question, setQuestion] = useState<Question | null>(null),
    [answer, setAnswer] = useState(""),
    [ordered, setOrdered] = useState<number[]>([]),
    [result, setResult] = useState<boolean | null>(null),
    [session, setSession] = useState(""),
    [index, setIndex] = useState(0),
    [total, setTotal] = useState(10),
    [score, setScore] = useState(0),
    [done, setDone] = useState(false);
  const [activity, setActivity] = useState<string | null>(null),
    [activitySeed, setActivitySeed] = useState(seed),
    [activityDone, setActivityDone] = useState(false),
    [restore, setRestore] = useState<State | null>(null),
    [reset, setReset] = useState(false),
    [saving, setSaving] = useState(false);
  const writeQueue = useRef(Promise.resolve());
  useEffect(() => {
    readState()
      .then(setData)
      .catch(() =>
        setError(
          "We could not open local storage. Check that your browser allows website storage, then reload.",
        ),
      );
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen, done, activity]);
  useEffect(() => {
    if (question) document.getElementById("question-title")?.focus();
  }, [question]);
  function commit(next: State) {
    setData(next);
    setSaving(true);
    writeQueue.current = writeQueue.current
      .then(() => saveState(next))
      .then(() => {
        setError("");
        setSaving(false);
      })
      .catch(() => {
        setSaving(false);
        setError(
          "Progress could not be saved on this device. Export a backup from Parent Settings before closing.",
        );
      });
  }
  function go(next: Screen) {
    setScreen(next);
    setGate(false);
    if (next !== "parents") setUnlocked(false);
  }
  function newQuestion(s: State, i: number, repeat?: string) {
    const id = selectSkill(s, i, seed(), repeat);
    setQuestion(generate(id, s.mastery[id]?.difficulty ?? 1, seed()));
    setAnswer("");
    setOrdered([]);
    setResult(null);
  }
  function start(count: number) {
    if (!data) return;
    setTotal(count);
    setIndex(0);
    setScore(0);
    setDone(false);
    setSession(crypto.randomUUID());
    newQuestion(data, 0);
    go("questions");
  }
  function check() {
    if (!data || !question || result !== null) return;
    const correct = isCorrect(
        question,
        Array.isArray(question.answer) ? ordered : Number(answer),
      ),
      date = new Date().toISOString();
    const m = updateMastery(
      data.mastery[question.skill] ?? emptyMastery(),
      correct,
      session,
      date,
    );
    const previous = data.sessions.find((s) => s.id === session);
    const next = {
      ...data,
      mastery: { ...data.mastery, [question.skill]: m },
      attempts: [
        ...data.attempts,
        {
          skill: question.skill,
          correct,
          date,
          session,
          difficulty: question.difficulty,
        },
      ],
      sessions: [
        ...data.sessions.filter((s) => s.id !== session),
        {
          id: session,
          date: previous?.date ?? date,
          count: (previous?.count ?? 0) + 1,
          correct: (previous?.correct ?? 0) + Number(correct),
        },
      ],
    };
    commit(next);
    setResult(correct);
    setScore(score + Number(correct));
  }
  function next() {
    if (!data || !question) return;
    if (index + 1 >= total) {
      setDone(true);
      return;
    }
    const repeat = result === false ? question.skill : undefined;
    setIndex(index + 1);
    newQuestion(data, index + 1, repeat);
  }
  function stopHold() {
    if (hold.current) clearTimeout(hold.current);
    setHolding(false);
  }
  function startHold() {
    stopHold();
    setHolding(true);
    hold.current = setTimeout(() => {
      setUnlocked(true);
      setGate(false);
      setScreen("parents");
      setHolding(false);
    }, 1800);
  }
  const nav = (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button
        className={screen === "home" ? "active" : ""}
        onClick={() => go("home")}
      >
        <span>⌂</span>Home
      </button>
      <button
        className={screen === "activities" ? "active" : ""}
        onClick={() => go("activities")}
      >
        <span>▦</span>Activities
      </button>
      <button
        className={screen === "progress" ? "active" : ""}
        onClick={() => go("progress")}
      >
        <span>▥</span>My progress
      </button>
    </nav>
  );
  if (!data)
    return (
      <div className="loading">
        <div className="brand">✳ Little Numbers</div>
        <p>{error || "Getting your little maths space ready…"}</p>
      </div>
    );
  if (!data.nickname)
    return (
      <main className="welcome">
        <div className="brand">✳ Little Numbers</div>
        <div className="welcome-art">{avatar}</div>
        <p className="eyebrow">SMALL STEPS. BIG DISCOVERIES.</p>
        <h1>Hello, number explorer.</h1>
        <p>A little maths adventure, just for you.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) commit({ ...data, nickname: name.trim(), avatar });
          }}
        >
          <label htmlFor="nickname">What shall we call you?</label>
          <input
            id="nickname"
            autoComplete="off"
            maxLength={30}
            placeholder="Your first name or nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="avatars" aria-label="Choose an avatar">
            {["🌱", "🐻", "🐰", "🦊", "🐼"].map((a) => (
              <button
                type="button"
                key={a}
                aria-label={`Choose ${a}`}
                aria-pressed={a === avatar}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <button className="primary wide" disabled={!name.trim()}>
            Let’s explore <span>→</span>
          </button>
        </form>
        <p className="small">Your name and progress stay on this device.</p>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  const mastered = skills.filter(
      (s) => data.mastery[s.id]?.status === "secure",
    ).length,
    practised = skills.filter((s) => data.mastery[s.id]?.attempts > 0).length;
  const week = data.attempts.filter(
      (a) => Date.now() - Date.parse(a.date) < 7 * 86400000,
    ),
    accuracy = week.length
      ? Math.round((100 * week.filter((a) => a.correct).length) / week.length)
      : 0;
  const currentAverage = Math.round(
    data.theme.skills.reduce(
      (sum, id) => sum + (data.mastery[id]?.score ?? 0),
      0,
    ) / data.theme.skills.length,
  );
  const newlySecured = Object.values(data.mastery).filter(
    (m) => m.securedAt && Date.now() - Date.parse(m.securedAt) < 7 * 86400000,
  ).length;
  const ended = data.theme.end < new Date().toISOString().slice(0, 10);
  const recommended = [...templates].sort((a, b) => {
    const weight = (id: string) => {
      const recent = data.feedback
        .filter((f) => f.template === id)
        .slice(-1)[0];
      return !recent ? 1 : recent.rating === "Tricky" ? 0 : 2;
    };
    return weight(a.id) - weight(b.id);
  })[0];
  return (
    <>
      <header>
        <button
          className="brand"
          onClick={() => go("home")}
          aria-label="Little Numbers home"
        >
          <span className="brand-icon">✳</span> Little Numbers
        </button>
        <div className="header-right">
          <span className="local">● Just on this device</span>
          <button
            aria-label="For parents"
            className="parent-link"
            onClick={() => setGate(true)}
          >
            ⚙ <span>For parents</span>
          </button>
        </div>
      </header>
      <main className="shell">
        {error && (
          <div className="error" role="alert">
            {error}
          </div>
        )}
        {saving && (
          <span className="save-status" role="status">
            Saving…
          </span>
        )}
        {screen === "home" && (
          <>
            <section className="greeting">
              <div>
                <p className="eyebrow">YOUR LITTLE SPACE TO GROW</p>
                <h1>
                  Hello, {data.nickname} <span className="wave">✦</span>
                </h1>
                <p>Ready to discover something new?</p>
              </div>
              <div className="avatar-badge">{data.avatar}</div>
            </section>
            <section className="theme-card">
              <div className="theme-copy">
                <div className="pill">THIS FORTNIGHT’S ADVENTURE</div>
                <h2>
                  Every number
                  <br />
                  has a story.
                </h2>
                <p>
                  Let’s explore <strong>place value</strong>,<br />
                  one little discovery at a time.
                </p>
                <div className="theme-progress">
                  <div>
                    <span>Place Value</span>
                    <span>{currentAverage}% explored</span>
                  </div>
                  <progress
                    aria-label="Current theme progress"
                    value={currentAverage}
                    max={100}
                  />
                </div>
              </div>
              <div className="number-art" aria-label="47 is 4 tens and 7 ones">
                <span className="art-spark s1">✦</span>
                <div className="number-tiles">
                  <div className="tile tens">
                    4<small>TENS</small>
                  </div>
                  <div className="tile ones">
                    7<small>ONES</small>
                  </div>
                </div>
                <NumberBlocks tens={4} ones={7} decorative />
                <div className="art-caption">40 + 7 = 47</div>
                <span className="art-spark s2">✧</span>
              </div>
            </section>
            <div className="section-title">
              <h2>A little maths today</h2>
              <span>No rush. Go at your pace.</span>
            </div>
            <section className="action-grid">
              <button
                className="action-card challenge"
                onClick={() => start(10)}
              >
                <span className="card-icon">◷</span>
                <span className="tag">A GREAT PLACE TO START</span>
                <h3>5-minute challenge</h3>
                <p>
                  Ten little questions.
                  <br />A lovely little brain stretch.
                </p>
                <span className="card-footer">
                  Let’s have a go <b>→</b>
                </span>
              </button>
              <button
                className="action-card activity"
                onClick={() => {
                  setActivity(null);
                  go("activities");
                }}
              >
                <span className="card-icon">▦</span>
                <span className="tag">OFF-SCREEN EXPLORING</span>
                <h3>Play a maths activity</h3>
                <p>
                  Build, spot and play with
                  <br />
                  numbers all around you.
                </p>
                <span className="card-footer">
                  Choose an activity <b>→</b>
                </span>
              </button>
              <button className="action-card quick" onClick={() => start(5)}>
                <span className="card-icon">ϟ</span>
                <span className="tag">JUST A MOMENT?</span>
                <h3>Quick questions</h3>
                <p>
                  Five quick discoveries.
                  <br />
                  Every little bit counts.
                </p>
                <span className="card-footer">
                  Jump in <b>→</b>
                </span>
              </button>
            </section>
            <section className="growth-strip">
              <span className="growth-icon">❀</span>
              <div>
                <h3>You’re growing, one step at a time.</h3>
                <p>
                  {practised
                    ? `${practised} skills explored. There’s always something new to discover.`
                    : "Your first little discovery is waiting for you."}
                </p>
              </div>
              <button onClick={() => go("progress")}>
                My progress <span>→</span>
              </button>
            </section>
            <p className="home-note">
              A little practice. A lot of possibility.
            </p>
          </>
        )}
        {screen === "questions" && question && (
          <section className="practice">
            {done ? (
              <div className="finish">
                <span className="big-icon">🌱</span>
                <p className="eyebrow">A LITTLE MORE GROWN</p>
                <h1>Lovely exploring, {data.nickname}.</h1>
                <p>
                  You tried {total} questions and got {score} right.
                </p>
                <p>Every question helps you learn.</p>
                <button className="primary" onClick={() => go("home")}>
                  Back to my space →
                </button>
                <button className="text-button" onClick={() => go("progress")}>
                  See my progress
                </button>
              </div>
            ) : (
              <>
                <div className="practice-top">
                  <button className="text-button" onClick={() => go("home")}>
                    ← Finish for now
                  </button>
                  <span>
                    Question {index + 1} of {total}
                  </span>
                </div>
                <progress
                  value={index + (result !== null ? 1 : 0)}
                  max={total}
                />
                <p className="eyebrow">
                  {skills.find((s) => s.id === question.skill)?.name}
                </p>
                <h1
                  id="question-title"
                  key={`${session}-${index}`}
                  tabIndex={-1}
                >
                  {question.prompt}
                </h1>
                {question.visual && (
                  <NumberBlocks
                    tens={question.visual.tens}
                    ones={question.visual.ones}
                  />
                )}
                {Array.isArray(question.answer) ? (
                  <>
                    <div className="ordered" aria-live="polite">
                      {ordered.length
                        ? ordered.join(" → ")
                        : "Your number train goes here"}
                    </div>
                    <div className="choices">
                      {question.options?.map((n) => (
                        <button
                          key={n}
                          disabled={result !== null || ordered.includes(n)}
                          onClick={() => setOrdered([...ordered, n])}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <button
                      className="text-button"
                      disabled={result !== null}
                      onClick={() => setOrdered([])}
                    >
                      Start the order again
                    </button>
                  </>
                ) : question.options ? (
                  <div className="choices">
                    {question.options.map((n) => (
                      <button
                        key={n}
                        disabled={result !== null}
                        aria-pressed={answer === String(n)}
                        onClick={() => setAnswer(String(n))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (answer.trim()) check();
                    }}
                  >
                    <label className="sr-only" htmlFor="answer">
                      Your answer
                    </label>
                    <input
                      id="answer"
                      className="number-input"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      value={answer}
                      disabled={result !== null}
                      placeholder="?"
                      onChange={(e) =>
                        setAnswer(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                        )
                      }
                    />
                  </form>
                )}
                {result === null ? (
                  <button
                    className="primary check"
                    disabled={
                      Array.isArray(question.answer)
                        ? ordered.length !== question.answer.length
                        : !answer.trim()
                    }
                    onClick={check}
                  >
                    Check my answer →
                  </button>
                ) : (
                  <div
                    className={`feedback ${result ? "correct" : "try"}`}
                    role="status"
                  >
                    <h3>
                      {result
                        ? "That’s it! Nicely done."
                        : "Good try. Let’s take a look."}
                    </h3>
                    {!result && <p>{question.explanation}</p>}
                    {!result &&
                      data.mastery[question.skill]?.recent
                        .slice(-2)
                        .every((x) => !x) && (
                        <p>
                          Let’s practise that idea once more. Take your time.
                        </p>
                      )}
                    <button className="primary" onClick={next}>
                      {index + 1 === total
                        ? "Finish exploring"
                        : "Next question"}{" "}
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
        {screen === "activities" && (
          <>
            <p className="eyebrow">MATHS IS EVERYWHERE</p>
            <h1>Let’s play with numbers.</h1>
            <p>Little adventures for curious minds. Bring a grown-up along.</p>
            {activity ? (
              (() => {
                const t = templates.find((t) => t.id === activity)!;
                return (
                  <section className={`activity-detail ${t.color}`}>
                    <button
                      className="text-button"
                      onClick={() => setActivity(null)}
                    >
                      ← All activities
                    </button>
                    <span className="big-icon">{t.icon}</span>
                    <h2>{t.name}</h2>
                    <p className="materials">You’ll need: {t.materials}</p>
                    <ol>
                      {t.steps(activityNumber(activitySeed)).map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    {activityDone ? (
                      <div role="status">
                        <h3>A lovely little discovery!</h3>
                        <button
                          className="primary"
                          onClick={() => {
                            setActivitySeed(seed());
                            setActivityDone(false);
                          }}
                        >
                          Try another version →
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3>How did it feel?</h3>
                        <div className="rating">
                          {(["Easy", "About right", "Tricky"] as const).map(
                            (r) => (
                              <button
                                key={r}
                                onClick={() => {
                                  commit({
                                    ...data,
                                    feedback: [
                                      ...data.feedback,
                                      {
                                        template: t.id,
                                        rating: r,
                                        date: new Date().toISOString(),
                                      },
                                    ],
                                  });
                                  setActivityDone(true);
                                }}
                              >
                                {r === "Easy"
                                  ? "☀"
                                  : r === "Tricky"
                                    ? "🌱"
                                    : "☺"}{" "}
                                {r}
                              </button>
                            ),
                          )}
                        </div>
                      </>
                    )}
                  </section>
                );
              })()
            ) : (
              <div className="activity-grid">
                {templates.map((t) => (
                  <button
                    className={`activity-option ${t.color}`}
                    key={t.id}
                    onClick={() => {
                      setActivity(t.id);
                      setActivitySeed(seed());
                      setActivityDone(false);
                    }}
                  >
                    <span className="card-icon">{t.icon}</span>
                    {recommended.id === t.id && (
                      <span className="tag">A LITTLE IDEA FOR TODAY</span>
                    )}
                    <h2>{t.name}</h2>
                    <p>{t.summary}</p>
                    <span className="card-footer">
                      Let’s explore <b>→</b>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        {screen === "progress" && (
          <>
            <p className="eyebrow">SMALL STEPS ADD UP</p>
            <h1>Look how you’re growing.</h1>
            <p>
              Your discoveries in {data.theme.name}. Everyone learns at their
              own pace.
            </p>
            <div className="stats">
              <div>
                <strong>{week.length}</strong>
                <span>questions in the last 7 days</span>
              </div>
              <div>
                <strong>{week.length ? `${accuracy}%` : "—"}</strong>
                <span>correct in the last 7 days</span>
              </div>
              <div>
                <strong>{mastered}</strong>
                <span>
                  skills feeling secure · {newlySecured} new this week
                </span>
              </div>
            </div>
            <section className="panel">
              <h2>Your number skills</h2>
              <div className="skill-list">
                {skills.map((s) => {
                  const m = data.mastery[s.id] ?? emptyMastery();
                  return (
                    <div className="skill-row" key={s.id}>
                      <div>
                        <strong>{s.name}</strong>
                        <progress
                          aria-label={`${s.name} mastery`}
                          value={m.score}
                          max={100}
                        />
                      </div>
                      <span className={`status ${m.status}`}>
                        {m.status === "new"
                          ? "Ready to explore"
                          : m.status === "learning"
                            ? "Learning"
                            : m.status === "developing"
                              ? "Developing"
                              : "Secure"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="panel">
              <h2>Recent discoveries</h2>
              {data.sessions.length ? (
                data.sessions
                  .slice(-6)
                  .reverse()
                  .map((s) => (
                    <div className="history" key={s.id}>
                      <span>
                        ✦{" "}
                        {new Date(s.date).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>
                        {s.count} questions · {s.correct} correct
                      </span>
                    </div>
                  ))
              ) : (
                <p>Your first practice will appear here.</p>
              )}
            </section>
          </>
        )}
        {screen === "parents" && unlocked && (
          <>
            <p className="eyebrow">A SPACE FOR GROWN-UPS</p>
            <h1>Parent settings</h1>
            <p>Small adjustments to support their next discovery.</p>
            <section className="panel">
              <h2>Their little space</h2>
              <label htmlFor="edit-name">First name or nickname</label>
              <input
                id="edit-name"
                maxLength={30}
                value={data.nickname}
                onChange={(e) => {
                  if (e.target.value.trim())
                    commit({ ...data, nickname: e.target.value });
                }}
              />
              <div className="avatars">
                {["🌱", "🐻", "🐰", "🦊", "🐼"].map((a) => (
                  <button
                    key={a}
                    aria-label={`Choose ${a}`}
                    aria-pressed={data.avatar === a}
                    onClick={() => commit({ ...data, avatar: a })}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </section>
            <section className="panel">
              <h2>Your 2-week theme</h2>
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={data.theme.id}
                onChange={(e) =>
                  commit({
                    ...data,
                    theme: makeTheme(data.theme.start, e.target.value),
                  })
                }
              >
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <label htmlFor="start">Start date</label>
              <input
                id="start"
                type="date"
                value={data.theme.start}
                onChange={(e) => {
                  if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value))
                    commit({ ...data, theme: makeTheme(e.target.value) });
                }}
              />
              <p>
                Ends{" "}
                {new Date(data.theme.end + "T12:00:00").toLocaleDateString()}.{" "}
                {ended
                  ? "This fortnight is complete. Restart when you’re ready."
                  : "Progress carries on when the theme changes."}
              </p>
              <button onClick={() => commit({ ...data, theme: makeTheme() })}>
                Start a new fortnight
              </button>
              <p className="small">
                Place Value is the first theme. More themes can be added without
                losing skills.
              </p>
            </section>
            <section className="panel">
              <h2>Progress & backups</h2>
              <p>
                Browser data can be cleared by your device. Keep an occasional
                backup somewhere safe.
              </p>
              <div className="button-row">
                <button onClick={() => go("progress")}>View progress</button>
                <button onClick={() => download(data)}>
                  Export progress ↓
                </button>
                <label className="button file-button">
                  Restore progress ↑
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        if (file.size > 10_000_000)
                          throw new Error(
                            "Please choose a backup smaller than 10 MB.",
                          );
                        setRestore(validate(JSON.parse(await file.text())));
                      } catch (e) {
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Could not read the backup.",
                        );
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {restore && (
                <div className="confirmation">
                  <h3>Restore {restore.nickname}’s backup?</h3>
                  <p>
                    {restore.attempts.length} answers and{" "}
                    {restore.sessions.length} sessions will replace this
                    device’s current progress.
                  </p>
                  <button
                    onClick={() => {
                      commit(restore);
                      setRestore(null);
                    }}
                  >
                    Replace with this backup
                  </button>
                  <button onClick={() => setRestore(null)}>Cancel</button>
                </div>
              )}
              <details>
                <summary>Detailed skill records</summary>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Skill</th>
                        <th>Attempts</th>
                        <th>Correct</th>
                        <th>Level</th>
                        <th>Last practice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.map((s) => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td>{data.mastery[s.id]?.attempts ?? 0}</td>
                          <td>{data.mastery[s.id]?.correct ?? 0}</td>
                          <td>{data.mastery[s.id]?.difficulty ?? 1}</td>
                          <td>
                            {data.mastery[s.id]?.lastPractised?.slice(0, 10) ??
                              "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </section>
            <section className="panel">
              <h2>A fresh start</h2>
              <p>
                Reset removes the nickname, answers and progress from this
                device.
              </p>
              {reset ? (
                <div className="confirmation">
                  <p>Have you exported anything you want to keep?</p>
                  <button
                    className="danger"
                    onClick={() => {
                      commit(freshState());
                      setReset(false);
                      setName("");
                      go("home");
                    }}
                  >
                    Yes, erase local progress
                  </button>
                  <button onClick={() => setReset(false)}>Keep progress</button>
                </div>
              ) : (
                <button className="danger" onClick={() => setReset(true)}>
                  Reset progress
                </button>
              )}
            </section>
          </>
        )}
        {screen === "privacy" && (
          <section className="panel privacy">
            <p className="eyebrow">A SMALL, PRIVATE SPACE</p>
            <h1>About Little Numbers</h1>
            <p>
              This is an informal maths practice tool. Progress is stored only
              on this device and is not uploaded or visible to other families.
            </p>
            <p>No analytics. No advertising. No external tracking.</p>
            <p>
              There is no account or cloud sync. Your nickname, answers,
              activities and progress are saved in this browser’s IndexedDB.
              Each browser and device has its own profile.
            </p>
            <p>
              The hosting provider receives ordinary requests when you load the
              app, but the app never sends your child’s name or progress.
              Exported backups contain their nickname and progress; store them
              somewhere private.
            </p>
            <h2>Take a little maths with you</h2>
            <p>
              On iPad, open this site in Safari, tap Share, then Add to Home
              Screen. Open it once while online and allow it to finish loading
              before using it offline.
            </p>
            <p>
              If you clear website data, progress will be removed. Export a
              backup in Parent Settings to keep a copy.
            </p>
          </section>
        )}
        <footer>
          <span>Made for little discoveries.</span>
          <button onClick={() => go("privacy")}>About & privacy</button>
        </footer>
      </main>
      {nav}
      {gate && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gate-title"
          >
            <button
              className="close"
              onClick={() => {
                stopHold();
                setGate(false);
              }}
              aria-label="Close"
            >
              ×
            </button>
            <span className="big-icon">⚙</span>
            <h2 id="gate-title">Hello, grown-up.</h2>
            <p>Press and hold below for two seconds to open Parent Settings.</p>
            <button
              className={`primary wide ${holding ? "holding" : ""}`}
              onPointerDown={startHold}
              onPointerUp={stopHold}
              onPointerCancel={stopHold}
              onPointerLeave={stopHold}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  startHold();
                }
              }}
              onKeyUp={stopHold}
              onBlur={stopHold}
            >
              {holding ? "Keep holding…" : "Hold to open settings"}
            </button>
          </section>
        </div>
      )}
    </>
  );
}
