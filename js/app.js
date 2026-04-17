/* =============================================
   App Orchestrator
   
   Ties together geo selection, dynamic statements,
   scoring, swipe UI, and results rendering.
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
  const swipeButtons   = document.querySelector('.swipe-buttons');

  // ── State ────────────────────────────────────
  let engine = null;
  let flowEngine = null;
  let swipeCtrl = null;
  let renderer = null;
  let currentStatement = null;   // currently displayed statement

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

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ── Geo Selector Card ────────────────────────
  function renderGeoSelector() {
    cardContainer.innerHTML = '';
    categoryBadge.innerHTML = '<span>Select Your Region</span>';
    swipeButtons.style.display = 'none';

    const card = document.createElement('div');
    card.className = 'swipe-card geo-selector-card top-card entering';
    card.addEventListener('animationend', () => card.classList.remove('entering'), { once: true });

    card.innerHTML = `
      <div class="card-question-number">Step 1</div>
      <div class="card-statement-text">Where is your organization primarily based?</div>
      <div class="card-question-context">This determines applicable regulations and available options.</div>
      <div class="geo-grid">
        ${GEO_OPTIONS.map(g => `
          <button class="geo-btn" data-geo="${escapeHtml(g.key)}">
            <span class="geo-icon">${g.icon}</span>
            <span class="geo-label">${escapeHtml(g.label)}</span>
          </button>
        `).join('')}
      </div>
    `;

    cardContainer.appendChild(card);

    // Attach click handlers
    card.querySelectorAll('.geo-btn').forEach(btn => {
      btn.addEventListener('click', () => handleGeoSelect(btn.dataset.geo));
    });

    updateProgress();
  }

  // ── Handle Geo Selection ─────────────────────
  function handleGeoSelect(geoKey) {
    flowEngine.selectGeo(geoKey);
    engine.applyGeoScores(geoKey);

    // Update scoring engine with geo-filtered pool
    engine.setActiveStatements(flowEngine.getActiveStatements());

    swipeButtons.style.display = '';
    advanceToNextStatement();
  }

  // ── Statement Card Rendering ─────────────────
  function createStatementCard(stmt, progress) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.dataset.statementId = stmt.id;

    card.innerHTML = `
      <div class="card-overlay card-overlay-yes">
        <span class="card-overlay-label">YES</span>
      </div>
      <div class="card-overlay card-overlay-no">
        <span class="card-overlay-label">NO</span>
      </div>
      <div class="card-question-number">${progress.answered + 1} of ~${progress.estimated}</div>
      <div class="card-statement-text">${escapeHtml(stmt.statement)}</div>
      <div class="card-question-context">${escapeHtml(stmt.context)}</div>
    `;

    return card;
  }

  /** Render the card stack using FlowEngine peek */
  function renderStatementCards() {
    cardContainer.innerHTML = '';
    const progress = flowEngine.getProgress();
    const upcoming = flowEngine.peekNext(3);

    if (upcoming.length === 0) {
      showResults();
      return;
    }

    // Behind card (3rd upcoming)
    if (upcoming[2]) {
      const behind = createStatementCard(upcoming[2], { answered: progress.answered + 2, estimated: progress.estimated });
      behind.classList.add('behind-card');
      cardContainer.appendChild(behind);
    }

    // Next card (2nd upcoming)
    if (upcoming[1]) {
      const next = createStatementCard(upcoming[1], { answered: progress.answered + 1, estimated: progress.estimated });
      next.classList.add('next-card');
      cardContainer.appendChild(next);
    }

    // Top card (1st upcoming = current)
    currentStatement = upcoming[0];
    const top = createStatementCard(currentStatement, progress);
    top.classList.add('top-card', 'entering');
    top.addEventListener('animationend', () => top.classList.remove('entering'), { once: true });
    cardContainer.appendChild(top);

    // Attach swipe controller
    swipeCtrl.attachTo(top);

    // Update category badge
    categoryBadge.innerHTML = `<span>${escapeHtml(currentStatement.category)}</span>`;
  }

  function advanceToNextStatement() {
    currentStatement = flowEngine.getNextStatement();
    if (!currentStatement) {
      showResults();
    } else {
      renderStatementCards();
      updateProgress();
    }
  }

  // ── Progress ─────────────────────────────────
  function updateProgress() {
    if (!flowEngine.geo) {
      // Geo selector phase
      progressFill.style.width = '0%';
      progressText.textContent = '';
      btnUndo.disabled = true;
      return;
    }
    const { answered, estimated } = flowEngine.getProgress();
    const pct = estimated > 0 ? (answered / estimated) * 100 : 0;
    progressFill.style.width = `${pct}%`;
    progressText.textContent = `${answered} / ~${estimated}`;
    btnUndo.disabled = flowEngine.history.length === 0;
  }

  // ── Swipe Handler ────────────────────────────
  function handleSwipe(direction) {
    if (!currentStatement) return;
    const answer = direction === 'right' ? 'yes' : 'no';

    flowEngine.recordAnswer(currentStatement.id, answer);
    engine.recordAnswer(currentStatement.id, answer);

    advanceToNextStatement();
  }

  // ── Undo ─────────────────────────────────────
  function handleUndo() {
    const undoneId = flowEngine.undoLast();
    if (undoneId === null) return;

    engine.undoLast();

    // If we've undone all statements and geo was selected, go back to geo
    if (flowEngine.history.length === 0 && flowEngine.geo) {
      // Reset geo selection
      flowEngine.geo = null;
      engine.reset();
      engine.setActiveStatements(STATEMENTS);
      renderGeoSelector();
      return;
    }

    renderStatementCards();
    updateProgress();
  }

  // ── Results ──────────────────────────────────
  function showResults() {
    showScreen(resultsScreen);
    const recommendations = engine.getRecommendations();
    const hybridCombos = engine.getHybridRecommendation(recommendations);
    const answeredCount = flowEngine.history.length;
    renderer.render(recommendations, hybridCombos, handleRestart, answeredCount);
  }

  // ── Restart ──────────────────────────────────
  function handleRestart() {
    currentStatement = null;
    engine.reset();
    engine.setActiveStatements(STATEMENTS);
    flowEngine.reset();
    showScreen(welcomeScreen);
  }

  // ── Keyboard Support ─────────────────────────
  document.addEventListener('keydown', (e) => {
    if (!questionScreen.classList.contains('active')) return;
    if (!currentStatement) return;

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

    engine = new ScoringEngine(STATEMENTS);
    flowEngine = new FlowEngine(STATEMENTS);
    renderer = new ResultsRenderer(resultsContent);
    swipeCtrl = new SwipeController(cardContainer, handleSwipe);

    startBtn.addEventListener('click', () => {
      showScreen(questionScreen);
      renderGeoSelector();
    });

    btnYes.addEventListener('click', () => {
      if (currentStatement) {
        swipeCtrl.triggerSwipe('right');
      }
    });

    btnNo.addEventListener('click', () => {
      if (currentStatement) {
        swipeCtrl.triggerSwipe('left');
      }
    });

    btnUndo.addEventListener('click', handleUndo);
  }

  init();
})();
