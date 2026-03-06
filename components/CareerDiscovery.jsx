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
  { key:"O", label:"Openness",          desc:"Curiosity, creativity, openness to new experiences" },
  { key:"C", label:"Conscientiousness", desc:"Organization, discipline, goal-directedness" },
  { key:"E", label:"Extraversion",      desc:"Sociability, energy, assertiveness" },
  { key:"A", label:"Agreeableness",     desc:"Cooperation, trust, empathy" },
  { key:"N", label:"Neuroticism",       desc:"Emotional sensitivity, anxiety, moodiness" },
];

const HIGH5_STRENGTHS = [
  "Achiever","Believer","Catalyst","Coach","Commander","Communicator",
  "Competitor","Connector","Designer","Deliverer","Empathizer","Engager",
  "Equalizer","Focus Expert","Forecaster","Ideator","Includer","Intuitor",
  "Inventor","Motivator","Optimist","Organizer","Philomath","Pragmatist",
  "Problem Solver","Relationship Master","Self-Believer","Strategist",
  "Storyteller","Thinker","Time Keeper","Winner",
];

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const buildSystemPrompt = (p) => `
You are Samuel — a warm, sharp, genuinely invested career advisor for young people. You talk like a brilliant older friend who knows the job market cold.

CRITICAL OUTPUT REQUIREMENT: You MUST return exactly 50 jobs total — 20 in tier1, 20 in tier2, 10 in tier3. This is non-negotiable. Do not stop early. Do not summarize. Write every single job out fully with all fields. A response with fewer than 50 jobs is an incomplete failure.

IMPORTANT TONE DIRECTIVE: ${p.name} tends to be down on himself and anxious about the future. Counter that with SPECIFIC evidence from his profile. Be his hype man, but make it real.

STUDENT PROFILE:
Name: ${p.name || "there"}
Studying: ${p.major || "History"} at community college
Interests: ${p.interests?.join(", ") || "not specified"}
Hobbies: ${p.hobbies?.join(", ") || "not specified"}
Natural strengths: ${p.strengths?.join(", ") || "not specified"}
Hyperfixations: ${p.hyperfixation || "not specified"}
Favorite books: ${p.books || "not specified"}
Favorite movies/shows: ${p.movies || "not specified"}
Favorite video games: ${p.games || "not specified"}
Work experience: ${p.workTypes?.join(", ") || "none listed"}
Liked/disliked about work: ${p.workDetails || "not specified"}
Career ideas so far: ${p.dreamJob || "no idea yet"}

PERSONALITY:
- DISC: D=${p.disc?.D ?? "?"}%, I=${p.disc?.I ?? "?"}%, S=${p.disc?.S ?? "?"}%, C=${p.disc?.C ?? "?"}%
- Holland Code (top 3): ${p.holland?.join(", ") || "not taken"}
- Enneagram: ${p.enneagram ? `${p.enneagram}${p.enneagramWing ? ` (${p.enneagramWing})` : ""} — ${ENNEAGRAM_LABELS[p.enneagram.replace(/w\\d/,"")] || ""}` : "not taken"}
- Myers-Briggs: ${p.mbti || "not taken"}
- OCEAN percentiles: O=${p.ocean?.O ?? "?"}%, C=${p.ocean?.C ?? "?"}%, E=${p.ocean?.E ?? "?"}%, A=${p.ocean?.A ?? "?"}%, N=${p.ocean?.N ?? "?"}%
- High5 strengths (top 5): ${p.high5?.join(", ") || "not taken"}
${p.extraContext ? `\nExtra context: ${p.extraContext}` : ""}

YOUR OUTPUT MUST BE VALID JSON ONLY. No markdown, no preamble, no explanation outside the JSON. Return exactly this structure:

{
  "intro": "2-3 sentence personal opener using his name, referencing his specific profile, hyping him up with evidence",
  "tier1": [
    {
      "title": "Job Title",
      "salary": "$55k–$95k",
      "median": "~$72k",
      "aiRisk": "Low" | "Medium" | "High",
      "remote": true | false,
      "degree": "No degree" | "Certificate" | "Associate's" | "Bachelor's" | "Master's",
      "whyFit": "2-3 sentences referencing his specific traits, test results, interests",
      "dayInLife": "2-3 sentences on pace, environment, what you actually do daily",
      "path": [
        "Step 1: Exact concrete action (e.g. 'Complete Google's free UX Research certificate on Coursera — 6 hours')",
        "Step 2: ...",
        "Step 3: ...",
        "Step 4: ...",
        "Step 5: First job title to search and apply for"
      ],
      "coffeeChat": {
        "why": "1 sentence on why talking to people in this field is low-stakes and worth it for him specifically",
        "whoToFind": ["Role title 1 to search on LinkedIn", "Role title 2", "Role title 3"],
        "where": ["LinkedIn — search '[job title] at [company type]'", "One specific company name to look up", "One community or Slack group name"],
        "script": "Hi [Name], I'm a [major] student at community college exploring careers in [field]. I came across your profile and I'm genuinely curious about your path — not looking for a job, just want to learn. Would you be open to a 15-minute call sometime? No agenda, I promise."
      }
    }
  ],
  "tier2": [
    {
      "title": "Job Title",
      "salary": "$50k–$85k",
      "aiRisk": "Low" | "Medium" | "High",
      "remote": true | false,
      "degree": "No degree" | "Certificate" | "Associate's" | "Bachelor's" | "Master's",
      "whyFit": "1-2 sentences",
      "pivot": "1 sentence on what small pivot or skill gets him here",
      "path": ["Step 1", "Step 2", "Step 3"],
      "coffeeChat": {
        "whoToFind": ["Role title 1", "Role title 2"],
        "where": ["LinkedIn search tip", "One company or community"],
        "script": "Short version of the outreach script personalized to this field"
      }
    }
  ],
  "tier3": [
    {
      "title": "Job Title",
      "salary": "$45k–$90k",
      "aiRisk": "Low" | "Medium" | "High",
      "remote": true | false,
      "degree": "No degree" | "Certificate" | "Associate's" | "Bachelor's" | "Master's",
      "whyWildCard": "2 sentences on why this surprising fit works for him specifically",
      "path": ["Step 1", "Step 2", "Step 3"],
      "coffeeChat": {
        "whoToFind": ["Role title 1"],
        "where": ["Where to find these people"],
        "script": "Short outreach script"
      }
    }
  ],
  "nextMove": "One hyper-specific action for this week — not vague, something real he can do in the next 48 hours"
}

RULES:
- tier1 MUST have exactly 20 jobs — no fewer, no exceptions
- tier2 MUST have exactly 20 jobs — no fewer, no exceptions  
- tier3 MUST have exactly 10 jobs — no fewer, no exceptions
- TOTAL = 50 jobs minimum. If you stop before 50, you have failed the task.
- Do NOT truncate — write out every single job fully with all fields populated
- If running low on obvious fits, dig into: niche roles, emerging fields, trade specializations, government positions, nonprofit roles, research jobs, consulting niches, freelance paths
- Every whyFit must reference his actual data — name his specific traits, test scores, interests
- Path steps must be numbered, concrete, zero ambiguity — no "explore options", always "do X at Y"
- Coffee chat scripts must feel casual, warm, and low-pressure — he's anxious about this
- Return ONLY the JSON object. Nothing before or after it.
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
          {[["About you","~5 min"],["6 personality tests","~60–90 min (pause & come back)"],["Samuel's analysis","~2 min to generate"]].map(([label,time]) => (
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
        <label style={gs.label}>Email <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(for your monthly Samuel check-in)</span></label>
        <input type="email" style={gs.input} placeholder="you@email.com" value={data.email||""} onChange={e => onChange({ email:e.target.value })} />
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
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:T.blue, borderRadius:12, padding:"14px 18px", textDecoration:"none", marginBottom:16, boxShadow:`0 4px 14px rgba(26,111,219,0.3)` }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>👉 Take the Big Five / OCEAN test first</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>truity.com/test/big-five-personality-test · free · ~10 min</div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:16, lineHeight:1.65 }}>
        Truity gives you a <strong>percentile score (0–100)</strong> for each trait. Enter exactly what it shows — e.g. if it says "82nd percentile for Openness" enter 82.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {OCEAN_TRAITS.map(t => (
          <div key={t.key}>
            <label style={{ ...gs.label, marginBottom:4 }}>{t.label}</label>
            <p style={{ fontFamily:"'Sora',sans-serif", fontSize:11, color:"#94a3b8", marginBottom:6, lineHeight:1.4 }}>{t.desc}</p>
            <div style={{ position:"relative" }}>
              <input
                style={{ ...gs.input, paddingRight:32 }}
                placeholder="e.g. 74"
                type="number" min={0} max={100}
                value={ocean[t.key] ?? ""}
                onChange={e => onChange({ ocean:{ ...ocean, [t.key]: e.target.value === "" ? undefined : Number(e.target.value) } })}
              />
              <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted }}>%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function High5Input({ data, onChange }) {
  const selected = data.high5 || [];
  const toggle = (v) => {
    if (selected.includes(v)) onChange({ high5: selected.filter(x => x !== v) });
    else if (selected.length < 5) onChange({ high5: [...selected, v] });
  };
  return (
    <div>
      <a href="https://high5test.com" target="_blank" rel="noopener noreferrer"
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:T.blue, borderRadius:12, padding:"14px 18px", textDecoration:"none", marginBottom:16, boxShadow:`0 4px 14px rgba(26,111,219,0.3)` }}>
        <div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white }}>👉 Take the High5 Strengths test first</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"rgba(255,255,255,0.8)", marginTop:2 }}>high5test.com · free · ~15 min</div>
        </div>
        <span style={{ fontSize:20, color:T.white }}>↗</span>
      </a>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, marginBottom:14, lineHeight:1.65 }}>
        High5 gives you your <strong>top 5 named strengths</strong>. Select the exact 5 it showed you — tap them in order, strongest first.
      </p>
      {selected.length > 0 && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          {selected.map((s, i) => (
            <span key={s} style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:T.white, background:T.blue, borderRadius:20, padding:"3px 11px" }}>
              {i+1}. {s}
            </span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
        {HIGH5_STRENGTHS.map(s => {
          const active = selected.includes(s);
          const disabled = !active && selected.length >= 5;
          return (
            <button key={s} onClick={() => toggle(s)} disabled={disabled} style={{
              padding:"7px 13px", borderRadius:20,
              background: active ? T.blue : T.white,
              border:`1.5px solid ${active ? T.blue : T.border}`,
              fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight: active ? 700 : 400,
              color: active ? T.white : disabled ? "#cbd5e1" : T.muted,
              cursor: disabled ? "not-allowed" : "pointer",
              transition:"all 0.15s", opacity: disabled ? 0.5 : 1,
            }}>{s}</button>
          );
        })}
      </div>
      {selected.length === 5 && (
        <p style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:"#16a34a", fontWeight:600, marginTop:10 }}>
          ✓ All 5 strengths selected
        </p>
      )}
    </div>
  );
}

function Step5({ data, onChange, onNext, onBack }) {
  const [subStep, setSubStep] = useState(0);
  const tests = [
    {
      id:"disc", title:"DISC",
      check: (d) => Object.keys(d.disc||{}).length === 4 && DISC_OPTIONS.every(o => (d.disc[o.key]||"").toString().trim() !== ""),
      component: <DiscInput data={data} onChange={onChange} />
    },
    {
      id:"holland", title:"Holland Code",
      check: (d) => (d.holland||[]).length >= 1,
      component: <HollandInput data={data} onChange={onChange} />
    },
    {
      id:"enneagram", title:"Enneagram",
      check: (d) => !!(d.enneagram && d.enneagram.replace(/w\d/,"") !== ""),
      component: <EnneagramInput data={data} onChange={onChange} />
    },
    {
      id:"mbti", title:"Myers-Briggs",
      check: (d) => !!(d.mbti && d.mbti.replace(/-(T|A)$/,"").length === 4),
      component: <MbtiInput data={data} onChange={onChange} />
    },
    {
      id:"ocean", title:"Big Five",
      check: (d) => d.ocean && Object.values(d.ocean).filter(v => v !== undefined && v !== "").length === 5,
      component: <OceanInput data={data} onChange={onChange} />
    },
    {
      id:"high5", title:"High5",
      check: (d) => (d.high5||[]).length === 5,
      component: <High5Input data={data} onChange={onChange} />
    },
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

// ─── CAREER MAP UI ────────────────────────────────────────────────────────────
const RISK_COLOR = { Low:"#16a34a", Medium:"#d97706", High:"#dc2626" };
const RISK_BG   = { Low:"#f0fdf4", Medium:"#fffbeb", High:"#fef2f2" };

function Badge({ label, color, bg }) {
  return (
    <span style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:700, color, background:bg, borderRadius:20, padding:"2px 9px", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function CareerCard({ job, saved, onSave }) {
  const [open, setOpen] = useState(false);
  const [pathStep, setPathStep] = useState(0);
  const [copiedScript, setCopiedScript] = useState(false);

  const copyScript = () => {
    navigator.clipboard.writeText(job.coffeeChat?.script || "").then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    });
  };

  return (
    <div style={{
      background:T.white, border:`1.5px solid ${open ? T.blue : T.border}`,
      borderRadius:16, overflow:"hidden",
      boxShadow: open ? `0 4px 20px rgba(26,111,219,0.12)` : "0 1px 4px rgba(0,0,0,0.04)",
      transition:"all 0.2s", marginBottom:10,
    }}>
      {/* Collapsed row */}
      <div onClick={() => setOpen(o => !o)} style={{ padding:"14px 16px", cursor:"pointer", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T.text, marginBottom:6 }}>{job.title}</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
            <Badge label={job.salary} color={T.blue} bg={T.blueLight} />
            <Badge label={`AI Risk: ${job.aiRisk}`} color={RISK_COLOR[job.aiRisk]||T.muted} bg={RISK_BG[job.aiRisk]||T.bg} />
            {job.remote && <Badge label="Remote ✓" color="#16a34a" bg="#f0fdf4" />}
            <Badge label={job.degree} color={T.muted} bg="#f8faff" />
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
          <button onClick={e => { e.stopPropagation(); onSave(job.title); }} style={{
            width:32, height:32, borderRadius:10, border:`1.5px solid ${saved ? T.blue : T.border}`,
            background: saved ? T.blueLight : T.white,
            display:"flex", alignItems:"center", justifyContent:"center",
            cursor:"pointer", fontSize:17, transition:"all 0.15s",
          }} title={saved ? "Saved" : "Save to shortlist"}>
            {saved ? "★" : "☆"}
          </button>
          <div style={{ fontSize:18, color:T.muted, transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</div>
        </div>
      </div>

      {/* Expanded */}
      {open && (
        <div style={{ borderTop:`1px solid ${T.border}`, padding:"4px 16px 18px" }}>

          {/* Why it fits */}
          <div style={{ paddingTop:14, marginBottom:14 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, color:T.blue, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Why this fits you</div>
            <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.text, lineHeight:1.8, margin:0 }}>{job.whyFit}</p>
          </div>

          {/* Day in life */}
          {(job.dayInLife || job.pivot) && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
                {job.dayInLife ? "Day in the life" : "The pivot"}
              </div>
              <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, lineHeight:1.8, margin:0 }}>{job.dayInLife || job.pivot}</p>
            </div>
          )}

          {/* Path tracker */}
          {job.path?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Your path in — tap each step as you complete it</div>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {job.path.map((step, i) => {
                  const done = i < pathStep;
                  const current = i === pathStep;
                  return (
                    <div key={i} onClick={() => setPathStep(done ? i : i + 1)} style={{
                      display:"flex", gap:12, alignItems:"flex-start", cursor:"pointer",
                      padding:"10px 12px", borderRadius:12,
                      background: done ? "#f0fdf4" : current ? T.blueLight : T.bg,
                      border:`1.5px solid ${done ? "#86efac" : current ? T.blue : T.border}`,
                      transition:"all 0.15s",
                    }}>
                      <div style={{
                        width:24, height:24, borderRadius:"50%", flexShrink:0, marginTop:1,
                        background: done ? "#16a34a" : current ? T.blue : T.white,
                        border:`2px solid ${done ? "#16a34a" : current ? T.blue : T.border}`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:700,
                        color: done || current ? T.white : T.muted,
                      }}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color: done ? "#16a34a" : current ? T.blue : T.muted, lineHeight:1.65, fontWeight: current ? 600 : 400 }}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              {pathStep > 0 && (
                <button onClick={() => setPathStep(0)} style={{ marginTop:8, fontFamily:"'Sora',sans-serif", fontSize:11, color:T.muted, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                  ↩ Reset progress
                </button>
              )}
            </div>
          )}

          {/* Coffee chat */}
          {job.coffeeChat && (
            <div style={{ background:"#f8faff", border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, color:T.blue, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>☕ Coffee chat — easiest way to learn</div>
              {job.coffeeChat.why && (
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, lineHeight:1.7, marginBottom:12, marginTop:0 }}>{job.coffeeChat.why}</p>
              )}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:600, color:T.muted, marginBottom:6 }}>Who to find</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {job.coffeeChat.whoToFind?.map(who => (
                    <span key={who} style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.blue, background:T.blueLight, borderRadius:20, padding:"3px 10px", fontWeight:600 }}>{who}</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:600, color:T.muted, marginBottom:6 }}>Where to find them</div>
                {job.coffeeChat.where?.map(w => (
                  <div key={w} style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.text, display:"flex", gap:6, alignItems:"flex-start", marginBottom:4 }}>
                    <span style={{ color:T.blue, flexShrink:0 }}>→</span>{w}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:600, color:T.muted, marginBottom:6 }}>Message — copy & paste this exactly</div>
                <div style={{ background:T.white, border:`1px solid ${T.blueMid}`, borderRadius:10, padding:"10px 12px", fontFamily:"'Sora',sans-serif", fontSize:12, color:T.text, lineHeight:1.75, marginBottom:8, whiteSpace:"pre-wrap" }}>
                  {job.coffeeChat.script}
                </div>
                <button onClick={copyScript} style={{
                  padding:"7px 16px", background: copiedScript ? "#f0fdf4" : T.blue, border:"none", borderRadius:8,
                  fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700,
                  color: copiedScript ? "#16a34a" : T.white, cursor:"pointer", transition:"all 0.15s",
                }}>
                  {copiedScript ? "✓ Copied!" : "Copy message"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CompareView({ allJobs, saved }) {
  const [picks, setPicks] = useState([null, null]);
  const [search, setSearch] = useState("");

  const filtered = allJobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase())
  );

  const pick = (job) => {
    if (picks[0]?.title === job.title || picks[1]?.title === job.title) {
      setPicks(picks.map(p => p?.title === job.title ? null : p));
      return;
    }
    if (!picks[0]) { setPicks([job, picks[1]]); return; }
    if (!picks[1]) { setPicks([picks[0], job]); return; }
    setPicks([job, picks[1]]);
  };

  const [a, b] = picks;
  const rows = [
    { label:"Salary",      va: a?.salary,   vb: b?.salary },
    { label:"Median",      va: a?.median,   vb: b?.median },
    { label:"AI Risk",     va: a?.aiRisk,   vb: b?.aiRisk },
    { label:"Remote",      va: a?.remote ? "Yes ✓" : "No", vb: b?.remote ? "Yes ✓" : "No" },
    { label:"Degree",      va: a?.degree,   vb: b?.degree },
    { label:"Path steps",  va: a?.path ? `${a.path.length} steps` : "—", vb: b?.path ? `${b.path.length} steps` : "—" },
  ];

  return (
    <div style={{ padding:"14px", background:"#f8faff", flex:1, overflow:"auto" }}>
      <p style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted, marginBottom:12, marginTop:0 }}>
        Pick any two careers to compare side by side.
      </p>

      {/* Search + pick list */}
      <input
        style={{ ...gs.input, marginBottom:10 }}
        placeholder="Search careers…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:20 }}>
        {filtered.map(job => {
          const picked = picks[0]?.title === job.title || picks[1]?.title === job.title;
          const isA = picks[0]?.title === job.title;
          return (
            <button key={job.title} onClick={() => pick(job)} style={{
              padding:"6px 12px", borderRadius:20,
              background: picked ? (isA ? T.blue : "#7c3aed") : T.white,
              border:`1.5px solid ${picked ? (isA ? T.blue : "#7c3aed") : T.border}`,
              fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:600,
              color: picked ? T.white : T.muted,
              cursor:"pointer", transition:"all 0.15s",
            }}>
              {picked ? (isA ? "A: " : "B: ") : ""}{job.title}
            </button>
          );
        })}
      </div>

      {/* Comparison table */}
      {(a || b) && (
        <div style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, overflow:"hidden" }}>
          {/* Headers */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ padding:"12px 14px", fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:700, color:T.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}></div>
            <div style={{ padding:"12px 14px", background:T.blueLight, fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:T.blue, borderLeft:`1px solid ${T.border}` }}>
              {a ? a.title : <span style={{ color:T.muted, fontWeight:400 }}>Pick A</span>}
            </div>
            <div style={{ padding:"12px 14px", background:"#f5f0ff", fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:"#7c3aed", borderLeft:`1px solid ${T.border}` }}>
              {b ? b.title : <span style={{ color:T.muted, fontWeight:400 }}>Pick B</span>}
            </div>
          </div>
          {rows.map((row, i) => (
            <div key={row.label} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", borderBottom: i < rows.length-1 ? `1px solid ${T.border}` : "none" }}>
              <div style={{ padding:"10px 14px", fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:600, color:T.muted }}>{row.label}</div>
              <div style={{ padding:"10px 14px", fontFamily:"'Sora',sans-serif", fontSize:13, color:T.text, borderLeft:`1px solid ${T.border}` }}>{row.va || "—"}</div>
              <div style={{ padding:"10px 14px", fontFamily:"'Sora',sans-serif", fontSize:13, color:T.text, borderLeft:`1px solid ${T.border}` }}>{row.vb || "—"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoffeeChatTracker() {
  const [chats, setChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem("samuel_chats") || "[]"); } catch { return []; }
  });
  const [form, setForm] = useState({ name:"", field:"", date:"", note:"" });
  const [adding, setAdding] = useState(false);

  const save = () => {
    if (!form.name.trim() || !form.field.trim()) return;
    const next = [{ ...form, id: Date.now() }, ...chats];
    setChats(next);
    try { localStorage.setItem("samuel_chats", JSON.stringify(next)); } catch {}
    setForm({ name:"", field:"", date:"", note:"" });
    setAdding(false);
  };

  const remove = (id) => {
    const next = chats.filter(c => c.id !== id);
    setChats(next);
    try { localStorage.setItem("samuel_chats", JSON.stringify(next)); } catch {}
  };

  return (
    <div style={{ flex:1, overflow:"auto", padding:"14px", background:"#f8faff" }}>
      {/* Header row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <p style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted, margin:0 }}>
            {chats.length === 0 ? "No chats logged yet — every conversation counts." : `${chats.length} coffee chat${chats.length !== 1 ? "s" : ""} logged 🎉`}
          </p>
        </div>
        <button onClick={() => setAdding(a => !a)} style={{
          padding:"8px 14px", background:adding ? T.white : T.blue, border:`1.5px solid ${adding ? T.border : T.blue}`,
          borderRadius:10, fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700,
          color: adding ? T.muted : T.white, cursor:"pointer", transition:"all 0.15s",
        }}>
          {adding ? "Cancel" : "+ Log a chat"}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background:T.white, border:`1.5px solid ${T.blue}`, borderRadius:16, padding:"16px", marginBottom:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <label style={{ ...gs.label, marginBottom:4 }}>Their name</label>
              <input style={gs.input} placeholder="e.g. Sarah Chen" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
            </div>
            <div>
              <label style={{ ...gs.label, marginBottom:4 }}>Career field</label>
              <input style={gs.input} placeholder="e.g. UX Research" value={form.field} onChange={e => setForm(f => ({...f, field:e.target.value}))} />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ ...gs.label, marginBottom:4 }}>Date</label>
            <input type="date" style={gs.input} value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ ...gs.label, marginBottom:4 }}>How did it go? <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
            <textarea style={{ ...gs.input, height:72, resize:"vertical", lineHeight:1.6 }}
              placeholder="What did you learn? Did anything surprise you?"
              value={form.note} onChange={e => setForm(f => ({...f, note:e.target.value}))} />
          </div>
          <button onClick={save} style={{
            width:"100%", padding:"11px", background:T.blue, border:"none", borderRadius:10,
            fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.white, cursor:"pointer",
          }}>Save chat</button>
        </div>
      )}

      {/* Chat list */}
      {chats.length === 0 && !adding && (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>☕</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, color:T.muted, lineHeight:1.7 }}>
            Log your first coffee chat.<br/>Even one conversation can change everything.
          </div>
        </div>
      )}

      {chats.map(chat => (
        <div key={chat.id} style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:T.text }}>{chat.name}</div>
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.blue, background:T.blueLight, borderRadius:20, padding:"2px 9px", fontWeight:600 }}>{chat.field}</span>
                {chat.date && <span style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted }}>{new Date(chat.date).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</span>}
              </div>
            </div>
            <button onClick={() => remove(chat.id)} style={{ background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", fontSize:16, padding:"2px 4px" }}>×</button>
          </div>
          {chat.note && <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, lineHeight:1.65, margin:"8px 0 0" }}>{chat.note}</p>}
        </div>
      ))}
    </div>
  );
}

function CareerMap({ data, name, email, onReset }) {
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(() => {
    try { return JSON.parse(localStorage.getItem("samuel_saved") || "[]"); } catch { return []; }
  });

  const toggleSave = (title) => {
    const next = saved.includes(title) ? saved.filter(t => t !== title) : [...saved, title];
    setSaved(next);
    try { localStorage.setItem("samuel_saved", JSON.stringify(next)); } catch {}
    // Register email for monthly check-in on first save
    if (email && !saved.length) {
      fetch("/api/register-checkin", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ email, name, savedCareers: next }),
      }).catch(() => {});
    }
  };

  const allJobs = [...(data.tier1||[]),...(data.tier2||[]),...(data.tier3||[])];
  const tabs = [
    { label:"🎯 Your Lane",   key:"lane" },
    { label:"🔭 Explore",     key:"explore" },
    { label:"🃏 Wild Cards",  key:"wild" },
    { label:"★ Saved" + (saved.length ? ` (${saved.length})` : ""), key:"saved" },
    { label:"⚖️ Compare",     key:"compare" },
    { label:"☕ Chats",       key:"chats" },
  ];
  const current = tabs[Math.min(tab, tabs.length-1)];

  const jobsForTab = () => {
    if (current.key === "lane")    return { jobs: data.tier1||[], desc:"Careers you'd genuinely thrive in" };
    if (current.key === "explore") return { jobs: data.tier2||[], desc:"Worth a closer look with a small pivot" };
    if (current.key === "wild")    return { jobs: data.tier3||[], desc:"Surprising fits most people never consider" };
    if (current.key === "saved")   return { jobs: allJobs.filter(j => saved.includes(j.title)), desc:"Your shortlist" };
    return null;
  };
  const jobTab = jobsForTab();

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:12, flexShrink:0, background:T.white }}>
        <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${T.blue},#4a9fef)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, flexShrink:0 }}>🧭</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:T.text }}>Samuel</div>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:11, color:T.muted }}>{name}'s Career Map · {allJobs.length} careers mapped</div>
        </div>
        <button onClick={() => { if(window.confirm("Start over? This clears all your answers.")) onReset(); }} title="Start over" style={{ width:34, height:34, borderRadius:10, background:T.bg, border:`1.5px solid ${T.border}`, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", color:T.muted }}>↺</button>
      </div>

      {/* Intro */}
      {data.intro && (
        <div style={{ padding:"12px 16px", background:T.blueLight, borderBottom:`1px solid ${T.blueMid}`, flexShrink:0 }}>
          <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.blue, lineHeight:1.8, margin:0, fontWeight:500 }}>{data.intro}</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, flexShrink:0, background:T.white, overflowX:"auto" }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding:"10px 14px", fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:700,
            color: tab===i ? T.blue : T.muted,
            background: tab===i ? T.white : "#fafbff",
            border:"none", borderBottom:`2.5px solid ${tab===i ? T.blue : "transparent"}`,
            cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      {current.key === "compare" && <CompareView allJobs={allJobs} saved={saved} />}
      {current.key === "chats"   && <CoffeeChatTracker />}
      {jobTab && (
        <div style={{ flex:1, overflow:"auto", padding:"14px", background:"#f8faff" }}>
          <p style={{ fontFamily:"'Sora',sans-serif", fontSize:12, color:T.muted, marginBottom:12, marginTop:0 }}>
            {jobTab.desc} · <strong style={{ color:T.text }}>{jobTab.jobs.length} careers</strong>
          </p>
          {jobTab.jobs.map((job, i) => (
            <CareerCard key={`${job.title}-${i}`} job={job} saved={saved.includes(job.title)} onSave={toggleSave} />
          ))}
          {jobTab.jobs.length === 0 && (
            <div style={{ textAlign:"center", padding:"48px 0", fontFamily:"'Sora',sans-serif", fontSize:14, color:T.muted }}>
              {current.key === "saved" ? "Tap ☆ on any career to save it here" : "No careers in this tier"}
            </div>
          )}
        </div>
      )}

      {/* Next move */}
      {data.nextMove && current.key !== "compare" && current.key !== "chats" && (
        <div style={{ padding:"14px 16px", background:T.blue, flexShrink:0 }}>
          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.65)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>⚡ Your move this week</div>
          <p style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.white, lineHeight:1.75, margin:0 }}>{data.nextMove}</p>
        </div>
      )}
    </div>
  );
}

// ─── CHAT VIEW ────────────────────────────────────────────────────────────────
function ChatView({ profile, onReset }) {
  const [careerMap, setCareerMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => { if (!ready) { setReady(true); kickoff(); } }, []);

  const kickoff = async () => {
    setLoading(true);
    setError("");
    const discDesc = profile.disc
      ? Object.entries(profile.disc).map(([k,v]) => `${k}=${v}%`).join(", ")
      : "not taken";

    const prompt = `Build my career map as JSON. Profile:
Name: ${profile.name}, Major: ${profile.major||"History"}
Interests: ${profile.interests?.join(", ")||"not specified"}
Hobbies: ${profile.hobbies?.join(", ")||"not specified"}
Hyperfixations: ${profile.hyperfixation||"none"}
Strengths: ${profile.strengths?.join(", ")||"not specified"}
Books: ${profile.books||"not specified"} | Movies: ${profile.movies||"not specified"} | Games: ${profile.games||"not specified"}
Work: ${profile.workTypes?.join(", ")||"none"} — ${profile.workDetails||""}
Career ideas: ${profile.dreamJob||"no idea"}
DISC: ${discDesc} | Holland: ${profile.holland?.join(", ")||"not taken"}
Enneagram: ${profile.enneagram||"not taken"}${profile.enneagramWing ? ` (${profile.enneagramWing})` : ""} | MBTI: ${profile.mbti||"not taken"}
OCEAN percentiles: O=${profile.ocean?.O??`?`}%, C=${profile.ocean?.C??`?`}%, E=${profile.ocean?.E??`?`}%, A=${profile.ocean?.A??`?`}%, N=${profile.ocean?.N??`?`}%
High5 strengths: ${profile.high5?.join(", ")||"not taken"}
${profile.extraContext ? `Extra: ${profile.extraContext}` : ""}`;

    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          system: buildSystemPrompt(profile),
          messages:[{ role:"user", content:prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/^```json\s*/,"").replace(/\s*```$/,"").trim();
      const parsed = JSON.parse(clean);
      setCareerMap(parsed);
    } catch(e) {
      setError(`Something went wrong. ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;}
        @keyframes pulse{0%,100%{opacity:0.2;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}
      `}</style>
      <div style={{ width:"100%", maxWidth:760, height:"calc(100vh - 48px)", maxHeight:900, display:"flex", flexDirection:"column", background:T.white, borderRadius:20, overflow:"hidden", boxShadow:"0 24px 80px rgba(0,0,0,0.35)" }}>

        {loading && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:20, padding:40, background:T.white }}>
            <div style={{ width:60, height:60, borderRadius:18, background:`linear-gradient(135deg,${T.blue},#4a9fef)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, boxShadow:`0 8px 24px rgba(26,111,219,0.3)` }}>🧭</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:700, color:T.text }}>Building your career map…</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, color:T.muted, textAlign:"center", maxWidth:300, lineHeight:1.7 }}>
              Analyzing your personality, interests, and strengths.<br/>Takes about 30 seconds.
            </div>
            <div style={{ display:"flex", gap:7, marginTop:4 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:T.blue, animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:40 }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, color:"#dc2626", textAlign:"center", lineHeight:1.65 }}>{error}</div>
            <button onClick={kickoff} style={{ padding:"11px 28px", background:T.blue, color:T.white, border:"none", borderRadius:12, fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, cursor:"pointer" }}>Try again</button>
          </div>
        )}

        {careerMap && !loading && (
          <CareerMap data={careerMap} name={profile.name} email={profile.email} onReset={onReset} />
        )}
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "samuel_profile_v1";
const STEP_KEY    = "samuel_step_v1";

const DEFAULT_PROFILE = {
  name:"", email:"", major:"History",
  interests:[], hobbies:[], hyperfixation:"",
  books:"", movies:"", games:"",
  strengths:[], dreamJob:"",
  workTypes:[], workDetails:"",
  disc:{}, holland:[], enneagram:"", enneagramWing:"", mbti:"", ocean:{}, high5:[],
  extraContext:"",
};

export default function App() {
  const [step, setStep] = useState(() => {
    try { const s = localStorage.getItem(STEP_KEY); return s ? Math.min(parseInt(s,10),6) : 0; } catch{ return 0; }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch { return DEFAULT_PROFILE; }
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch{}
  }, [profile]);
  useEffect(() => {
    try { if (step > 0 && step < 7) localStorage.setItem(STEP_KEY, String(step)); } catch{}
  }, [step]);

  const u = (patch) => setProfile(p => ({ ...p, ...patch }));
  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleReset = () => {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(STEP_KEY); } catch{}
    setProfile(DEFAULT_PROFILE);
    setStep(0);
  };

  if (step === 0) return <StepWelcome onNext={next} hasProgress={(() => { try { return !!localStorage.getItem(STEP_KEY); } catch { return false; }})()}  onResume={() => { try { const s = localStorage.getItem(STEP_KEY); if(s) setStep(parseInt(s,10)); } catch{} }} onReset={handleReset} />;
  if (step === 7) return <ChatView profile={profile} onReset={handleReset} />;

  return (
    <>
      {step === 1 && <Step1 data={profile} onChange={u} onNext={next} />}
      {step === 2 && <Step2 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 3 && <Step3 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 4 && <Step4 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 5 && <Step5 data={profile} onChange={u} onNext={next} onBack={back} />}
      {step === 6 && <Step6 data={profile} onChange={u} onNext={next} onBack={back} />}
    </>
  );
}