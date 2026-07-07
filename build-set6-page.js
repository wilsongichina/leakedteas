const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const sourceRoot = path.join(root, "set 6");
const localSetDir = path.join(root, "sets", "set-6");
const publicSetDir = path.join(root, "public", "sets", "set-6");

const subjectSources = {
  reading: {
    label: "Reading",
    dir: "Reading",
    file: "ATI TEAS Version 7 - Reading Set 6 - ChatGPT Extracted Questions.html",
    duration: "00:55:00"
  },
  math: {
    label: "Math",
    dir: "Math",
    file: "ATI TEAS Version 7 - Math Set 6 - ChatGPT Extracted Questions.html",
    duration: "00:57:00"
  },
  science: {
    label: "Science",
    dir: "Science",
    file: "ATI TEAS Version 7 - Science Set 6 - ChatGPT Extracted Questions.html",
    duration: "01:00:00"
  },
  english: {
    label: "English",
    dir: "English",
    file: "ATI TEAS Version 7 - English Set 6 - ChatGPT Extracted Questions.html",
    duration: "00:37:00"
  }
};

function extractQuestions(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(/const questions\s*=\s*([\s\S]*?\n\];?)/);
  if (!match) throw new Error(`Could not find questions array in ${filePath}`);
  return vm.runInNewContext(`(${match[1].replace(/;\s*$/, "")})`);
}

function normalizeAssetPaths(html) {
  return String(html || "")
    .replace(/reading-extracted-assets\//g, "assets/")
    .replace(/set6-assets\//g, "assets/")
    .replace(/extracted-diagrams\//g, "assets/");
}

function rewriteSetReferences(html) {
  return String(html || "")
    .replace(/TEAS Version 7 Set 9/g, "TEAS Version 7 Set 6")
    .replace(/Set 9 subject tabs/g, "Set 6 subject tabs")
    .replace(/aria-label="Set 9 subject tabs"/g, 'aria-label="Set 6 subject tabs"')
    .replace(/\/sets\/set-9\//g, "/sets/set-6/")
    .replace(/\.{2}\/sets\/set-9\//g, "../sets/set-6/")
    .replace(/sets\/set-9\//g, "sets/set-6/")
    .replace(/set-9\/index\.html/g, "set-6/index.html")
    .replace(/teas-version-7-set-9/g, "teas-version-7-set-6")
    .replace(/titlePrefix: "TEAS Version 7 Set 9"/, 'titlePrefix: "TEAS Version 7 Set 6"');
}

function wrapQuestionHtml(question) {
  const chunks = [];
  if (question.passageTitle) chunks.push(`<h3>${question.passageTitle}</h3>`);
  if (question.passageHtml) chunks.push(question.passageHtml);
  if (question.stimulusHtml && /</.test(question.stimulusHtml)) chunks.push(question.stimulusHtml);
  chunks.push(`<div>${question.question || ""}</div>`);
  return normalizeAssetPaths(chunks.join(""));
}

function getCorrectIndex(question) {
  if (Number.isInteger(question.correctIndex)) return question.correctIndex;
  if (Array.isArray(question.correctIndexes) && Number.isInteger(question.correctIndexes[0])) {
    return question.correctIndexes[0];
  }
  return 0;
}

function buildQuizData() {
  const quizData = {};

  for (const [key, source] of Object.entries(subjectSources)) {
    const filePath = path.join(sourceRoot, source.dir, source.file);
    const questions = extractQuestions(filePath).map((question, index) => ({
      skill: source.label,
      sourceNumber: String(question.sourceFile || question.sourceNumber || question.source || question.number || ""),
      questionNumber: Number(question.number || index + 1),
      question: wrapQuestionHtml(question),
      image: "",
      imageAlt: "",
      options: Array.isArray(question.options) ? question.options : [],
      correct: getCorrectIndex(question),
      explanation: "Answer extracted from the uploaded Set 6 question screenshot."
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

function updateSetPage(templateFile, outputFile, quizData) {
  let html = fs.readFileSync(templateFile, "utf8");
  html = html.replace(/<title>.*?<\/title>/, "<title>TEAS Version 7 Set 6 Full Questions | TG</title>");
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    '<meta name="description" content="TEAS Version 7 Set 6 full question list with Reading, Math, Science, and English sections." />'
  );
  html = rewriteSetReferences(html);
  html = html.replace(/const quizData = [\s\S]*?\n\s*const quizPageConfig = /, `const quizData = ${JSON.stringify(quizData)};\n\n    const quizPageConfig = `);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html);
}

function main() {
  const quizData = buildQuizData();
  updateSetPage(path.join(root, "sets", "set-9", "index.html"), path.join(localSetDir, "index.html"), quizData);
  updateSetPage(path.join(root, "public", "sets", "set-9", "index.html"), path.join(publicSetDir, "index.html"), quizData);

  for (const [subject, data] of Object.entries(quizData)) {
    console.log(`${subject}: ${data.questions.length} questions`);
  }
}

main();
