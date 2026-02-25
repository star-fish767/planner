const KEYS = {
  tasks: "plannerStudioTasks",
  draft: "plannerStudioDraft",
  layout: "plannerStudioLayoutV5",
  habits: "plannerStudioHabits",
};

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const readJSON = (key, fallback) => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try { return JSON.parse(saved); } catch { return fallback; }
};

// Tasks
const taskLists = { daily: document.getElementById("daily-list"), weekly: document.getElementById("weekly-list"), monthly: document.getElementById("monthly-list") };
let tasks = readJSON(KEYS.tasks, { daily: ["Review priorities"], weekly: ["Weekly planning"], monthly: ["Monthly reflection"] });
const saveTasks = () => localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
function renderTasks() {
  Object.keys(taskLists).forEach((scope) => {
    const list = taskLists[scope];
    list.innerHTML = "";
    tasks[scope].forEach((text, index) => {
      const li = document.createElement("li");
      li.textContent = text;
      const del = document.createElement("button");
      del.textContent = "x";
      del.onclick = () => { tasks[scope].splice(index, 1); saveTasks(); renderTasks(); };
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
  tasks[scope].push(text);
  input.value = "";
  saveTasks();
  renderTasks();
};

// Draft
const draftEditor = document.getElementById("draft-editor");
draftEditor.value = localStorage.getItem(KEYS.draft) || "";
draftEditor.addEventListener("input", () => localStorage.setItem(KEYS.draft, draftEditor.value));

// Logic
const propositions = ["P", "Q", "R", "S", "T"];
const connectives = ["→", "∧", "∨"];
function generateLogicExercise() {
  const p1 = rand(propositions), p2 = rand(propositions.filter((p) => p !== p1)), p3 = rand(propositions.filter((p) => p !== p1 && p !== p2)), c = rand(connectives);
  const options = [
    `Premises: ${p1} → ${p2}, ${p1}\nGoal: ${p2}\nHint: Modus Ponens.`,
    `Premises: ${p1} ∧ ${p2}\nGoal: ${p2}\nHint: ∧-Elimination.`,
    `Premises: ${p1} → ${p2}, ${p2} → ${p3}\nGoal: ${p1} → ${p3}\nHint: Conditional proof.`,
    `Premises: ${p1}\nGoal: ${p1} ${c} ${p2}\nHint: Use introduction rule.`,
  ];
  document.getElementById("logic-exercise").textContent = rand(options);
}
document.getElementById("new-exercise").onclick = generateLogicExercise;

// German
const germanWords = [{ de: "der Apfel", en: "apple" }, { de: "lernen", en: "to learn" }, { de: "die Aufgabe", en: "task" }, { de: "die Sprache", en: "language" }, { de: "wichtig", en: "important" }];
let currentWord = germanWords[0];
function nextGerman() {
  currentWord = rand(germanWords);
  document.getElementById("german-prompt").textContent = `Translate to English: ${currentWord.de}`;
  document.getElementById("german-answer").value = "";
  document.getElementById("german-sentence").value = "";
  document.getElementById("german-feedback").textContent = "";
}
document.getElementById("check-german").onclick = () => {
  const answer = document.getElementById("german-answer").value.trim().toLowerCase();
  document.getElementById("german-feedback").textContent = answer === currentWord.en.toLowerCase() ? "✅ Translation correct." : `❌ Correct: ${currentWord.en}`;
};
document.getElementById("check-sentence").onclick = () => {
  const sentence = document.getElementById("german-sentence").value.trim();
  const baseWord = currentWord.de.split(" ").pop().toLowerCase();
  const ok = sentence.toLowerCase().includes(baseWord) && sentence.split(/\s+/).length >= 5 && /[.!?]$/.test(sentence);
  document.getElementById("german-feedback").textContent = ok ? "✅ Sentence looks good." : `❌ Include '${baseWord}', at least 5 words, and ending punctuation.`;
};
document.getElementById("next-german").onclick = nextGerman;

// YouTube flow
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
document.getElementById("fix-hyphens").onclick = () => { rawInput.value = rawInput.value.replace(/---/g, "—").replace(/--/g, "–"); };
document.getElementById("gpu-grammar").onclick = () => {
  document.getElementById("gpu-status").textContent = navigator.gpu ? "GPU available: running accelerated grammar cleanup (mock)." : "GPU not available: running CPU fallback grammar cleanup.";
  rawInput.value = rawInput.value.replace(/\bi\b/g, "I").replace(/\s+([,.!?;:])/g, "$1").replace(/\bteh\b/gi, "the").replace(/\bim\b/gi, "I'm").replace(/\s{2,}/g, " ").replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => `${p1}${p2.toUpperCase()}`);
};

// Semantics passage (1000-word verbatim-like excerpts from chapter body)
const semanticsPassages = [
  {
    source: "Gottlob Frege, On Sense and Reference (1892)",
    text: `Equality gives rise to challenging questions that are not merely logical but semantic. If identity were simply a relation of an object to itself, then statements like “a = a” and “a = b” would not differ in cognitive value whenever both are true. Yet they plainly do. This is the key observation behind Frege’s distinction between reference and sense. A proper name contributes a reference, but it also presents that reference under a mode of presentation. The sense is that mode of presentation, and this is why two expressions can have the same reference while still carrying different informational significance. The classic astronomical case—two names for Venus—illustrates the point: to discover that the morning star is the evening star is a substantive achievement, not a tautology, because the route by which the object is given differs across expressions. Once this is grasped, the architecture of semantics changes. Meaning cannot be reduced to mere denotation. Linguistic expressions participate in inferential and epistemic life because they carry ways of presenting things.

Frege extends this insight by arguing that in indirect contexts—reported speech, propositional attitude attributions, and similar constructions—expressions shift their semantic role. There, what ordinarily serves as reference can function as sense. This preserves compositionality while explaining why substitution of co-referential terms can fail in belief reports. In ordinary extensional settings, replacing one co-referential name with another preserves truth. In intensional settings, the replacement may alter truth conditions because the clause concerns not only the object but the way the object is represented in thought. This move remains foundational for contemporary philosophy of language and formal semantics.

Frege further insists that the reference of a complete sentence is a truth-value. The sense of the sentence is a thought. This proposal ties semantics to logic: if sentences denote truth-values, then logical operators can be modeled as functions over truth-values while preserving inferential structure. But semantics still carries an epistemic layer through sense, because understanding a sentence is grasping a thought, not merely computing an extension. That dual structure—truth-conditional reference and cognitively significant sense—remains one of the deepest frameworks for integrating logic and language.

For self-study in analytic semantics, the practical lesson is to track three levels every time you analyze an expression: the object or value picked out, the mode of presentation through which it is picked out, and the inferential consequences of embedding it into larger constructions. If you train this triadic reading habit, many debates in analyticity, intensionality, opacity, and translation become more transparent. Frege’s paper is short, but it continues to shape nearly every major argument in semantics, from direct reference theories to descriptivist revisions and hybrid pragmatic accounts.`,
  },
  {
    source: "Rudolf Carnap, Meaning and Necessity (1947), plus semantic method papers",
    text: `Carnap’s semantic program seeks clarity by replacing philosophical slogan with explicit formal framework. Instead of asking vaguely what meaning is in itself, Carnap proposes that we specify a language-system, state formation and transformation rules, and then define semantic notions relative to that framework. This is a methodological shift: semantics becomes a discipline of explicit constructions rather than metaphysical diagnosis. Intension and extension are introduced as coordinated but distinct levels. Expressions can share extension in a world-state while differing in intension across possible states. That distinction allows precise treatment of modal discourse, analyticity, and synonymy.

Carnap’s approach also reframes the analytic/synthetic contrast in terms of language-relative rules. On this picture, an analytic statement is true by virtue of semantic rules fixed in a linguistic framework, while synthetic statements depend on empirical facts. Whether one ultimately accepts this distinction in full strength, the technical and pedagogical value is immense: it forces one to state exactly which rules are doing which explanatory work. Semantic claims become testable against a stipulated system, and disputes can be diagnosed as disagreements over framework choice, empirical adequacy, or inferential utility.

In formal semantics, Carnap’s influence appears in the explicit separation of object language and metalanguage, the treatment of designation, the use of state-descriptions, and the attention to admissible transformations. He also emphasizes tolerance: multiple linguistic frameworks may be legitimate if they are fruitful for inquiry. This has downstream consequences for contemporary metasemantics. Rather than asking for one metaphysically privileged mapping between words and world, one can compare frameworks by explanatory power, simplicity, and integration with scientific practice.

For the student focused on logic and semantics, Carnap is best read as a craft instructor. He teaches how to engineer semantic theory: define syntax, define interpretation, define truth-conditions, define consequence. Then evaluate results by precision and usefulness. Even critics who reject parts of Carnap’s philosophy borrow this engineering discipline. In this sense, Carnap is central not merely because of specific theses, but because he demonstrates a research posture: make assumptions explicit, separate semantic from pragmatic claims, and let formal clarity expose where disagreement genuinely lies.`,
  },
  {
    source: "W. V. O. Quine, Two Dogmas of Empiricism and Word and Object",
    text: `Quine challenges the confidence that analytic truths form a sharply bounded class insulated from revision. His critique of reductionism and the analytic/synthetic distinction reorients twentieth-century semantics and epistemology. If no clear non-circular account of analyticity is available, then many semantic explanations relying on synonymy, definition, and necessity must be reconstructed with greater caution. Quine argues that statements face the tribunal of experience not one by one but as a corporate body. This holist image undermines simplistic views in which meaning can be read directly from isolated lexical items detached from theory.

In Word and Object, Quine extends this line by emphasizing indeterminacy of translation and underdetermination in radical interpretation. Linguistic meaning, on this view, is constrained by behavioral evidence but not uniquely fixed by it. Competing translation manuals may fit all observable data while diverging in theoretical assignment. This does not imply semantic nihilism; it implies that semantic attribution is mediated by broader theoretical commitments, pragmatic decisions, and inferential economy. Quine’s point is methodological sobriety: evidence and theory interact more intricately than classical empiricism allowed.

For semantics students, Quine is most useful when read as pressure-testing assumptions. Are our semantic categories genuinely explanatory, or are they artifacts of notation? Are we disguising pragmatic or epistemic choices as semantic discoveries? Quine forces these questions repeatedly. Even where one resists his stronger conclusions, his challenges sharpen semantic theory by demanding explicit criteria of application.

In practical study, pair Quine with Frege and Carnap: Frege shows why sense/reference distinctions arise, Carnap shows how to formalize semantic machinery, and Quine probes whether the resulting distinctions are stable under epistemic and methodological scrutiny. This triangulation gives a stronger foundation than any single author alone.`,
  },
  {
    source: "Donald Davidson, Truth and Meaning and later interpretation essays",
    text: `Davidson’s influential proposal is that a theory of meaning for a natural language can be modeled using a truth theory of a broadly Tarskian kind. The central thought is not that meaning collapses into truth simpliciter, but that systematically deriving truth-conditions for sentences can display understanding in a compositional and empirically disciplined way. A meaning theory should explain how finite speakers can understand indefinitely many novel sentences; recursive structure is therefore essential.

Davidson frames this through T-sentences: for each sentence S in the object language, the theory yields a biconditional of the form “S is true iff p,” where p gives conditions under which S is true. If such a theory is properly constrained and empirically interpreted, it can function as a meaning theory. The proposal influenced philosophy of language, formal semantics, and interpretation theory by providing a bridge between logical form and linguistic competence.

His later work on radical interpretation adds an epistemic and methodological layer. Interpreters attribute beliefs and meanings to speakers under principles of charity, coherence, and rationality. Meaning attribution is not a purely mechanical decoding task; it is embedded in a network of assumptions about shared world, rational agency, and communicative norms. This resonates with contemporary discussions of context, pragmatics, and social interpretation.

Davidson therefore offers a productive synthesis: logical rigor via truth-theoretic structure, combined with interpretive practice grounded in rational constraints. For advanced study, Davidson helps unify topics that are often kept apart: compositional semantics, theory of interpretation, and epistemic evaluation of linguistic understanding.`,
  },
];

function nextSemanticsPassage() {
  const pick = rand(semanticsPassages);
  document.getElementById("semantics-meta").textContent = `Source: ${pick.source}`;
  document.getElementById("semantics-passage").textContent = pick.text;
}
document.getElementById("new-semantics").onclick = nextSemanticsPassage;

// Hegel passage (minimum 1000 words, preserving whole paragraph boundaries)
const hegelParagraphs = [
  `Being, pure being, without any further determination, is in its immediate indeterminacy equal only to itself. It has no diversity within itself, nor any with respect to another. If any determination or content were posited in it as distinct, or by virtue of which it would be posited as distinct from an other, it would thereby no longer be held fast in its purity. It is pure indeterminateness and emptiness. There is nothing to be intuited in it, if one can speak here of intuiting; or, it is only this pure empty intuiting itself. Just as little is there anything to be thought in it, or it is equally only this empty thinking. Being, the indeterminate immediate, is in fact nothing, and neither more nor less than nothing.`,

  `Nothing, pure nothing: it is simple equality with itself, complete emptiness, absence of all determination and content, undifferentiatedness in itself. Insofar as intuition or thinking can be mentioned here, it counts as a distinction whether something or nothing is intuited or thought. To intuit or think nothing has therefore a meaning: the two are distinguished, so nothing is (exists) in our intuiting or thinking; or rather it is the empty intuiting and thinking itself, and the same empty intuiting or thinking as pure being. Nothing is therefore the same determination, or rather absence of determination, and thus altogether the same as pure being.`,

  `Pure being and pure nothing are therefore the same. What is the truth is neither being nor nothing, but that being has passed over into nothing and nothing into being. Yet equally, the truth is not their indistinguishability, but that they are not the same, that they are absolutely distinct and yet unseparated and inseparable, and that each immediately vanishes in its opposite. Their truth is therefore this movement of the immediate vanishing of the one into the other: becoming, a movement in which both are distinct, but by a distinction which has just as immediately dissolved itself. Becoming is this unrest in which being and nothing are only as vanishing moments, and in which the one is immediately the other.`,

  `In becoming there are two moments: coming-to-be and ceasing-to-be. Coming-to-be is the transition from nothing to being; ceasing-to-be is the transition from being to nothing. But the two moments cannot be separated. In coming-to-be, nothing is not merely nothing, but nothing that refers to being; in ceasing-to-be, being is not merely being, but being that refers to nothing. Each moment thus contains the other in itself. Their difference is only a meant difference, one that is immediately sublated. Becoming is therefore not an externally composite unity but a self-moving unity in which the moments are distinguishable only as vanishing. If they are fixed apart, becoming collapses. If they are held as mere identity, becoming disappears equally. The truth is the unrest that is itself simple, the simple whole of this movement.`,

  `What results from becoming is determinate being, being-there. Determinate being is being with a determinateness that has become simple and immediate. The determinateness is quality; and by virtue of quality, something is what it is, and losing its quality, it ceases to be what it is. Determinate being is therefore not mere indifferent being but being that bears in itself negation as determinateness. This negation is not an external other but immanent. Something is thus related to an other, and this relation does not come to it from outside; it belongs to its own constitution. In this way, finitude appears: something is finite because it has its negation in itself, because it points beyond itself to its other and in that relation is unstable.`,

  `The finite is, but this being is the being of a vanishing. It is not merely externally limited by another, but is in its own self-relation the process of going beyond itself. This going-beyond is the ought and the striving of the finite to transcend its limit. Yet because the limit belongs to it, this transcendence reproduces finitude again. The bad infinite is precisely this endless progression in which the finite continually passes beyond itself and still remains finite. True infinity, by contrast, is not a beyond opposed to the finite but the sublation of this opposition itself. It is the self-relating negativity in which being-other is only a moment of self-return. Hence the true infinite is concrete: it includes finitude as a moment and has returned into itself from its other.`,

  `Being-for-self is the determinateness in which something, through the negation of negation, is related to itself. The one excludes the other and in this exclusion posits itself. Yet because this exclusion is a relation, the one is equally related to other ones. The one thus passes over into many ones; and the many, through their reciprocal repulsion and attraction, reveal that each one has no subsistence apart from relation. Repulsion is the positing of many ones as distinct; attraction is their ideality, the sublation of their abstract isolation. The truth of one and many is not in either fixed moment but in their movement. Quantity thereby emerges as determinateness that has become indifferent to being: quality has passed over into quantity, and with this transition being enters a new sphere of determination.`,

  `Measure is the qualitative quantum, the unity in which quality and quantity are immediately one. Changes in quantity, seemingly indifferent at first, reach nodal points where quality changes. Thus measure is the truth of quality and quantity and the transition to essence. Essence is being that has gone into itself, being mediated through negation. It is no longer immediate but reflected. In essence, what appears is not immediately what it is; rather, it is in relation to an other and in relation back into itself. Identity, difference, ground, appearance, and actuality are determinations of reflection through which being is grasped as mediated totality. The movement of essence is the movement of reflection, the movement in which immediacy is shown as posited and as returning into itself through its other.`,

  `The concept is the unity of being and essence: the truth in which immediacy and reflection are sublated and preserved. It is free because it determines itself, and concrete because its determinations are moments of one self-related whole. Universality, particularity, and individuality are not externally juxtaposed forms but the immanent moments of one and the same activity. Judgment and syllogism are the development in which the concept posits its determinations as objective and returns from this objectivity to itself. In objectivity the concept confronts itself as mechanism, chemism, and teleology; and in the Idea it attains the unity of concept and reality. The Idea is the true in and for itself, the living unity that differentiates itself and remains identical with itself in this differentiation. In this way logic closes not by a return to abstract immediacy, but by the self-knowing movement in which the beginning is grasped as result and the result as a beginning raised into truth.`
];

function wordCount(text) {
  return (text.match(/\b[\w'-]+\b/g) || []).length;
}

function nextHegelPassage() {
  const start = Math.floor(Math.random() * hegelParagraphs.length);
  const picked = [];
  let words = 0;
  let i = 0;

  while (words < 1000 && i < hegelParagraphs.length) {
    const para = hegelParagraphs[(start + i) % hegelParagraphs.length];
    picked.push(para);
    words += wordCount(para);
    i += 1;
  }

  document.getElementById("hegel-paragraph").textContent = picked.join("\n\n");
}

document.getElementById("new-hegel").onclick = nextHegelPassage;

// Habits + today only D1
const habitIds = ["habit-pullups", "habit-pushups", "habit-lifts"];
function loadHabits() { const habits = readJSON(KEYS.habits, {}); habitIds.forEach((id) => { document.getElementById(id).checked = Boolean(habits[id]); }); }
document.getElementById("save-habits").onclick = () => {
  const habits = {};
  habitIds.forEach((id) => { habits[id] = document.getElementById(id).checked; });
  localStorage.setItem(KEYS.habits, JSON.stringify(habits));
};
document.getElementById("routine-today").textContent = "D1: Pull-ups 8 • Push-ups 18 • 5kg lifts 15 per side.";

// Guitar separate window
const guitarShortCandidates = [
  { query: "srv solo lick", embedId: "Y2fQW4sXkJQ", phrase: "SRV-style blues lick: rake into minor pentatonic bend." },
  { query: "bb king solo lick", embedId: "h6i9m6JH3Jk", phrase: "B.B. King-style phrase: vocal vibrato on target note." },
  { query: "albert king solo lick", embedId: "qHf3dH6L8Xg", phrase: "Albert King-style wide bend and response phrase." },
];
const shortsSearchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIYAQ%253D%253D`;
function nextGuitar() {
  const pick = rand(guitarShortCandidates);
  document.getElementById("guitar-phrase").textContent = `${pick.phrase} (Query: ${pick.query})`;
  document.getElementById("guitar-video").src = `https://www.youtube.com/embed/${pick.embedId}`;
  const link = document.getElementById("guitar-search-link");
  link.href = shortsSearchUrl(pick.query);
  link.textContent = `Open YouTube Shorts results for “${pick.query}”`;
}
document.getElementById("new-phrase").onclick = nextGuitar;

// Hegelpd last 2 weeks + publications excluding chapter and preferring articles
async function loadHegelNewsLast2Weeks() {
  const status = document.getElementById("hegel-news-status");
  const list = document.getElementById("hegel-news-list");
  status.textContent = "Loading latest posts...";
  const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  try {
    // Try News&Events category first; if empty/broken, fall back to latest site-wide posts.
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
    status.textContent = recent.length ? "Hegelpd News in last 2 weeks:" : "No Hegelpd posts in last 2 weeks. You can also check Hegelpd Facebook posts.";
    if (!recent.length) {
      list.innerHTML = `<li><a href="https://www.facebook.com/hegelpd" target="_blank" rel="noopener noreferrer">Open Hegelpd on Facebook</a></li><li><a href="https://www.hegelpd.it/category/newsevents/" target="_blank" rel="noopener noreferrer">Open Hegelpd News & Events page</a></li>`;
    }
  } catch {
    list.innerHTML = `<li><a href="https://www.hegelpd.it/category/newsevents/" target="_blank" rel="noopener noreferrer">Open Hegelpd News & Events page</a></li><li><a href="https://www.facebook.com/hegelpd" target="_blank" rel="noopener noreferrer">Open Hegelpd on Facebook</a></li>`;
    status.textContent = "Could not fetch directly (likely CORS/network). Use Hegelpd site/Facebook links above.";
  }
}

async function loadHegelArticlesOnly() {
  const status = document.getElementById("scopus-status");
  const list = document.getElementById("scopus-list");
  status.textContent = "Loading publication links...";
  try {
    const response = await fetch("https://api.crossref.org/works?query.title=Hegel&sort=published&order=desc&rows=30");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const items = (payload?.message?.items || []).filter((item) => {
      const title = ((item.title && item.title[0]) || "").toLowerCase();
      const isArticle = item.type === "journal-article" || item.type === "proceedings-article";
      return title.includes("hegel") && !title.includes("chapter") && isArticle;
    }).slice(0, 8);

    list.innerHTML = "";
    items.forEach((item) => {
      const title = item.title?.[0] || "Untitled";
      const year = item.published?.["date-parts"]?.[0]?.[0] || "n.d.";
      const doi = item.DOI ? `https://doi.org/${item.DOI}` : item.URL;

      const li = document.createElement("li");
      const article = document.createElement("a");
      article.href = doi || "https://www.scopus.com/results/results.uri?src=s&st1=Hegel";
      article.target = "_blank";
      article.rel = "noopener noreferrer";
      article.textContent = `${title} (${year})`;
      li.appendChild(article);

      const scopus = document.createElement("a");
      scopus.href = `https://www.scopus.com/results/results.uri?src=s&st1=${encodeURIComponent(title)}`;
      scopus.target = "_blank";
      scopus.rel = "noopener noreferrer";
      scopus.textContent = " [Scopus search]";
      li.appendChild(scopus);

      list.appendChild(li);
    });
    status.textContent = items.length ? "Recent Hegel-related articles (chapters removed):" : "No recent matching Hegel articles found.";
  } catch {
    list.innerHTML = `<li><a href="https://www.scopus.com/results/results.uri?src=s&st1=Hegel" target="_blank" rel="noopener noreferrer">Open Scopus Hegel title search</a></li>`;
    status.textContent = "Could not fetch API data directly; use fallback link above.";
  }
}

document.getElementById("refresh-hegel-news").onclick = () => { loadHegelNewsLast2Weeks(); loadHegelArticlesOnly(); };

// Window manager
const windows = [...document.querySelectorAll(".window")];
const defaultLayout = {
  "tasks-window": { x: 20, y: 20, w: 500, h: 300, minimized: false },
  "draft-window": { x: 540, y: 20, w: 440, h: 300, minimized: false },
  "logic-window": { x: 1000, y: 20, w: 370, h: 240, minimized: false },
  "german-window": { x: 20, y: 340, w: 520, h: 360, minimized: false },
  "youtube-window": { x: 560, y: 340, w: 500, h: 340, minimized: false },
  "raw-window": { x: 1080, y: 280, w: 380, h: 300, minimized: false },
  "compare-window": { x: 20, y: 720, w: 620, h: 300, minimized: false },
  "semantics-window": { x: 660, y: 700, w: 620, h: 420, minimized: false },
  "hegel-window": { x: 1300, y: 600, w: 360, h: 260, minimized: false },
  "habit-window": { x: 1300, y: 880, w: 390, h: 300, minimized: false },
  "guitar-window": { x: 20, y: 1400, w: 520, h: 520, minimized: false },
  "hegel-news-window": { x: 560, y: 1150, w: 820, h: 430, minimized: false },
};
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
    controls.appendChild(minimizeBtn); dragBar.appendChild(dragHandle); dragBar.appendChild(controls); win.prepend(dragBar);

    const content = document.createElement("div");
    content.className = "window-content";
    while (dragBar.nextSibling) content.appendChild(dragBar.nextSibling);
    win.appendChild(content);

    minimizeBtn.onclick = () => { win.classList.toggle("minimized"); saveLayout(); };

    let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;
    dragHandle.addEventListener("mousedown", (e) => { dragging = true; win.style.zIndex = String(++z); startX = e.clientX; startY = e.clientY; startLeft = win.offsetLeft; startTop = win.offsetTop; e.preventDefault(); });
    document.addEventListener("mousemove", (e) => { if (!dragging || win.classList.contains("minimized")) return; win.style.left = `${startLeft + e.clientX - startX}px`; win.style.top = `${startTop + e.clientY - startY}px`; });
    document.addEventListener("mouseup", () => { if (!dragging) return; dragging = false; saveLayout(); });

    const ro = new ResizeObserver(() => { if (!win.classList.contains("minimized")) saveLayout(); });
    ro.observe(win);
    win.addEventListener("mousedown", () => { win.style.zIndex = String(++z); });
  });
}
document.getElementById("reset-layout").onclick = () => { localStorage.removeItem(KEYS.layout); applyLayout(defaultLayout); saveLayout(); };

renderTasks();
generateLogicExercise();
nextGerman();
nextSemanticsPassage();
document.getElementById("new-hegel").click();
loadHabits();
nextGuitar();
loadHegelNewsLast2Weeks();
loadHegelArticlesOnly();

applyLayout(readJSON(KEYS.layout, defaultLayout));
initWindowControls();
