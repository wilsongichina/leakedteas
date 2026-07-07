const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const sourceRoot = path.join(root, "set 7");
const localSetDir = path.join(root, "sets", "set-7");
const publicSetDir = path.join(root, "public", "sets", "set-7");
const localAssetsDir = path.join(localSetDir, "assets");
const publicAssetsDir = path.join(publicSetDir, "assets");
const templateFile = path.join(root, "sets", "set-10", "index.html");

const subjectSources = {
  reading: { label: "Reading", dir: "Reading", file: "Sample.html", duration: "00:55:00" },
  math: { label: "Math", dir: "Math", file: "Sample.html", duration: "00:57:00" },
  science: { label: "Science", dir: "Science", file: "Sample.html", duration: "01:00:00" },
  english: { label: "English", dir: "English", file: "Sample.html", duration: "00:37:00" }
};

function extractQuestions(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const start = html.indexOf("const questions");
  if (start < 0) throw new Error(`Could not find questions array in ${filePath}`);
  const arrayStart = html.indexOf("[", start);
  if (arrayStart < 0) throw new Error(`Could not find questions array start in ${filePath}`);

  const endMarker = "];const totalQuestions";
  let arrayEnd = html.indexOf(endMarker, arrayStart);
  if (arrayEnd < 0) arrayEnd = html.indexOf("];", arrayStart);
  if (arrayEnd < 0) throw new Error(`Could not find questions array end in ${filePath}`);

  return vm.runInNewContext(`(${html.slice(arrayStart, arrayEnd + 1)})`);
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
    const questions = extractQuestions(filePath).map((question, index) => {
      const correctIndexes = Array.isArray(question.correctIndexes)
        ? question.correctIndexes.filter((value) => Number.isInteger(value))
        : [];
      const multi = Boolean(question.multi || correctIndexes.length > 0);
      const correctIndex = Number.isInteger(question.correctIndex)
        ? question.correctIndex
        : (correctIndexes[0] ?? 0);

      return {
        skill: source.label,
        sourceNumber: String(question.sourceFile || question.sourceNumber || question.source || question.number || ""),
        questionNumber: Number(question.number || question.questionNumber || index + 1),
        question: buildQuestionHtml(question),
        options: Array.isArray(question.options) ? question.options : [],
        correct: correctIndex,
        correctIndexes,
        multi,
        explanation: "Answer extracted from the uploaded Set 7 question screenshot."
      };
    });

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

function patchTemplate(html, quizData) {
  html = html.replace(/TEAS Version 7 Set 10/g, "TEAS Version 7 Set 7");
  html = html.replace(/Set 10 subject tabs/g, "Set 7 subject tabs");
  html = html.replace(
    /const quizData = [\s\S]*?;\s*\n\s*const quizPageConfig =/,
    `const quizData = ${JSON.stringify(quizData)};\n\n    const quizPageConfig =`
  );

  html = html.replace(
    /questions: questions\.map\(\(question, index\) => \(\{\n\s*questionNumber: question\.questionNumber \|\| index \+ 1,\n\s*question: question\.question \|\| "",\n\s*image: question\.image \|\| "",\n\s*imageAlt: question\.imageAlt \|\| "",\n\s*options: Array\.isArray\(question\.options\) \? question\.options : \[\],\n\s*correct: Number\.isInteger\(question\.correct\) \? question\.correct : 0,\n\s*explanation: question\.explanation \|\| ""\n\s*\}\)\)/,
    `questions: questions.map((question, index) => ({
            questionNumber: question.questionNumber || index + 1,
            question: question.question || "",
            image: question.image || "",
            imageAlt: question.imageAlt || "",
            options: Array.isArray(question.options) ? question.options : [],
            correct: Number.isInteger(question.correct) ? question.correct : 0,
            correctIndexes: Array.isArray(question.correctIndexes) ? question.correctIndexes : [],
            multi: Boolean(question.multi || Array.isArray(question.correctIndexes)),
            explanation: question.explanation || ""
          }))`
  );

  html = html.replace(
    /function formatTime\(seconds\) \{\n\s*const h = String\(Math\.floor\(seconds \/ 3600\)\)\.padStart\(2, "0"\);\n\s*const m = String\(Math\.floor\(\(seconds % 3600\) \/ 60\)\)\.padStart\(2, "0"\);\n\s*const s = String\(seconds % 60\)\.padStart\(2, "0"\);\n\s*return `\$\{h\}:\$\{m\}:\$\{s\}`;\n\s*\}/,
    `function formatTime(seconds) {
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      return \`\${h}:\${m}:\${s}\`;
    }

    function sameArray(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
      const left = a.slice().sort((x, y) => x - y);
      const right = b.slice().sort((x, y) => x - y);
      return left.every((value, index) => value === right[index]);
    }`
  );

  html = html.replace(
    /const selected = s\.answers\[qIndex\];/,
    `const selected = s.answers[qIndex];
        const isMulti = Boolean(item.multi || Array.isArray(item.correctIndexes));`
  );

  html = html.replace(
    /const options = item\.options\.map\(\(option, index\) => \{[\s\S]*?\}\)\.join\("\"\);/,
    `const options = item.options.map((option, index) => {
          const answered = isMulti ? Array.isArray(selected) && selected.length > 0 : selected !== null;
          const isSelected = isMulti ? Array.isArray(selected) && selected.indexOf(index) !== -1 : selected === index;
          const isCorrectOption = isMulti ? Array.isArray(item.correctIndexes) && item.correctIndexes.indexOf(index) !== -1 : index === item.correct;
          let cls = "option" + (isMulti ? " checkbox" : "");
          if (isSelected) cls += " selected";
          if (answered && isCorrectOption) cls += " correct";
          if (answered && isSelected && !isCorrectOption) cls += " incorrect";
          return \`
            <button class="\${cls}" type="button" data-question="\${qIndex}" data-option="\${index}" \${isLocked ? "tabindex=\\\"-1\\\"" : ""}>
              <span class="radio"></span>
              <span class="option-text">\${String.fromCharCode(65 + index)}. \${option}</span>
            </button>
          \`;
        }).join("");`
  );

  html = html.replace(
    /const feedbackVisible = selected !== null;\n\s*const correctText = item\.options\[item\.correct\];\n\s*const isCorrect = selected === item\.correct;\n\s*const feedbackClass = "answer-feedback" \+ \(feedbackVisible \? " show" : ""\) \+ \(!isCorrect && feedbackVisible \? " wrong" : ""\);\n\s*const feedbackText = feedbackVisible\n\s*\? `\$\{isCorrect \? "Correct\." : "Incorrect\."\} Correct answer: \$\{correctText\}<br>\$\{item\.explanation\}`\n\s*: "";/,
    `const feedbackVisible = isMulti ? Array.isArray(selected) && selected.length > 0 : selected !== null;
        const correctIndexes = Array.isArray(item.correctIndexes) && item.correctIndexes.length ? item.correctIndexes : [item.correct];
        const correctText = correctIndexes.map((index) => item.options[index]).join(", ");
        const isCorrect = isMulti ? sameArray(selected || [], correctIndexes) : selected === item.correct;
        const feedbackClass = "answer-feedback" + (feedbackVisible ? " show" : "") + (!isCorrect && feedbackVisible ? " wrong" : "");
        const feedbackText = feedbackVisible
          ? \`\${isCorrect ? "Correct." : "Incorrect."} Correct answer: \${correctText}<br>\${item.explanation}\`
          : "";`
  );

  html = html.replace(
    /state\[activeSubject\]\.answers\[qIndex\] = optionIndex;\n\s*render\(\);/,
    `const item = quizContainer.data[activeSubject].questions[qIndex];
          if (item.multi || Array.isArray(item.correctIndexes)) {
            const current = Array.isArray(state[activeSubject].answers[qIndex]) ? state[activeSubject].answers[qIndex].slice() : [];
            const existing = current.indexOf(optionIndex);
            if (existing === -1) current.push(optionIndex);
            else current.splice(existing, 1);
            state[activeSubject].answers[qIndex] = current.sort((a, b) => a - b);
          } else {
            state[activeSubject].answers[qIndex] = optionIndex;
          }
          render();`
  );

  html = html.replace(
    /<title>TEAS Version 7 Set 10 Full Questions \| TG<\/title>/,
    "<title>TEAS Version 7 Set 7 Full Questions | TG</title>"
  );
  html = html.replace(
    /content="TEAS Version 7 Set 10 full question list with Reading, Math, Science, and English sections\."/,
    'content="TEAS Version 7 Set 7 full question list with Reading, Math, Science, and English sections."'
  );

  return html;
}

function writePage(outputFile, quizData) {
  const template = fs.readFileSync(templateFile, "utf8");
  const html = patchTemplate(template, quizData);
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
