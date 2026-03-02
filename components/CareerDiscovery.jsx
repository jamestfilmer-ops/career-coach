import { useState, useRef, useEffect } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  blue: "#1a6fdb",
  blueDark: "#1459b3",
  blueLight: "#e8f1fc",
  blueMid: "#d0e4fa",
  text: "#0f172a",
  muted: "#64748b",
  border: "#dce6f5",
  bg: "#f5f8ff",
  white: "#ffffff",
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const INTERESTS = [
  "History & Culture","True Crime","Science & Nature","Technology",
  "Gaming","Music","Art & Design","Film & TV","Sports","Fitness",
  "Cooking","Travel","Animals","Politics & News","Psychology",
  "Philosophy","Business","Math & Logic","Writing & Storytelling",
  "Fashion","Anime & Comics","Cars & Machines","Outdoors & Hiking",
  "Photography","DIY & Building","Social Justice","Religion & Spirituality",
  "Space & Astronomy","Medical & Health","Law & Crime","Finance & Investing",
];

const HOBBIES = [
  "Reading","Video games","Watching documentaries","Drawing or sketching",
  "Playing music","Collecting things","Hiking","Cooking / baking",
  "Writing","Working out","Podcasts","Board games","Coding",
  "Volunteering","Photography","Social media","Watching sports",
  "Fishing or hunting","Crafts / DIY","Journaling","Streaming / content",
  "Cars / mechanics","Gardening","Debate / arguing online",
];

const STRENGTHS = [
  "Remembering details","Explaining things clearly","Researching topics",
  "Writing well","Spotting patterns","Staying calm under pressure",
  "Listening to people","Problem solving","Being creative",
  "Organizing and planning","Learning new things fast","Leading others",
  "Working independently","Fixing / building things","Talking to people",
  "Staying focused for hours","Thinking outside the box","Being reliable",
];

const WORK_TYPES = [
  "Retail / customer service","Food service / restaurant","Manual labor / construction",
  "Childcare / babysitting","Tutoring / teaching","Office / admin",
  "Healthcare support","Warehouse / logistics","Freelance / gig work",
  "Military / ROTC","Internship","Volunteer work","Family business",
  "Self-employed / side hustle","I haven't worked yet",
];

// Enneagram types + wing subtypes
const ENNEAGRAM_TYPES = [
  { type:"1", label:"The Reformer",    wings:["1w9","1w2"] },
  { type:"2", label:"The Helper",      wings:["2w1","2w3"] },
  { type:"3", label:"The Achiever",    wings:["3w2","3w4"] },
  { type:"4", label:"The Individualist",wings:["4w3","4w5"] },
  { type:"5", label:"The Investigator",wings:["5w4","5w6"] },
  { type:"6", label:"The Loyalist",    wings:["6w5","6w7"] },
  { type:"7", label:"The Enthusiast",  wings:["7w6","7w8"] },
  { type:"8", label:"The Challenger",  wings:["8w7","8w9"] },
  { type:"9", label:"The Peacemaker",  wings:["9w8","9w1"] },
];
const ENNEAGRAM_LABELS = Object.fromEntries(ENNEAGRAM_TYPES.map(t => [t.type, t.label]));

// MBTI with -T (Turbulent) and -A (Assertive) variants
const MBTI_BASE = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];

const HOLLAND_OPTIONS = [
  { value:"R", label:"Realistic",      desc:"Hands-on, practical, tools & machines" },
  { value:"I", label:"Investigative",  desc:"Curious, analytical, loves research" },
  { value:"A", label:"Artistic",       desc:"Creative, expressive, independent" },
  { value:"S", label:"Social",         desc:"Helpful, empathetic, works with people" },
  { value:"E", label:"Enterprising",   desc:"Persuasive, ambitious, natural leader" },
  { value:"C", label:"Conventional",   desc:"Organized, detail-oriented, structured" },
];

const DISC_OPTIONS = [
  { key:"D", label:"D — Dominance",        desc:"Results, directness, decisiveness" },
  { key:"I", label:"I — Influence",        desc:"Optimism, enthusiasm, collaboration" },
  { key:"S", label:"S — Steadiness",       desc:"Patience, reliability, team focus" },
  { key:"C", label:"C — Conscientiousness",desc:"Accuracy, analysis, detail" },
];

const OCEAN_TRAITS = [
  { key:"O", label:"Openness",          lo:"Practical / conventional", hi:"Creative / curious" },
  { key:"C", label:"Conscientiousness", lo:"Spontaneous / flexible",   hi:"Organized / disciplined" },
  { key:"E", label:"Extraversion",      lo:"Introverted / reserved",   hi:"Extroverted / energetic" },
  { key:"A", label:"Agreeableness",     lo:"Skeptical / competitive",  hi:"Trusting / cooperative" },
  { key:"N", label:"Neuroticism",       lo:"Calm / stable",            hi:"Sensitive / anxious" },
];
const OCEAN_LEVELS = ["Very Low","Low","Medium","High","Very High"];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const buildSystemPrompt = (p) => `
You are Samuel — a warm, sharp, and genuinely invested personal career advisor for young people. You talk like a brilliant older friend who's been through it and knows the job market cold. You're specific, direct, and deeply encouraging — especially for someone who feels behind or unsure.

IMPORTANT TONE DIRECTIVE: ${p.name} tends to be down on himself and anxious about the future. Your job is to actively counter that — not with empty hype, but with SPECIFIC evidence from his own profile about why he's actually well-positioned. Every time he expresses doubt or says something self-deprecating, respond with targeted, evidence-based encouragement referencing his actual traits, interests, and test results. Be his hype man, but make it real.

STUDENT PROFILE:
Name: ${p.name || "there"}
Studying: History at community college
Interests: ${p.interests?.join(", ") || "not specified"}
Hobbies: ${p.hobbies?.join(", ") || "not specified"}
Natural strengths: ${p.strengths?.join(", ") || "not specified"}
Hyperfixations / deep dives: ${p.hyperfixation || "not specified"}
Favorite books: ${p.books || "not specified"}
Favorite movies/shows: ${p.movies || "not specified"}
Favorite video games: ${p.games || "not specified"}
Work experience: ${p.workTypes?.join(", ") || "none listed"}
Liked/disliked about work: ${p.workDetails || "not specified"}
Career ideas so far: ${p.dreamJob || "no idea yet"}

PERSONALITY ASSESSMENTS:
- DISC: D=${p.disc?.D ?? "?"}, I=${p.disc?.I ?? "?"}, S=${p.disc?.S ?? "?"}, C=${p.disc?.C ?? "?"}
- Holland Code (top 3): ${p.holland?.join(", ") || "not taken"}
- Enneagram: ${p.enneagram ? `${p.enneagram}${p.enneagramWing ? ` (wing: ${p.enneagramWing})` : ""} — ${ENNEAGRAM_LABELS[p.enneagram.replace(/w\d/,"")] || p.enneagram}` : "not taken"}
- Myers-Briggs: ${p.mbti || "not taken"}
- OCEAN: O=${p.ocean?.O != null ? OCEAN_LEVELS[p.ocean.O] : "?"}, C=${p.ocean?.C != null ? OCEAN_LEVELS[p.ocean.C] : "?"}, E=${p.ocean?.E != null ? OCEAN_LEVELS[p.ocean.E] : "?"}, A=${p.ocean?.A != null ? OCEAN_LEVELS[p.ocean.A] : "?"}, N=${p.ocean?.N != null ? OCEAN_LEVELS[p.ocean.N] : "?"}

KEY INSIGHTS TO WEAVE IN:
- History major = research, critical thinking, writing, pattern recognition, understanding human behavior — ALL elite transferable skills. Treat this as an asset.
- Community college = strategic financial choice. Never a limitation.
- Hyperfixation tendency = depth, mastery, obsessive expertise. This is a superpower in the right field.
- His favorite media (books/movies/games) tells you what themes, worlds, and problems genuinely light him up. Use these as clues to what he'd love doing.
- Grades aren't the story — his curiosity, patterns, and personality are.

YOUR OUTPUT — Generate a full CAREER MAP with exactly these tiers:

🎯 TIER 1 — YOUR LANE (12–18 jobs)
Careers he'd genuinely thrive in. For each:
• Job title
• Why it fits HIM — reference specific traits, test results, interests
• Salary: realistic US range + median (e.g. $52k–$95k, median ~$68k)
• Where the jobs are: top cities/regions + remote availability
• Day in the life: 2–3 sentences — pace, environment, interactions, what you actually do
• LinkedIn tip: exact job title to search + what to say cold
• AI-resistance: Low / Medium / High
• First step: one concrete action this week

🔭 TIER 2 — WORTH EXPLORING (15–20 jobs)
Careers worth a closer look with some pivot. For each:
• Job title + why it could fit + what the pivot looks like
• Salary range
• Where the jobs are + remote availability
• Day in the life (2 sentences)
• LinkedIn tip

🃏 TIER 3 — WILD CARDS (10 jobs)
Surprising, niche, or unconventional careers most people have never heard of that he could absolutely crush. For each:
• Job title + why it's a wild card fit for him specifically
• Salary range + where this work exists

End with:
⚡ YOUR NEXT MOVE THIS WEEK
One specific, concrete action — not "explore your options" but something real like "message 3 people on LinkedIn using this script" or "sign up for this exact free course."

RULES:
- Use his name throughout. Be personal, not generic.
- Reference his actual data every time — specific test results, interests, hyperfixations.
- Frame LinkedIn outreach as low-stakes curiosity, not pressure.
- If he seems anxious or down, push back with specifics.
- After the career map, stay in full conversation mode — go deep on any follow-up.
`;

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const gs = {
  label: {
    display:"block", fontFamily:"'Sora',sans-serif", fontSize:13,
    color: T.muted, fontWeight:600, marginBottom:8, lineHeight:1.5,
    textTransform:"uppercase", letterSpacing:"0.04em",
  },
  input: {
    width:"100%", background:T.white, border:`1.5px solid ${T.border}`,
    borderRadius:10, padding:"11px 14px", color:T.text, fontSize:15,
    fontFamily:"'Sora',sans-serif", fontWeight:400, transition:"all 0.15s",
    outline:"none",
  },
};

const chatStyles = {
  aiAvatar: {
    width:38, height:38, borderRadius:12, flexShrink:0,
    background:`linear-gradient(135deg,${T.blue},#4a9fef)`,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:17, boxShadow:`0 2px 8px rgba(26,111,219,0.25)`,
  },
  userAvatar: {
    width:38, height:38, borderRadius:12, flexShrink:0,
    background:T.blue, display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:14, fontFamily:"'Sora',sans-serif", fontWeight:700, color:T.white,
  },
};

// ─── MARKDOWN RENDERER ────────────────────────────────────────────────────────
// Renders **bold**, *italic*, ## headers, bullet lists from Samuel's responses
function Markdown({ text, color }) {
  const lines = text.split("\n");
  const elements = [];
  let listBuffer = [];

  const flushList = (key) => {
    if (listBuffer.length) {
      elements.push(
        <ul key={`list-${key}`} style={{ paddingLeft:18, margin:"6px 0 10px" }}>
          {listBuffer.map((item, i) => (
            <li key={i} style={{ fontFamily:"'Sora',sans-serif", fontSize:14, lineHeight:1.75, color, marginBottom:3 }}>
              <InlineMarkdown text={item} color={color} />
            </li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  lines.forEach((line, i) => {
    // Headers: ## or ### or **TIER
    if (/^#{1,3}\s/.test(line)) {
      flushList(i);
      const txt = line.replace(/^#{1,3}\s/, "");
      elements.push(
        <div key={i} style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color, marginTop:18, marginBottom:6, lineHeight:1.3 }}>
          <InlineMarkdown text={txt} color={color} />
        </div>
      );
    }
    // Bold-only headers like **🎯 TIER 1**
    else if (/^\*\*[^*]+\*\*\s*$/.test(line.trim()) && line.trim().length < 80) {
      flushList(i);
      const txt = line.replace(/\*\*/g,"").trim();
      elements.push(
        <div key={i} style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:800, color, marginTop:18, marginBottom:6, lineHeight:1.3 }}>
          {txt}
        </div>
      );
    }
    // Bullet list items: • or - or *
    else if (/^[•\-\*]\s/.test(line.trimStart())) {
      const txt = line.trimStart().replace(/^[•\-\*]\s/,"");
      listBuffer.push(txt);
    }
    // Empty line — flush list
    else if (line.trim() === "") {
      flushList(i);
      elements.push(<div key={i} style={{ height:6 }} />);
    }
    // Normal paragraph line
    else {
      flushList(i);
      elements.push(
        <p key={i} style={{ fontFamily:"'Sora',sans-serif", fontSize:14, lineHeight:1.8, color, margin:"2px 0" }}>
          <InlineMarkdown text={line} color={color} />
        </p>
      );
    }
  });
  flushList("end");
  return <div>{elements}</div>;
}

function InlineMarkdown({ text, color }) {
  // Handle **bold** and *italic* inline
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={i} style={{ fontWeight:700, color }}>{part.slice(2,-2)}</strong>;
        if (/^\*[^*]+\*$/.test(part)) return <em key={i}>{part.slice(1,-1)}</em>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}


function ProgressBar({ step, total }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ padding:"20px 20px 0", maxWidth:560, margin:"0 auto", width:"100%" }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
        <span style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.9)", fontWeight:700 }}>
          Step {step} of {total}
        </span>
        <span style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.6)" }}>{pct}%</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.2)", borderRadius:4, overflow:"hidden" }}>
        <div style={{ height:"100%", background:"rgba(255,255,255,0.85)", borderRadius:4, width:`${pct}%`, transition:"width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── CHIP SELECTOR ────────────────────────────────────────────────────────────
function ChipSelector({ options, selected=[], onChange, max }) {
  const toggle = (v) => {
    if (selected.includes(v)) onChange(selected.filter(x => x !== v));
    else { if (max && selected.length >= max) return; onChange([...selected, v]); }
  };
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding:"8px 14px", borderRadius:20,
            background: active ? T.blue : T.white,
            border:`1.5px solid ${active ? T.blue : T.border}`,
            fontFamily:"'Sora',sans-serif", fontSize:13,
            color: active ? T.white : T.muted,
            cursor:"pointer", fontWeight: active ? 600 : 400,
            transition:"all 0.15s", lineHeight:1.3,
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── STEP WRAPPER ─────────────────────────────────────────────────────────────
function StepWrap({ children, step, total }) {
  return (
    <div style={{ minHeight:"100vh", background:T.blue, paddingBottom:48, display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root,#__next{min-height:100%;}
        input:focus,textarea:focus,select:focus{outline:none;border-color:${T.blue}!important;box-shadow:0 0 0 3px rgba(26,111,219,0.12)!important;}
        input::placeholder,textarea::placeholder{color:#b8cce8;}
        button:focus{outline:none;}
      `}</style>
      <ProgressBar step={step} total={total} />
      <div style={{ display:"flex", justifyContent:"center", padding:"16px 16px 0", flex:1 }}>
        <div style={{
          background:T.white, borderRadius:20, padding:"28px 24px",
          width:"100%", maxWidth:560,
          boxShadow:"0 8px 40px rgba(0,0,0,0.25)",
          border:`1px solid rgba(255,255,255,0.15)`,
          height:"fit-content",
        }}>{children}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div style={{ marginBottom:22 }}>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:T.text, fontWeight:700, marginBottom:6, lineHeight:1.25 }}>{title}</h2>
      {sub && <p style={{ fontFamily:"'Sora',sans-serif", fontSize:14, color:T.muted, lineHeight:1.65 }}>{sub}</p>}
    </div>
  );
}

function NavBtns({ onBack, onNext, nextLabel="Next →", canNext=true }) {
  return (
    <div style={{ display:"flex", gap:10, marginTop:28 }}>
      {onBack && (
        <button onClick={onBack} style={{
          padding:"12px 18px", background:T.white, border:`1.5px solid ${T.border}`,
          borderRadius:12, color:T.muted, fontSize:14,
          fontFamily:"'Sora',sans-serif", cursor:"pointer", flexShrink:0,
        }}>← Back</button>
      )}
      <button onClick={onNext} disabled={!canNext} style={{
        flex:1, padding:"13px",
        background: canNext ? T.blue : "#e2e8f0",
        border:"none", borderRadius:12,
        color: canNext ? T.white : "#94a3b8",
        fontSize:15, fontFamily:"'Sora',sans-serif", fontWeight:700,
        cursor: canNext ? "pointer" : "not-allowed",
        boxShadow: canNext ? `0 4px 14px rgba(26,111,219,0.3)` : "none",
        transition:"all 0.15s",
      }}>
        {nextLabel}
      </button>
    </div>
  );
}

function InfoBox({ children }) {
  return (
    <div style={{ background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:12, padding:"12px 16px", marginBottom:20 }}>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.blue, lineHeight:1.65 }}>{children}</div>
    </div>
  );
}

// ─── STEP 0: WELCOME ──────────────────────────────────────────────────────────
function StepWelcome({ onNext, hasProgress, onResume, onReset }) {
  return (
    <div style={{ minHeight:"100vh", background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root,#__next{min-height:100%;}
      `}</style>

      <div style={{
        background:T.white, borderRadius:24, padding:"40px 36px",
        width:"100%", maxWidth:480,
        boxShadow:"0 24px 80px rgba(0,0,0,0.3)",
        display:"flex", flexDirection:"column", alignItems:"center",
      }}>

        {/* Resume banner */}
        {hasProgress && (
          <div style={{
            width:"100%", marginBottom:24,
            background:T.blueLight, border:`1.5px solid ${T.blue}`,
            borderRadius:14, padding:"14px 18px",
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          }}>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:T.blue, marginBottom:2 }}>👋 Welcome back!</div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted }}>You have saved progress. Pick up where you left off?</div>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={onReset} style={{ padding:"7px 12px", borderRadius:8, fontSize:12, fontFamily:"'Sora',sans-serif", background:T.white, border:`1.5px solid ${T.border}`, color:T.muted, cursor:"pointer", fontWeight:600 }}>Start over</button>
              <button onClick={onResume} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontFamily:"'Sora',sans-serif", background:T.blue, border:"none", color:T.white, cursor:"pointer", fontWeight:700, boxShadow:`0 2px 8px rgba(26,111,219,0.3)` }}>Resume →</button>
            </div>
          </div>
        )}

        {/* Logo */}
        <div style={{ width:72, height:72, borderRadius:20, marginBottom:24, background:`linear-gradient(135deg,${T.blue},#4a9fef)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, boxShadow:`0 8px 28px rgba(26,111,219,0.3)` }}>🧭</div>

        {/* Badge */}
        <div style={{ display:"inline-block", background:T.blueLight, border:`1px solid ${T.blueMid}`, borderRadius:20, padding:"4px 14px", marginBottom:16, fontFamily:"'Sora',sans-serif", fontSize:11, color:T.blue, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Meet Samuel</div>

        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,5vw,42px)", color:T.text, fontWeight:700, lineHeight:1.2, textAlign:"center", marginBottom:14, maxWidth:380 }}>
          Your personal<br /><span style={{ color:T.blue, fontStyle:"italic" }}>career advisor.</span>
        </h1>

        <p style={{ fontFamily:"'Sora',sans-serif", fontSize:14, color:T.muted, lineHeight:1.75, marginBottom:28, maxWidth:380, textAlign:"center" }}>
          You don't have to know what you want — that's literally why we're here. Answer a few questions and Samuel will map out <strong style={{ color:T.text }}>40+ real careers</strong> built around who you actually are.
        </p>

        {/* Feature grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:24, width:"100%" }}>
          {[["🎯","Jobs tailored to you"],["💰","Real salary ranges"],["📍","Where the jobs are"],["🤝","Who to reach out to"]].map(([icon,label]) => (
            <div key={label} style={{ background:T.bg, borderRadius:12, padding:"12px 14px", border:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>{icon}</span>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.text, fontWeight:600, lineHeight:1.3 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Time breakdown */}
        <div style={{ width:"100%", marginBottom:24, background:T.bg, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px" }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>⏱ How long this takes</div>
          {[["About you","~5 min"],["5 personality tests","~45–60 min (pause & come back)"],["Samuel's analysis","~2 min to generate"]].map(([label,time]) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:5 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.text, fontWeight:500 }}>{label}</span>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted }}>{time}</span>
            </div>
          ))}
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}`, fontFamily:"'Sora',sans-serif", fontSize:12, color:T.blue, fontWeight:600 }}>
            💾 Your answers save automatically — close the tab anytime.
          </div>
        </div>

        <button onClick={onNext} style={{ width:"100%", padding:"15px", background:T.blue, border:"none", borderRadius:14, color:T.white, fontSize:16, fontFamily:"'Sora',sans-serif", fontWeight:700, cursor:"pointer", boxShadow:`0 6px 20px rgba(26,111,219,0.35)`, transition:"transform 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.transform="translateY(-1px)"}
          onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}
        >Let's go →</button>
      </div>
    </div>
  );
}

// ─── STEP 1: BASICS ───────────────────────────────────────────────────────────
function Step1({ data, onChange, onNext }) {
  const majors = ["History","General Studies","Undecided","English","Psychology","Business",
    "Criminal Justice","Nursing / Pre-Med","Computer Science","Education","Communication",
    "Sociology","Political Science","Art","Other"];
  return (
    <StepWrap step={1} total={7}>
      <SectionTitle title="Let's start with you." sub="Quick basics — no wrong answers here." />
      <div style={{ marginBottom:18 }}>
        <label style={gs.label}>First name</label>
        <input style={gs.input} placeholder="Your name" value={data.name} onChange={e => onChange({ name:e.target.value })} />
      </div>
      <div style={{ marginBottom:18 }}>
        <label style={gs.label}>What are you studying?</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {majors.map(m => (
            <button key={m} onClick={() => onChange({ major:m })} style={{
              padding:"8px 14px", borderRadius:20,
              background: data.major===m ? T.blue : T.white,
              border:`1.5px solid ${data.major===m ? T.blue : T.border}`,
              fontFamily:"'Sora',sans-serif", fontSize:13,
              color: data.major===m ? T.white : T.muted,
              cursor:"pointer", fontWeight: data.major===m ? 600 : 400,
              transition:"all 0.15s",
            }}>{m}</button>
          ))}
        </div>
      </div>
      <NavBtns onNext={onNext} canNext={!!data.name.trim()} />
    </StepWrap>
  );
}

// ─── STEP 2: INTERESTS, HOBBIES & MEDIA ───────────────────────────────────────
function Step2({ data, onChange, onNext, onBack }) {
  const canNext = (data.interests||[]).length > 0;
  return (
    <StepWrap step={2} total={7}>
      <SectionTitle title="What's your world?" sub="Pick everything that resonates. The more honest you are, the sharper Samuel gets." />
      <div style={{ marginBottom:20 }}>
        <label style={gs.label}>Topics that genuinely interest you</label>
        <ChipSelector options={INTERESTS} selected={data.interests||[]} onChange={v => onChange({ interests:v })} />
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={gs.label}>Things you actually do in your free time</label>
        <ChipSelector options={HOBBIES} selected={data.hobbies||[]} onChange={v => onChange({ hobbies:v })} />
      </div>
      <div style={{ marginBottom:20 }}>
        <label style={gs.label}>Have you ever gone completely deep on something?</label>
        <input style={gs.input}
          placeholder="e.g. WW2 strategy, a specific game's lore, how the stock market actually works…"
          value={data.hyperfixation||""} onChange={e => onChange({ hyperfixation:e.target.value })} />
      </div>

      {/* Media section */}
      <div style={{ background:T.bg, border:`1px solid ${T.border}`, borderRadius:14, padding:"16px 18px", marginBottom:8 }}>
        <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.blue, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>
          Your favorite media
        </div>
        <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:16, lineHeight:1.6 }}>
          What you love watching, reading, and playing tells Samuel a lot about what kind of work would actually light you up.
        </p>
        {[
          { key:"books",  label:"3 favorite books",              placeholder:"e.g. Sapiens, Ready Player One, The Count of Monte Cristo…" },
          { key:"movies", label:"3 favorite movies or shows",    placeholder:"e.g. Interstellar, Breaking Bad, The Wire…" },
          { key:"games",  label:"3 favorite video games",        placeholder:"e.g. Red Dead Redemption 2, Civilization, Dark Souls…" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom:14 }}>
            <label style={{ ...gs.label, marginBottom:6 }}>{label}</label>
            <input style={gs.input} placeholder={placeholder}
              value={data[key]||""} onChange={e => onChange({ [key]:e.target.value })} />
          </div>
        ))}
      </div>

      <NavBtns onBack={onBack} onNext={onNext} canNext={canNext} />
    </StepWrap>
  );
}

// ─── STEP 3: STRENGTHS ───────────────────────────────────────────────────────
function Step3({ data, onChange, onNext, onBack }) {
  return (
    <StepWrap step={3} total={7}>
      <SectionTitle title="What comes naturally to you?" sub="Pick what genuinely feels true — even stuff you don't think of as special." />
      <ChipSelector options={STRENGTHS} selected={data.strengths||[]} onChange={v => onChange({ strengths:v })} />
      <div style={{ marginTop:22, marginBottom:0 }}>
        <label style={gs.label}>Any vague career ideas? <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(totally fine to say "no idea")</span></label>
        <input style={gs.input}
          placeholder="e.g. law, something outdoors, anything that pays, absolutely no clue…"
          value={data.dreamJob||""} onChange={e => onChange({ dreamJob:e.target.value })} />
      </div>
      <NavBtns onBack={onBack} onNext={onNext} />
    </StepWrap>
  );
}

// ─── STEP 4: WORK EXPERIENCE ─────────────────────────────────────────────────
function Step4({ data, onChange, onNext, onBack }) {
  return (
    <StepWrap step={4} total={7}>
      <SectionTitle title="Work & experience" sub="Any job counts — part-time, summer, volunteer. What you've done tells us a lot about what you'd enjoy." />
      <div style={{ marginBottom:18 }}>
        <label style={gs.label}>Types of work you've done</label>
        <ChipSelector options={WORK_TYPES} selected={data.workTypes||[]} onChange={v => onChange({ workTypes:v })} />
      </div>
      <div style={{ marginBottom:0 }}>
        <label style={gs.label}>What did you like or hate about working? <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
        <textarea style={{ ...gs.input, height:90, resize:"vertical", lineHeight:1.6 }}
          placeholder="e.g. I liked helping customers one-on-one but hated the pace. I loved when I could problem-solve on my own…"
          value={data.workDetails||""} onChange={e => onChange({ workDetails:e.target.value })} />
      </div>
      <NavBtns onBack={onBack} onNext={onNext} />
    </StepWrap>
  );
}

// ─── STEP 5: PERSONALITY TESTS ────────────────────────────────────────────────
// Sub-pages for each test
function DiscInput({ data, onChange }) {
  return (
    <div>
      <a href="https://www.123test.com/disc-personality-test/" target="_blank" rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:T.blue, borderRadius:12, padding:"14px 18px",
          textDecoration:"none", marginBottom:16,
          boxShadow:`0 4px 14px rgba(26,111,219,0.3)`,
        }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>
            👉 Take the DISC test first
          </div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
            123test.com/disc-personality-test · free · ~8 min
          </div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:14, lineHeight:1.6 }}>
        Come back and enter your 4 percentage scores exactly as shown on the results page.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {DISC_OPTIONS.map(({ key, label, desc }) => (
          <div key={key}>
            <label style={{ ...gs.label, marginBottom:6 }}>{label}</label>
            <p style={{ fontFamily:"'Sora',sans-serif", fontSize:11, color:"#94a3b8", marginBottom:6, lineHeight:1.4 }}>{desc}</p>
            <div style={{ position:"relative" }}>
              <input style={{ ...gs.input, paddingRight:32 }}
                placeholder="e.g. 72"
                value={data.disc?.[key]||""}
                onChange={e => onChange({ disc:{ ...(data.disc||{}), [key]:e.target.value } })}
                type="number" min={0} max={100}
              />
              <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted }}>%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HollandInput({ data, onChange }) {
  const selected = data.holland || [];
  const toggle = (v) => {
    if (selected.includes(v)) {
      onChange({ holland: selected.filter(x => x !== v) });
    } else {
      if (selected.length < 3) onChange({ holland: [...selected, v] });
    }
  };
  return (
    <div>
      <a href="https://www.truity.com/test/holland-code-career-test" target="_blank" rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:T.blue, borderRadius:12, padding:"14px 18px",
          textDecoration:"none", marginBottom:16,
          boxShadow:`0 4px 14px rgba(26,111,219,0.3)`,
        }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>
            👉 Take the Holland Code test first
          </div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
            truity.com/test/holland-code-career-test · free · ~10 min
          </div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:14, lineHeight:1.6 }}>
        Come back and select your <strong>top 3 types</strong> in order — tap your strongest first, then second, then third.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {HOLLAND_OPTIONS.map(opt => {
          const idx = selected.indexOf(opt.value);
          const active = idx !== -1;
          return (
            <button key={opt.value} onClick={() => toggle(opt.value)} style={{
              display:"flex", alignItems:"center", gap:14, padding:"12px 14px",
              background: active ? T.blueLight : T.white,
              border:`1.5px solid ${active ? T.blue : T.border}`,
              borderRadius:12, cursor:"pointer", textAlign:"left",
              transition:"all 0.15s",
            }}>
              <div style={{
                width:28, height:28, borderRadius:"50%", flexShrink:0,
                background: active ? T.blue : T.bg,
                border:`2px solid ${active ? T.blue : T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700,
                color: active ? T.white : T.muted,
              }}>
                {active ? idx + 1 : opt.value}
              </div>
              <div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color: active ? T.blue : T.text }}>{opt.label}</div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted, marginTop:2 }}>{opt.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted, marginTop:10 }}>
        {selected.length}/3 selected
      </p>
    </div>
  );
}

function EnneagramInput({ data, onChange }) {
  const selectedType = data.enneagram ? data.enneagram.replace(/w\d/,"") : "";
  const wingData = ENNEAGRAM_TYPES.find(t => t.type === selectedType);

  return (
    <div>
      {/* Prominent test link */}
      <a href="https://www.truity.com/test/enneagram-personality-test" target="_blank" rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:T.blue, borderRadius:12, padding:"14px 18px",
          textDecoration:"none", marginBottom:16,
          boxShadow:`0 4px 14px rgba(26,111,219,0.3)`,
        }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>
            👉 Take the Enneagram test first
          </div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
            truity.com/test/enneagram-personality-test · free · ~10 min
          </div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:14, lineHeight:1.6 }}>
        Then come back and select your type below. If your results show a wing (e.g. "7w8"), select the wing too.
      </p>

      {/* Type selection */}
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
        Your type
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:20 }}>
        {ENNEAGRAM_TYPES.map(({ type, label }) => {
          const active = selectedType === type;
          return (
            <button key={type} onClick={() => onChange({ enneagram:type, enneagramWing:"" })} style={{
              display:"flex", alignItems:"center", gap:12, padding:"11px 14px",
              background: active ? T.blueLight : T.white,
              border:`1.5px solid ${active ? T.blue : T.border}`,
              borderRadius:12, cursor:"pointer", textAlign:"left", transition:"all 0.15s",
            }}>
              <div style={{
                width:30, height:30, borderRadius:"50%", flexShrink:0,
                background: active ? T.blue : T.bg,
                border:`2px solid ${active ? T.blue : T.border}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700,
                color: active ? T.white : T.muted,
              }}>{type}</div>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight: active ? 700 : 500, color: active ? T.blue : T.text }}>
                Type {type} — {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Wing selection — only shown after type is picked */}
      {wingData && (
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
            Wing <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional — pick if your results show one)</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {wingData.wings.map(w => {
              const active = data.enneagramWing === w;
              return (
                <button key={w} onClick={() => onChange({ enneagramWing: active ? "" : w })} style={{
                  flex:1, padding:"12px", borderRadius:12,
                  background: active ? T.blue : T.white,
                  border:`1.5px solid ${active ? T.blue : T.border}`,
                  fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700,
                  color: active ? T.white : T.text,
                  cursor:"pointer", transition:"all 0.15s",
                  letterSpacing:"0.04em",
                }}>{w}</button>
              );
            })}
            <button onClick={() => onChange({ enneagramWing:"" })} style={{
              padding:"12px 14px", borderRadius:12,
              background: !data.enneagramWing ? T.blueLight : T.white,
              border:`1.5px solid ${!data.enneagramWing ? T.blue : T.border}`,
              fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:600,
              color: !data.enneagramWing ? T.blue : T.muted,
              cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
            }}>Not sure</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MbtiInput({ data, onChange }) {
  const selectedBase = data.mbti ? data.mbti.replace(/-(T|A)$/,"") : "";
  const selectedVariant = data.mbti && data.mbti.includes("-") ? data.mbti.split("-")[1] : "";

  return (
    <div>
      {/* Prominent test link */}
      <a href="https://www.16personalities.com/free-personality-test" target="_blank" rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:T.blue, borderRadius:12, padding:"14px 18px",
          textDecoration:"none", marginBottom:16,
          boxShadow:`0 4px 14px rgba(26,111,219,0.3)`,
        }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>
            👉 Take the Myers-Briggs test first
          </div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
            16personalities.com · free · ~12 min
          </div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:14, lineHeight:1.6 }}>
        Come back and select your 4-letter type, then your variant (-A Assertive or -T Turbulent) if shown.
      </p>

      {/* Base type grid */}
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
        Your type
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:7, marginBottom:20 }}>
        {MBTI_BASE.map(type => {
          const active = selectedBase === type;
          return (
            <button key={type} onClick={() => onChange({ mbti: selectedVariant ? `${type}-${selectedVariant}` : type })} style={{
              padding:"11px 4px", borderRadius:10,
              background: active ? T.blue : T.white,
              border:`1.5px solid ${active ? T.blue : T.border}`,
              fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700,
              color: active ? T.white : T.text,
              cursor:"pointer", transition:"all 0.15s",
              letterSpacing:"0.02em",
            }}>{type}</button>
          );
        })}
      </div>

      {/* -A / -T variant — only shown after base type picked */}
      {selectedBase && (
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
            Variant <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(if your results showed one)</span>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {[
              { code:"A", label:"-A  Assertive", sub:"Confident, stress-resistant" },
              { code:"T", label:"-T  Turbulent",  sub:"Self-conscious, driven to improve" },
            ].map(({ code, label, sub }) => {
              const active = selectedVariant === code;
              return (
                <button key={code} onClick={() => onChange({ mbti: active ? selectedBase : `${selectedBase}-${code}` })} style={{
                  flex:1, padding:"12px 14px", borderRadius:12, textAlign:"left",
                  background: active ? T.blueLight : T.white,
                  border:`1.5px solid ${active ? T.blue : T.border}`,
                  cursor:"pointer", transition:"all 0.15s",
                }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color: active ? T.blue : T.text }}>{label}</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, color:T.muted, marginTop:3 }}>{sub}</div>
                </button>
              );
            })}
            <button onClick={() => onChange({ mbti: selectedBase })} style={{
              padding:"12px 14px", borderRadius:12,
              background: !selectedVariant ? T.blueLight : T.white,
              border:`1.5px solid ${!selectedVariant ? T.blue : T.border}`,
              fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:600,
              color: !selectedVariant ? T.blue : T.muted,
              cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap",
            }}>Not shown</button>
          </div>
        </div>
      )}
    </div>
  );
}

function OceanInput({ data, onChange }) {
  const ocean = data.ocean || {};
  return (
    <div>
      <a href="https://www.truity.com/test/big-five-personality-test" target="_blank" rel="noopener noreferrer"
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background:T.blue, borderRadius:12, padding:"14px 18px",
          textDecoration:"none", marginBottom:16,
          boxShadow:`0 4px 14px rgba(26,111,219,0.3)`,
        }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>
            👉 Take the Big Five / OCEAN test first
          </div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>
            truity.com/test/big-five-personality-test · free · ~10 min
          </div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:14, lineHeight:1.6 }}>
        Come back and drag each slider to match what your results showed for each trait.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
        {OCEAN_TRAITS.map(t => (
          <div key={t.key}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.text }}>{t.label}</span>
              <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.blue, fontWeight:700 }}>
                {OCEAN_LEVELS[ocean[t.key] ?? 2]}
              </span>
            </div>
            <input type="range" min={0} max={4} value={ocean[t.key] ?? 2}
              onChange={e => onChange({ ocean:{ ...ocean, [t.key]:Number(e.target.value) } })}
              style={{ width:"100%", accentColor:T.blue, height:6 }} />
            <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Sora',sans-serif", fontSize:11, color:"#b8cce8", marginTop:4 }}>
              <span>{t.lo}</span><span>{t.hi}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5({ data, onChange, onNext, onBack }) {
  const [subStep, setSubStep] = useState(0);
  const tests = [
    { id:"disc",      title:"DISC Personality",    check: (d) => Object.keys(d.disc||{}).length === 4 && DISC_OPTIONS.every(o => (d.disc[o.key]||"").toString().trim() !== ""), component: <DiscInput data={data} onChange={onChange} /> },
    { id:"holland",   title:"Holland Code",         check: (d) => (d.holland||[]).length >= 1,    component: <HollandInput data={data} onChange={onChange} /> },
    { id:"enneagram", title:"Enneagram",            check: (d) => !!(d.enneagram && d.enneagram.replace(/w\d/,"") !== ""), component: <EnneagramInput data={data} onChange={onChange} /> },
    { id:"mbti",      title:"Myers-Briggs (MBTI)",  check: (d) => !!(d.mbti && d.mbti.replace(/-(T|A)$/,"").length === 4), component: <MbtiInput data={data} onChange={onChange} /> },
    { id:"ocean",     title:"Big Five (OCEAN)",     check: (d) => d.ocean && Object.keys(d.ocean).length === 5, component: <OceanInput data={data} onChange={onChange} /> },
  ];

  const current = tests[subStep];
  const canAdvance = current.check(data);

  const handleSubNext = () => {
    if (subStep < tests.length - 1) setSubStep(s => s + 1);
    else onNext();
  };
  const handleSubBack = () => {
    if (subStep > 0) setSubStep(s => s - 1);
    else onBack();
  };

  return (
    <StepWrap step={5} total={7}>
      {/* Test progress — named tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:22, overflowX:"auto", paddingBottom:2 }}>
        {tests.map((t, i) => {
          const done = i < subStep;
          const active = i === subStep;
          return (
            <div key={t.id} style={{
              flex:"1 1 0", minWidth:0, textAlign:"center",
              padding:"7px 6px", borderRadius:10,
              background: active ? T.blue : done ? T.blueLight : T.bg,
              border:`1.5px solid ${active ? T.blue : done ? T.blue : T.border}`,
              transition:"all 0.3s",
            }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, color: active ? T.white : done ? T.blue : T.muted, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {done ? "✓ " : ""}{t.title.replace(" Personality","").replace(" (MBTI)","").replace(" (OCEAN)","")}
              </div>
            </div>
          );
        })}
      </div>

      <SectionTitle
        title={`${current.title} 🧠`}
        sub={`Test ${subStep + 1} of ${tests.length} — take the test, then come back and enter your results.`}
      />

      {current.component}

      <NavBtns
        onBack={handleSubBack}
        onNext={handleSubNext}
        nextLabel={subStep < tests.length - 1 ? `Next test →` : "Done! Build my map →"}
        canNext={canAdvance}
      />
    </StepWrap>
  );
}

// ─── STEP 6: EXTRA CONTEXT ────────────────────────────────────────────────────
function Step6({ data, onChange, onNext, onBack }) {
  return (
    <StepWrap step={6} total={7}>
      <SectionTitle
        title="Anything else?"
        sub="This is optional — but if there's something Samuel should know about you, your life, or what you're worried about, say it here."
      />
      <InfoBox>
        💡 Things worth mentioning: family obligations, location constraints, things you're scared of, anything you're genuinely excited about, or just "I don't know where to start."
      </InfoBox>
      <div style={{ marginBottom:0 }}>
        <label style={gs.label}>Tell Samuel anything <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
        <textarea style={{ ...gs.input, height:110, resize:"vertical", lineHeight:1.65 }}
          placeholder="e.g. I'm anxious about picking the wrong thing. I'm good at learning fast but terrible in social situations. I want to make at least $60k eventually…"
          value={data.extraContext||""} onChange={e => onChange({ extraContext:e.target.value })} />
      </div>
      <NavBtns onBack={onBack} onNext={onNext} nextLabel="One more step →" canNext={true} />
    </StepWrap>
  );
}

// ─── STEP 7: API KEY ──────────────────────────────────────────────────────────
function Step7({ onSubmit, onBack }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    if (!val.trim().startsWith("sk-ant-")) { setErr("That doesn't look right — it should start with sk-ant-. Get yours at console.anthropic.com"); return; }
    onSubmit(val.trim());
  };
  return (
    <StepWrap step={7} total={7}>
      <SectionTitle title="Almost there 🔑" sub="Samuel runs on real AI — you need a free Anthropic API key to unlock it." />
      <InfoBox>
        <strong>Get your key in 2 minutes:</strong><br />
        1. Go to <strong>console.anthropic.com</strong><br />
        2. Sign up → API Keys → Create Key<br />
        3. Paste it below. It stays in your browser only — never stored anywhere.
      </InfoBox>
      <div style={{ marginBottom:0 }}>
        <label style={gs.label}>Your Anthropic API Key</label>
        <input type="password" style={gs.input} placeholder="sk-ant-api03-…"
          value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />
        {err && <div style={{ color:"#ef4444", fontSize:13, fontFamily:"'Sora',sans-serif", marginTop:6 }}>{err}</div>}
      </div>
      <NavBtns onBack={onBack} onNext={submit} nextLabel="Meet Samuel →" canNext={!!val.trim()} />
    </StepWrap>
  );
}

// ─── CHAT VIEW ────────────────────────────────────────────────────────────────
function ChatView({ profile, apiKey, onReset }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [exportMsg, setExportMsg] = useState("");
  const bottomRef = useRef(null);
  const taRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);
  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + "px";
    }
  }, [input]);
  useEffect(() => { if (!ready) { setReady(true); kickoff(); } }, []);

  const getFullText = () =>
    messages.map(m => `${m.role === "user" ? profile.name : "Samuel"}:\n${m.content}`).join("\n\n---\n\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullText()).then(() => {
      setExportMsg("Copied!"); setTimeout(() => setExportMsg(""), 2000);
    });
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("My Career Map — Samuel");
    const body = encodeURIComponent(getFullText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Career Map — Samuel</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
        body{font-family:'Sora',sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#0f172a;line-height:1.75;background:#fff;}
        h1{font-size:26px;margin-bottom:4px;color:#1a6fdb;}
        .meta{color:#64748b;font-size:13px;margin-bottom:36px;}
        .msg{margin-bottom:28px;}
        .who{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:8px;}
        .who.samuel{color:#1a6fdb;}
        .content{font-size:15px;white-space:pre-wrap;}
        hr{border:none;border-top:1px solid #e2e8f0;margin:28px 0;}
      </style></head><body>
      <h1>🧭 Career Map</h1>
      <div class="meta">Generated by Samuel · ${profile.name} · ${new Date().toLocaleDateString()}</div>
      ${messages.map(m => `
        <div class="msg">
          <div class="who ${m.role==="assistant"?"samuel":""}">${m.role==="assistant"?"Samuel":profile.name}</div>
          <div class="content">${m.content.replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}</div>
        </div><hr/>
      `).join("")}
      </body></html>
    `);
    win.document.close(); win.print();
  };

  const callApi = async (msgs) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "x-api-key":apiKey,
        "anthropic-version":"2023-06-01",
        "anthropic-dangerous-direct-browser-access":"true",
      },
      body: JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:5000,
        system:buildSystemPrompt(profile),
        messages:msgs,
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.content[0].text;
  };

  const kickoff = async () => {
    setLoading(true);
    const oceanDesc = profile.ocean
      ? Object.entries(profile.ocean).map(([k,v]) => `${k}=${OCEAN_LEVELS[v]}`).join(", ")
      : "not set";
    const discDesc = profile.disc
      ? Object.entries(profile.disc).map(([k,v]) => `${k}=${v}%`).join(", ")
      : "not taken";
    const opener = `Hi Samuel! I'm ${profile.name}, studying ${profile.major || "History"} at community college.

My interests: ${profile.interests?.join(", ")||"not specified"}
My hobbies: ${profile.hobbies?.join(", ")||"not specified"}
Things I've gone deep on: ${profile.hyperfixation||"nothing specific yet"}
My natural strengths: ${profile.strengths?.join(", ")||"not specified"}
Favorite books: ${profile.books||"not specified"}
Favorite movies/shows: ${profile.movies||"not specified"}
Favorite video games: ${profile.games||"not specified"}
Work experience: ${profile.workTypes?.join(", ")||"none"}
What I liked/disliked about work: ${profile.workDetails||"not specified"}
Career ideas: ${profile.dreamJob||"honestly no idea yet"}

Personality results:
- DISC: ${discDesc}
- Holland Code: ${profile.holland?.join(", ")||"not taken"}
- Enneagram: ${profile.enneagram ? `Type ${profile.enneagram}${profile.enneagramWing ? ` (${profile.enneagramWing})` : ""} — ${ENNEAGRAM_LABELS[profile.enneagram.replace(/w\d/,"")] || ""}` : "not taken"}
- MBTI: ${profile.mbti||"not taken"}
- OCEAN: ${oceanDesc}

${profile.extraContext ? `Extra context: ${profile.extraContext}` : ""}

Can you build my full career map?`;

    try {
      const reply = await callApi([{ role:"user", content:opener }]);
      setMessages([{ role:"assistant", content:reply }]);
    } catch(e) {
      setMessages([{ role:"assistant", content:`Something went wrong: ${e.message}` }]);
    }
    setLoading(false);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role:"user", content:input.trim() };
    const allMsgs = [...messages, userMsg];
    setMessages(allMsgs);
    setInput("");
    setLoading(true);
    try {
      const reply = await callApi(allMsgs);
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
    } catch(e) {
      setMessages(prev => [...prev, { role:"assistant", content:`Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const chips = [
    "Tell me more about Tier 1",
    "Which jobs don't need a 4-year degree?",
    "Show me the wild cards",
    "What should I actually do this week?",
    "I feel behind — is that normal?",
    "Which jobs are most remote-friendly?",
    "Write me a LinkedIn cold message",
    "Which careers pay the most?",
  ];

  return (
    <div style={{ minHeight:"100vh", background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes blink{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      <div style={{ width:"100%", maxWidth:760, height:"calc(100vh - 48px)", maxHeight:900, display:"flex", flexDirection:"column", background:T.white, borderRadius:20, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>

      {/* Header */}
      <div style={{
        background:T.white, padding:"12px 16px",
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
        borderBottom:`1px solid ${T.border}`,
        boxShadow:"0 1px 8px rgba(26,111,219,0.08)",
      }}>
        <div style={{
          width:40, height:40, borderRadius:12, flexShrink:0,
          background:`linear-gradient(135deg,${T.blue},#4a9fef)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:18, boxShadow:`0 2px 8px rgba(26,111,219,0.25)`,
        }}>🧭</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:T.text, fontSize:15 }}>Samuel</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, color:T.muted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            Career Advisor · {profile.name}{profile.mbti ? ` · ${profile.mbti}` : ""}{profile.enneagram ? ` · Type ${profile.enneagram}` : ""}
          </div>
        </div>
        {messages.length > 0 && !loading && (
          <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
            {exportMsg && <span style={{ fontFamily:"'Sora',sans-serif", fontSize:11, color:T.blue, marginRight:2 }}>{exportMsg}</span>}
            {[
              { label:"📋", title:"Copy to clipboard",   fn:handleCopy },
              { label:"✉️", title:"Email to myself",      fn:handleEmail },
              { label:"🖨️", title:"Print / Save as PDF",  fn:handlePrint },
              { label:"↺",  title:"Start over",           fn:() => { if(window.confirm("Start over? This will clear all your answers.")) onReset(); } },
            ].map(btn => (
              <button key={btn.label} onClick={btn.fn} title={btn.title} style={{
                width:34, height:34, borderRadius:10,
                background:T.bg, border:`1.5px solid ${T.border}`,
                cursor:"pointer", fontSize:btn.label==="↺"?18:15,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"background 0.15s",
              }}>
                {btn.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:"auto", padding:"20px 16px", background:"#f8faff" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          {loading && messages.length === 0 && (
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              <div style={chatStyles.aiAvatar}>🧭</div>
              <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:"4px 16px 16px 16px", padding:"14px 16px", boxShadow:"0 1px 4px rgba(26,111,219,0.06)" }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:8 }}>Building your career map…</div>
                <div style={{ display:"flex", gap:5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.blue, animation:`blink 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              <div style={{ marginBottom:12, display:"flex", gap:10, flexDirection:msg.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
                <div style={msg.role==="user" ? chatStyles.userAvatar : chatStyles.aiAvatar}>
                  {msg.role==="user" ? (profile.name?.[0]?.toUpperCase()||"Y") : "🧭"}
                </div>
                <div style={{
                  maxWidth:"86%",
                  background: msg.role==="user" ? T.blue : T.white,
                  border: msg.role==="user" ? "none" : `1px solid ${T.border}`,
                  borderRadius: msg.role==="user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  padding:"13px 16px",
                  boxShadow: msg.role==="user" ? `0 2px 10px rgba(26,111,219,0.25)` : "0 2px 8px rgba(26,111,219,0.06)",
                }}>
                  {msg.role === "user"
                    ? <p style={{ fontFamily:"'Sora',sans-serif", fontSize:14, lineHeight:1.7, color:T.white, margin:0 }}>{msg.content}</p>
                    : <Markdown text={msg.content} color={T.text} />
                  }
                </div>
              </div>
              {/* Quick chips after every AI message */}
              {msg.role === "assistant" && i === messages.length - 1 && !loading && (
                <div style={{ marginLeft:50, marginBottom:16 }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, color:"#b8cce8", marginBottom:7, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>Quick questions</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {chips.map(q => (
                      <button key={q} onClick={() => { setInput(q); }} style={{
                        padding:"6px 12px", background:T.white,
                        border:`1.5px solid ${T.border}`, borderRadius:20,
                        color:T.muted, fontSize:12, fontFamily:"'Sora',sans-serif",
                        cursor:"pointer", fontWeight:500, transition:"all 0.15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.color=T.blue; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor=T.border; e.currentTarget.style.color=T.muted; }}
                      >{q}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && messages.length > 0 && (
            <div style={{ display:"flex", gap:10, marginBottom:16 }}>
              <div style={chatStyles.aiAvatar}>🧭</div>
              <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:"4px 16px 16px 16px", padding:"12px 16px" }}>
                <div style={{ display:"flex", gap:5 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:T.blue, animation:`blink 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            </div>
          )}


          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div style={{ padding:"10px 16px 16px", borderTop:`1px solid ${T.border}`, background:T.white, flexShrink:0 }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", gap:8, alignItems:"flex-end" }}>
          <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask Samuel anything…" rows={1}
            style={{
              flex:1, background:T.bg, border:`1.5px solid ${T.border}`, borderRadius:12,
              padding:"10px 14px", color:T.text, fontSize:14,
              fontFamily:"'Sora',sans-serif", fontWeight:300, lineHeight:1.6,
              resize:"none", outline:"none", transition:"border 0.15s",
            }}
            onFocus={e => e.target.style.borderColor=T.blue}
            onBlur={e => e.target.style.borderColor=T.border}
          />
          <button onClick={send} disabled={!input.trim()||loading} style={{
            padding:"10px 16px", border:"none", borderRadius:12, fontSize:18, flexShrink:0,
            background: input.trim()&&!loading ? T.blue : "#e2e8f0",
            color: input.trim()&&!loading ? T.white : "#94a3b8",
            cursor: input.trim()&&!loading ? "pointer" : "not-allowed",
            transition:"background 0.15s",
            boxShadow: input.trim()&&!loading ? `0 2px 8px rgba(26,111,219,0.3)` : "none",
          }}>→</button>
        </div>
      </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "samuel_profile_v1";
const STEP_KEY    = "samuel_step_v1";

const DEFAULT_PROFILE = {
  name:"", major:"History",
  interests:[], hobbies:[], hyperfixation:"",
  books:"", movies:"", games:"",
  strengths:[], dreamJob:"",
  workTypes:[], workDetails:"",
  disc:{}, holland:[], enneagram:"", enneagramWing:"", mbti:"", ocean:{},
  extraContext:"",
};

export default function App() {
  const [step, setStep] = useState(() => {
    try { const s = localStorage.getItem(STEP_KEY); return s ? Math.min(parseInt(s,10),7) : 0; } catch{ return 0; }
  });
  const [apiKey, setApiKey] = useState("");
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  // Persist profile & step to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch{}
  }, [profile]);
  useEffect(() => {
    try { if (step > 0 && step < 8) localStorage.setItem(STEP_KEY, String(step)); } catch{}
  }, [step]);

  const u = (patch) => setProfile(p => ({ ...p, ...patch }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleReset = () => {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STEP_KEY); } catch{}
    setProfile(DEFAULT_PROFILE);
    setStep(0);
  };

  if (step === 0) return <StepWelcome onNext={next} hasProgress={(() => { try { return !!localStorage.getItem(STEP_KEY); } catch { return false; }})() } onResume={() => { try { const s = localStorage.getItem(STEP_KEY); if(s) setStep(parseInt(s,10)); } catch{} }} onReset={handleReset} />;
  if (step === 8) return <ChatView profile={profile} apiKey={apiKey} onReset={handleReset} />;

  return (
    <>
      {step === 1 && <Step1 data={profile} onChange={u} onNext={next} />}
      {step === 2 && <Step2 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 3 && <Step3 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 4 && <Step4 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 5 && <Step5 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 6 && <Step6 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 7 && <Step7 onSubmit={k => { setApiKey(k); next(); }} onBack={back} />}
    </>
  );
}
