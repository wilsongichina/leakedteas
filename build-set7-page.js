const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const sourceRoot = path.join(root, "set 7");
const localSetDir = path.join(root, "sets", "set-7");
const publicSetDir = path.join(root, "public", "sets", "set-7");
const localAssetsDir = path.join(localSetDir, "assets");
const publicAssetsDir = path.join(publicSetDir, "assets");

const subjectSources = {
  reading: {
    label: "Reading",
    dir: "Reading",
    file: "Sample.html",
    duration: "00:55:00"
  },
  math: {
    label: "Math",
    dir: "Math",
    file: "Sample.html",
    duration: "00:57:00"
  },
  science: {
    label: "Science",
    dir: "Science",
    file: "Sample.html",
    duration: "01:00:00"
  },
  english: {
    label: "English",
    dir: "English",
    file: "Sample.html",
    duration: "00:37:00"
  }
};

function extractQuestions(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const start = html.indexOf("const questions");
  if (start < 0) throw new Error(`Could not find questions array in ${filePath}`);
  const arrayStart = html.indexOf("[", start);
  if (arrayStart < 0) throw new Error(`Could not find questions array start in ${filePath}`);

  const endMarker = "];const totalQuestions";
  let arrayEnd = html.indexOf(endMarker, arrayStart);
  if (arrayEnd < 0) {
    arrayEnd = html.indexOf("];", arrayStart);
  }
  if (arrayEnd < 0) throw new Error(`Could not find questions array end in ${filePath}`);

  const arraySource = html.slice(arrayStart, arrayEnd + 1);
  return vm.runInNewContext(`(${arraySource})`);
}

function normalizeAssetPaths(html) {
  return String(html || "").replace(/extracted-diagrams\//g, "assets/");
}

function buildQuestionHtml(question) {
  if (question.questionHtml) return normalizeAssetPaths(question.questionHtml);

  const chunks = [];
  if (question.passageTitle) chunks.push(`<h3>${question.passageTitle}</h3>`);
  if (question.passageHtml) chunks.push(question.passageHtml);
  if (question.stimulusHtml && /</.test(question.stimulusHtml)) {
    chunks.push(question.stimulusHtml);
  } else if (question.stimulus) {
    chunks.push(`<div class="stimulus-label">Stimulus: ${question.stimulus}</div>`);
  }
  chunks.push(`<div>${question.question || ""}</div>`);
  return normalizeAssetPaths(chunks.join(""));
}

function buildQuizData() {
  const quizData = {};

  for (const [key, source] of Object.entries(subjectSources)) {
    const filePath = path.join(sourceRoot, source.dir, source.file);
    const questions = extractQuestions(filePath).map((question, index) => ({
      skill: source.label,
      sourceNumber: String(question.sourceFile || question.sourceNumber || question.source || question.number || ""),
      questionNumber: Number(question.number || question.questionNumber || index + 1),
      question: question.questionHtml ? "" : buildQuestionHtml(question),
      questionHtml: question.questionHtml ? normalizeAssetPaths(question.questionHtml) : "",
      passageTitle: question.passageTitle || "",
      passageHtml: question.passageHtml ? normalizeAssetPaths(question.passageHtml) : "",
      stimulus: question.stimulus || "",
      stimulusHtml: question.stimulusHtml ? normalizeAssetPaths(question.stimulusHtml) : "",
      options: Array.isArray(question.options) ? question.options : [],
      correctIndex: Number.isInteger(question.correctIndex) ? question.correctIndex : 0,
      correctIndexes: Array.isArray(question.correctIndexes) ? question.correctIndexes : [],
      multi: Boolean(question.multi || Array.isArray(question.correctIndexes)),
      explanation: "Answer extracted from the uploaded Set 7 question screenshot."
    }));

    quizData[key] = {
      title: source.label,
      duration: source.duration,
      questions,
      totalOriginal: questions.length
    };
  }

  return quizData;
}

function copySubjectAssets() {
  fs.mkdirSync(localAssetsDir, { recursive: true });
  fs.mkdirSync(publicAssetsDir, { recursive: true });

  for (const source of Object.values(subjectSources)) {
    const assetDir = path.join(sourceRoot, source.dir, "extracted-diagrams");
    if (!fs.existsSync(assetDir)) continue;

    for (const entry of fs.readdirSync(assetDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const sourceFile = path.join(assetDir, entry.name);
      fs.copyFileSync(sourceFile, path.join(localAssetsDir, entry.name));
      fs.copyFileSync(sourceFile, path.join(publicAssetsDir, entry.name));
    }
  }
}

function buildPageHtml(quizData) {
  const titlePrefix = "TEAS Version 7 Set 7";
  const config = {
    titlePrefix,
    defaultSubject: "reading",
    subjects: [
      { key: "reading", label: "Reading" },
      { key: "math", label: "Math" },
      { key: "science", label: "Science" },
      { key: "english", label: "English" }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TEAS Version 7 Set 7 Full Questions | Teas Gurus</title>
  <meta name="description" content="TEAS Version 7 Set 7 full question set with Reading, Math, Science, and English sections." />
  <link rel="stylesheet" href="../../assets/whatsapp-popup.css" />
  <style>
    :root{--text:#4a4a4a;--heading:#333;--blue:#caebfb;--btn:#b6e4e7;--btn-text:#50646b;--dot:#8b8f92;--dot-light:#c1e5fb;--dot-active:#89bce8;--olive:#6b7300;--ok:#e7f7ec;--bad:#fff0f0;--tab:#eef7fb;--tab-active:#d6ecfb}
    *{box-sizing:border-box}
    body{margin:0;font-family:Arial,Helvetica,sans-serif;color:var(--text);background:#fff}
    .exam-shell{max-width:1280px;margin:0 auto;min-height:100vh;padding:34px 32px 42px;display:flex;flex-direction:column}
    .topbar{display:flex;justify-content:space-between;align-items:center;padding:0 10px 16px;margin-bottom:10px;border-bottom:5px solid transparent;border-image:repeating-linear-gradient(135deg,var(--blue) 0 3px,transparent 3px 8px) 12}
    .brand{font-size:18px;font-weight:700;color:#3a3a3a}
    .close{border:none;background:#f8f8f8;color:#444;font-weight:700;font-size:14px;padding:10px 16px;display:flex;align-items:center;gap:6px;text-transform:uppercase}
    .close .x{width:16px;height:16px;border-radius:50%;display:grid;place-items:center;background:#444;color:#fff;line-height:1;font-size:12px}
    .subject-tabs{display:flex;flex-wrap:wrap;gap:10px;padding:0 6px 18px}
    .subject-tab{border:1px solid #d8e8f1;background:var(--tab);color:#44606b;font-weight:700;padding:10px 16px;cursor:pointer}
    .subject-tab.active{background:var(--tab-active);border-color:#b6d8f0}
    .main{flex:1;display:grid;grid-template-columns:minmax(0,1fr);gap:36px;align-items:start;padding:6px 8px 0}
    .top-question-row{display:flex;justify-content:space-between;align-items:flex-start;gap:24px;margin-bottom:18px;padding:0 6px}
    h1{font-family:Georgia,"Times New Roman",serif;color:var(--heading);font-size:28px;margin:0;line-height:1.2}
    .utility{text-align:right;flex:0 0 auto;min-width:195px;display:flex;flex-direction:column;align-items:flex-end;gap:10px}
    .timer-row{display:flex;align-items:center;justify-content:flex-end;gap:14px;width:100%}
    .timer{font-weight:700;white-space:nowrap}
    .timer span{font-weight:400}
    .flag{display:inline-flex;align-items:center;gap:8px;border:1px solid #d6d6d6;background:#fff;padding:11px 16px;color:#555;font-weight:700}
    .flag-icon{width:22px;height:27px;border:3px solid #555;border-top:none;position:relative}
    .flag-icon:before{content:"";position:absolute;left:5px;top:-9px;width:13px;height:24px;background:#555;clip-path:polygon(0 0,100% 0,100% 78%,50% 58%,0 78%)}
    .calc{width:33px;height:43px;border:4px solid var(--olive);position:relative;flex:0 0 auto}
    .calc:before{content:"";position:absolute;left:6px;right:6px;top:5px;height:6px;background:#fff}
    .calc:after{content:"";position:absolute;left:6px;top:18px;width:4px;height:4px;background:#fff;box-shadow:9px 0 #fff,18px 0 #fff,0 9px #fff,9px 9px #fff,18px 9px #fff,0 18px #fff,9px 18px #fff,18px 18px #fff}
    .content-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,520px);gap:36px;align-items:start;padding:6px 8px 0}
    .left-col,.right-col{min-width:0}
    .left-col{padding-top:4px}
    .passage-title{font-weight:700;font-size:18px;color:#444;margin:0 0 14px;text-align:center}
    .passage{font-size:16px;line-height:1.52;color:#595959;padding:0 6px 8px}
    .passage p{margin:0 0 14px}
    .stimulus{font-weight:700;font-size:16px;color:#3d3d3d;margin:0 6px 6px;padding-bottom:5px;border-bottom:1px solid #e5e5e5}
    .question-text{font-size:17px;font-weight:700;color:#333;line-height:1.45;margin:0 6px 26px;max-width:1120px}
    .question-text h3{margin:0 0 14px;font-size:18px}
    .question-text img{max-width:100%;height:auto;display:block}
    .dots{display:flex;flex-wrap:nowrap;gap:14px;align-items:center;margin:0 6px 28px;overflow:hidden}
    .dot{width:7px;height:7px;border-radius:50%;background:var(--dot);box-shadow:21px 0 var(--dot-light)}
    .dot.active{background:var(--dot-active);transform:scale(1.35)}
    .options{display:grid;gap:14px;margin:0 0 22px}
    .option{min-height:56px;display:flex;align-items:center;gap:18px;padding:12px 16px;border:2px solid transparent;cursor:pointer;outline:none}
    .option:hover,.option:focus{border-color:#d7edf9}
    .option.selected{border-color:#b8e1f2;background:#fff}
    .option.correct{background:var(--ok);border-color:#87c99c}
    .option.incorrect{background:var(--bad);border-color:#e4a3a3}
    .control{width:23px;height:23px;border-radius:50%;border:2px solid #d6d6d6;background:#eee;box-shadow:inset 0 1px 3px rgba(0,0,0,.12);flex:0 0 auto}
    .checkbox .control{border-radius:3px}
    .option.selected .control{border:7px solid #6f7378;background:#fff}
    .checkbox.selected .control{border:2px solid #8e8e8e;background:#8e8e8e;position:relative}
    .checkbox.selected .control:after{content:"";position:absolute;left:5px;top:1px;width:7px;height:13px;border:solid white;border-width:0 3px 3px 0;transform:rotate(45deg)}
    .option-text{font-size:16px;line-height:1.35}
    .answer-feedback{display:none;margin:10px 6px 0;padding:12px 14px;border-left:4px solid #70b987;background:#f4fbf6;font-weight:700}
    .answer-feedback.wrong{border-left-color:#d27878;background:#fff7f7}
    .answer-feedback.show{display:block}
    .preview-gate{display:none;margin:0 6px;padding:18px;border:1px solid #dae7ef;background:#f9fcfe}
    .preview-gate h2{margin:0 0 8px;font-size:20px;color:#333}
    .preview-gate p{margin:0 0 14px;line-height:1.5;color:#555}
    .preview-actions{display:flex;flex-wrap:wrap;gap:10px}
    .preview-btn{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;text-decoration:none;font-weight:700;border:1px solid transparent}
    .preview-btn-primary{background:#b6e4e7;color:#50646b}
    .preview-btn-dark{background:#32424a;color:#fff}
    .preview-note{margin-top:12px;color:#667; font-size:13px}
    .nav{margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding:26px 0 0}
    .nav button{border:none;background:var(--btn);color:var(--btn-text);font-size:15px;font-weight:700;text-transform:uppercase;padding:13px 26px;min-width:120px;clip-path:polygon(15px 0,100% 0,calc(100% - 15px) 50%,100% 100%,15px 100%,0 50%)}
    .nav button:disabled{opacity:.45;cursor:not-allowed}
    #prevBtn{clip-path:polygon(0 50%,15px 0,100% 0,100% 100%,15px 100%)}
    .status{font-size:13px;color:#777;text-align:center;padding:0 16px}
    @media(max-width:860px){
      .exam-shell{padding:22px 14px 30px}
      .topbar{padding-inline:0}
      .subject-tabs{padding-inline:0}
      .content-grid{grid-template-columns:1fr}
      .top-question-row{flex-direction:column}
      .utility{width:100%;align-items:flex-start;text-align:left}
      .timer-row{justify-content:flex-start}
      .question-text{font-size:16px}
      .dots{gap:9px}
      .option{padding:12px 10px}
      .nav{gap:12px}
      .status{font-size:12px}
      .nav button{min-width:104px;padding:12px 18px}
    }
  </style>
</head>
<body>
  <div class="exam-shell">
    <header class="topbar">
      <div class="brand" id="brandTitle">TEAS Version 7 Set 7</div>
      <button class="close" type="button"><span class="x">x</span> Close</button>
    </header>
    <div class="subject-tabs" id="subjectTabs"></div>
    <main class="main">
      <div class="top-question-row">
        <h1 id="questionNumber"></h1>
        <div class="utility">
          <div class="timer-row">
            <div class="timer">Time Remaining: <span id="timer">01:00:00</span></div>
            <div class="calc"></div>
          </div>
          <div><button class="flag" type="button"><span class="flag-icon"></span> FLAG</button></div>
        </div>
      </div>
      <div class="content-grid">
        <section class="left-col" id="leftCol">
          <div class="passage-title" id="passageTitle"></div>
          <div class="passage" id="passage"></div>
        </section>
        <section class="right-col">
          <div class="stimulus" id="stimulus"></div>
          <div class="question-text" id="questionText"></div>
          <div class="preview-gate" id="previewGate">
            <h2 id="previewGateTitle"></h2>
            <p id="previewGateCopy"></p>
            <div class="preview-actions">
              <a class="preview-btn preview-btn-primary" href="../../pricing/index.html">Unlock All Questions - $100</a>
              <a class="preview-btn preview-btn-dark" href="../../index.html#practice-tests">View Other Sets</a>
              <a class="preview-btn preview-btn-primary" href="https://wa.me/15795011983" target="_blank" rel="noopener">Take My Teas Exam for Me</a>
            </div>
            <div class="preview-note">Choose View Other Sets to return to the home page.</div>
          </div>
          <div class="dots" id="dots"></div>
          <div class="options" id="options"></div>
          <div class="answer-feedback" id="answerFeedback"></div>
        </section>
      </div>
    </main>
    <nav class="nav">
      <button id="prevBtn" type="button">Previous</button>
      <div class="status" id="status"></div>
      <button id="nextBtn" type="button">Continue</button>
    </nav>
  </div>
  <script src="../../quiz-config.js"></script>
  <script src="../../assets/whatsapp-popup.js" defer></script>
  <script>
    const quizData = ${JSON.stringify(quizData)};
    const quizPageConfig = ${JSON.stringify(config, null, 2)};

    function parseDuration(duration) {
      const parts = String(duration || "00:00:00").split(":").map(Number);
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }

    function formatTime(seconds) {
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      return h + ":" + m + ":" + s;
    }

    function sameArray(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      const left = a.slice().sort((x, y) => x - y);
      const right = b.slice().sort((x, y) => x - y);
      return left.every((value, index) => value === right[index]);
    }

    function getPreviewPercent() {
      const config = window.TEAS_QUIZ_CONFIG || {};
      const percent = Number(config.previewPercent);
      return Number.isFinite(percent) && percent > 0 ? Math.min(percent, 100) : 25;
    }

    function getPreviewLimit(total) {
      return Math.max(1, Math.min(total, Math.ceil(total * getPreviewPercent() / 100)));
    }

    const subjectTabs = document.getElementById("subjectTabs");
    const brandTitle = document.getElementById("brandTitle");
    const questionNumber = document.getElementById("questionNumber");
    const timerEl = document.getElementById("timer");
    const leftCol = document.getElementById("leftCol");
    const passageTitleEl = document.getElementById("passageTitle");
    const passageEl = document.getElementById("passage");
    const stimulusEl = document.getElementById("stimulus");
    const questionTextEl = document.getElementById("questionText");
    const previewGateEl = document.getElementById("previewGate");
    const previewGateTitleEl = document.getElementById("previewGateTitle");
    const previewGateCopyEl = document.getElementById("previewGateCopy");
    const dotsEl = document.getElementById("dots");
    const optionsEl = document.getElementById("options");
    const feedbackEl = document.getElementById("answerFeedback");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const statusEl = document.getElementById("status");
    const mainEl = document.querySelector(".content-grid");

    const state = {};
    const subjectKeys = quizPageConfig.subjects.map((subject) => subject.key);
    subjectKeys.forEach((key) => {
      const duration = parseDuration(quizData[key].duration);
      state[key] = {
        current: 0,
        answers: Array(quizData[key].questions.length).fill(null),
        remaining: duration,
        previewUnlocked: false
      };
    });

    let activeSubject = quizPageConfig.defaultSubject;

    function renderTabs() {
      subjectTabs.innerHTML = quizPageConfig.subjects.map((subject) => {
        return '<button class="subject-tab' + (subject.key === activeSubject ? ' active' : '') + '" type="button" data-subject="' + subject.key + '">' + subject.label + '</button>';
      }).join("");

      subjectTabs.querySelectorAll(".subject-tab").forEach((button) => {
        button.addEventListener("click", function () {
          activeSubject = button.dataset.subject;
          renderTabs();
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }

    function buildDots(active, total) {
      dotsEl.innerHTML = "";
      for (let i = 1; i <= total; i++) {
        const dot = document.createElement("span");
        dot.className = "dot" + (i === active ? " active" : "");
        dotsEl.appendChild(dot);
      }
    }

    function setLayout(item) {
      const hasPassage = Boolean((item.passageTitle || "").trim() || (item.passageHtml || "").trim());
      const hasQuestionHtml = Boolean((item.questionHtml || "").trim());
      leftCol.style.display = hasPassage && !hasQuestionHtml ? "" : "none";
      mainEl.style.gridTemplateColumns = hasPassage && !hasQuestionHtml ? "minmax(0,1fr) minmax(420px,520px)" : "1fr";
    }

    function answerText(item) {
      if (item.multi) {
        return item.correctIndexes.map(function (index) { return item.options[index]; }).join("; ");
      }
      return item.options[item.correctIndex];
    }

    function hasAnswer(item, ans) {
      if (item.multi) return Array.isArray(ans) && ans.length > 0;
      return ans !== null;
    }

    function renderPreviewGate(data, currentIndex) {
      const previewLimit = getPreviewLimit(data.questions.length);
      const locked = previewLimit < data.questions.length && currentIndex >= previewLimit && !state[activeSubject].previewUnlocked;
      previewGateEl.style.display = locked ? "block" : "none";
      previewGateTitleEl.textContent = "You have seen Question " + previewLimit + " of " + data.questions.length;
      previewGateCopyEl.textContent = "You have finished the first " + getPreviewPercent() + "% preview questions in this " + data.title + " section. Unlock all questions for the full set, or return home to view other available sets.";
      return locked;
    }

    function render() {
      const data = quizData[activeSubject];
      const s = state[activeSubject];
      const item = data.questions[s.current];
      const totalOriginal = data.totalOriginal || data.questions.length;
      const locked = renderPreviewGate(data, s.current);

      brandTitle.textContent = quizPageConfig.titlePrefix + " - " + data.title;
      questionNumber.textContent = "Question: " + item.questionNumber + " of " + totalOriginal;
      timerEl.textContent = formatTime(s.remaining);

      const answeredCount = s.answers.filter(function (answer, index) {
        return hasAnswer(data.questions[index], answer);
      }).length;

      passageTitleEl.textContent = item.passageTitle || "";
      passageEl.innerHTML = item.passageHtml || "";
      stimulusEl.innerHTML = item.stimulusHtml || (item.stimulus ? "Stimulus: " + item.stimulus : "");
      questionTextEl.innerHTML = item.questionHtml || (item.question || "").replace(/\n/g, "<br>");
      setLayout(item);

      if (locked) {
        dotsEl.innerHTML = "";
        optionsEl.innerHTML = "";
        feedbackEl.className = "answer-feedback";
        feedbackEl.textContent = "";
        prevBtn.disabled = false;
        nextBtn.disabled = false;
        nextBtn.textContent = "Continue";
        statusEl.textContent = answeredCount + " of " + data.questions.length + " uploaded " + data.title + " questions answered | Source: " + item.sourceFile;
        return;
      }

      buildDots(item.questionNumber, totalOriginal);
      optionsEl.innerHTML = "";

      item.options.forEach(function (opt, index) {
        const answered = s.answers[s.current] !== null;
        const selected = item.multi ? Array.isArray(s.answers[s.current]) && s.answers[s.current].indexOf(index) !== -1 : s.answers[s.current] === index;
        const correct = item.multi ? item.correctIndexes.indexOf(index) !== -1 : index === item.correctIndex;
        let cls = "option" + (item.multi ? " checkbox" : "") + (selected ? " selected" : "");
        if (answered && correct) cls += " correct";
        if (answered && selected && !correct) cls += " incorrect";

        const row = document.createElement("div");
        row.className = cls;
        row.tabIndex = 0;
        const control = document.createElement("span");
        control.className = "control";
        const label = document.createElement("span");
        label.className = "option-text";
        label.textContent = opt;
        row.appendChild(control);
        row.appendChild(label);
        row.addEventListener("click", function () { selectOption(index); });
        row.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectOption(index);
          }
        });
        optionsEl.appendChild(row);
      });

      if (hasAnswer(item, s.answers[s.current])) {
        const ok = item.multi ? sameArray(s.answers[s.current], item.correctIndexes) : s.answers[s.current] === item.correctIndex;
        feedbackEl.className = "answer-feedback show" + (ok ? "" : " wrong");
        feedbackEl.textContent = ok ? "Correct. Answer: " + answerText(item) : "Incorrect. Correct answer: " + answerText(item);
      } else {
        feedbackEl.className = "answer-feedback";
        feedbackEl.textContent = "";
      }

      prevBtn.disabled = s.current === 0;
      nextBtn.textContent = s.current === data.questions.length - 1 ? "Finish" : "Continue";
      statusEl.textContent = answeredCount + " of " + data.questions.length + " uploaded " + data.title + " questions answered | Source: " + item.sourceFile;
    }

    function selectOption(index) {
      const data = quizData[activeSubject];
      const s = state[activeSubject];
      const item = data.questions[s.current];
      if (item.multi) {
        const current = Array.isArray(s.answers[s.current]) ? s.answers[s.current].slice() : [];
        const existing = current.indexOf(index);
        if (existing === -1) current.push(index);
        else current.splice(existing, 1);
        s.answers[s.current] = current.sort(function (a, b) { return a - b; });
      } else {
        s.answers[s.current] = index;
      }
      render();
    }

    prevBtn.addEventListener("click", function () {
      const s = state[activeSubject];
      if (s.current > 0) {
        s.current--;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    nextBtn.addEventListener("click", function () {
      const data = quizData[activeSubject];
      const s = state[activeSubject];
      if (s.current < data.questions.length - 1) {
        s.current++;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert("You have reached the end of the uploaded Set 7 questions.");
      }
    });

    setInterval(function () {
      const s = state[activeSubject];
      if (s.remaining > 0) {
        s.remaining--;
        timerEl.textContent = formatTime(s.remaining);
      }
    }, 1000);

    renderTabs();
    render();
  </script>
</body>
</html>`;
}

function writePage(outputFile, quizData) {
  const html = buildPageHtml(quizData);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html, "utf8");
}

function main() {
  const quizData = buildQuizData();
  copySubjectAssets();
  writePage(path.join(localSetDir, "index.html"), quizData);
  writePage(path.join(publicSetDir, "index.html"), quizData);

  for (const [subject, data] of Object.entries(quizData)) {
    console.log(`${subject}: ${data.questions.length} questions`);
  }
}

main();
