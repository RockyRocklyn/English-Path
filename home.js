// The English Path - Main Application Controller
// Modular, human-readable SPA engine supporting 6 question types, instant 4-part feedback,
// progress analytics, custom reviewer maker, streak tracking, and audio effects.

// Global Application State
let appState = {
  activeView: 'dashboard',
  difficultyFilter: 'all',
  currentQuiz: null,
  matchingState: {
    selectedLeft: null,
    matchedPairs: 0,
    totalPairs: 0,
    userPairs: []
  },
  currentReviewerDefinitions: [],
  currentReviewerQuestions: []
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  audioSFX.init();
  updateHeaderBadges();
  updateSoundIcon();
  navigateTo('dashboard');
});

// Update Header User Details, Streak & XP
function updateHeaderBadges() {
  const user = storage.getUser();
  document.getElementById('header-streak').textContent = user.streakCount || 1;
  document.getElementById('header-xp').textContent = user.xp || 0;
  document.getElementById('header-avatar-emoji').textContent = user.avatar || '🌸';
}

// Audio Toggle Controller
function toggleAudio() {
  const isMuted = audioSFX.toggleMute();
  updateSoundIcon();
  if (!isMuted) audioSFX.playClick();
}

function updateSoundIcon() {
  const icon = document.getElementById('sound-icon');
  if (audioSFX.isMuted) {
    icon.className = 'fa-solid fa-volume-xmark text-pink-300';
  } else {
    icon.className = 'fa-solid fa-volume-high text-pink-600';
  }
}

// ============================================================================
// VIEW NAVIGATION ROUTER
// ============================================================================
function navigateTo(viewName) {
  audioSFX.playClick();
  appState.activeView = viewName;

  // Update Nav Tabs Active State
  const navTabs = ['dashboard', 'topics', 'reviewer', 'progress', 'history'];
  navTabs.forEach(tab => {
    const btn = document.getElementById(`nav-${tab}`);
    if (btn) {
      if (tab === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });

  // Hide all views
  const allViews = ['dashboard-view', 'topics-view', 'quiz-view', 'results-view', 'progress-view', 'reviewer-view', 'history-view'];
  allViews.forEach(vId => {
    const el = document.getElementById(vId);
    if (el) el.classList.add('hidden');
  });

  // Show target view
  const targetView = document.getElementById(`${viewName}-view`);
  if (targetView) targetView.classList.remove('hidden');

  // Trigger View Renderers
  if (viewName === 'dashboard') renderDashboard();
  if (viewName === 'topics') renderTopics();
  if (viewName === 'reviewer') renderReviewers();
  if (viewName === 'progress') renderProgress();
  if (viewName === 'history') renderHistory();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// 1. DASHBOARD VIEW CONTROLLER
// ============================================================================
function renderDashboard() {
  const user = storage.getUser();
  document.getElementById('dash-player-name').textContent = user.name || 'Learner';
  document.getElementById('dash-player-avatar').textContent = user.avatar || '🌸';
  updateHeaderBadges();

  // 1. Render Smart Study Recommendation
  const recs = storage.getSmartRecommendations(quizTopics);
  const recCard = document.getElementById('dash-recommendation-card');
  if (recs.length > 0) {
    const topRec = recs[0];
    document.getElementById('dash-rec-title').textContent = `Recommended: ${topRec.title}`;
    document.getElementById('dash-rec-msg').textContent = topRec.message;
    document.getElementById('dash-rec-btn').onclick = () => startQuiz(topRec.topicId, 'all');
    recCard.classList.remove('hidden');
  } else {
    recCard.classList.add('hidden');
  }

  // 2. Render Topic Mastery Mini Cards
  const masteryGrid = document.getElementById('dash-mastery-grid');
  masteryGrid.innerHTML = '';
  const progressMap = storage.getTopicProgress();

  quizTopics.forEach(topic => {
    const prog = progressMap[topic.id] || { accuracy: 0, completedQuizzes: 0, mastery: 'Unattempted' };
    const accuracy = prog.completedQuizzes > 0 ? prog.accuracy : 0;
    
    const card = document.createElement('div');
    card.className = 'bg-white p-3.5 rounded-2xl border-2 border-pink-200 shadow-sm hover:border-pink-400 transition-all cursor-pointer space-y-2';
    card.onclick = () => startQuiz(topic.id, 'all');

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-sm">
          <i class="${topic.iconClass}"></i>
        </div>
        <span class="text-xs font-black text-pink-700">${accuracy}%</span>
      </div>
      <div>
        <h4 class="text-xs font-bold text-pink-950 font-bubbly truncate">${topic.title}</h4>
        <p class="text-[10px] font-bold text-pink-400 uppercase">${prog.mastery || 'Unattempted'}</p>
      </div>
      <div class="w-full bg-pink-100 rounded-full h-1.5 overflow-hidden">
        <div class="bg-pink-500 h-full rounded-full" style="width: ${accuracy}%"></div>
      </div>
    `;
    masteryGrid.appendChild(card);
  });

  // 3. Render Recent History Snippet
  const history = storage.getHistory();
  const recentContainer = document.getElementById('dash-recent-history');
  recentContainer.innerHTML = '';

  if (history.length === 0) {
    recentContainer.innerHTML = `
      <div class="bg-pink-50/70 p-4 rounded-2xl text-center text-xs font-bold text-pink-500 border border-pink-200">
        No quiz history yet. Start your first quiz today!
      </div>
    `;
  } else {
    history.slice(0, 3).forEach(item => {
      const row = document.createElement('div');
      row.className = 'bg-white p-3 rounded-2xl border border-pink-200 flex items-center justify-between text-xs font-bold text-pink-900 shadow-sm';
      const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      row.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full ${item.accuracy >= 70 ? 'bg-emerald-400' : 'bg-rose-400'}"></span>
          <span>${item.topicTitle}</span>
          <span class="text-[10px] uppercase font-bold text-pink-400 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">${item.difficulty}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-pink-600 font-extrabold">${item.score} pts (${item.accuracy}%)</span>
          <span class="text-pink-400 font-medium">${dateStr}</span>
        </div>
      `;
      recentContainer.appendChild(row);
    });
  }
}

// Quick start random quiz from Dashboard
function quickStartQuiz() {
  const randomTopic = quizTopics[Math.floor(Math.random() * quizTopics.length)];
  startQuiz(randomTopic.id, 'all');
}

function startRecommendedQuiz() {
  const recs = storage.getSmartRecommendations(quizTopics);
  if (recs.length > 0) {
    startQuiz(recs[0].topicId, 'all');
  } else {
    quickStartQuiz();
  }
}

// ============================================================================
// 2. TOPICS SELECTION CONTROLLER
// ============================================================================
function setDifficultyFilter(diff) {
  audioSFX.playClick();
  appState.difficultyFilter = diff;

  ['all', 'beginner', 'intermediate', 'advanced'].forEach(d => {
    const btn = document.getElementById(`diff-${d}`);
    if (btn) {
      if (d === diff) {
        btn.className = 'px-4 py-1.5 rounded-full text-xs font-extrabold border-2 border-pink-400 bg-pink-500 text-white shadow-sm';
      } else {
        btn.className = 'px-4 py-1.5 rounded-full text-xs font-extrabold border-2 border-pink-200 bg-white text-pink-700 hover:bg-pink-50';
      }
    }
  });

  renderTopics();
}

function renderTopics() {
  const container = document.getElementById('topics-list-container');
  container.innerHTML = '';
  const progressMap = storage.getTopicProgress();

  // 1. Render Built-in Topic Cards
  quizTopics.forEach(topic => {
    let filteredQuestions = topic.questions;
    if (appState.difficultyFilter !== 'all') {
      filteredQuestions = topic.questions.filter(q => q.difficulty === appState.difficultyFilter);
    }

    const prog = progressMap[topic.id] || { accuracy: 0, completedQuizzes: 0, mastery: 'Unattempted' };
    const count = filteredQuestions.length;

    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-3xl border-2 border-pink-200 shadow-sm hover:shadow-md hover:border-pink-400 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group';
    card.onclick = () => startQuiz(topic.id, appState.difficultyFilter);

    card.innerHTML = `
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0 border border-pink-200">
          <i class="${topic.iconClass}"></i>
        </div>
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <h3 class="text-lg font-bold text-pink-950 font-bubbly">${topic.title}</h3>
            <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${prog.accuracy >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'}">
              ${prog.mastery || 'Unattempted'}
            </span>
          </div>
          <p class="text-xs font-semibold text-pink-600 leading-relaxed">${topic.description}</p>
          <div class="flex items-center gap-3 pt-1 text-xs font-bold text-pink-500">
            <span><i class="fa-solid fa-layer-group text-pink-400 mr-1"></i> ${count} Questions</span>
            <span>&bull;</span>
            <span><i class="fa-solid fa-circle-check text-emerald-400 mr-1"></i> ${prog.accuracy}% Accuracy</span>
          </div>
        </div>
      </div>

      <div class="bubbly-btn py-2.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center gap-2 whitespace-nowrap self-end md:self-center">
        <span>Start Quiz</span>
        <i class="fa-solid fa-circle-play"></i>
      </div>
    `;
    container.appendChild(card);
  });

  // 2. Render "All Topics Marathon" Card
  const allCard = document.createElement('div');
  allCard.className = 'bg-gradient-to-r from-pink-500 to-rose-500 p-5 rounded-3xl text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group border-2 border-pink-300';
  allCard.onclick = () => startQuiz('all', appState.difficultyFilter);
  allCard.innerHTML = `
    <div class="flex items-center gap-4">
      <div class="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
        <i class="fa-solid fa-flag-checkered"></i>
      </div>
      <div>
        <h3 class="text-lg font-bold text-white font-bubbly">All Topics Grand Marathon</h3>
        <p class="text-xs font-medium text-pink-100">Play a comprehensive mixed quiz across all grammar categories.</p>
      </div>
    </div>
    <div class="bg-white text-pink-600 rounded-full py-2.5 px-6 text-xs font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-2 self-end md:self-center">
      <span>Play Marathon</span>
      <i class="fa-solid fa-play"></i>
    </div>
  `;
  container.appendChild(allCard);

  // 3. Render Custom Reviewer Decks
  const reviewerContainer = document.getElementById('custom-reviewer-decks-container');
  reviewerContainer.innerHTML = '';
  const reviewers = storage.getReviewers();

  if (reviewers.length === 0) {
    reviewerContainer.innerHTML = `
      <div class="col-span-full bg-pink-50/70 p-4 rounded-2xl text-center text-xs font-bold text-pink-500 border border-pink-200">
        No custom reviewers yet. Create one in the Reviewer Maker tab to quiz your custom notes!
      </div>
    `;
  } else {
    reviewers.forEach(rev => {
      const qCount = (rev.customQuestions || []).length;
      const card = document.createElement('div');
      card.className = 'bg-white p-4 rounded-2xl border-2 border-pink-200 shadow-sm hover:border-pink-400 transition-all flex items-center justify-between gap-3';
      
      card.innerHTML = `
        <div class="space-y-0.5">
          <span class="text-[10px] font-black uppercase text-pink-500 bg-pink-100 px-2 py-0.5 rounded-full">${rev.topic || 'Custom Deck'}</span>
          <h4 class="text-sm font-bold text-pink-950 font-bubbly truncate">${rev.title}</h4>
          <p class="text-[11px] font-bold text-pink-400">${qCount} Questions &bull; ${(rev.definitions || []).length} Terms</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openStudyModal('${rev.id}')" class="bubbly-btn-secondary py-1.5 px-3 text-xs font-bold" title="Study Flashcards">
            <i class="fa-solid fa-book-open"></i>
          </button>
          <button onclick="startCustomReviewerQuiz('${rev.id}')" class="bubbly-btn py-1.5 px-3 text-xs font-bold" title="Start Quiz">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      `;
      reviewerContainer.appendChild(card);
    });
  }
}

// ============================================================================
// 3. QUIZ ENGINE CONTROLLER
// ============================================================================
function startQuiz(topicId, difficulty = 'all') {
  audioSFX.playClick();
  let questions = [];
  let topicTitle = '';
  let topicIcon = 'fa-solid fa-shapes';

  if (topicId === 'all') {
    topicTitle = 'All Topics Marathon';
    topicIcon = 'fa-solid fa-flag-checkered';
    questions = quizTopics.flatMap(t => t.questions);
  } else {
    const topic = quizTopics.find(t => t.id === topicId);
    if (!topic) return;
    topicTitle = topic.title;
    topicIcon = topic.iconClass;
    questions = [...topic.questions];
  }

  // Filter by difficulty if specified
  if (difficulty !== 'all') {
    const filtered = questions.filter(q => q.difficulty === difficulty);
    if (filtered.length > 0) questions = filtered;
  }

  // Shuffle questions
  questions.sort(() => Math.random() - 0.5);

  appState.currentQuiz = {
    topicId,
    topicTitle,
    topicIcon,
    difficulty,
    questions,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    answers: [],
    isAnswered: false
  };

  document.getElementById('quiz-topic-title').textContent = topicTitle;
  document.getElementById('quiz-topic-icon').className = topicIcon;
  document.getElementById('quiz-difficulty-badge').textContent = difficulty.toUpperCase();
  document.getElementById('total-q-num').textContent = questions.length;

  navigateTo('quiz');
  renderCurrentQuestion();
}

// Start Quiz with Custom Reviewer Questions
function startCustomReviewerQuiz(reviewerId) {
  const reviewer = storage.getReviewerById(reviewerId);
  if (!reviewer || !reviewer.customQuestions || reviewer.customQuestions.length === 0) {
    alert('This reviewer does not have any custom questions yet. Please add questions in the Reviewer Maker!');
    return;
  }

  const questions = [...reviewer.customQuestions].sort(() => Math.random() - 0.5);

  appState.currentQuiz = {
    topicId: 'custom_' + reviewer.id,
    topicTitle: reviewer.title,
    topicIcon: 'fa-solid fa-bookmark',
    difficulty: 'Custom Deck',
    questions,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    answers: [],
    isAnswered: false
  };

  document.getElementById('quiz-topic-title').textContent = reviewer.title;
  document.getElementById('quiz-topic-icon').className = 'fa-solid fa-bookmark';
  document.getElementById('quiz-difficulty-badge').textContent = 'CUSTOM';
  document.getElementById('total-q-num').textContent = questions.length;

  navigateTo('quiz');
  renderCurrentQuestion();
}

// Render Current Question
function renderCurrentQuestion() {
  const quiz = appState.currentQuiz;
  if (!quiz) return;

  quiz.isAnswered = false;
  const question = quiz.questions[quiz.currentIndex];

  // Update progress numbers & progress bar
  const qNum = quiz.currentIndex + 1;
  const totalNum = quiz.questions.length;
  document.getElementById('current-q-num').textContent = qNum;
  const progressPercent = (qNum / totalNum) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

  // Update question type badge
  const typeMap = {
    'mcq': 'Multiple Choice',
    'fill-blank': 'Fill in the Blank',
    'sentence-correction': 'Sentence Correction',
    'true-false': 'True or False',
    'matching': 'Interactive Matching',
    'short-answer': 'Short Answer'
  };
  document.getElementById('quiz-type-badge').textContent = typeMap[question.type] || 'Question';

  // Format Sentence Box
  const sentenceBox = document.getElementById('question-sentence-box');
  const sentenceEl = document.getElementById('question-sentence');
  
  if (question.sentence) {
    sentenceEl.innerHTML = question.sentence;
    sentenceBox.classList.remove('hidden');
  } else {
    sentenceBox.classList.add('hidden');
  }

  // Set prompt text
  document.getElementById('question-text').textContent = question.questionText;

  // Render Dynamic Question Area based on Type
  const container = document.getElementById('dynamic-question-container');
  container.innerHTML = '';

  switch (question.type) {
    case 'mcq':
    case 'sentence-correction':
      renderMCQQuestion(container, question);
      break;
    case 'fill-blank':
      renderFillBlankQuestion(container, question);
      break;
    case 'true-false':
      renderTrueFalseQuestion(container, question);
      break;
    case 'matching':
      renderMatchingQuestion(container, question);
      break;
    case 'short-answer':
      renderShortAnswerQuestion(container, question);
      break;
    default:
      renderMCQQuestion(container, question);
  }

  // Hide feedback container until user answers
  document.getElementById('feedback-container').classList.add('hidden');
}

// --- Question Type 1 & 3: Multiple Choice & Sentence Correction ---
function renderMCQQuestion(container, question) {
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-3';
  const labels = ['A', 'B', 'C', 'D'];

  question.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn p-4 text-left font-bold text-sm md:text-base flex items-center gap-3';
    btn.id = `opt-btn-${idx}`;
    btn.onclick = () => handleAnswerSubmission(idx);

    btn.innerHTML = `
      <span class="w-7 h-7 rounded-full bg-pink-100 text-pink-600 text-xs font-extrabold flex items-center justify-center flex-shrink-0 border border-pink-300">
        ${labels[idx] || idx + 1}
      </span>
      <span>${optText}</span>
    `;
    grid.appendChild(btn);
  });

  container.appendChild(grid);
}

// --- Question Type 2: Fill in the Blank ---
function renderFillBlankQuestion(container, question) {
  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-4 text-center';

  const choicesContainer = document.createElement('div');
  choicesContainer.className = 'flex flex-wrap items-center justify-center gap-3 pt-2';

  question.options.forEach((opt, idx) => {
    const chip = document.createElement('button');
    chip.className = 'blank-chip text-sm md:text-base';
    chip.id = `blank-chip-${idx}`;
    chip.textContent = opt;
    chip.onclick = () => handleAnswerSubmission(opt, idx);
    choicesContainer.appendChild(chip);
  });

  wrapper.appendChild(choicesContainer);
  container.appendChild(wrapper);
}

// --- Question Type 4: True or False ---
function renderTrueFalseQuestion(container, question) {
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-4 max-w-md mx-auto';

  const trueCard = document.createElement('button');
  trueCard.id = 'tf-true-btn';
  trueCard.className = 'tf-card space-y-2';
  trueCard.onclick = () => handleAnswerSubmission(true);
  trueCard.innerHTML = `
    <div class="text-3xl text-emerald-500"><i class="fa-solid fa-circle-check"></i></div>
    <div class="text-lg font-black text-emerald-700">TRUE</div>
  `;

  const falseCard = document.createElement('button');
  falseCard.id = 'tf-false-btn';
  falseCard.className = 'tf-card space-y-2';
  falseCard.onclick = () => handleAnswerSubmission(false);
  falseCard.innerHTML = `
    <div class="text-3xl text-rose-500"><i class="fa-solid fa-circle-xmark"></i></div>
    <div class="text-lg font-black text-rose-700">FALSE</div>
  `;

  grid.appendChild(trueCard);
  grid.appendChild(falseCard);
  container.appendChild(grid);
}

// --- Question Type 5: Interactive Matching Columns ---
function renderMatchingQuestion(container, question) {
  const pairs = question.pairs || [];
  appState.matchingState = {
    selectedLeft: null,
    matchedPairs: 0,
    totalPairs: pairs.length,
    userPairs: []
  };

  const leftItems = pairs.map((p, i) => ({ id: i, text: p.left }));
  const rightItems = pairs.map((p, i) => ({ id: i, text: p.right })).sort(() => Math.random() - 0.5);

  const wrapper = document.createElement('div');
  wrapper.className = 'space-y-3';

  const helperText = document.createElement('p');
  helperText.className = 'text-xs font-bold text-center text-pink-600';
  helperText.textContent = '👉 Click an item on the Left, then click its corresponding match on the Right:';
  wrapper.appendChild(helperText);

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

  const leftCol = document.createElement('div');
  leftCol.className = 'space-y-2.5';
  leftItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'match-item w-full';
    btn.id = `match-left-${item.id}`;
    btn.onclick = () => selectMatchingLeft(item.id);
    btn.innerHTML = `<span>${item.text}</span> <i class="fa-solid fa-arrow-right text-pink-300 text-xs"></i>`;
    leftCol.appendChild(btn);
  });

  const rightCol = document.createElement('div');
  rightCol.className = 'space-y-2.5';
  rightItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'match-item w-full';
    btn.id = `match-right-${item.id}`;
    btn.onclick = () => selectMatchingRight(item.id);
    btn.innerHTML = `<span>${item.text}</span> <i class="fa-solid fa-link text-pink-300 text-xs"></i>`;
    rightCol.appendChild(btn);
  });

  grid.appendChild(leftCol);
  grid.appendChild(rightCol);
  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

function selectMatchingLeft(leftId) {
  if (appState.currentQuiz.isAnswered) return;
  audioSFX.playClick();

  // Clear existing left selections
  document.querySelectorAll('[id^="match-left-"]').forEach(el => el.classList.remove('selected'));

  appState.matchingState.selectedLeft = leftId;
  const el = document.getElementById(`match-left-${leftId}`);
  if (el) el.classList.add('selected');
}

function selectMatchingRight(rightId) {
  if (appState.currentQuiz.isAnswered) return;
  const leftId = appState.matchingState.selectedLeft;
  if (leftId === null) {
    alert('Please select an item from the Left column first!');
    return;
  }

  audioSFX.playClick();
  const leftEl = document.getElementById(`match-left-${leftId}`);
  const rightEl = document.getElementById(`match-right-${rightId}`);

  const isMatch = leftId === rightId;

  if (isMatch) {
    leftEl.classList.remove('selected');
    leftEl.classList.add('matched');
    rightEl.classList.add('matched');
    leftEl.disabled = true;
    rightEl.disabled = true;
    appState.matchingState.matchedPairs++;
    appState.matchingState.userPairs.push({ leftId, rightId, correct: true });

    // Check if all pairs matched
    if (appState.matchingState.matchedPairs === appState.matchingState.totalPairs) {
      handleAnswerSubmission(true);
    }
  } else {
    // Incorrect match shake
    rightEl.classList.add('incorrect');
    setTimeout(() => {
      rightEl.classList.remove('incorrect');
    }, 500);
  }

  appState.matchingState.selectedLeft = null;
}

// --- Question Type 6: Short Answer ---
function renderShortAnswerQuestion(container, question) {
  const form = document.createElement('form');
  form.className = 'max-w-md mx-auto space-y-3';
  form.onsubmit = (e) => {
    e.preventDefault();
    const val = document.getElementById('short-answer-input').value.trim();
    if (!val) return;
    handleAnswerSubmission(val);
  };

  form.innerHTML = `
    <input 
      type="text" 
      id="short-answer-input" 
      required
      autocomplete="off"
      placeholder="Type your answer here..." 
      class="short-answer-input text-center"
    >
    <button type="submit" id="short-answer-submit-btn" class="bubbly-btn w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2">
      <span>Submit Answer</span>
      <i class="fa-solid fa-paper-plane"></i>
    </button>
  `;

  container.appendChild(form);
  setTimeout(() => {
    const input = document.getElementById('short-answer-input');
    if (input) input.focus();
  }, 100);
}

// ============================================================================
// ANSWER SUBMISSION & 4-PART INSTANT FEEDBACK EVALUATOR
// ============================================================================
function handleAnswerSubmission(userAnswer, optionIdx = null) {
  const quiz = appState.currentQuiz;
  if (!quiz || quiz.isAnswered) return;
  quiz.isAnswered = true;

  const question = quiz.questions[quiz.currentIndex];
  let isCorrect = false;

  // Evaluate based on question type
  switch (question.type) {
    case 'mcq':
    case 'sentence-correction':
      isCorrect = (userAnswer === question.correctAnswer);
      highlightMCQOptions(question, userAnswer);
      break;

    case 'fill-blank':
      isCorrect = (userAnswer === question.correctAnswer);
      highlightFillBlankChips(question, optionIdx, isCorrect);
      break;

    case 'true-false':
      isCorrect = (userAnswer === question.correctAnswer);
      highlightTrueFalseCards(question, userAnswer);
      break;

    case 'matching':
      isCorrect = (userAnswer === true);
      break;

    case 'short-answer':
      const cleanUser = String(userAnswer).toLowerCase().trim();
      const acceptable = (question.acceptableAnswers || [question.correctAnswer]).map(a => String(a).toLowerCase().trim());
      isCorrect = acceptable.includes(cleanUser);
      highlightShortAnswerInput(isCorrect);
      break;

    default:
      isCorrect = (userAnswer === question.correctAnswer);
  }

  // Update Score & Audio
  if (isCorrect) {
    quiz.score += 10;
    quiz.correctCount++;
    audioSFX.playCorrect();
  } else {
    audioSFX.playIncorrect();
  }

  // Record answer attempt
  quiz.answers.push({
    questionText: question.questionText,
    sentence: question.sentence,
    userAnswer,
    correctAnswer: question.correctAnswer,
    isCorrect,
    feedback: question.feedback
  });

  // Render 4-Part Instant Feedback Card
  renderInstantFeedback(isCorrect, question);
}

// Visual Highlighting Helpers
function highlightMCQOptions(question, userIndex) {
  question.options.forEach((_, idx) => {
    const btn = document.getElementById(`opt-btn-${idx}`);
    if (!btn) return;
    btn.disabled = true;
    btn.classList.add('cursor-not-allowed');

    if (idx === question.correctAnswer) {
      btn.classList.add('correct');
    } else if (idx === userIndex) {
      btn.classList.add('incorrect');
    } else {
      btn.classList.add('opacity-50');
    }
  });
}

function highlightFillBlankChips(question, userIdx, isCorrect) {
  question.options.forEach((opt, idx) => {
    const chip = document.getElementById(`blank-chip-${idx}`);
    if (!chip) return;
    chip.disabled = true;
    if (opt === question.correctAnswer) {
      chip.classList.add('correct');
    } else if (idx === userIdx && !isCorrect) {
      chip.classList.add('incorrect');
    } else {
      chip.classList.add('opacity-50');
    }
  });
}

function highlightTrueFalseCards(question, userChoice) {
  const trueBtn = document.getElementById('tf-true-btn');
  const falseBtn = document.getElementById('tf-false-btn');
  if (trueBtn) trueBtn.disabled = true;
  if (falseBtn) falseBtn.disabled = true;

  if (question.correctAnswer === true) {
    if (trueBtn) trueBtn.classList.add('correct');
    if (userChoice === false && falseBtn) falseBtn.classList.add('incorrect');
  } else {
    if (falseBtn) falseBtn.classList.add('correct');
    if (userChoice === true && trueBtn) trueBtn.classList.add('incorrect');
  }
}

function highlightShortAnswerInput(isCorrect) {
  const input = document.getElementById('short-answer-input');
  const btn = document.getElementById('short-answer-submit-btn');
  if (input) {
    input.disabled = true;
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
  }
  if (btn) btn.disabled = true;
}

// Render the 4-Part Instant Feedback Card
function renderInstantFeedback(isCorrect, question) {
  const feedbackBox = document.getElementById('feedback-box');
  const iconBox = document.getElementById('feedback-status-icon-box');
  const icon = document.getElementById('feedback-status-icon');
  const title = document.getElementById('feedback-status-title');
  const sub = document.getElementById('feedback-status-sub');
  
  const ruleText = document.getElementById('feedback-rule-text');
  const exampleText = document.getElementById('feedback-example-text');
  const tipText = document.getElementById('feedback-tip-text');

  if (isCorrect) {
    feedbackBox.className = 'feedback-box correct p-5 md:p-6 space-y-4';
    iconBox.className = 'w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl';
    icon.className = 'fa-solid fa-circle-check';
    title.className = 'text-lg font-black font-bubbly text-emerald-700';
    title.textContent = 'Correct Answer! Spot on!';
    sub.textContent = 'Great work! Here is why this rule works:';
  } else {
    feedbackBox.className = 'feedback-box incorrect p-5 md:p-6 space-y-4';
    iconBox.className = 'w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl';
    icon.className = 'fa-solid fa-circle-xmark';
    title.className = 'text-lg font-black font-bubbly text-rose-700';
    title.textContent = 'Incorrect. Let\'s learn why:';
    sub.textContent = 'Review the rule below to master this concept:';
  }

  // Populate the 3 structured educational parts
  ruleText.textContent = question.feedback?.rule || 'Master this fundamental English grammar concept.';
  exampleText.textContent = question.feedback?.example || question.sentence || 'Review context sentence.';
  tipText.textContent = question.feedback?.tip || 'Practice makes perfect!';

  // Update Next CTA Button Text
  const nextBtnText = document.getElementById('next-btn-text');
  const isLast = (appState.currentQuiz.currentIndex + 1 === appState.currentQuiz.questions.length);
  nextBtnText.textContent = isLast ? 'View Results' : 'Next Question';

  document.getElementById('feedback-container').classList.remove('hidden');
  document.getElementById('feedback-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handle Next Question or Completion
function handleNextQuestion() {
  audioSFX.playClick();
  const quiz = appState.currentQuiz;
  if (!quiz) return;

  if (quiz.currentIndex + 1 < quiz.questions.length) {
    quiz.currentIndex++;
    renderCurrentQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    renderResultsScreen();
  }
}

// ============================================================================
// 4. RESULTS VIEW CONTROLLER
// ============================================================================
function renderResultsScreen() {
  const quiz = appState.currentQuiz;
  if (!quiz) return;

  const total = quiz.questions.length;
  const accuracy = Math.round((quiz.correctCount / total) * 100);

  // Record attempt in LocalStorage
  const { earnedXP } = storage.recordQuizAttempt({
    topicId: quiz.topicId,
    topicTitle: quiz.topicTitle,
    difficulty: quiz.difficulty,
    score: quiz.score,
    totalQuestions: total,
    correctCount: quiz.correctCount,
    accuracy,
    mistakes: quiz.answers.filter(a => !a.isCorrect)
  });

  // Play fanfare
  audioSFX.playVictory();

  // Populate Results Screen
  const user = storage.getUser();
  document.getElementById('results-player-name').textContent = user.name || 'Learner';
  document.getElementById('results-score').textContent = quiz.score;
  document.getElementById('results-accuracy').textContent = `${accuracy}%`;
  document.getElementById('results-xp').textContent = earnedXP;

  // Determine Badge Title
  let badgeText = 'Grammar Champion!';
  if (accuracy === 100) badgeText = '🌟 Flawless Mastery! Perfect Score!';
  else if (accuracy >= 80) badgeText = '⭐ Grammar Star! Outstanding Accuracy!';
  else if (accuracy >= 60) badgeText = '🌱 Great Progress! Keep Practicing!';
  else badgeText = '💡 Keep Learning! Practice Makes Perfect!';
  document.getElementById('results-badge-text').textContent = badgeText;

  // Render Expandable Question Review
  const reviewList = document.getElementById('results-review-list');
  reviewList.innerHTML = '';

  quiz.answers.forEach((ans, i) => {
    const item = document.createElement('div');
    item.className = `p-3.5 rounded-2xl border-2 ${ans.isCorrect ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'} space-y-1.5 text-xs`;
    
    item.innerHTML = `
      <div class="flex items-center justify-between font-black">
        <span class="${ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}">Question ${i + 1}: ${ans.isCorrect ? '✓ Correct' : '✗ Mistake'}</span>
      </div>
      <p class="font-bold text-pink-950">${ans.questionText}</p>
      <p class="text-pink-800 font-semibold italic">${ans.feedback?.rule || ''}</p>
    `;
    reviewList.appendChild(item);
  });

  updateHeaderBadges();
  navigateTo('results');
}

function toggleResultsReview() {
  audioSFX.playClick();
  const list = document.getElementById('results-review-list');
  const icon = document.getElementById('results-review-toggle-icon');
  if (list.classList.contains('hidden')) {
    list.classList.remove('hidden');
    icon.className = 'fa-solid fa-chevron-up';
  } else {
    list.classList.add('hidden');
    icon.className = 'fa-solid fa-chevron-down';
  }
}

function restartCurrentQuiz() {
  if (appState.currentQuiz) {
    startQuiz(appState.currentQuiz.topicId, appState.currentQuiz.difficulty);
  } else {
    navigateTo('topics');
  }
}

// ============================================================================
// 5. PROGRESS TRACKER VIEW CONTROLLER
// ============================================================================
function renderProgress() {
  const history = storage.getHistory();
  const progressMap = storage.getTopicProgress();
  const user = storage.getUser();

  // Top Metrics
  document.getElementById('prog-total-quizzes').textContent = history.length;
  document.getElementById('prog-streak').textContent = `🔥 ${user.streakCount || 1}`;
  document.getElementById('prog-xp').textContent = user.xp || 0;

  const totalAttempted = Object.values(progressMap).reduce((sum, p) => sum + (p.attempted || 0), 0);
  const totalCorrect = Object.values(progressMap).reduce((sum, p) => sum + (p.correct || 0), 0);
  const avgAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  document.getElementById('prog-avg-accuracy').textContent = `${avgAccuracy}%`;

  // Topic Breakdown Cards
  const container = document.getElementById('prog-topics-list');
  container.innerHTML = '';

  const weakTopics = [];

  quizTopics.forEach(topic => {
    const prog = progressMap[topic.id] || { attempted: 0, correct: 0, accuracy: 0, completedQuizzes: 0, mastery: 'Unattempted' };
    const accuracy = prog.completedQuizzes > 0 ? prog.accuracy : 0;

    if (prog.completedQuizzes > 0 && accuracy < 70) {
      weakTopics.push({ topic, accuracy });
    }

    const card = document.createElement('div');
    card.className = 'bg-white p-4 rounded-2xl border-2 border-pink-200 space-y-2 shadow-sm';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center text-lg border border-pink-200">
            <i class="${topic.iconClass}"></i>
          </div>
          <div>
            <h4 class="text-sm font-bold text-pink-950 font-bubbly">${topic.title}</h4>
            <p class="text-xs font-bold text-pink-400">${prog.completedQuizzes} Quizzes Taken &bull; ${prog.correct}/${prog.attempted} Correct</p>
          </div>
        </div>

        <div class="text-right">
          <span class="text-lg font-black text-pink-600 font-bubbly">${accuracy}%</span>
          <p class="text-[10px] font-black uppercase text-pink-500">${prog.mastery || 'Unattempted'}</p>
        </div>
      </div>

      <div class="w-full bg-pink-100 rounded-full h-2.5 overflow-hidden">
        <div class="bg-gradient-to-r from-pink-400 to-pink-600 h-full rounded-full transition-all duration-500" style="width: ${accuracy}%"></div>
      </div>
    `;
    container.appendChild(card);
  });

  // Needs Improvement Box
  const weakBox = document.getElementById('prog-needs-improvement-box');
  const weakList = document.getElementById('prog-weak-topics-list');
  weakList.innerHTML = '';

  if (weakTopics.length > 0) {
    weakBox.classList.remove('hidden');
    weakTopics.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between';
      chip.innerHTML = `
        <span class="text-xs font-bold text-rose-800">${item.topic.title} (${item.accuracy}%)</span>
        <button onclick="startQuiz('${item.topic.id}', 'all')" class="bubbly-btn py-1 px-3 text-[10px] font-bold">
          Review Topic
        </button>
      `;
      weakList.appendChild(chip);
    });
  } else {
    weakBox.classList.add('hidden');
  }
}

// ============================================================================
// 6. PERSONALIZED REVIEWER MAKER CONTROLLER
// ============================================================================
function renderReviewers() {
  const container = document.getElementById('reviewers-cards-container');
  container.innerHTML = '';
  const reviewers = storage.getReviewers();

  if (reviewers.length === 0) {
    container.innerHTML = `
      <div class="col-span-full bg-pink-50 p-8 rounded-3xl text-center space-y-3 border-2 border-pink-200">
        <i class="fa-solid fa-book-open-reader text-4xl text-pink-400"></i>
        <h3 class="text-lg font-bold text-pink-800 font-bubbly">No Custom Reviewers Created Yet</h3>
        <p class="text-xs font-bold text-pink-600">Create your first personalized study reviewer to practice notes, terms, and custom questions!</p>
        <button onclick="openReviewerModal()" class="bubbly-btn py-2.5 px-6 text-xs font-bold">
          + Create Reviewer
        </button>
      </div>
    `;
    return;
  }

  reviewers.forEach(rev => {
    const card = document.createElement('div');
    card.className = 'bg-white p-5 rounded-3xl border-2 border-pink-200 shadow-sm hover:border-pink-400 transition-all space-y-3 flex flex-col justify-between';

    card.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full border border-pink-200">${rev.topic || 'Reviewer'}</span>
          <div class="flex items-center gap-2">
            <button onclick="editReviewer('${rev.id}')" class="text-pink-400 hover:text-pink-700 text-xs font-bold" title="Edit Reviewer">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="handleDeleteReviewer('${rev.id}')" class="text-rose-400 hover:text-rose-700 text-xs font-bold" title="Delete Reviewer">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <h3 class="text-lg font-bold text-pink-950 font-bubbly">${rev.title}</h3>
        <p class="text-xs font-semibold text-pink-800 line-clamp-2 leading-relaxed">${rev.notes || 'No summary notes added.'}</p>

        <div class="flex items-center gap-3 text-xs font-bold text-pink-500 pt-1">
          <span><i class="fa-solid fa-spell-check text-pink-400 mr-1"></i> ${(rev.definitions || []).length} Terms</span>
          <span>&bull;</span>
          <span><i class="fa-solid fa-clipboard-question text-purple-400 mr-1"></i> ${(rev.customQuestions || []).length} Custom Quiz Qs</span>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2 border-t border-pink-100">
        <button onclick="openStudyModal('${rev.id}')" class="bubbly-btn-secondary flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-book-open"></i>
          <span>Study Notes</span>
        </button>
        <button onclick="startCustomReviewerQuiz('${rev.id}')" class="bubbly-btn flex-1 py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-play"></i>
          <span>Quiz Deck</span>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Open Reviewer Creator / Editor Modal
function openReviewerModal(editId = null) {
  audioSFX.playClick();
  document.getElementById('rev-edit-id').value = editId || '';
  document.getElementById('rev-modal-title').textContent = editId ? 'Edit Personalized Reviewer' : 'Create Personalized Reviewer';

  const defContainer = document.getElementById('rev-definitions-container');
  const qContainer = document.getElementById('rev-questions-container');
  defContainer.innerHTML = '';
  qContainer.innerHTML = '';

  if (editId) {
    const rev = storage.getReviewerById(editId);
    if (rev) {
      document.getElementById('rev-title-input').value = rev.title || '';
      document.getElementById('rev-topic-input').value = rev.topic || '';
      document.getElementById('rev-notes-input').value = rev.notes || '';

      (rev.definitions || []).forEach(d => addDefinitionRow(d.term, d.definition));
      (rev.customQuestions || []).forEach(q => addCustomQuestionRow(q));
    }
  } else {
    document.getElementById('rev-title-input').value = '';
    document.getElementById('rev-topic-input').value = '';
    document.getElementById('rev-notes-input').value = '';
    addDefinitionRow();
    addCustomQuestionRow();
  }

  document.getElementById('reviewer-modal').classList.remove('hidden');
}

function closeReviewerModal() {
  audioSFX.playClick();
  document.getElementById('reviewer-modal').classList.add('hidden');
}

// Add Definition Row in Creator Form
function addDefinitionRow(term = '', definition = '') {
  const container = document.getElementById('rev-definitions-container');
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2 def-row';
  row.innerHTML = `
    <input type="text" placeholder="Term (e.g. Gerund)" value="${term}" class="def-term short-answer-input text-xs w-1/3 py-2" required>
    <input type="text" placeholder="Definition / Explanation" value="${definition}" class="def-desc short-answer-input text-xs flex-1 py-2" required>
    <button type="button" onclick="this.parentElement.remove()" class="text-rose-400 hover:text-rose-600 text-sm px-2 font-bold">&times;</button>
  `;
  container.appendChild(row);
}

// Add Custom Question Row in Creator Form
function addCustomQuestionRow(q = null) {
  const container = document.getElementById('rev-questions-container');
  const qCard = document.createElement('div');
  qCard.className = 'bg-white p-3.5 rounded-2xl border border-pink-200 space-y-2.5 q-row text-xs';

  const defaultPrompt = q?.questionText || '';
  const defaultSentence = q?.sentence || '';
  const defaultRule = q?.feedback?.rule || '';
  const defaultAnswer = q?.correctAnswer !== undefined ? q.correctAnswer : '';

  qCard.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="font-black text-pink-700 uppercase">Question Details</span>
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="text-rose-400 hover:text-rose-600 font-bold">&times; Remove</button>
    </div>
    <input type="text" placeholder="Question Prompt (e.g. Identify the verb:)" value="${defaultPrompt}" class="q-prompt short-answer-input text-xs py-2" required>
    <input type="text" placeholder="Context Sentence (e.g. Maria runs every morning.)" value="${defaultSentence}" class="q-sentence short-answer-input text-xs py-2">
    <div class="grid grid-cols-2 gap-2">
      <input type="text" placeholder="Correct Answer (e.g. runs)" value="${defaultAnswer}" class="q-answer short-answer-input text-xs py-2" required>
      <input type="text" placeholder="Explanation & Rule" value="${defaultRule}" class="q-rule short-answer-input text-xs py-2" required>
    </div>
  `;
  container.appendChild(qCard);
}

// Save Reviewer Form Handler
function handleSaveReviewerForm(e) {
  e.preventDefault();
  audioSFX.playClick();

  const editId = document.getElementById('rev-edit-id').value;
  const title = document.getElementById('rev-title-input').value.trim();
  const topic = document.getElementById('rev-topic-input').value.trim();
  const notes = document.getElementById('rev-notes-input').value.trim();

  // Collect Definitions
  const definitions = [];
  document.querySelectorAll('.def-row').forEach(row => {
    const term = row.querySelector('.def-term').value.trim();
    const definition = row.querySelector('.def-desc').value.trim();
    if (term && definition) definitions.push({ term, definition });
  });

  // Collect Custom Questions
  const customQuestions = [];
  document.querySelectorAll('.q-row').forEach((row, i) => {
    const prompt = row.querySelector('.q-prompt').value.trim();
    const sentence = row.querySelector('.q-sentence').value.trim();
    const answer = row.querySelector('.q-answer').value.trim();
    const rule = row.querySelector('.q-rule').value.trim();

    if (prompt && answer) {
      customQuestions.push({
        id: `custom_q_${Date.now()}_${i}`,
        type: 'short-answer',
        questionText: prompt,
        sentence: sentence || prompt,
        correctAnswer: answer,
        acceptableAnswers: [answer],
        feedback: {
          rule: rule || `The correct answer is "${answer}".`,
          example: sentence || prompt,
          tip: 'Review your personalized reviewer notes!'
        }
      });
    }
  });

  const reviewerObj = {
    id: editId || 'rev_' + Date.now(),
    title,
    topic,
    notes,
    definitions,
    customQuestions
  };

  storage.saveReviewer(reviewerObj);
  closeReviewerModal();
  renderReviewers();
}

function editReviewer(id) {
  openReviewerModal(id);
}

function handleDeleteReviewer(id) {
  if (confirm('Are you sure you want to delete this custom reviewer?')) {
    audioSFX.playClick();
    storage.deleteReviewer(id);
    renderReviewers();
  }
}

// Open Flashcard Study Modal
function openStudyModal(reviewerId) {
  audioSFX.playClick();
  const reviewer = storage.getReviewerById(reviewerId);
  if (!reviewer) return;

  document.getElementById('study-title').textContent = reviewer.title;
  document.getElementById('study-category').textContent = reviewer.topic || 'Grammar Reviewer';
  
  const wrapper = document.getElementById('study-cards-wrapper');
  wrapper.innerHTML = '';

  // 1. Notes card
  if (reviewer.notes) {
    const notesCard = document.createElement('div');
    notesCard.className = 'bg-pink-50 p-4 rounded-2xl border border-pink-200 space-y-1';
    notesCard.innerHTML = `
      <span class="text-xs font-black uppercase text-pink-600">Summary Notes</span>
      <p class="text-xs font-bold text-pink-900 leading-relaxed">${reviewer.notes}</p>
    `;
    wrapper.appendChild(notesCard);
  }

  // 2. Definitions Flashcards
  if (reviewer.definitions && reviewer.definitions.length > 0) {
    const defSection = document.createElement('div');
    defSection.className = 'space-y-2 pt-2';
    defSection.innerHTML = `<span class="text-xs font-black uppercase text-pink-700">Vocabulary & Definitions (${reviewer.definitions.length})</span>`;

    reviewer.definitions.forEach(d => {
      const card = document.createElement('div');
      card.className = 'bg-white p-3 rounded-2xl border border-pink-200 shadow-sm space-y-1';
      card.innerHTML = `
        <h4 class="text-xs font-black text-pink-600 font-bubbly">${d.term}</h4>
        <p class="text-xs font-semibold text-pink-900">${d.definition}</p>
      `;
      defSection.appendChild(card);
    });
    wrapper.appendChild(defSection);
  }

  document.getElementById('study-launch-quiz-btn').onclick = () => {
    closeStudyModal();
    startCustomReviewerQuiz(reviewer.id);
  };

  document.getElementById('study-modal').classList.remove('hidden');
}

function closeStudyModal() {
  audioSFX.playClick();
  document.getElementById('study-modal').classList.add('hidden');
}

// ============================================================================
// 7. QUIZ HISTORY VIEW CONTROLLER
// ============================================================================
function renderHistory() {
  const container = document.getElementById('history-list-container');
  container.innerHTML = '';
  const history = storage.getHistory();

  if (history.length === 0) {
    container.innerHTML = `
      <div class="bg-pink-50 p-8 rounded-3xl text-center text-xs font-bold text-pink-500 border border-pink-200">
        No quiz history recorded yet. Complete a quiz to view your score progression!
      </div>
    `;
    return;
  }

  history.forEach(item => {
    const row = document.createElement('div');
    row.className = 'bg-white p-4 rounded-2xl border-2 border-pink-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm';
    const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    row.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl ${item.accuracy >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} flex items-center justify-center text-lg font-black border border-pink-100">
          ${item.accuracy}%
        </div>
        <div>
          <h4 class="text-sm font-bold text-pink-950 font-bubbly">${item.topicTitle}</h4>
          <p class="text-xs font-bold text-pink-400">${dateStr} &bull; <span class="uppercase">${item.difficulty}</span></p>
        </div>
      </div>

      <div class="flex items-center gap-3 self-end sm:self-center">
        <span class="text-sm font-black text-pink-600">${item.score} pts (${item.correctCount}/${item.totalQuestions})</span>
        <button onclick="startQuiz('${item.topicId}', '${item.difficulty}')" class="bubbly-btn py-1.5 px-4 text-xs font-bold">
          Retake
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

// ============================================================================
// 8. PROFILE & AVATAR EDIT CONTROLLER
// ============================================================================
let selectedProfileAvatar = '🌸';

function openProfileModal() {
  audioSFX.playClick();
  const user = storage.getUser();
  document.getElementById('profile-name-input').value = user.name || 'Learner';
  selectedProfileAvatar = user.avatar || '🌸';
  document.getElementById('profile-modal').classList.remove('hidden');
}

function closeProfileModal() {
  audioSFX.playClick();
  document.getElementById('profile-modal').classList.add('hidden');
}

function selectAvatar(emoji) {
  audioSFX.playClick();
  selectedProfileAvatar = emoji;
}

function handleSaveProfile(e) {
  e.preventDefault();
  audioSFX.playClick();
  const name = document.getElementById('profile-name-input').value.trim();
  storage.updateProfile(name, selectedProfileAvatar);
  closeProfileModal();
  updateHeaderBadges();
  if (appState.activeView === 'dashboard') renderDashboard();
}
