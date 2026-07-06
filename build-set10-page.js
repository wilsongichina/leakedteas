const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const sourceRoot = path.join(root, "set 10");
const localSetDir = path.join(root, "sets", "set-10");
const publicSetDir = path.join(root, "public", "sets", "set-10");
const localAssetsDir = path.join(localSetDir, "assets");
const publicAssetsDir = path.join(publicSetDir, "assets");

const subjectSources = {
  reading: {
    label: "Reading",
    dir: "READING",
    file: "ATI TEAS Version 7 - Reading Set 10 - ChatGPT Extracted Questions.html",
    duration: "00:55:00"
  },
  math: {
    label: "Math",
    dir: "MATH",
    file: "ATI TEAS Version 7 - Math Set 10 - ChatGPT Extracted Questions.html",
    duration: "00:57:00"
  },
  science: {
    label: "Science",
    dir: "SCIENCE",
    file: "ATI TEAS Version 7 - Science Set 10 - ChatGPT Extracted Questions.html",
    duration: "01:00:00"
  },
  english: {
    label: "English",
    dir: "ENGLISH",
    file: "ATI TEAS Version 7 - English Set 10 - ChatGPT Extracted Questions.html",
    duration: "00:37:00"
  }
};

function extractQuestions(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(/const questions = ([\s\S]*?\n\];)/);
  if (!match) throw new Error(`Could not find questions array in ${filePath}`);
  return vm.runInNewContext(`(${match[1].replace(/;\s*$/, "")})`);
}

function normalizeAssetPaths(html) {
  return String(html || "").replace(/set10-assets\//g, "assets/");
}

function wrapQuestionHtml(question) {
  const chunks = [];
  if (question.passageTitle) chunks.push(`<h3>${question.passageTitle}</h3>`);
  if (question.passageHtml) chunks.push(question.passageHtml);
  if (question.stimulusHtml && /</.test(question.stimulusHtml)) chunks.push(question.stimulusHtml);
  chunks.push(`<div>${question.question || ""}</div>`);
  return normalizeAssetPaths(chunks.join(""));
}

function buildQuizData() {
  const quizData = {};

  for (const [key, source] of Object.entries(subjectSources)) {
    const filePath = path.join(sourceRoot, source.dir, source.file);
    const questions = extractQuestions(filePath).map((question, index) => ({
      skill: source.label,
      sourceNumber: String(question.sourceNumber || question.source || question.number || ""),
      questionNumber: Number(question.number || index + 1),
      question: wrapQuestionHtml(question),
      options: Array.isArray(question.options) ? question.options : [],
      correct: Number.isInteger(question.correctIndex) ? question.correctIndex : 0,
      explanation: "Answer extracted from the uploaded Set 10 question screenshot."
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
    const assetDir = path.join(sourceRoot, source.dir, "set10-assets");
    if (!fs.existsSync(assetDir)) continue;

    for (const entry of fs.readdirSync(assetDir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const sourceFile = path.join(assetDir, entry.name);
      fs.copyFileSync(sourceFile, path.join(localAssetsDir, entry.name));
      fs.copyFileSync(sourceFile, path.join(publicAssetsDir, entry.name));
    }
  }

  for (const keepFile of [path.join(localAssetsDir, ".gitkeep"), path.join(publicAssetsDir, ".gitkeep")]) {
    if (fs.existsSync(keepFile)) fs.unlinkSync(keepFile);
  }
}

function updateSetPage(templateFile, outputFile, quizData) {
  let html = fs.readFileSync(templateFile, "utf8");
  html = html.replace(/<title>.*?<\/title>/, "<title>TEAS Version 7 Set 10 Full Questions | Teas Gurus</title>");
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    '<meta name="description" content="TEAS Version 7 Set 10 full question list with Reading, Math, Science, and English sections." />'
  );
  html = html.replace(/TEAS Version 7 Set 9/g, "TEAS Version 7 Set 10");
  html = html.replace(/Set 9 subject tabs/g, "Set 10 subject tabs");
  html = html.replace(/const quizData = [\s\S]*?\n\s*const quizPageConfig = /, `const quizData = ${JSON.stringify(quizData)};\n\n    const quizPageConfig = `);
  html = html.replace(/titlePrefix: "TEAS Version 7 Set 9"/, 'titlePrefix: "TEAS Version 7 Set 10"');
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, html);
}

function main() {
  const quizData = buildQuizData();
  copySubjectAssets();
  updateSetPage(path.join(root, "sets", "set-9", "index.html"), path.join(localSetDir, "index.html"), quizData);
  updateSetPage(path.join(root, "public", "sets", "set-9", "index.html"), path.join(publicSetDir, "index.html"), quizData);

  for (const [subject, data] of Object.entries(quizData)) {
    console.log(`${subject}: ${data.questions.length} questions`);
  }
}

main();
