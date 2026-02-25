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

// Logic (harder)
const propositions = ["P", "Q", "R", "S", "T", "U", "V"];
function generateLogicExercise() {
  const p = rand(propositions), q = rand(propositions.filter((x) => x !== p)), r = rand(propositions.filter((x) => x !== p && x !== q)), s = rand(propositions.filter((x) => x !== p && x !== q && x !== r));
  const options = [
    `Premises: ${p} → (${q} → ${r}), ${p}, ${q}\nGoal: ${r}\nHint: nested implication elimination.`,
    `Premises: (${p} ∨ ${q}) → ${r}, ${p} ∨ ${q}\nGoal: ${r}\nHint: derive implication target directly.`,
    `Premises: ${p} → ${q}, ${q} → ${r}, ${r} → ${s}\nGoal: ${p} → ${s}\nHint: conditional proof with chained MPs.`,
    `Premises: ¬${p} → ${q}, ¬${q}\nGoal: ${p}\nHint: contradiction strategy.`,
    `Premises: (${p} → ${q}) ∧ (${r} → ¬${q}), ${p} ∨ ${r}\nGoal: ${q} ∨ ¬${q}\nHint: case split and introduction.`,
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
  document.getElementById("gpu-status").textContent = navigator.gpu ? "GPU available: running accelerated grammar cleanup (mock)." : "GPU not available: running CPU fallback grammar cleanup.";
  rawInput.value = rawInput.value.replace(/\bi\b/g, "I").replace(/\s+([,.!?;:])/g, "$1").replace(/\bteh\b/gi, "the").replace(/\bim\b/gi, "I'm").replace(/\s{2,}/g, " ").replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => `${p1}${p2.toUpperCase()}`);
};

// Compare marking
function applyMark(color) {
  document.execCommand("styleWithCSS", false, true);
  document.execCommand("hiliteColor", false, color);
}
document.getElementById("mark-yellow").onclick = () => applyMark("#fef08a");
document.getElementById("mark-green").onclick = () => applyMark("#bbf7d0");
document.getElementById("clear-mark").onclick = () => document.execCommand("removeFormat", false);

// Semantics passages
const semanticsPassages = [
  { source: "Frege", text: "Frege distinguishes sense and reference to explain cognitive value differences in identity statements and intensional substitutions." },
  { source: "Carnap", text: "Carnap formalizes intension/extension and language frameworks, showing how semantic rules structure analyticity and modality." },
  { source: "Quine", text: "Quine challenges strict analyticity and emphasizes holism and indeterminacy, pressuring semantic explanation to be methodologically explicit." },
  { source: "Davidson", text: "Davidson links meaning theory with truth-conditional recursion and radical interpretation under charity constraints." },
];
function nextSemanticsPassage() {
  const pick = rand(semanticsPassages);
  document.getElementById("semantics-meta").textContent = `Source: ${pick.source}`;
  document.getElementById("semantics-passage").textContent = pick.text;
}
document.getElementById("new-semantics").onclick = nextSemanticsPassage;

// Hegel long passage (>=1000 words using full paragraphs)
const hegelParagraphs = [
  "Being, pure being, without any further determination, is in its immediate indeterminacy equal only to itself. It has no diversity within itself, nor any with respect to another. If any determination or content were posited in it as distinct, or by virtue of which it would be posited as distinct from an other, it would thereby no longer be held fast in its purity. It is pure indeterminateness and emptiness. There is nothing to be intuited in it, if one can speak here of intuiting; or, it is only this pure empty intuiting itself. Just as little is there anything to be thought in it, or it is equally only this empty thinking. Being, the indeterminate immediate, is in fact nothing, and neither more nor less than nothing.",
  "Nothing, pure nothing: it is simple equality with itself, complete emptiness, absence of all determination and content, undifferentiatedness in itself. Insofar as intuition or thinking can be mentioned here, it counts as a distinction whether something or nothing is intuited or thought. To intuit or think nothing has therefore a meaning: the two are distinguished, so nothing is (exists) in our intuiting or thinking; or rather it is the empty intuiting and thinking itself, and the same empty intuiting or thinking as pure being. Nothing is therefore the same determination, or rather absence of determination, and thus altogether the same as pure being.",
  "Pure being and pure nothing are therefore the same. What is the truth is neither being nor nothing, but that being has passed over into nothing and nothing into being. Yet equally, the truth is not their indistinguishability, but that they are not the same, that they are absolutely distinct and yet unseparated and inseparable, and that each immediately vanishes in its opposite. Their truth is therefore this movement of the immediate vanishing of the one into the other: becoming, a movement in which both are distinct, but by a distinction which has just as immediately dissolved itself. Becoming is this unrest in which being and nothing are only as vanishing moments, and in which the one is immediately the other.",
  "In becoming there are two moments: coming-to-be and ceasing-to-be. Coming-to-be is the transition from nothing to being; ceasing-to-be is the transition from being to nothing. But the two moments cannot be separated. In coming-to-be, nothing is not merely nothing, but nothing that refers to being; in ceasing-to-be, being is not merely being, but being that refers to nothing. Each moment thus contains the other in itself. Their difference is only a meant difference, one that is immediately sublated. Becoming is therefore not an externally composite unity but a self-moving unity in which the moments are distinguishable only as vanishing. If they are fixed apart, becoming collapses. If they are held as mere identity, becoming disappears equally. The truth is the unrest that is itself simple, the simple whole of this movement.",
  "What results from becoming is determinate being, being-there. Determinate being is being with a determinateness that has become simple and immediate. The determinateness is quality; and by virtue of quality, something is what it is, and losing its quality, it ceases to be what it is. Determinate being is therefore not mere indifferent being but being that bears in itself negation as determinateness. This negation is not an external other but immanent. Something is thus related to an other, and this relation does not come to it from outside; it belongs to its own constitution. In this way, finitude appears: something is finite because it has its negation in itself, because it points beyond itself to its other and in that relation is unstable.",
  "The finite is, but this being is the being of a vanishing. It is not merely externally limited by another, but is in its own self-relation the process of going beyond itself. This going-beyond is the ought and the striving of the finite to transcend its limit. Yet because the limit belongs to it, this transcendence reproduces finitude again. The bad infinite is precisely this endless progression in which the finite continually passes beyond itself and still remains finite. True infinity, by contrast, is not a beyond opposed to the finite but the sublation of this opposition itself. It is the self-relating negativity in which being-other is only a moment of self-return. Hence the true infinite is concrete: it includes finitude as a moment and has returned into itself from its other.",
  "Being-for-self is the determinateness in which something, through the negation of negation, is related to itself. The one excludes the other and in this exclusion posits itself. Yet because this exclusion is a relation, the one is equally related to other ones. The one thus passes over into many ones; and the many, through their reciprocal repulsion and attraction, reveal that each one has no subsistence apart from relation. Repulsion is the positing of many ones as distinct; attraction is their ideality, the sublation of their abstract isolation. The truth of one and many is not in either fixed moment but in their movement. Quantity thereby emerges as determinateness that has become indifferent to being: quality has passed over into quantity, and with this transition being enters a new sphere of determination.",
  "Measure is the qualitative quantum, the unity in which quality and quantity are immediately one. Changes in quantity, seemingly indifferent at first, reach nodal points where quality changes. Thus measure is the truth of quality and quantity and the transition to essence. Essence is being that has gone into itself, being mediated through negation. It is no longer immediate but reflected. In essence, what appears is not immediately what it is; rather, it is in relation to an other and in relation back into itself. Identity, difference, ground, appearance, and actuality are determinations of reflection through which being is grasped as mediated totality. The movement of essence is the movement of reflection, the movement in which immediacy is shown as posited and as returning into itself through its other.",
  "The concept is the unity of being and essence: the truth in which immediacy and reflection are sublated and preserved. It is free because it determines itself, and concrete because its determinations are moments of one self-related whole. Universality, particularity, and individuality are not externally juxtaposed forms but the immanent moments of one and the same activity. Judgment and syllogism are the development in which the concept posits its determinations as objective and returns from this objectivity to itself. In objectivity the concept confronts itself as mechanism, chemism, and teleology; and in the Idea it attains the unity of concept and reality. The Idea is the true in and for itself, the living unity that differentiates itself and remains identical with itself in this differentiation. In this way logic closes not by a return to abstract immediacy, but by the self-knowing movement in which the beginning is grasped as result and the result as a beginning raised into truth.",
];
function wordCount(text) { return (text.match(/\b[\w'-]+\b/g) || []).length; }
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

// Guitar
const guitarShortCandidates = [
  { query: "srv solo lick", embedId: "2Vv-BfVoq4g", phrase: "SRV-style pentatonic bend target practice." },
  { query: "bb king solo lick", embedId: "fJ9rUzIMcZQ", phrase: "B.B.-style vocal phrasing and vibrato timing." },
  { query: "albert king solo lick", embedId: "YQHsXMglC9A", phrase: "Albert-style wide bend and response phrase." },
  { query: "gary moore solo lick", embedId: "kJQP7kiw5Fk", phrase: "Sustained note into descending blues run." },
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
  status.textContent = "Loading publication links...";
  try {
    const response = await fetch("https://api.crossref.org/works?query.title=Hegel&sort=published&order=desc&rows=30");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const items = (payload?.message?.items || []).filter((item) => {
      const title = ((item.title && item.title[0]) || "").toLowerCase();
      const isArticle = item.type === "journal-article" || item.type === "proceedings-article";
      const lang = String(item.language || "").toLowerCase();
      const langOk = !lang || lang === "en" || lang === "de";
      return title.includes("hegel") && !title.includes("chapter") && isArticle && langOk;
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
    status.textContent = items.length ? "Recent Hegel-related articles (English/German, no chapters):" : "No recent matching Hegel articles found.";
  } catch {
    list.innerHTML = `<li><a href="https://www.scopus.com/results/results.uri?src=s&st1=Hegel" target="_blank" rel="noopener noreferrer">Open Scopus Hegel title search</a></li>`;
    status.textContent = "Could not fetch API data directly; use fallback link above.";
  }
}
document.getElementById("refresh-hegel-news").onclick = () => { loadHegelNewsLast2Weeks(); loadHegelArticlesOnly(); };

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
nextGerman();
nextSemanticsPassage();
nextHegelPassage();
loadHabits();
nextGuitar();
loadHegelNewsLast2Weeks();
loadHegelArticlesOnly();

applyLayout(readJSON(KEYS.layout, defaultLayout));
initWindowControls();
