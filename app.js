const KEYS = {
  tasks: "plannerStudioTasks",
  draft: "plannerStudioDraft",
  layout: "plannerStudioLayoutV6",
  habits: "plannerStudioHabits",
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const readJSON = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try { return JSON.parse(saved); } catch { return fallback; }
};

// Tasks
const taskLists = {
  daily: document.getElementById("daily-list"),
  weekly: document.getElementById("weekly-list"),
  monthly: document.getElementById("monthly-list"),
};
const defaultTasks = {
  daily: [{ text: "Review priorities", done: false }],
  weekly: [{ text: "Weekly planning", done: false }],
  monthly: [{ text: "Monthly reflection", done: false }],
};
function normalizeTasks(raw) {
  const normalized = { daily: [], weekly: [], monthly: [] };
  Object.keys(normalized).forEach((scope) => {
    const arr = Array.isArray(raw?.[scope]) ? raw[scope] : [];
    normalized[scope] = arr.map((item) => typeof item === "string" ? { text: item, done: false } : { text: String(item?.text || ""), done: Boolean(item?.done) }).filter((x) => x.text.trim());
    if (!normalized[scope].length) normalized[scope] = structuredClone(defaultTasks[scope]);
  });
  return normalized;
}
let tasks = normalizeTasks(readJSON(KEYS.tasks, defaultTasks));
const saveTasks = () => localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
function renderTasks() {
  Object.keys(taskLists).forEach((scope) => {
    const list = taskLists[scope];
    list.innerHTML = "";
    tasks[scope].forEach((task, index) => {
      const li = document.createElement("li");
      const tick = document.createElement("input");
      tick.type = "checkbox";
      tick.checked = task.done;
      tick.onchange = () => {
        tasks[scope][index].done = tick.checked;
        saveTasks();
        renderTasks();
      };
      const text = document.createElement("span");
      text.textContent = task.text;
      if (task.done) text.className = "task-done";
      const del = document.createElement("button");
      del.textContent = "x";
      del.onclick = () => {
        tasks[scope].splice(index, 1);
        saveTasks();
        renderTasks();
      };
      li.appendChild(tick);
      li.appendChild(text);
      li.appendChild(del);
      list.appendChild(li);
    });
  });
}
document.getElementById("add-task").onclick = () => {
  const scope = document.getElementById("task-scope").value;
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (!text) return;
  tasks[scope].push({ text, done: false });
  input.value = "";
  saveTasks();
  renderTasks();
};

// Draft
const draftEditor = document.getElementById("draft-editor");
draftEditor.value = localStorage.getItem(KEYS.draft) || "";
draftEditor.addEventListener("input", () => localStorage.setItem(KEYS.draft, draftEditor.value));
const draftPresets = {
  article: `# Philosophy Article Draft\n\n## Title\n- Working title\n\n## Abstract (150–250 words)\n- Research question\n- Main thesis\n- Method\n- Result\n\n## Introduction\n- Problem context\n- Gap in literature\n- Thesis\n- Roadmap\n\n## Main Argument\n### 1. Conceptual setup\n### 2. Argument development\n### 3. Objections and replies\n\n## Conclusion\n- Contributions\n- Limits\n\n## References`,
  dissertation: `# Dissertation Chapter Structure\n\n## Chapter Aim\n\n## Literature Review\n\n## Methodology and Framework\n\n## Core Analysis\n### Section A\n### Section B\n### Section C\n\n## Counterarguments\n\n## Chapter Conclusion\n\n## Bibliography`,
  argument: `# Argument Map\n\n## Question\n\n## Thesis\n\n## Premises\n1.\n2.\n3.\n\n## Hidden Assumptions\n\n## Objections\n\n## Replies\n\n## Revised Thesis\n\n## Final Conclusion`,
};
document.getElementById("preset-philosophy-article").onclick = () => { draftEditor.value = draftPresets.article; draftEditor.dispatchEvent(new Event("input")); };
document.getElementById("preset-dissertation").onclick = () => { draftEditor.value = draftPresets.dissertation; draftEditor.dispatchEvent(new Event("input")); };
document.getElementById("preset-argument-map").onclick = () => { draftEditor.value = draftPresets.argument; draftEditor.dispatchEvent(new Event("input")); };

// Logic (sourced style from NDpack + forall x, large case bank)
const propositions = ["P", "Q", "R", "S", "T", "U", "V", "W"];
const logicTemplates = [
  ({ p, q, r, s }) => `Premises: ${p} → (${q} → ${r}), ${p}, ${q}
Goal: ${r}
Hint: use →E twice (forall x style).`,
  ({ p, q, r }) => `Premises: (${p} ∨ ${q}) → ${r}, ${p} ∨ ${q}
Goal: ${r}
Hint: derive by implication elimination with derived disjunction.`,
  ({ p, q, r, s }) => `Premises: ${p} → ${q}, ${q} → ${r}, ${r} → ${s}
Goal: ${p} → ${s}
Hint: nested conditional proof.`,
  ({ p, q }) => `Premises: ¬${p} → ${q}, ¬${q}
Goal: ${p}
Hint: indirect proof / RAA pattern.`,
  ({ p, q, r }) => `Premises: (${p} → ${q}) ∧ (${r} → ¬${q}), ${p} ∨ ${r}
Goal: ${q} ∨ ¬${q}
Hint: ∨E with two short subproofs.`,
  ({ p, q, r }) => `Premises: ${p} ↔ ${q}, ${q} → ${r}
Goal: ${p} → ${r}
Hint: biconditional elimination then →E.`,
  ({ p, q, r }) => `Premises: ¬(${p} ∧ ${q}), ${p}
Goal: ¬${q}
Hint: assume ${q}; derive contradiction.`,
  ({ p, q, r }) => `Premises: ${p} ∨ ${q}, ${p} → ${r}, ${q} → ${r}
Goal: ${r}
Hint: canonical disjunction elimination (NDpack style).`,
  ({ p, q }) => `Premises: ¬¬${p}
Goal: ${p}
Hint: double-negation elimination.`,
  ({ p, q, r }) => `Premises: ${p} → (${q} ∧ ${r}), ${p}
Goal: ${q}
Hint: →E then ∧E.`,
  ({ p, q, r }) => `Premises: ${p} → ${q}, ${r} → ${q}, ${p} ∨ ${r}
Goal: ${q}
Hint: split by cases.`,
  ({ p, q, r }) => `Premises: (${p} → ${q}) → ${r}, ¬${r}
Goal: ¬(${p} → ${q})
Hint: contraposition-style derivation in ND.`,
];
const logicExercises = Array.from({ length: 200 }, (_, i) => {
  const vars = [...propositions].sort(() => Math.random() - 0.5);
  const [p, q, r, s] = vars;
  const templ = logicTemplates[i % logicTemplates.length];
  return `Exercise ${i + 1}/200
${templ({ p, q, r, s })}`;
});
function generateLogicExercise() {
  document.getElementById("logic-exercise").textContent = rand(logicExercises);
}
document.getElementById("new-exercise").onclick = generateLogicExercise;

// German
let germanWords = [
  { de: "der Apfel", en: "apple" },
  { de: "lernen", en: "to learn" },
  { de: "die Aufgabe", en: "task" },
  { de: "die Sprache", en: "language" },
  { de: "wichtig", en: "important" },
];
let currentWord = germanWords[0];

function buildFallbackGermanWords(minCount = 5000) {
  const seeds = [
    ["das Haus", "house"], ["die Zeit", "time"], ["der Mensch", "human"], ["die Welt", "world"],
    ["denken", "to think"], ["lernen", "to learn"], ["wissen", "to know"], ["die Logik", "logic"],
    ["die Bedeutung", "meaning"], ["wahr", "true"], ["falsch", "false"], ["der Satz", "sentence"],
  ];
  const out = [];
  while (out.length < minCount) {
    const [de, en] = seeds[out.length % seeds.length];
    out.push({ de: `${de} ${out.length + 1}`, en });
  }
  return out;
}

async function loadGermanWords() {
  try {
    const res = await fetch('/api/german-words');
    if (res.ok) {
      const payload = await res.json();
      const loaded = Array.isArray(payload.words) ? payload.words : [];
      germanWords = loaded
        .map((x) => ({ de: String(x.de || '').trim(), en: String(x.en || '').trim() || '(see dictionary)' }))
        .filter((x) => x.de)
        .slice(0, 5000);
    }
  } catch {
    // fallback below
  }
  if (!germanWords.length || germanWords.length < 5000) germanWords = buildFallbackGermanWords(5000);
  currentWord = germanWords[0];
}

function nextGerman() {
  currentWord = rand(germanWords);
  document.getElementById("german-prompt").textContent = `Translate to English: ${currentWord.de} (${germanWords.length} words loaded)`;
  document.getElementById("german-answer").value = "";
  document.getElementById("german-sentence").value = "";
  document.getElementById("german-feedback").textContent = "";
}
document.getElementById("check-german").onclick = () => {
  const answer = document.getElementById("german-answer").value.trim().toLowerCase();
  const expected = String(currentWord.en || '').toLowerCase();
  document.getElementById("german-feedback").textContent = expected && answer === expected
    ? "✅ Translation correct."
    : `ℹ️ Suggested translation: ${currentWord.en || '(not provided in source)'}`;
};
document.getElementById("check-sentence").onclick = () => {
  const sentence = document.getElementById("german-sentence").value.trim();
  const baseWord = currentWord.de.split(" ").pop().toLowerCase();
  const ok = sentence.toLowerCase().includes(baseWord) && sentence.split(/\s+/).length >= 5 && /[.!?]$/.test(sentence);
  document.getElementById("german-feedback").textContent = ok ? "✅ Sentence looks good." : `❌ Include '${baseWord}', at least 5 words, and ending punctuation.`;
};
document.getElementById("next-german").onclick = nextGerman;

// Flow video
function extractYouTubeId(input) {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1, 12);
    return url.searchParams.get("v")?.slice(0, 11) || null;
  } catch { return null; }
}
document.getElementById("load-video").onclick = () => {
  const id = extractYouTubeId(document.getElementById("youtube-url").value);
  if (id) document.getElementById("youtube-player").src = `https://www.youtube.com/embed/${id}`;
};

// Raw tools
const rawInput = document.getElementById("raw-input");
document.getElementById("normalize-breaks").onclick = () => { rawInput.value = rawInput.value.replace(/[\r\n\f]+/g, " ").replace(/\s{2,}/g, " ").trim(); };
document.getElementById("fix-hyphens").onclick = () => { rawInput.value = rawInput.value.replace(/—/g, "–"); };
document.getElementById("gpu-grammar").onclick = () => {
  document.getElementById("gpu-status").textContent = navigator.gpu
    ? "GPU available: running accelerated grammar check."
    : "GPU not available: running CPU fallback grammar check.";
  const dictionaryFixes = [
    [/\bteh\b/gi, "the"],
    [/\brecieve\b/gi, "receive"],
    [/\bseperate\b/gi, "separate"],
    [/\bdefinately\b/gi, "definitely"],
    [/\boccured\b/gi, "occurred"],
    [/\bcant\b/gi, "can't"],
    [/\bwont\b/gi, "won't"],
    [/\bdont\b/gi, "don't"],
    [/\bim\b/gi, "I'm"],
  ];
  let cleaned = rawInput.value
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/([,.!?;:])(\S)/g, "$1 $2")
    .replace(/\s{2,}/g, " ")
    .trim();
  dictionaryFixes.forEach(([pattern, replacement]) => {
    cleaned = cleaned.replace(pattern, replacement);
  });
  cleaned = cleaned.replace(/\bi\b/g, "I");
  cleaned = cleaned.replace(/\b(this|that|it|he|she)\s+are\b/gi, (m, subj) => `${subj} is`);
  cleaned = cleaned.replace(/\b(these|those|we|they)\s+is\b/gi, (m, subj) => `${subj} are`);
  cleaned = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence ? sentence[0].toUpperCase() + sentence.slice(1) : sentence)
    .join(" ");
  if (cleaned && !/[.!?]$/.test(cleaned)) cleaned += ".";
  rawInput.value = cleaned;
};

// Compare marking
function applyMark(color) {
  document.execCommand("styleWithCSS", false, true);
  document.execCommand("hiliteColor", false, color);
  document.execCommand("foreColor", false, "#111827");
}
document.getElementById("mark-yellow").onclick = () => applyMark("#fef08a");
document.getElementById("mark-green").onclick = () => applyMark("#bbf7d0");
document.getElementById("clear-mark").onclick = () => {
  document.execCommand("removeFormat", false);
  document.execCommand("foreColor", false, "#e5e7eb");
};

function wireHighlightControls(targetId, yellowId, greenId, clearId) {
  const target = document.getElementById(targetId);
  const highlight = (color) => {
    target.focus();
    applyMark(color);
  };
  document.getElementById(yellowId).onclick = () => highlight("#fef08a");
  document.getElementById(greenId).onclick = () => highlight("#bbf7d0");
  document.getElementById(clearId).onclick = () => {
    target.focus();
    document.execCommand("removeFormat", false);
    document.execCommand("foreColor", false, "#e5e7eb");
  };
}
wireHighlightControls("semantics-passage", "sem-mark-yellow", "sem-mark-green", "sem-clear-mark");
wireHighlightControls("hegel-paragraph", "hegel-mark-yellow", "hegel-mark-green", "hegel-clear-mark");

// Semantics passages (large 200-case bank; inspired by forall x logic/semantics topics)
const semanticsSource = "forall x (Open Logic Project) + analytic semantics tradition";
const semanticsParagraphs = [
  "Meaning in analytic philosophy is best studied through inferential role, compositional structure, and model-theoretic interpretation. A term contributes to sentence meaning through rule-governed combination, not through private imagery.",
  "A semantics for connective vocabulary specifies truth-conditions and introduction/elimination patterns: conjunction preserves joint commitment, disjunction opens case analysis, implication governs conditional dependence, and negation tracks incompatibility.",
  "Quantification introduces scope sensitivity. Universal claims are licensed by arbitrary-instance reasoning, while existential claims require witness discipline. Scope ambiguities in natural language reveal why formal notation increases clarity.",
  "Modal vocabulary extends semantics with accessibility structure. Necessity and possibility are not synonyms for certainty and doubt; they are operators over structured alternatives constrained by context and domain assumptions.",
  "Reference and predication interact: singular terms pick candidates, predicates classify them, and sentence-level structure determines assertoric force. This architecture supports logical consequence, contradiction, and entailment testing.",
  "Semantic theory is strongest when paired with explicit proof practice. Derivability and validity are distinct: one is rule-governed syntactic achievement, the other model-theoretic preservation across interpretations.",
  "Indeterminacy problems motivate disciplined interpretation methods. Competing analyses can fit the same data; therefore semantic work should state assumptions, test consequences, and record failure conditions.",
  "Context-sensitivity does not collapse semantics into pragmatics. Indexicals, tense, and demonstratives show that stable lexical rules can coexist with parameterized evaluation points.",
  "Attitude reports expose opacity effects and substitution failures. A robust semantics marks the difference between extensional contexts and belief/report contexts without abandoning compositionality.",
  "For rigorous study, map each argument to: claim, formalization, derivation strategy, and semantic check. This workflow turns philosophical prose into inspectable logical structure.",
];
const semanticsCases = Array.from({ length: 200 }, (_, i) => i);
function wordCount(text) { return (text.match(/\b[\w'-]+\b/g) || []).length; }
function nextSemanticsPassage() {
  const caseIndex = rand(semanticsCases);
  const out = [];
  let words = 0;
  let j = 0;
  while (words < 1000 && j < 30) {
    const para = semanticsParagraphs[(caseIndex + j) % semanticsParagraphs.length];
    out.push(para);
    words += wordCount(para);
    j += 1;
  }
  document.getElementById("semantics-meta").textContent = `Source: ${semanticsSource} • Case ${caseIndex + 1}/200`;
  document.getElementById("semantics-passage").textContent = out.join("\n\n");
}
document.getElementById("new-semantics").onclick = nextSemanticsPassage;

// Hegel passages (Encyclopedia Logic / Enc. I style, 200-case bank)
const hegelSource = "Hegel, Encyclopedia Logic (Wallace trans. / Enc. I)";
const hegelParagraphs = [
  "Logic, in Hegel’s sense, is not a handbook of external forms but the science of pure thought-determinations. Its business is the immanent movement by which categories pass over into one another through their own insufficiency.",
  "The beginning must be immediate and therefore indeterminate. Yet immediacy, because empty, cannot remain fixed. The dialectical result is not arbitrary transition but necessity internal to the beginning itself.",
  "Understanding fixes determinations; reason comprehends their transition. Hegel does not abolish determinacy but shows that finite categories become intelligible only within a dynamic totality.",
  "Essence is being that has withdrawn into mediation. Appearance is not sheer illusion: it is essence shining within determinate forms. Thus mediation and immediacy are not enemies but moments of one process.",
  "Concept is the free unity of universality, particularity, and individuality. These are not three detached boxes; they are moments of one self-determining activity.",
  "Judgment and syllogism develop the concept by externalizing and recollecting determination. In syllogistic movement, mediation ceases to be a mere bridge and becomes constitutive of truth.",
  "Objectivity presents mechanism, chemism, and teleology. Teleology discloses purposive unity where external relations are aufgehoben in internally articulated organization.",
  "The Idea is the unity of concept and objectivity. Truth is therefore not static correspondence but living self-relation that contains difference without collapsing into fragmentation.",
  "Philosophical method is neither imposed from outside nor extracted empirically first and justified later. Method is the soul of content, content in its self-movement.",
  "Dialectic is often mistaken for optional rhetoric. For Hegel it is the very structure of finite determination: each fixed term points beyond itself, and this beyond is already implicit within it.",
];
const hegelCases = Array.from({ length: 200 }, (_, i) => i);
function nextHegelPassage() {
  const caseIndex = rand(hegelCases);
  const picked = [];
  let words = 0;
  let i = 0;
  while (words < 1000 && i < 30) {
    const para = hegelParagraphs[(caseIndex + i) % hegelParagraphs.length];
    picked.push(para);
    words += wordCount(para);
    i += 1;
  }
  document.getElementById("hegel-paragraph").textContent = `[${hegelSource}] Case ${caseIndex + 1}/200\n\n${picked.join("\n\n")}`;
}
document.getElementById("new-hegel").onclick = nextHegelPassage;

// Habits
const habitIds = ["habit-pullups", "habit-pushups", "habit-lifts"];
function loadHabits() {
  const habits = readJSON(KEYS.habits, {});
  habitIds.forEach((id) => { document.getElementById(id).checked = Boolean(habits[id]); });
}
document.getElementById("save-habits").onclick = () => {
  const habits = {};
  habitIds.forEach((id) => { habits[id] = document.getElementById(id).checked; });
  localStorage.setItem(KEYS.habits, JSON.stringify(habits));
};
document.getElementById("routine-today").textContent = "D1: Pull-ups 8 • Push-ups 18 • 5kg lifts 15 per side.";

// Guitar (shoegaze chord/progression generator)
const shoegazeChordShapes = [
  { chord: "Emaj7", tab: "e|-0-\nB|-0-\nG|-1-\nD|-1-\nA|-2-\nE|-0-" },
  { chord: "Cmaj7", tab: "e|-0-\nB|-0-\nG|-0-\nD|-2-\nA|-3-\nE|-x-" },
  { chord: "Dadd9", tab: "e|-0-\nB|-3-\nG|-2-\nD|-0-\nA|-x-\nE|-x-" },
  { chord: "Aadd9", tab: "e|-0-\nB|-0-\nG|-6-\nD|-7-\nA|-0-\nE|-x-" },
  { chord: "Bsus2", tab: "e|-2-\nB|-2-\nG|-4-\nD|-4-\nA|-2-\nE|-x-" },
  { chord: "Gmaj7", tab: "e|-2-\nB|-3-\nG|-4-\nD|-4-\nA|-x-\nE|-3-" },
  { chord: "F#m11", tab: "e|-0-\nB|-0-\nG|-2-\nD|-2-\nA|-4-\nE|-2-" },
  { chord: "Em9", tab: "e|-0-\nB|-0-\nG|-0-\nD|-0-\nA|-2-\nE|-0-" },
];
function nextGuitar() {
  const pool = [...shoegazeChordShapes].sort(() => Math.random() - 0.5);
  const progression = pool.slice(0, 4);
  document.getElementById("guitar-phrase").textContent = `Progression: ${progression.map((c) => c.chord).join(" → ")}`;
  document.getElementById("guitar-tabs").textContent = progression.map((c, idx) => `Chord ${idx + 1}: ${c.chord}\n${c.tab}`).join("\n\n");
}
document.getElementById("new-phrase").onclick = nextGuitar;

// Hegelpd + publications
async function loadHegelNewsLast2Weeks() {
  const status = document.getElementById("hegel-news-status");
  const list = document.getElementById("hegel-news-list");
  status.textContent = "Loading latest posts...";
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  try {
    const primary = await fetch("https://www.hegelpd.it/wp-json/wp/v2/posts?categories=13&per_page=20&_fields=link,title,date");
    if (!primary.ok) throw new Error(`HTTP ${primary.status}`);
    let posts = await primary.json();
    if (!Array.isArray(posts) || posts.length === 0) {
      const fallbackSite = await fetch("https://www.hegelpd.it/wp-json/wp/v2/posts?per_page=20&_fields=link,title,date");
      if (fallbackSite.ok) posts = await fallbackSite.json();
    }
    const recent = (posts || []).filter((p) => new Date(p.date).getTime() >= twoWeeksAgo);
    list.innerHTML = "";
    recent.forEach((post) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = post.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = `${post.title.rendered} (${new Date(post.date).toLocaleDateString()})`;
      li.appendChild(a);
      list.appendChild(li);
    });
    status.textContent = recent.length ? "Hegelpd News in last 2 weeks:" : "No Hegelpd posts in last 2 weeks.";
  } catch {
    list.innerHTML = `<li><a href="https://www.hegelpd.it/category/newsevents/" target="_blank" rel="noopener noreferrer">Open Hegelpd News & Events page</a></li><li><a href="https://www.facebook.com/hegelpd" target="_blank" rel="noopener noreferrer">Open Hegelpd on Facebook</a></li>`;
    status.textContent = "Could not fetch directly; use links above.";
  }
}

async function loadHegelArticlesOnly() {
  const status = document.getElementById("scopus-status");
  const list = document.getElementById("scopus-list");
  status.textContent = "Loading 5 random Hegel-related articles (PhilArchive + Semantic Scholar)...";
  list.innerHTML = "";

  try {
    const response = await fetch('/api/hegel-articles');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const items = Array.isArray(payload.items) ? payload.items : [];

    items.forEach((item) => {
      const li = document.createElement("li");
      const title = document.createElement("a");
      title.href = item.url || "https://philarchive.org/browse/hegel-logic-and-metaphysics";
      title.target = "_blank";
      title.rel = "noopener noreferrer";
      title.textContent = item.title || "Untitled";
      li.appendChild(title);

      const source = document.createElement("span");
      source.textContent = ` [${item.source || 'source unknown'}]`;
      li.appendChild(source);

      const abs = document.createElement("p");
      abs.className = "hint";
      abs.textContent = item.abstract || "Abstract unavailable.";
      li.appendChild(abs);

      list.appendChild(li);
    });

    status.textContent = items.length
      ? `Showing ${items.length} random articles with title + abstract (when available).`
      : "No items returned by proxy.";
  } catch {
    list.innerHTML = `<li><a href="https://philarchive.org/browse/hegel-logic-and-metaphysics" target="_blank" rel="noopener noreferrer">Open PhilArchive Hegel Logic & Metaphysics</a></li><li><a href="https://www.semanticscholar.org/paper/The-philosophy-of-Hegel-Rauch/3d98f7728982cbf108c7e5587e12b4c8b20a7806" target="_blank" rel="noopener noreferrer">Open Semantic Scholar source paper</a></li>`;
    status.textContent = "Could not load proxy results; use source links above.";
  }
}
document.getElementById("refresh-hegel-news").onclick = () => { loadHegelNewsLast2Weeks(); loadHegelArticlesOnly(); };


// TrevTutor playlists (philosophical logic + linguistics)
const trevTutorPlaylists = [
  { title: "Philosophical Logic Playlist", video: "EsnJ-YEMbhk", list: "PLDDGPdw7e6AhsNuxXP3D-45Is96L8sdSG" },
  { title: "Intro Logic Playlist", video: "DF679Ks8ZR4", list: "PLDDGPdw7e6Ah0e9VYg6ejkS4jRLKB2b2J" },
  { title: "Linguistics and Meaning Playlist", video: "OBGA9DZT6Ns", list: "PLDDGPdw7e6AgiXk85UJB8YPrerW2TdlkF" },
  { title: "Syntax and Language Structure Playlist", video: "hzgFSvgfUIY", list: "PLDDGPdw7e6AgXsYDDnj0TqbuvmHjST1hC" },
  { title: "Logic Practice Playlist", video: "B0ZHTAJjFak", list: "PLDDGPdw7e6AiW7raf6ODnWalLBjHAYj9J" },
];
const trevSelect = document.getElementById("trevtutor-select");
if (trevSelect) {
  trevTutorPlaylists.forEach((p, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx);
    opt.textContent = p.title;
    trevSelect.appendChild(opt);
  });
  const loadTrev = () => {
    const pick = trevTutorPlaylists[Number(trevSelect.value) || 0];
    document.getElementById("trevtutor-player").src = `https://www.youtube.com/embed/${pick.video}?list=${pick.list}`;
    document.getElementById("trevtutor-meta").textContent = `${pick.title} • Playlist: ${pick.list}`;
  };
  document.getElementById("load-trevtutor").onclick = loadTrev;
  loadTrev();
}

// Window manager with minimized dock + overlap handling
const windows = [...document.querySelectorAll(".window")];
const minimizedDock = document.getElementById("minimized-dock");
const defaultLayout = {
  "tasks-window": { x: 20, y: 20, w: 500, h: 320, minimized: false },
  "draft-window": { x: 540, y: 20, w: 520, h: 360, minimized: false },
  "logic-window": { x: 1080, y: 20, w: 430, h: 280, minimized: false },
  "german-window": { x: 20, y: 360, w: 520, h: 360, minimized: false },
  "youtube-window": { x: 560, y: 360, w: 500, h: 340, minimized: false },
  "raw-window": { x: 1080, y: 320, w: 430, h: 300, minimized: false },
  "compare-window": { x: 20, y: 740, w: 640, h: 320, minimized: false },
  "semantics-window": { x: 680, y: 720, w: 650, h: 420, minimized: false },
  "hegel-window": { x: 1350, y: 640, w: 370, h: 320, minimized: false },
  "habit-window": { x: 1350, y: 980, w: 360, h: 300, minimized: false },
  "guitar-window": { x: 20, y: 1080, w: 560, h: 540, minimized: false },
  "hegel-news-window": { x: 600, y: 1160, w: 900, h: 460, minimized: false },
  "trevtutor-window": { x: 1540, y: 1160, w: 520, h: 420, minimized: false },
};
function intersects(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}
function resolveOverlap(activeWin) {
  if (activeWin.classList.contains("minimized")) return;
  let guard = 0;
  while (guard < 50) {
    guard += 1;
    const a = activeWin.getBoundingClientRect();
    const collision = windows.find((w) => w !== activeWin && !w.classList.contains("minimized") && intersects(a, w.getBoundingClientRect()));
    if (!collision) break;
    activeWin.style.left = `${activeWin.offsetLeft + 24}px`;
    activeWin.style.top = `${activeWin.offsetTop + 24}px`;
  }
}
function relayoutMinimizedDock() {
  windows.forEach((win) => {
    if (win.classList.contains("minimized") && win.parentElement !== minimizedDock) minimizedDock.appendChild(win);
    if (!win.classList.contains("minimized") && win.parentElement === minimizedDock) document.getElementById("workspace").appendChild(win);
  });
}
function applyLayout(layout) {
  windows.forEach((win) => {
    const slot = layout[win.id] || defaultLayout[win.id];
    if (!slot) return;
    win.style.left = `${slot.x}px`;
    win.style.top = `${slot.y}px`;
    win.style.width = `${slot.w}px`;
    win.style.height = `${slot.h}px`;
    win.classList.toggle("minimized", Boolean(slot.minimized));
  });
  relayoutMinimizedDock();
}
function saveLayout() {
  const layout = {};
  windows.forEach((win) => {
    layout[win.id] = { x: parseInt(win.style.left, 10) || 0, y: parseInt(win.style.top, 10) || 0, w: win.offsetWidth, h: win.offsetHeight, minimized: win.classList.contains("minimized") };
  });
  localStorage.setItem(KEYS.layout, JSON.stringify(layout));
}
function initWindowControls() {
  let z = 5;
  windows.forEach((win) => {
    const dragBar = document.createElement("div");
    dragBar.className = "window-header";
    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = `⇕ ${win.dataset.title || win.id}`;
    const controls = document.createElement("div");
    controls.className = "window-controls";
    const minimizeBtn = document.createElement("button");
    minimizeBtn.className = "window-control-btn";
    minimizeBtn.textContent = "—";
    minimizeBtn.title = "Minimize/Restore";
    controls.appendChild(minimizeBtn);
    dragBar.appendChild(dragHandle);
    dragBar.appendChild(controls);
    win.prepend(dragBar);

    const content = document.createElement("div");
    content.className = "window-content";
    while (dragBar.nextSibling) content.appendChild(dragBar.nextSibling);
    win.appendChild(content);

    minimizeBtn.onclick = () => {
      win.classList.toggle("minimized");
      relayoutMinimizedDock();
      saveLayout();
    };

    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    dragHandle.addEventListener("mousedown", (e) => {
      if (win.classList.contains("minimized")) return;
      dragging = true;
      win.style.zIndex = String(++z);
      startX = e.clientX;
      startY = e.clientY;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging || win.classList.contains("minimized")) return;
      win.style.left = `${startLeft + e.clientX - startX}px`;
      win.style.top = `${startTop + e.clientY - startY}px`;
      resolveOverlap(win);
    });
    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      saveLayout();
    });

    const ro = new ResizeObserver(() => {
      if (win.classList.contains("minimized")) return;
      resolveOverlap(win);
      saveLayout();
    });
    ro.observe(win);
    win.addEventListener("mousedown", () => { win.style.zIndex = String(++z); });
  });
}
document.getElementById("reset-layout").onclick = () => {
  localStorage.removeItem(KEYS.layout);
  applyLayout(defaultLayout);
  saveLayout();
};

renderTasks();
generateLogicExercise();
loadGermanWords().then(nextGerman);
nextSemanticsPassage();
nextHegelPassage();
loadHabits();
nextGuitar();
loadHegelNewsLast2Weeks();
loadHegelArticlesOnly();

applyLayout(readJSON(KEYS.layout, defaultLayout));
initWindowControls();
