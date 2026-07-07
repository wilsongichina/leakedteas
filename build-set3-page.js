const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = __dirname;
const sourceRoot = path.join(root, "set 3");
const localSetDir = path.join(root, "sets", "set-3");
const publicSetDir = path.join(root, "public", "sets", "set-3");
const localAssetsDir = path.join(localSetDir, "assets");
const publicAssetsDir = path.join(publicSetDir, "assets");

const subjectSources = {
  reading: {
    label: "Reading",
    dir: "READING",
    file: "ATI TEAS Version 7 - Reading - ChatGPT Extracted Questions.html",
    duration: "00:55:00"
  },
  math: {
    label: "Math",
    dir: "MATH",
    file: "ATI TEAS Version 7 - Math - ChatGPT Extracted Questions.html",
    duration: "00:57:00"
  },
  science: {
    label: "Science",
    dir: "SCIENCE",
    file: "ATI TEAS Version 7 - Science Set 5 - ChatGPT Extracted Questions.html",
    duration: "01:00:00"
  },
  english: {
    label: "English",
    dir: "ENGLISH",
    file: "ATI TEAS Version 7 - English and Language Usage - ChatGPT Extracted Questions.html",
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
    .replace(/set3-assets\//g, "assets/")
    .replace(/extracted-diagrams\//g, "assets/");
}

function rewriteSetReferences(html) {
  return String(html || "")
    .replace(/TEAS Version 7 Set 9/g, "TEAS Version 7 Set 3")
    .replace(/Set 9 subject tabs/g, "Set 3 subject tabs")
    .replace(/aria-label="Set 9 subject tabs"/g, 'aria-label="Set 3 subject tabs"')
    .replace(/\/sets\/set-9\//g, "/sets/set-3/")
    .replace(/\.{2}\/sets\/set-9\//g, "../sets/set-3/")
    .replace(/sets\/set-9\//g, "sets/set-3/")
    .replace(/set-9\/index\.html/g, "set-3/index.html")
    .replace(/teas-version-7-set-9/g, "teas-version-7-set-3")
    .replace(/titlePrefix: "TEAS Version 7 Set 9"/, 'titlePrefix: "TEAS Version 7 Set 3"');
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
      explanation: "Answer extracted from the uploaded Set 3 question screenshot."
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

function copyFileIfAvailable(candidates, destinationName) {
  const targetLocal = path.join(localAssetsDir, destinationName);
  const targetPublic = path.join(publicAssetsDir, destinationName);

  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    fs.copyFileSync(candidate, targetLocal);
    fs.copyFileSync(candidate, targetPublic);
    return candidate;
  }

  throw new Error(`Missing required asset for ${destinationName}`);
}

function copySubjectAssets() {
  fs.mkdirSync(localAssetsDir, { recursive: true });
  fs.mkdirSync(publicAssetsDir, { recursive: true });

  const readingDir = path.join(sourceRoot, "READING");
  const scienceDir = path.join(sourceRoot, "SCIENCE", "extracted-diagrams");
  const set2ReadingDir = path.join(root, "Set 2", "ATI TEAS Version 7 - Reading", "extracted-diagrams");

  copyFileIfAvailable(
    [
      path.join(readingDir, "reading-extracted-assets", "q38-phone-system-reference-card.png"),
      path.join(set2ReadingDir, "q32-phone-system.png")
    ],
    "q38-phone-system-reference-card.png"
  );

  copyFileIfAvailable(
    [
      path.join(readingDir, "reading-extracted-assets", "q44-nutrition-facts-label.png"),
      path.join(set2ReadingDir, "q37-nutrition-facts.png")
    ],
    "q44-nutrition-facts-label.png"
  );

  for (const assetName of [
    "q04-respiratory-highlight.png",
    "q08-menstrual-cycle-graph.png",
    "q17-endocrine-diagram.png",
    "q25-respiratory-system.png",
    "q39-cell-diameter.png",
    "q40-female-reproductive-system.png",
    "q46-pulmonary-veins-options.png"
  ]) {
    copyFileIfAvailable([path.join(scienceDir, assetName)], assetName);
  }

  for (const keepFile of [path.join(localAssetsDir, ".gitkeep"), path.join(publicAssetsDir, ".gitkeep")]) {
    if (fs.existsSync(keepFile)) fs.unlinkSync(keepFile);
  }
}

function updateSetPage(templateFile, outputFile, quizData) {
  let html = fs.readFileSync(templateFile, "utf8");
  html = html.replace(/<title>.*?<\/title>/, "<title>TEAS Version 7 Set 3 Full Questions | TG</title>");
  html = html.replace(
    /<meta name="description" content=".*?" \/>/,
    '<meta name="description" content="TEAS Version 7 Set 3 full question list with Reading, Math, Science, and English sections." />'
  );
  html = rewriteSetReferences(html);
  html = html.replace(/const quizData = [\s\S]*?\n\s*const quizPageConfig = /, `const quizData = ${JSON.stringify(quizData)};\n\n    const quizPageConfig = `);
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
