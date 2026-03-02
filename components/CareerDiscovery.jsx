import { useState, useRef, useEffect } from "react";

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
const buildSystemPrompt = (profile) => `
You are Marco — a warm, energetic, and genuinely encouraging career coach for community college students. You're like that cool older sibling or mentor who's ALWAYS in your corner, but also gives real talk.

Your student's name is ${profile.name || "there"}. Here's what you know about them:

ACADEMIC PROFILE:
- School: Community college, studying ${profile.major || "History"}
- GPA: ${profile.gpa || "not provided"}
- Courses & Grades: ${profile.courses?.map(c => `${c.name}: ${c.grade}`).join(", ") || "not provided"}
- Test Scores: ${profile.testScores?.map(t => `${t.name}: ${t.score}`).join(", ") || "not provided"}
- Interests: ${profile.interests || "not specified"}
- Things they're good at: ${profile.strengths || "not specified"}
- Dream job or vague direction: ${profile.dreamJob || "not sure yet"}

YOUR PERSONALITY & APPROACH:
- You are HYPE. You genuinely believe in this person. When you see something good, you call it out with real enthusiasm.
- You are specific — you don't just say "great job!" you say WHY something about them is genuinely impressive or useful.
- You are honest but kind — if their grades in one area are lower, you reframe it (maybe that's not their path) instead of dwelling on it.
- You connect dots they can't see — "hey, the fact that you love history AND got a B+ in your writing class? That's actually a combo that law firms pay serious money for."
- You talk like a real person, not a guidance counselor. Casual, warm, direct.
- You use their name naturally throughout the conversation.
- You are NOT generic. Do not give cookie-cutter advice.
- Community college is a SMART choice — never make them feel lesser for it. Reframe it as strategic.

YOUR MISSION IN THIS CONVERSATION:
1. First, affirm what's genuinely strong about their profile — be specific and enthusiastic
2. Ask what they're actually curious about and enjoy day to day
3. Help them see skills they take for granted (History = research, writing, critical thinking, seeing patterns, understanding people — all RARE and valuable)
4. Guide them toward 2-3 AI-resistant, well-paying career paths that actually fit their profile
5. For each path: explain WHY they'd be good at it, what the salary looks like, how to get there from community college, and why AI won't replace it
6. Give them a concrete NEXT STEP they can do this week

AI-RESISTANT CAREERS to draw from (use what fits their profile):
- UX Research / Human Insight Research — companies pay $80-130k to understand real humans. AI can't do real human interviews.
- Paralegal → Law school path — history students are MADE for this. Research + writing + critical thinking.
- Policy Analyst / Government work — history + writing = perfect pipeline. Stable, meaningful, AI-resistant.
- K-12 Teacher / College Instructor — teaching is deeply human. Social studies teachers are needed everywhere.
- Archivist / Museum Curator — history majors have a built-in advantage.
- Technical Writer / Content Strategist — writing + research skills. $70-120k. AI makes content but companies need humans to direct it.
- Nonprofit Program Manager — understanding people + organizing = needed everywhere.
- Human Resources / Recruiting — people skills + communication. Growing field.
- Sales / Account Management — history = understanding people = great salespeople. $80-150k+ with commission.
- Healthcare adjacent (Patient Advocate, Health Educator, Medical Scribe) — human-facing, growing.
- Journalism / Investigative reporting — context + research. Niche but valuable.
- Military Officer track — leadership, structure, strong benefits.

RULES:
- Keep messages conversational — not too long, not a wall of text
- Use line breaks generously so it reads like a text, not an essay
- NEVER be condescending about community college
- NEVER make them feel bad about imperfect grades
- Always end your first message by asking one engaging follow-up question
- Use emojis sparingly but warmly — like a real person would
- Be REAL. They can tell when they're being patronized.
- If they seem down on themselves, gently but firmly push back with specifics
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const gradeColor = (g) => {
  if (!g) return "#64748b";
  const grade = g.toUpperCase();
  if (grade.startsWith("A")) return "#22c55e";
  if (grade.startsWith("B")) return "#3b82f6";
  if (grade.startsWith("C")) return "#f59e0b";
  return "#f87171";
};

const gradeGpa = (g) => {
  if (!g) return 0;
  const map = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0 };
  return map[g.toUpperCase()] ?? 0;
};

// ─── WELCOME ──────────────────────────────────────────────────────────────────
function StepWelcome({ onNext }) {
  return (
    <div style={s.card}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🎓</div>
        <h1 style={s.heroTitle}>
          Hey — let's figure out<br />
          <em style={{ color: "#60a5fa", fontStyle: "italic" }}>your next move.</em>
        </h1>
        <p style={{ ...s.sub, marginTop: 16 }}>
          You're in community college, studying history, and you're not sure where it all goes.
        </p>
        <p style={{ ...s.sub, color: "#60a5fa", marginTop: 10, fontWeight: 500 }}>
          That's totally normal — and honestly? You're in a better position than you think. Let's find out why.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
        {[
          ["📋", "Enter your grades", "We'll look for strengths, not weaknesses"],
          ["🧠", "Tell us what you like", "Interests are data too"],
          ["🤖", "AI-proof careers", "Jobs that need real humans"],
          ["💰", "Real salary info", "Not vague — actual numbers"],
        ].map(([icon, title, desc]) => (
          <div key={title} style={{ background: "#162032", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#93c5fd", fontWeight: 600, marginBottom: 3 }}>{title}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#475569", lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
      <button style={s.btn} onClick={onNext}>Let's go →</button>
    </div>
  );
}

// ─── BASIC INFO ───────────────────────────────────────────────────────────────
function StepBasicInfo({ data, onChange, onNext }) {
  return (
    <div style={s.card}>
      <div style={s.stepHead}>
        <div style={s.stepNum}>Step 1 of 4</div>
        <h2 style={s.title}>About you</h2>
        <p style={s.sub}>Just the basics — no pressure.</p>
      </div>
      {[
        { label: "What's your first name?", key: "name", placeholder: "e.g. Alex" },
        { label: "What are you studying?", key: "major", placeholder: "e.g. History, General Studies, Undecided…" },
      ].map(f => (
        <div key={f.key} style={s.field}>
          <label style={s.label}>{f.label}</label>
          <input style={s.input} placeholder={f.placeholder} value={data[f.key]} onChange={e => onChange({ [f.key]: e.target.value })} />
        </div>
      ))}
      <div style={s.field}>
        <label style={s.label}>What do you actually enjoy? (hobbies, subjects, anything)</label>
        <textarea style={{ ...s.input, height: 76, resize: "vertical" }} placeholder="e.g. reading, talking to people, watching docs, gaming, sports…" value={data.interests} onChange={e => onChange({ interests: e.target.value })} />
      </div>
      <div style={s.field}>
        <label style={s.label}>What do people say you're good at, or what comes easy to you?</label>
        <textarea style={{ ...s.input, height: 76, resize: "vertical" }} placeholder="e.g. writing, explaining things, organizing, remembering facts, talking to people…" value={data.strengths} onChange={e => onChange({ strengths: e.target.value })} />
      </div>
      <div style={s.field}>
        <label style={s.label}>Any career ideas, even vague? (totally fine to say "no clue")</label>
        <input style={s.input} placeholder="e.g. law, teaching, business, no idea…" value={data.dreamJob} onChange={e => onChange({ dreamJob: e.target.value })} />
      </div>
      <button style={{ ...s.btn, opacity: data.name.trim() ? 1 : 0.5 }} onClick={onNext} disabled={!data.name.trim()}>
        Next: Grades →
      </button>
    </div>
  );
}

// ─── GRADES ───────────────────────────────────────────────────────────────────
function StepGrades({ data, onChange, onNext, onBack }) {
  const [cName, setCName] = useState("");
  const [cGrade, setCGrade] = useState("A");
  const grades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

  const add = () => {
    if (!cName.trim()) return;
    onChange({ courses: [...(data.courses || []), { name: cName.trim(), grade: cGrade }] });
    setCName("");
    setCGrade("A");
  };

  const remove = (i) => onChange({ courses: data.courses.filter((_, idx) => idx !== i) });

  const calcGpa = data.courses?.length
    ? (data.courses.reduce((s, c) => s + gradeGpa(c.grade), 0) / data.courses.length).toFixed(2)
    : null;

  return (
    <div style={s.card}>
      <div style={s.stepHead}>
        <div style={s.stepNum}>Step 2 of 4</div>
        <h2 style={s.title}>Your classes & grades</h2>
        <p style={s.sub}>Add your courses. Every grade tells us something useful — even the Cs.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="Course name (e.g. World History)" value={cName} onChange={e => setCName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <select value={cGrade} onChange={e => setCGrade(e.target.value)}
          style={{ ...s.input, width: 72, marginBottom: 0, paddingLeft: 10, paddingRight: 4 }}>
          {grades.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button style={s.addBtn} onClick={add}>+</button>
      </div>

      {data.courses?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {data.courses.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#162032", border: "1px solid #1e293b", borderRadius: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#cbd5e1" }}>{c.name}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: gradeColor(c.grade), minWidth: 30 }}>{c.grade}</span>
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#334155", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>×</button>
            </div>
          ))}
          {calcGpa && <div style={{ textAlign: "right", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#60a5fa", marginTop: 6 }}>Estimated GPA: <strong>{calcGpa}</strong></div>}
        </div>
      )}

      <div style={s.field}>
        <label style={s.label}>Overall GPA (if you know it)</label>
        <input style={s.input} placeholder="e.g. 3.2" value={data.gpa} onChange={e => onChange({ gpa: e.target.value })} />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <button style={{ ...s.btn, flex: 1 }} onClick={onNext}>Next: Test Scores →</button>
      </div>
    </div>
  );
}

// ─── TEST SCORES ──────────────────────────────────────────────────────────────
function StepTestScores({ data, onChange, onNext, onBack }) {
  const [tName, setTName] = useState("");
  const [tScore, setTScore] = useState("");
  const common = ["SAT", "ACT", "AP U.S. History", "AP World History", "AP English", "AP Gov", "ACCUPLACER", "CLEP"];

  const add = () => {
    if (!tName.trim() || !tScore.trim()) return;
    onChange({ testScores: [...(data.testScores || []), { name: tName.trim(), score: tScore.trim() }] });
    setTName(""); setTScore("");
  };

  const remove = (i) => onChange({ testScores: data.testScores.filter((_, idx) => idx !== i) });

  return (
    <div style={s.card}>
      <div style={s.stepHead}>
        <div style={s.stepNum}>Step 3 of 4</div>
        <h2 style={s.title}>Test scores</h2>
        <p style={s.sub}>SAT, ACT, AP exams, placement tests — add what you have. None? Skip to the next step.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {common.map(t => (
          <button key={t} onClick={() => setTName(t)}
            style={{ padding: "5px 12px", border: "1px solid", borderRadius: 20, fontSize: 12, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
              background: tName === t ? "#1e3a5f" : "#162032",
              borderColor: tName === t ? "#3b82f6" : "#1e293b",
              color: tName === t ? "#93c5fd" : "#475569",
            }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input style={{ ...s.input, flex: 1, marginBottom: 0 }} placeholder="Test name" value={tName} onChange={e => setTName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <input style={{ ...s.input, width: 90, marginBottom: 0 }} placeholder="Score" value={tScore} onChange={e => setTScore(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} />
        <button style={s.addBtn} onClick={add}>+</button>
      </div>

      {data.testScores?.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          {data.testScores.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#162032", border: "1px solid #1e293b", borderRadius: 8, marginBottom: 6 }}>
              <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#cbd5e1" }}>{t.name}</span>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#60a5fa" }}>{t.score}</span>
              <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "#334155", fontSize: 18, cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={s.backBtn} onClick={onBack}>← Back</button>
        <button style={{ ...s.btn, flex: 1 }} onClick={onNext}>Almost there →</button>
      </div>
    </div>
  );
}

// ─── API KEY ──────────────────────────────────────────────────────────────────
function StepApiKey({ onSubmit }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!val.trim().startsWith("sk-ant-")) { setErr("Needs to start with sk-ant- — get a free key at console.anthropic.com"); return; }
    onSubmit(val.trim());
  };
  return (
    <div style={s.card}>
      <div style={s.stepHead}>
        <div style={s.stepNum}>Step 4 of 4</div>
        <h2 style={s.title}>One last thing 🔑</h2>
        <p style={s.sub}>This app uses real AI to power your coaching session. You need a free Anthropic key.</p>
      </div>
      <div style={{ background: "#162032", border: "1px solid #1e3a5f", borderRadius: 10, padding: 16, marginBottom: 20, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#93c5fd", lineHeight: 1.8 }}>
        <strong>Get your free key (2 min):</strong><br />
        1. Go to <span style={{ color: "#60a5fa" }}>console.anthropic.com</span><br />
        2. Sign up free → "API Keys" → "Create Key"<br />
        3. Copy and paste it below<br />
        <span style={{ color: "#475569", fontSize: 13 }}>It stays in your browser only. Never stored anywhere.</span>
      </div>
      <div style={s.field}>
        <label style={s.label}>Your Anthropic API Key</label>
        <input type="password" style={s.input} placeholder="sk-ant-api03-..." value={val}
          onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        {err && <div style={{ color: "#f87171", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginTop: 5 }}>{err}</div>}
      </div>
      <button style={{ ...s.btn, marginTop: 4 }} onClick={submit}>Start my session →</button>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────
function ChatView({ profile, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
    }
  }, [input]);

  useEffect(() => { if (!ready) { setReady(true); kickoff(); } }, []);

  const callApi = async (msgs) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(profile), messages: msgs }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text;
  };

  const kickoff = async () => {
    setLoading(true);
    try {
      const opener = `Hi! I'm ${profile.name}. I study ${profile.major || "history"} at community college.${profile.gpa ? ` My GPA is ${profile.gpa}.` : ""}${profile.courses?.length ? ` My courses: ${profile.courses.map(c => `${c.name} (${c.grade})`).join(", ")}.` : ""}${profile.testScores?.length ? ` Test scores: ${profile.testScores.map(t => `${t.name}: ${t.score}`).join(", ")}.` : ""} Can you look at my profile and help me figure out what I should do?`;
      const reply = await callApi([{ role: "user", content: opener }]);
      setMessages([{ role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([{ role: "assistant", content: `Hmm, something went wrong: ${e.message}` }]);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);
    try {
      const reply = await callApi(allMsgs);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const avgGpa = profile.courses?.length
    ? (profile.courses.reduce((sum, c) => sum + gradeGpa(c.grade), 0) / profile.courses.length).toFixed(2)
    : profile.gpa;

  const suggestions = [
    "What careers would I actually be good at?",
    "How do I get there from community college?",
    "What jobs won't AI replace?",
    "What's a realistic salary I can aim for?",
    "I feel behind — is that true?",
  ];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a" }}>
      {/* Header */}
      <div style={{ background: "#0d1b2e", borderBottom: "1px solid #1e293b", padding: "13px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎓</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>Marco — Career Coach</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#475569" }}>
            {profile.name} · {profile.major || "History"}{avgGpa ? ` · GPA ${avgGpa}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
          {profile.courses?.slice(0, 5).map((c, i) => (
            <div key={i} style={{ background: `${gradeColor(c.grade)}18`, border: `1px solid ${gradeColor(c.grade)}55`, borderRadius: 20, padding: "2px 8px", fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: gradeColor(c.grade), fontWeight: 700 }}>
              {c.grade}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "24px 20px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>

          {/* Loading spinner for first message */}
          {loading && messages.length === 0 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 20 }}>
              <div style={s.aiAvatar}>🎓</div>
              <div style={{ padding: "12px 0", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 18, display: "flex", gap: 12, flexDirection: msg.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
              <div style={msg.role === "user" ? s.userAvatar : s.aiAvatar}>
                {msg.role === "user" ? (profile.name?.[0]?.toUpperCase() || "Y") : "🎓"}
              </div>
              <div style={{
                maxWidth: "82%",
                background: msg.role === "user" ? "#1e293b" : "#0d1b2e",
                border: `1px solid ${msg.role === "user" ? "#334155" : "#1e3a5f"}`,
                borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                padding: "13px 16px",
              }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.75, color: "#e2e8f0", whiteSpace: "pre-wrap", fontWeight: 300 }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && messages.length > 0 && (
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
              <div style={s.aiAvatar}>🎓</div>
              <div style={{ padding: "12px 0", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", animation: `blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          )}

          {/* Suggestion chips - show after first reply */}
          {messages.length === 1 && !loading && (
            <div style={{ marginBottom: 20, marginLeft: 50 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#334155", marginBottom: 8 }}>Try asking:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {suggestions.map(q => (
                  <button key={q} onClick={() => { setInput(q); taRef.current?.focus(); }}
                    style={{ padding: "7px 13px", background: "#162032", border: "1px solid #1e3a5f", borderRadius: 20, color: "#60a5fa", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "background 0.15s" }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #1e293b", background: "#0d1b2e", flexShrink: 0 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything — careers, school plans, salary, next steps…"
            rows={1}
            style={{ flex: 1, background: "#1e293b", border: "1px solid #334155", borderRadius: 10, padding: "11px 14px", color: "#e2e8f0", fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.6, resize: "none", outline: "none", transition: "border-color 0.15s" }}
          />
          <button onClick={send} disabled={!input.trim() || loading}
            style={{ padding: "11px 18px", background: input.trim() && !loading ? "#2563eb" : "#1e293b", border: "1px solid #334155", borderRadius: 10, color: input.trim() && !loading ? "#fff" : "#475569", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 16, flexShrink: 0, transition: "background 0.15s" }}>
            →
          </button>
        </div>
        <div style={{ maxWidth: 640, margin: "5px auto 0", fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#334155", textAlign: "center" }}>Shift+Enter for new line</div>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [profile, setProfile] = useState({ name: "", major: "History", gpa: "", courses: [], testScores: [], interests: "", strengths: "", dreamJob: "" });
  const update = (patch) => setProfile(p => ({ ...p, ...patch }));

  const wrap = (child) => (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 20px", overflowY: "auto" }}>
      {child}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=DM+Serif+Display:ital@0;1&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root, #__next { height: 100%; background: #0f172a; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.12) !important; }
        input::placeholder, textarea::placeholder { color: #334155; }
        button:hover { opacity: 0.9; }
      `}</style>
      {step === 0 && wrap(<StepWelcome onNext={() => setStep(1)} />)}
      {step === 1 && wrap(<StepBasicInfo data={profile} onChange={update} onNext={() => setStep(2)} />)}
      {step === 2 && wrap(<StepGrades data={profile} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />)}
      {step === 3 && wrap(<StepTestScores data={profile} onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />)}
      {step === 4 && wrap(<StepApiKey onSubmit={k => { setApiKey(k); setStep(5); }} />)}
      {step === 5 && <ChatView profile={profile} apiKey={apiKey} />}
    </>
  );
}

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const s = {
  card: { background: "#0d1b2e", border: "1px solid #1e293b", borderRadius: 18, padding: "36px 32px", width: "100%", maxWidth: 500 },
  heroTitle: { fontFamily: "'DM Serif Display', serif", fontSize: "clamp(28px,5vw,38px)", color: "#f1f5f9", fontWeight: 400, lineHeight: 1.25 },
  sub: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#64748b", lineHeight: 1.7, fontWeight: 300 },
  stepHead: { marginBottom: 26 },
  stepNum: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#3b82f6", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 },
  title: { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#f1f5f9", fontWeight: 400, marginBottom: 6 },
  field: { marginBottom: 16 },
  label: { display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8", fontWeight: 500, marginBottom: 6 },
  input: { width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "11px 14px", color: "#e2e8f0", fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 },
  btn: { width: "100%", padding: "13px", background: "#2563eb", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer" },
  backBtn: { padding: "12px 16px", background: "transparent", border: "1px solid #1e293b", borderRadius: 10, color: "#475569", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  addBtn: { padding: "0 15px", background: "#1e3a5f", border: "1px solid #2563eb44", borderRadius: 8, color: "#60a5fa", fontSize: 22, cursor: "pointer", height: 44, flexShrink: 0 },
  aiAvatar: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #1e3a5f, #1d4ed8)", border: "1px solid #3b82f644", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 },
  userAvatar: { width: 36, height: 36, borderRadius: "50%", background: "#1e293b", border: "1px solid #334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: "#60a5fa", flexShrink: 0 },
};
