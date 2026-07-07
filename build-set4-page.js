const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const sourceRoot = path.join(root, "Set 4");
const localSetDir = path.join(root, "sets", "set-4");
const publicSetDir = path.join(root, "public", "sets", "set-4");
const localAssetsDir = path.join(localSetDir, "assets");
const publicAssetsDir = path.join(publicSetDir, "assets");

const subjectSources = {
  reading: {
    label: "Reading",
    dir: "ATI TEAS Version 7 - Reading",
    file: "ATI TEAS Version 7 - Reading Set 4 - ChatGPT Extracted Questions.html",
    duration: "00:55:00"
  },
  math: {
    label: "Math",
    dir: "ATI TEAS Version 7 - Math",
    file: "ATI TEAS Version 7 - Math Set 4 - ChatGPT Extracted Questions.html",
    duration: "00:57:00"
  },
  science: {
    label: "Science",
    dir: "ATI TEAS Version 7 - Science",
    file: "ATI TEAS Version 7 - Science Set 4 - ChatGPT Extracted Questions.html",
    duration: "01:00:00"
  },
  english: {
    label: "English",
    dir: "ATI TEAS Version 7 - English",
    file: "ATI TEAS Version 7 - English Set 4 - ChatGPT Extracted Questions.html",
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
    .replace(/set4-assets\//g, "assets/")
    .replace(/extracted-diagrams\//g, "assets/");
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
      options: Array.isArray(question.options) ? question.options : [],
      correct: getCorrectIndex(question),
      explanation: "Answer extracted from the uploaded Set 4 question screenshot."
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

function copyDirectoryAssets(sourceDir) {
  if (!fs.existsSync(sourceDir)) return;

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourceFile = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryAssets(sourceFile);
      continue;
    }
    if (!entry.isFile() || !/\.(png|jpe?g|gif|webp|svg)$/i.test(entry.name)) continue;
    fs.copyFileSync(sourceFile, path.join(localAssetsDir, entry.name));
    fs.copyFileSync(sourceFile, path.join(publicAssetsDir, entry.name));
  }
}

function copySubjectAssets() {
  fs.mkdirSync(localAssetsDir, { recursive: true });
  fs.mkdirSync(publicAssetsDir, { recursive: true });

  for (const source of Object.values(subjectSources)) {
    copyDirectoryAssets(path.join(sourceRoot, source.dir, "set4-assets"));
    copyDirectoryAssets(path.join(sourceRoot, source.dir, "extracted-diagrams"));
  }

  for (const keepFile of [path.join(localAssetsDir, ".gitkeep"), path.join(publicAssetsDir, ".gitkeep")]) {
    if (fs.existsSync(keepFile)) fs.unlinkSync(keepFile);
  }
}

function updateSetPage(templateFile, outputFile, quizData) {
  let html = fs.readFileSync(templateFile, "utf8");
  html = html.replace(/<title>.*?<\/title>/, "<title>TEAS Version 7 Set 4 Full Questions | TG</title>");
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    '<meta name="description" content="TEAS Version 7 Set 4 full question list with Reading, Math, Science, and English sections." />'
  );
  html = html.replace(/TEAS Version 7 Set 9/g, "TEAS Version 7 Set 4");
  html = html.replace(/Set 9 subject tabs/g, "Set 4 subject tabs");
  html = html.replace(/const quizData = [\s\S]*?\n\s*const quizPageConfig = /, `const quizData = ${JSON.stringify(quizData)};\n\n    const quizPageConfig = `);
  html = html.replace(/titlePrefix: "TEAS Version 7 Set 9"/, 'titlePrefix: "TEAS Version 7 Set 4"');
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
