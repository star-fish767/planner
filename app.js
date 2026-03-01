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

// Semantics passages
const semanticsPassages = [
  {
    source: "Frege, Carnap, Quine, Davidson — Analytic Semantics Survey",
    text: `Analytic philosophy of language became methodologically distinctive when questions about meaning were increasingly treated as questions about logical form, inference, and public criteria of correctness, rather than as purely introspective reports about ideas. A useful entry point is Frege’s distinction between sense and reference. The distinction answers a cognitive puzzle: why identity claims such as “a = b” can be informative while “a = a” is trivial. If names contributed only bare objects, informative identities would collapse into tautologies. Frege instead proposes that an expression presents its referent under a mode of presentation. Sense is this mode of presentation; reference is the object. The distinction then extends into embedded contexts, where substitution of co-referential terms may fail to preserve truth in attitude reports. This allows semantic theory to explain opacity without abandoning compositional structure.

Frege’s sentence-level view is equally important. He proposes that the reference of a complete declarative sentence is a truth-value, while its sense is a thought. This move bridges language and logic: if sentence reference is truth-value, logical operators can be modeled functionally; if sentence sense is thought, cognition and understanding remain theoretically visible. The dual aspect—truth-conditional and cognitive—remains foundational for contemporary semantics. It is still visible in disputes between strict truth-conditional theories and approaches that assign more explanatory work to pragmatic enrichment.

Carnap’s contribution is methodological rigor. Rather than debating meaning in the abstract, he encourages explicit framework construction: define syntax, define model-theoretic interpretation, define semantic consequence, and evaluate the resulting system by clarity and utility. Intension/extension distinctions become operational tools rather than metaphysical declarations. A term can share extension in one state-description while differing in intension across admissible possibilities. Carnap’s framework-relative conception of analyticity also changes the dialectic: what is analytic depends on rules of a language-system. Even critics of Carnap inherit this demand for explicitness. In modern formal semantics, this legacy appears in strict metalanguage/object-language discipline and the expectation that semantic claims should be stated in testable, compositional terms.

Quine’s challenge destabilizes any easy confidence that analyticity is sharply bounded. In “Two Dogmas,” he argues that appeals to synonymy and definition often move in circles when asked for non-question-begging foundations. His holism suggests that statements face empirical revision not atomically but as parts of wider theoretical webs. For semantics, this is a cautionary lesson: lexical meaning, inferential role, and empirical belief are often more entangled than simplified textbook boundaries suggest. In Word and Object, Quine’s indeterminacy themes further pressure semantic theory to explain how interpretation is constrained by evidence, behavior, and theory choice without presuming unique decompositions at every point.

Davidson reorients meaning theory by proposing truth-theoretic form as an engine for semantic explanation. A recursive truth theory that yields appropriately interpreted T-sentences can, under strict constraints, function as a theory of meaning. This does not collapse meaning into truth; rather, it uses truth-conditions to display systematic understanding of indefinitely many novel sentences. Davidson’s later work on radical interpretation introduces principles of charity and coherence, tying semantics to norms of rational attribution. Meaning assignment is not a private decoding act but a public interpretive practice embedded in world-directed communication.

Taken together, these lines of work motivate a disciplined workflow for analytic semantics. First, separate semantic content from pragmatic effect, while preserving interfaces between them. Second, represent compositional structure explicitly: clause type, quantifier scope, operator domain, and anaphoric dependencies must be modeled, not guessed. Third, treat translation and interpretation as constrained underdetermination problems: evidence narrows theory space but rarely forces one unique micro-analysis. Fourth, connect semantics to epistemic and inferential roles: what a sentence means is partly visible in what follows from accepting it and what would count as a reason to revise it.

This integrated perspective helps with contemporary topics such as context sensitivity, indexicality, modality, and attitude ascriptions. In context sensitivity, the challenge is to distinguish genuine semantic parameters from pragmatic free enrichment. In modality, possible-world semantics must be calibrated to explanatory aims: metaphysical necessity, epistemic possibility, deontic obligation, and dispositional readings often require different accessibility assumptions. In attitude reports, opacity phenomena require handling not only reference but representational perspective. In quantification and anaphora, dynamic effects force semantics to track discourse updates over sequences of sentences, not only isolated propositions.

A practical study strategy is to read one canonical text from each author with an explicit notebook schema: target problem, formal move, inferential payoff, and surviving objection. This prevents the common failure mode of collecting slogans without understanding their functional role in argument. It also reveals convergence beneath disagreement. Frege and Davidson, for example, differ in framework but share a commitment to compositional explainability. Carnap and Quine disagree about analyticity but jointly force precision in how theoretical claims are stated. Read this tradition as a sequence of method-refinements, not as mutually cancelling positions.

The upshot is that analytic semantics remains strongest when it combines exact formal articulation with interpretive realism about language use. Over-formalized models can lose contact with communicative practice; purely conversational models can lose explanatory stability. The best work moves between levels: logical structure, model-theoretic interpretation, pragmatic modulation, and epistemic application. That is precisely why this tradition remains central for philosophy, linguistics, and logic today: it gives reusable tools for making meaning claims precise without pretending that precision alone resolves every philosophical question.

An additional advantage of this lineage is pedagogical transfer. Once you learn to model reference, compositionality, and inferential commitment in one domain, you can reuse the same scaffold in adjacent domains: legal interpretation, scientific explanation, and AI language evaluation. Semantic discipline scales because it separates data description from rule articulation and then forces explicit tests for adequacy. In practical writing, this means every major claim should be accompanied by (a) a clear proposition, (b) an explicit dependency set, and (c) a failure condition showing what would count against it.

That final requirement is often missing in informal debate, where disagreement persists because interlocutors never identify disconfirming conditions. Analytic semantics reduces this failure mode. If two speakers differ on the truth-conditions of a sentence, the dispute can be made explicit in model terms; if they differ in pragmatic enrichment, the disagreement can be isolated at the interface level; if they differ in evidential standards, the issue can be treated epistemically rather than semantically. The framework does not guarantee consensus, but it prevents equivocation from masquerading as depth.`,
  },
  {
    source: "Long-form Analytic Semantics Companion Passage",
    text: `A robust semantic theory should answer at least five questions. What are the primitive meaning-bearing units? How are complex meanings composed? What is the relation between semantic value and truth conditions? How does context enter the semantics/pragmatics boundary? And how should interpretation deal with indeterminacy, disagreement, and theory revision? The analytic tradition addresses these through layered proposals rather than a single unified doctrine.

At the lexical level, one learns quickly that reference alone is too weak. Proper names, descriptions, predicates, and indexicals behave differently under embedding, quantification, and attitude attribution. Frege’s lesson is that cognitive significance matters: expressions must be representationally articulated, not merely extensionally listed. In extensional contexts, co-reference supports substitution; in intensional contexts, substitution can fail because speakers track ways of presenting objects. This distinction underlies much of the modern treatment of propositional attitudes and de re/de dicto contrasts.

At the compositional level, formal semantics inherits from logic the requirement that surface combination rules map systematically to semantic composition. Quantifier scope, operator precedence, and variable binding are not optional decorations; they are often decisive for truth conditions. A sentence with two quantifiers may have multiple readings with distinct entailment patterns. A semantic model that ignores this loses explanatory adequacy. This is why work in generalized quantifier theory, dynamic semantics, and type-driven composition became central: they preserve compositional rigor while accommodating natural-language phenomena such as anaphora and context update.

At the truth-conditional level, Tarskian and Davidsonian influences remain decisive. Truth definitions supply an explicit architecture for stating what must obtain for sentences to be true. Their value is methodological: they force semantic claims into transparent inferential form. But truth-conditional architecture does not settle all meaning questions by itself. Expressive force, presupposition, implicature, and discourse function can alter communicated content in ways not captured by literal truth conditions alone. Hence the long-running semantics/pragmatics interface debate.

At the interface level, Gricean pragmatics and later developments emphasize that hearers infer beyond literal content using cooperative assumptions, background knowledge, and relevance expectations. The key technical challenge is division of labor: which content is encoded semantically, and which is pragmatically derived? Over-encoding semantics risks bloated lexical entries and opaque composition. Under-encoding semantics pushes too much into unconstrained inference. Contemporary approaches often seek principled intermediate positions, preserving testable semantic cores while allowing context-sensitive enrichment under explicit constraints.

At the methodological level, Quine reminds theorists that semantic distinctions need defensible criteria. If analyticity is invoked, how is it fixed non-circularly? If synonymy is claimed, what evidence supports it beyond stipulation? Holism and underdetermination do not imply that all semantic analysis is arbitrary, but they do imply that semantic theory is accountable to broader explanatory networks, including empirical linguistics, translation practice, and inferential behavior. The result is a mature view: semantic theorizing is constrained, revisable, and comparative.

Carnap contributes a constructive response: build explicit frameworks and evaluate them by clarity, fruitfulness, and systematic integration. Different frameworks may serve different explanatory projects without collapsing into relativism. This framework tolerance encourages plural toolkits: model-theoretic semantics for truth-conditional structure, proof-theoretic tools for inferential role, dynamic machinery for discourse evolution, and pragmatic models for speaker meaning. The real test is not metaphysical purity but explanatory success under transparent assumptions.

Davidson’s interpretive turn adds another discipline: meaning attribution is inseparable from rational interpretation. Interpreting speakers requires balancing charity, coherence, and world-directedness. This does not replace formal semantics, but situates it inside communicative practice. A theory that predicts formal truth conditions but systematically misreads ordinary interpretive behavior is incomplete. Conversely, purely interpretive accounts without compositional machinery struggle to explain productivity and structural constraints.

For philosophy and linguistics students, the practical payoff is a multi-level analytic method. Start with structural diagnosis: parse clause architecture and operator dependencies. Then assign semantic values and derive candidate truth conditions. Next, test entailments and counterexamples across contexts. Finally, evaluate pragmatic overlays and interpretive plausibility. This cycle transforms semantics from memorized doctrine into operational analysis.

Modal and epistemic language illustrates the need for this method. “Must,” “might,” “know,” “believe,” and “should” vary across epistemic, metaphysical, deontic, and evidential readings. A good semantics captures these as constrained parameter shifts, not free ambiguity. Yet pragmatic and discourse factors still guide resolution. Similarly, indexicals and demonstratives demand coordination between stable character-like rules and context-dependent contents. The same expression type can be semantically rule-governed and context-sensitive without inconsistency.

A final point concerns normativity. Semantic theory is not only descriptive; it often carries implicit norms for correct use, valid inference, and interpretive charity. Making these norms explicit prevents category mistakes. One can distinguish semantic competence from rhetorical effectiveness, logical consequence from persuasion, and lexical meaning from social uptake. This distinction is crucial for academic writing, argument analysis, and cross-linguistic comparison alike.

In sum, analytic semantics advances by balancing formal precision, empirical responsibility, and interpretive realism. Frege secures representational depth, Carnap secures constructive explicitness, Quine secures methodological skepticism, and Davidson secures interpretive integration. Treat these not as isolated schools but as complementary constraints on theory-building. When used together, they produce semantic analyses that are both technically rigorous and philosophically illuminating.

For long-form research projects, this framework enables repeatable quality control. Draft a paragraph, then audit it for semantic stability: are key terms used with a fixed inferential profile? Do quantifiers scope as intended? Are modal operators consistently interpreted? Are purported consequences genuinely entailed or merely suggested? This audit habit is one reason analytic styles remain influential in dissertation writing and advanced argument reconstruction.

Finally, semantic analysis improves interdisciplinary communication. Philosophers, linguists, logicians, and cognitive scientists often use overlapping vocabulary with different background assumptions. A model-explicit semantic workflow surfaces those assumptions quickly and makes collaboration possible without forced theoretical uniformity. In that sense, the analytic tradition is not only a doctrine-set but a communication technology: it makes disagreements inspectable, revisions trackable, and conclusions responsibly bounded by the structures that support them.

In practical seminars, one useful exercise is to take a contested paragraph and produce three rewrites: a purely extensional rewrite, an intensional rewrite, and a pragmatics-aware rewrite. Comparing the three versions usually reveals where disagreement actually lives. This kind of disciplined rewriting is one of the fastest ways to improve analytic clarity and argumentative precision over time.`,
  },
];
function nextSemanticsPassage() {
  const pick = rand(semanticsPassages);
  const paragraphs = pick.text.split(/\n\n+/).filter(Boolean);
  const out = [];
  let words = 0;
  let index = 0;
  while (words < 1000 && paragraphs.length > 0 && index < paragraphs.length * 2) {
    const para = paragraphs[index % paragraphs.length];
    out.push(para);
    words += wordCount(para);
    index += 1;
  }
  document.getElementById("semantics-meta").textContent = `Source: ${pick.source}`;
  document.getElementById("semantics-passage").textContent = out.join("\n\n");
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
  status.textContent = "Loading publication links (Crossref, OpenAlex, Semantic Scholar)...";

  const topicRegex = /(hegel|kant|german\s+idealism)/i;
  const chapterRegex = /chapter/i;
  const normalize = (title, year, url, lang, source) => ({
    title: String(title || "Untitled").trim(),
    year: year || "n.d.",
    url,
    lang: String(lang || "").toLowerCase(),
    source,
  });
  const langOk = (lang) => !lang || lang === "en" || lang === "de";
  const topicOk = (title) => topicRegex.test(title || "");
  const isNotChapter = (title) => !chapterRegex.test(title || "");

  try {
    const [crossrefRes, openAlexRes, semanticRes] = await Promise.allSettled([
      fetch("https://api.crossref.org/works?query.title=Hegel%20OR%20Kant%20OR%20German%20Idealism&sort=published&order=desc&rows=100"),
      fetch("https://api.openalex.org/works?search=Hegel%20Kant%20German%20Idealism&per-page=100&sort=publication_date:desc"),
      fetch("https://api.semanticscholar.org/graph/v1/paper/search?query=Hegel%20OR%20Kant%20OR%20German%20Idealism&limit=50&fields=title,year,url,publicationTypes"),
    ]);

    const all = [];

    if (crossrefRes.status === "fulfilled" && crossrefRes.value.ok) {
      const payload = await crossrefRes.value.json();
      (payload?.message?.items || []).forEach((item) => {
        const title = (item.title && item.title[0]) || "";
        const type = item.type || "";
        const articleTypeOk = type === "journal-article" || type === "proceedings-article";
        const lang = String(item.language || "").toLowerCase();
        if (topicOk(title) && isNotChapter(title) && articleTypeOk && langOk(lang)) {
          all.push(normalize(title, item.published?.["date-parts"]?.[0]?.[0], item.DOI ? `https://doi.org/${item.DOI}` : item.URL, lang, "Crossref"));
        }
      });
    }

    if (openAlexRes.status === "fulfilled" && openAlexRes.value.ok) {
      const payload = await openAlexRes.value.json();
      (payload?.results || []).forEach((item) => {
        const title = item.display_name || "";
        const type = (item.type || "").toLowerCase();
        const articleTypeOk = type.includes("article");
        const lang = String(item.language || "").toLowerCase();
        if (topicOk(title) && isNotChapter(title) && articleTypeOk && langOk(lang)) {
          all.push(normalize(title, String(item.publication_year || "n.d."), item.primary_location?.landing_page_url || item.id, lang, "OpenAlex"));
        }
      });
    }

    if (semanticRes.status === "fulfilled" && semanticRes.value.ok) {
      const payload = await semanticRes.value.json();
      (payload?.data || []).forEach((item) => {
        const title = item.title || "";
        const pTypes = (item.publicationTypes || []).map((x) => String(x).toLowerCase());
        const articleTypeOk = pTypes.length === 0 || pTypes.some((t) => t.includes("journal") || t.includes("conference") || t.includes("article"));
        if (topicOk(title) && isNotChapter(title) && articleTypeOk) {
          all.push(normalize(title, item.year, item.url, "", "Semantic Scholar"));
        }
      });
    }

    const dedup = new Map();
    all.forEach((item) => {
      const key = item.title.toLowerCase();
      if (!dedup.has(key)) dedup.set(key, item);
    });
    const items = [...dedup.values()]
      .sort((a, b) => Number(b.year || 0) - Number(a.year || 0))
      .slice(0, 12);

    list.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      const article = document.createElement("a");
      article.href = item.url || "https://scholar.google.com/scholar?q=Hegel+Kant+German+Idealism";
      article.target = "_blank";
      article.rel = "noopener noreferrer";
      article.textContent = `${item.title} (${item.year})`;
      li.appendChild(article);

      const meta = document.createElement("span");
      meta.textContent = ` [${item.source}]`;
      li.appendChild(meta);

      const scopus = document.createElement("a");
      scopus.href = `https://www.scopus.com/results/results.uri?src=s&st1=${encodeURIComponent(item.title)}`;
      scopus.target = "_blank";
      scopus.rel = "noopener noreferrer";
      scopus.textContent = " [Scopus search]";
      li.appendChild(scopus);

      list.appendChild(li);
    });

    status.textContent = items.length
      ? "Recent Hegel OR Kant OR German Idealism articles (English/German when available, no chapters)."
      : "No matches returned from API responses. Use fallback database links below.";

    if (!items.length) {
      list.innerHTML = `
        <li><a href="https://www.scopus.com/results/results.uri?src=s&st1=Hegel%20OR%20Kant%20OR%20%22German%20Idealism%22" target="_blank" rel="noopener noreferrer">Search Scopus (Hegel OR Kant OR German Idealism)</a></li>
        <li><a href="https://api.crossref.org/works?query.title=Hegel%20OR%20Kant%20OR%20German%20Idealism" target="_blank" rel="noopener noreferrer">Crossref query</a></li>
        <li><a href="https://api.openalex.org/works?search=Hegel%20Kant%20German%20Idealism" target="_blank" rel="noopener noreferrer">OpenAlex query</a></li>
        <li><a href="https://scholar.google.com/scholar?q=Hegel+Kant+German+Idealism" target="_blank" rel="noopener noreferrer">Google Scholar query</a></li>
      `;
    }
  } catch {
    list.innerHTML = `
      <li><a href="https://www.scopus.com/results/results.uri?src=s&st1=Hegel%20OR%20Kant%20OR%20%22German%20Idealism%22" target="_blank" rel="noopener noreferrer">Search Scopus (Hegel OR Kant OR German Idealism)</a></li>
      <li><a href="https://api.crossref.org/works?query.title=Hegel%20OR%20Kant%20OR%20German%20Idealism" target="_blank" rel="noopener noreferrer">Crossref query</a></li>
      <li><a href="https://api.openalex.org/works?search=Hegel%20Kant%20German%20Idealism" target="_blank" rel="noopener noreferrer">OpenAlex query</a></li>
      <li><a href="https://scholar.google.com/scholar?q=Hegel+Kant+German+Idealism" target="_blank" rel="noopener noreferrer">Google Scholar query</a></li>
    `;
    status.textContent = "Could not fetch API data directly; use fallback database links above.";
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
