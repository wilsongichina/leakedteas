/*
  Common TEAS question page container.

  Use this file as the shared structure when generating Set 1-10 pages.
  Each generated page should provide:

  - quizData
  - quizPageConfig
  - Existing page elements:
    brandTitle, progressLine, timer, allQuestions, .subject-tabs
*/

function normalizeQuizData(sourceData) {
  return Object.entries(sourceData).reduce((normalized, [subject, subjectData]) => {
    const questions = Array.isArray(subjectData.questions) ? subjectData.questions : [];

    normalized[subject] = {
      title: subjectData.title || subject.charAt(0).toUpperCase() + subject.slice(1),
      duration: subjectData.duration || "00:00:00",
      totalOriginal: subjectData.totalOriginal || questions.length,
      questions: questions.map((question, index) => ({
        questionNumber: question.questionNumber || index + 1,
        question: question.question || "",
        image: question.image || "",
        imageAlt: question.imageAlt || "",
        options: Array.isArray(question.options) ? question.options : [],
        correct: Number.isInteger(question.correct) ? question.correct : 0,
        explanation: question.explanation || ""
      }))
    };

    return normalized;
  }, {});
}

function createQuizContainer(sourceData, config) {
  const data = normalizeQuizData(sourceData);
  const configuredSubjects = Array.isArray(config.subjects) ? config.subjects : [];
  const subjects = (configuredSubjects.length ? configuredSubjects : Object.keys(data).map((key) => ({ key })))
    .filter(({ key }) => data[key])
    .map(({ key, label }) => ({ key, label: label || data[key].title || key }));

  return {
    titlePrefix: config.titlePrefix || "TEAS Practice",
    defaultSubject: data[config.defaultSubject] ? config.defaultSubject : subjects[0]?.key,
    subjects,
    data
  };
}

function parseDuration(duration) {
  const [h, m, s] = duration.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

function formatTime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function createQuizState(quizContainer) {
  const state = {};

  quizContainer.subjects.forEach(({ key }) => {
    state[key] = {
      answers: Array(quizContainer.data[key].questions.length).fill(null),
      flagged: Array(quizContainer.data[key].questions.length).fill(false),
      remaining: parseDuration(quizContainer.data[key].duration),
      submitted: false
    };
  });

  return state;
}

function getPreviewLimit(total) {
  const config = window.TEAS_QUIZ_CONFIG || {};
  const percent = Number(config.previewPercent);
  const normalizedPercent = Number.isFinite(percent) && percent > 0 ? Math.min(percent, 100) : 25;
  return Math.max(1, Math.min(total, Math.ceil(total * normalizedPercent / 100)));
}

function getPreviewPercent() {
  const config = window.TEAS_QUIZ_CONFIG || {};
  const percent = Number(config.previewPercent);
  return Number.isFinite(percent) && percent > 0 ? Math.min(percent, 100) : 25;
}

function scrollToQuestion(target) {
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}
