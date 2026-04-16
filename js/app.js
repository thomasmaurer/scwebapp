/* =============================================
   App Orchestrator
   
   Ties together questions, scoring, swipe UI,
   and results rendering. Entry point.
   ============================================= */

(function () {
  'use strict';

  // ── DOM References ───────────────────────────
  const welcomeScreen  = document.getElementById('welcomeScreen');
  const questionScreen = document.getElementById('questionScreen');
  const resultsScreen  = document.getElementById('resultsScreen');
  const startBtn       = document.getElementById('startBtn');
  const btnYes         = document.getElementById('btnYes');
  const btnNo          = document.getElementById('btnNo');
  const btnUndo        = document.getElementById('btnUndo');
  const themeToggle    = document.getElementById('themeToggle');
  const progressFill   = document.getElementById('progressFill');
  const progressText   = document.getElementById('progressText');
  const categoryBadge  = document.getElementById('categoryBadge');
  const cardContainer  = document.getElementById('cardContainer');
  const resultsContent = document.getElementById('resultsContent');

  // ── State ────────────────────────────────────
  let currentIndex = 0;
  let engine = null;
  let swipeCtrl = null;
  let renderer = null;

  // ── Theme Toggle ─────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('scw-theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('scw-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('scw-theme', 'dark');
    }
  });

  // ── Screen Navigation ────────────────────────
  function showScreen(screen) {
    welcomeScreen.classList.remove('active');
    questionScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    screen.classList.add('active');
  }

  // ── Card Rendering ───────────────────────────
  function createCardElement(question, index) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.dataset.questionId = question.id;

    card.innerHTML = `
      <div class="card-overlay card-overlay-yes">
        <span class="card-overlay-label">YES</span>
      </div>
      <div class="card-overlay card-overlay-no">
        <span class="card-overlay-label">NO</span>
      </div>
      <div class="card-question-number">Question ${index + 1} of ${QUESTIONS.length}</div>
      <div class="card-question-text">${escapeHtml(question.text)}</div>
      <div class="card-question-context">${escapeHtml(question.context)}</div>
    `;

    return card;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /** Render the card stack (top + next + behind) */
  function renderCards() {
    cardContainer.innerHTML = '';

    // Behind card (current + 2)
    if (currentIndex + 2 < QUESTIONS.length) {
      const behind = createCardElement(QUESTIONS[currentIndex + 2], currentIndex + 2);
      behind.classList.add('behind-card');
      cardContainer.appendChild(behind);
    }

    // Next card (current + 1)
    if (currentIndex + 1 < QUESTIONS.length) {
      const next = createCardElement(QUESTIONS[currentIndex + 1], currentIndex + 1);
      next.classList.add('next-card');
      cardContainer.appendChild(next);
    }

    // Top card (current)
    if (currentIndex < QUESTIONS.length) {
      const top = createCardElement(QUESTIONS[currentIndex], currentIndex);
      top.classList.add('top-card', 'entering');
      // Remove entering class after animation so it won't block exit animations
      top.addEventListener('animationend', () => {
        top.classList.remove('entering');
      }, { once: true });
      cardContainer.appendChild(top);

      // Attach swipe controller
      swipeCtrl.attachTo(top);
    }

    // Update category badge
    if (currentIndex < QUESTIONS.length) {
      categoryBadge.innerHTML = `<span>${escapeHtml(QUESTIONS[currentIndex].category)}</span>`;
    }
  }

  // ── Progress ─────────────────────────────────
  function updateProgress() {
    const pct = (currentIndex / QUESTIONS.length) * 100;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${currentIndex} / ${QUESTIONS.length}`;
    btnUndo.disabled = engine.answers.length === 0;
  }

  // ── Swipe Handler ────────────────────────────
  function handleSwipe(direction) {
    const answer = direction === 'right' ? 'yes' : 'no';
    engine.recordAnswer(QUESTIONS[currentIndex].id, answer);
    currentIndex++;

    if (currentIndex >= QUESTIONS.length) {
      showResults();
    } else {
      renderCards();
      updateProgress();
    }
  }

  // ── Undo ─────────────────────────────────────
  function handleUndo() {
    const undone = engine.undoLast();
    if (!undone) return;

    currentIndex--;
    renderCards();
    updateProgress();
  }

  // ── Results ──────────────────────────────────
  function showResults() {
    showScreen(resultsScreen);
    const recommendations = engine.getRecommendations();
    const hybridCombos = engine.getHybridRecommendation(recommendations);
    renderer.render(recommendations, hybridCombos, handleRestart);
  }

  // ── Restart ──────────────────────────────────
  function handleRestart() {
    currentIndex = 0;
    engine.reset();
    showScreen(welcomeScreen);
  }

  // ── Keyboard Support ─────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!questionScreen.classList.contains('active')) return;
    if (currentIndex >= QUESTIONS.length) return;

    if (e.key === 'ArrowLeft' || e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      swipeCtrl.triggerSwipe('left');
    } else if (e.key === 'ArrowRight' || e.key === 'y' || e.key === 'Y') {
      e.preventDefault();
      swipeCtrl.triggerSwipe('right');
    } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleUndo();
    }
  });

  // ── Initialize ───────────────────────────────
  function init() {
    initTheme();

    engine = new ScoringEngine(QUESTIONS);
    renderer = new ResultsRenderer(resultsContent);
    swipeCtrl = new SwipeController(cardContainer, handleSwipe);

    startBtn.addEventListener('click', () => {
      showScreen(questionScreen);
      renderCards();
      updateProgress();
    });

    btnYes.addEventListener('click', () => {
      if (currentIndex < QUESTIONS.length) {
        swipeCtrl.triggerSwipe('right');
      }
    });

    btnNo.addEventListener('click', () => {
      if (currentIndex < QUESTIONS.length) {
        swipeCtrl.triggerSwipe('left');
      }
    });

    btnUndo.addEventListener('click', handleUndo);
  }

  init();
})();
