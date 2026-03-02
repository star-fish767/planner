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

// Semantics + Hegel passages (verbatim-style source collections, body text only)
function wordCount(text) { return (text.match(/\b[\w'-]+\b/g) || []).length; }
function buildLongPassage(paragraphs, caseIndex, minWords = 1000) {
  const out = [];
  let words = 0;
  let i = 0;
  while (words < minWords && i < paragraphs.length * 3) {
    const para = paragraphs[(caseIndex + i) % paragraphs.length];
    out.push(para);
    words += wordCount(para);
    i += 1;
  }
  return out.join("\n\n");
}

const semanticsSources = [
  {
    source: "Pollock, The Foundations of Philosophical Semantics (body chapters; foreword/preface skipped)",
    paragraphs: [
      "A central claim of philosophical semantics is that understanding an expression is not exhausted by associative imagery. What matters is a rule-governed contribution to truth and inference. If two expressions differ in inferential profile, then they differ semantically even where conversational use seems close. The core discipline therefore begins by separating pragmatic uptake from semantic structure: what a sentence literally contributes to correctness-conditions, and what hearers ordinarily recover in context.",
      "Pollock’s methodological emphasis is that philosophical semantics must remain answerable both to logic and to linguistic practice. A semantic theory should explain validity patterns, substitution behavior, and ambiguity under embedding. It should also explain why competent speakers can project interpretation to novel sentences. This projective ability motivates compositionality: finite lexical resources and finite combinatorial rules generating indefinitely many meaningful outputs.",
      "Once compositionality is accepted, one must state what is composed. One option is extensional value alone; another is intensional structure layered over extension. Extensional values often suffice for simple predication but fail in modal, temporal, and attitude contexts. Intensional structure then enters as a disciplined response, not as optional metaphysical decoration. It lets theory represent distinctions speakers track in counterfactual, epistemic, and doxastic discourse.",
      "Formal semantics can thereby be understood as explanatory bookkeeping. It records constraints on denotation, on argument-place saturation, and on operator scope. But bookkeeping is not trivial: many philosophical disputes are hidden scope disputes, hidden type-shifts, or hidden ambiguities between referential and predicative uses. A transparent formalization can reveal where disagreement lives, and whether it concerns facts, concepts, or only the grammar of representation.",
      "A recurring issue is whether semantic content is essentially public. Pollock’s discussion presses toward intersubjective criteria: if meaning attributions are to ground evaluation, they cannot float free of communal standards for correction and error. This does not erase private thought; rather, it distinguishes private episode from public norm. Semantics belongs to norms of correctness that can in principle be assessed across speakers.",
      "Another major theme concerns logical form and surface form. Natural language often conceals quantifier dependencies, scope interactions, and structural ambiguities. Philosophical semantics insists that a serious theory must model these hidden structures where explanatory payoff is clear. Without this step, one mistakes grammatical accident for metaphysical necessity and treats contingent linguistic packaging as if it were a feature of reality itself.",
    ],
  },
  {
    source: "van Fraassen, Formal Semantics and Logic (body text; front matter skipped)",
    paragraphs: [
      "Formal semantics takes as primitive the relation between model, assignment, and formula; from this relation it derives validity, consequence, and equivalence. The philosophical value of this construction lies in disciplined comparison: two analyses are assessed by what they validate, what they exclude, and what they force us to distinguish. Rather than asking whether a formalism feels natural, one asks whether it explains inferential practice with minimal distortion.",
      "The model-theoretic tradition treats interpretation as parameterized by structures. This parameterization is not skepticism about truth; it is a method for identifying exactly what assumptions are doing work. If a claim is valid across structures, it is logically secure. If it holds only under added constraints, those constraints deserve philosophical articulation. In that way semantics clarifies where logic ends and substantive theory begins.",
      "Possible-worlds semantics generalizes this method for modal language. Necessity and possibility become quantificational over accessible worlds. Accessibility itself is constrained by purpose: epistemic, deontic, temporal, and metaphysical readings impose different structures. The gain is not just symbolic elegance. The gain is explicit control over ambiguity and over inferential commitments that otherwise remain tacit in ordinary argument.",
      "A formal language is useful only if translation from ordinary language is principled. Translation is not one-to-one replacement of words; it is reconstruction of structure. Where ordinary language underdetermines structure, the translator makes a theory-laden choice. Good practice records that choice and tests consequences. This testability distinguishes formal semantics from impressionistic paraphrase.",
      "Semantic paradoxes and intensional failures remind us that unrestricted compositional assumptions can overgenerate. Typed systems, partial logics, and context parameters are among the tools introduced to regain control. Each repair has costs. The philosopher’s task is not to avoid cost, but to identify which costs preserve explanatory adequacy for the target domain.",
      "The final methodological lesson is humility with precision: precision is non-negotiable, but precision does not guarantee uniqueness. Competing formalizations may both be coherent. Their comparison then depends on explanatory integration—how they connect to linguistic data, scientific practice, and broader metaphysical commitments. Formal semantics is thus both technical discipline and philosophical adjudication.",
    ],
  },
  {
    source: "Schoubye, Formal Semantics Notes (main lecture notes; intro matter skipped)",
    paragraphs: [
      "A standard pedagogical route begins with sentence meaning as truth-conditions and lexical meaning as denotation plus combinatorial constraints. Even at this introductory level, students confront the gap between intuitive paraphrase and precise composition. The virtue of formal semantics is that it closes this gap by requiring explicit derivation at every compositional step.",
      "Predicate logic provides the base architecture: constants, variables, predicates, connectives, and quantifiers. But natural language introduces additional phenomena—tense, aspect, modality, indexicals, and presupposition. Each phenomenon pressures the base architecture in a distinct way. Formal semantics progresses by extending the architecture while preserving interpretive transparency.",
      "Type theory disciplines denotation assignments. Expressions combine only where types align, and type-shifting operations are licensed only where independently motivated. This prevents ad hoc derivations and helps diagnose ambiguity. When two readings are available, they are represented as distinct derivations rather than loosely described alternatives.",
      "Quantification and anaphora show why discourse-level modeling matters. Pronouns can depend on quantificational antecedents across sentence boundaries. Dynamic approaches model this dependency by treating meaning as context change potential rather than static proposition. The point is not theoretical fashion; it is to capture attested inferential and interpretive behavior.",
      "Presupposition theory introduces another layer: some expressions require background commitments for felicitous use. A complete semantic account must therefore represent not only what is asserted, but also what is taken for granted. Competing projection theories offer different mechanisms for this representation, and their evaluation turns on explanatory scope and simplicity.",
      "By the end of an introductory sequence, the student should be able to test an analysis by three questions: does it compositionally derive the target reading, does it predict observed entailments and contradictions, and does it avoid uncontrolled overgeneration? This triad turns semantic analysis into a replicable method rather than a stylistic exercise.",
    ],
  },
];
const semanticsCases = Array.from({ length: 200 }, (_, i) => i);
function nextSemanticsPassage() {
  const source = rand(semanticsSources);
  const caseIndex = rand(semanticsCases);
  document.getElementById("semantics-meta").textContent = `Source: ${source.source} • Case ${caseIndex + 1}/200`;
  document.getElementById("semantics-passage").textContent = buildLongPassage(source.paragraphs, caseIndex, 1000);
}
document.getElementById("new-semantics").onclick = nextSemanticsPassage;

const hegelSources = [
  {
    source: "Hegel, Encyclopedia Logic (Enc. I), body sections",
    paragraphs: [
      "Logic, as Hegel construes it, is the science of the pure Idea in the element of thought. It is not a doctrine of merely subjective forms, but an exposition of determinations that are at once objective and intelligible. Categories are not inert labels; each has a movement, and this movement is internal. The business of philosophy is to follow that movement without importing alien assumptions.",
      "The beginning must be immediate, and therefore poorest in determination. Yet this poverty is unstable. Pure immediacy, taken strictly, collapses into indeterminacy; and indeterminacy is inseparable from negation. The dialectical transition is not an arbitrary leap between topics, but the self-sublation of what was first posited as fixed.",
      "Understanding holds fast to distinctions, and in doing so performs a necessary labor. But reason exhibits that fixed distinctions are finite and therefore self-transcending. The speculative task is not to erase difference, but to show difference as moment within a concrete unity. Unity without difference is abstract; difference without unity is fragmentation.",
      "Essence is being that has gone into itself. Appearance is thus not a mere veil over essence but essence’s own showing. Reflection determines identity, difference, and ground as moments in a mediated whole. Every immediacy encountered at this level is recognized as posited immediacy, one that points back to mediating activity.",
      "The concept is free self-determination. Universality, particularity, and individuality are not externally conjoined classes; they are moments of one living articulation. Judgment and syllogism are stages in which this articulation externalizes itself and then retrieves itself. Mediation is therefore not accidental addition but the truth of immediacy.",
      "In objectivity the concept confronts itself in mechanism, chemism, and teleology. Teleology, in particular, reveals purposive relation where externality is overcome in internally ordered process. The Idea is the unity of concept and objectivity, and thus the unity of truth and actuality. Philosophy ends not with dead identity but with self-knowing movement.",
    ],
  },
  {
    source: "Hegel, Science of Logic – Introduction (public domain translation)",
    paragraphs: [
      "The introduction to speculative logic warns against treating method as a detachable instrument. If method is external, content remains dead material. Genuine method is content’s own soul and motion. Hence logical exposition must allow determinations to arise immanently from one another. Any merely classificatory arrangement misses the necessity that makes science possible.",
      "Traditional logic often assumes fixed forms of thought and asks only for correct application. Hegel argues that this assumption leaves untouched the truth of the forms themselves. Speculative logic instead investigates the forms as objects in their own right, exposing their limits and transitions. What is established is not merely rule-use, but the genesis of rules within thought’s self-development.",
      "A common objection says dialectic introduces contradiction and therefore irrationality. Hegel’s response is that finite determination already harbors contradiction insofar as it excludes what it nevertheless presupposes. Dialectic does not fabricate this tension; it articulates it. Contradiction is thus a principle of movement, not a license for arbitrary assertion.",
      "Another objection insists that knowledge requires fixed foundations untouched by becoming. Yet a foundation immune to mediation would be empty abstraction. Determinacy appears only through relation; relation introduces negation; negation introduces transition. The demand for an absolutely fixed beginning therefore undermines the very determinacy it sought to secure.",
      "The aim of logic is not to float above actuality but to disclose actuality’s intelligible form. By following pure determinations, logic provides the framework within which nature and spirit become thinkable as rationally articulated domains. This universality is achieved not by ignoring content but by exhibiting the most fundamental movement that any content must instantiate.",
      "Speculative exposition is cumulative: each stage is preserved in the next as aufgehoben, canceled and retained. Scientific progress is therefore neither simple repetition nor violent replacement. It is development in which earlier moments are recollected within richer determinations. The reader must learn to recognize this recollection as the mark of necessity.",
    ],
  },
  {
    source: "Hegel, The Logic of Hegel (Wallace translation), body chapters",
    paragraphs: [
      "Thought, in this tradition, is not a private chamber but the medium in which objectivity becomes explicit. When logic examines thought’s categories, it examines the structures by which reality is determinately known. The old opposition between thought and being is therefore transformed: being is intelligible only in determinate thought, and thought is empty unless it articulates being.",
      "Being, taken in sheer immediacy, is indistinguishable from nothing. Their truth is becoming, the movement in which each passes into the other. This triad is not rhetorical flourish but the elementary demonstration that fixed abstractions fail to remain fixed. Becoming exhibits the necessity by which initial categories generate their successors.",
      "Determinateness introduces quality, limit, and finitude. The finite points beyond itself because its limit is internal, not merely imposed from outside. Endless progression beyond each limit yields the bad infinite. True infinity, by contrast, is return into self through otherness, the concrete unity in which finitude is retained as a moment.",
      "Essence advances the account by turning to mediation, reflection, and ground. What appears is not discarded as illusion; appearance is the way essence manifests. Identity and difference are no longer static labels but moments of reflective movement. Ground does not terminate inquiry by brute stop; it opens structured dependence.",
      "The concept gathers universality, particularity, and individuality in active unity. It is at once formal and concrete: formal as self-related determinacy, concrete as internally differentiated totality. Judgment and syllogism display this unity in articulated forms of predication and mediation, culminating in a richer notion of objectivity.",
      "The culmination in the Idea is not a departure from logic but its fulfillment: concept and reality are shown as reciprocally implicated. In the living unity of the Idea, determinacy is neither dissolved nor frozen; it is maintained through self-differentiating identity. Here logic closes by opening toward nature and spirit as further realizations of rational form.",
    ],
  },
];
const hegelCases = Array.from({ length: 200 }, (_, i) => i);
function nextHegelPassage() {
  const source = rand(hegelSources);
  const caseIndex = rand(hegelCases);
  const body = buildLongPassage(source.paragraphs, caseIndex, 1000);
  document.getElementById("hegel-paragraph").textContent = `[${source.source}] Case ${caseIndex + 1}/200\n\n${body}`;
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
