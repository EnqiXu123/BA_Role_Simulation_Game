(function () {
  const config = window.GAME_CONFIG;

  const screenRoot = document.getElementById("screenRoot");
  const scoreBoard = document.getElementById("scoreBoard");
  const insightsPanel = document.getElementById("insightsPanel");
  const stageTracker = document.getElementById("stageTracker");
  const restartButton = document.getElementById("restartButton");

  const state = createInitialState();

  screenRoot.addEventListener("click", handleScreenClick);
  restartButton.addEventListener("click", restartGame);

  render();

  function createInitialState() {
    return {
      view: "intro",
      currentSceneId: config.firstSceneId,
      selectedChoiceId: null,
      lastFeedback: null,
      pendingNextSceneId: null,
      insights: [],
      scores: { ...config.initialScores },
      choiceHistory: [],
      finalRecommendation: null,
      ending: null,
    };
  }

  function restartGame() {
    Object.assign(state, createInitialState());
    render();
  }

  function startGame() {
    Object.assign(state, createInitialState(), { view: "scene" });
    render();
  }

  function handleScreenClick(event) {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      const action = actionTarget.dataset.action;
      if (action === "start") {
        startGame();
      } else if (action === "continue") {
        continueScenario();
      } else if (action === "restart") {
        restartGame();
      }
      return;
    }

    const choiceButton = event.target.closest("[data-choice-id]");
    if (!choiceButton) {
      return;
    }

    applyChoice(choiceButton.dataset.choiceId);
  }

  function continueScenario() {
    const currentScene = getCurrentScene();
    if (!currentScene || !state.selectedChoiceId) {
      return;
    }

    if (currentScene.type === "recommendation" || state.pendingNextSceneId === "ending") {
      state.ending = evaluateEnding();
      state.view = "ending";
      state.selectedChoiceId = null;
      state.lastFeedback = null;
      state.pendingNextSceneId = null;
      render();
      return;
    }

    state.currentSceneId = state.pendingNextSceneId;
    state.selectedChoiceId = null;
    state.lastFeedback = null;
    state.pendingNextSceneId = null;
    render();
  }

  function applyChoice(choiceId) {
    const currentScene = getCurrentScene();
    if (!currentScene || state.selectedChoiceId) {
      return;
    }

    const choice = currentScene.choices.find((item) => item.id === choiceId);
    if (!choice) {
      return;
    }

    state.selectedChoiceId = choice.id;
    state.lastFeedback = choice.feedback;
    state.pendingNextSceneId = choice.nextSceneId || currentScene.nextSceneId;
    state.choiceHistory.push({
      sceneId: currentScene.id,
      choiceId: choice.id,
      label: choice.label,
    });

    if (currentScene.type === "recommendation") {
      state.finalRecommendation = choice;
    }

    applyScoreEffects(choice.scoreEffects || {});

    if (choice.insight) {
      addInsight(choice.insight);
    }

    render();
  }

  function applyScoreEffects(scoreEffects) {
    Object.keys(config.scoreMeta).forEach((metric) => {
      const currentValue = state.scores[metric];
      const delta = scoreEffects[metric] || 0;
      state.scores[metric] = clamp(currentValue + delta, 0, 100);
    });
  }

  function addInsight(insight) {
    const exists = state.insights.some((item) => item.id === insight.id);
    if (!exists) {
      state.insights.push(insight);
    }
  }

  function evaluateEnding() {
    const scores = state.scores;
    const positiveAverage = Math.round(
      (scores.businessUnderstanding + scores.teamTrust + scores.deliveryReadiness) / 3
    );
    const strongestMetric = getStrongestPositiveMetric();
    const weakestMetric = getWeakestPositiveMetric();

    let endingKey = "mixedOutcome";
    if (
      positiveAverage >= 68 &&
      scores.businessUnderstanding >= 65 &&
      scores.deliveryReadiness >= 60 &&
      scores.riskExposure <= 35
    ) {
      endingKey = "strongOutcome";
    } else if (positiveAverage < 45 || scores.riskExposure > 60) {
      endingKey = "poorOutcome";
    }

    return {
      ...config.endings[endingKey],
      key: endingKey,
      strongestMetric,
      weakestMetric,
      takeaway: buildTakeaway(endingKey, strongestMetric, weakestMetric),
      improvement: buildImprovementNote(weakestMetric),
    };
  }

  function buildTakeaway(endingKey, strongestMetric, weakestMetric) {
    const strongLabel = config.scoreMeta[strongestMetric].label;
    const weakLabel = config.scoreMeta[weakestMetric].label;

    if (endingKey === "strongOutcome") {
      return (
        "Best signal: " +
        strongLabel +
        ". You kept the team focused on the problem, then translated it into a release shape that delivery could actually support."
      );
    }

    if (endingKey === "poorOutcome") {
      return (
        "Biggest recovery area: " +
        weakLabel +
        ". The next step is to slow the conversation down, surface what is unclear, and stop treating pressure as clarity."
      );
    }

    return (
      "Best signal: " +
      strongLabel +
      ". Biggest gap: " +
      weakLabel +
      ". You are close to a workable outcome, but MVP discipline depends on sharpening that weaker area."
    );
  }

  function buildImprovementNote(weakestMetric) {
    if (weakestMetric === "businessUnderstanding") {
      return "Next time, spend longer separating root causes from requested features before steering the room toward solution ideas.";
    }

    if (weakestMetric === "teamTrust") {
      return "Next time, use stakeholder concerns as design input instead of pushing past them. Alignment is a delivery tool, not a soft extra.";
    }

    return "Next time, turn uncertainty into explicit rules, examples, and acceptance criteria earlier so build and test can move without guesswork.";
  }

  function getStrongestPositiveMetric() {
    return ["businessUnderstanding", "teamTrust", "deliveryReadiness"].reduce((best, key) =>
      state.scores[key] > state.scores[best] ? key : best
    );
  }

  function getWeakestPositiveMetric() {
    return ["businessUnderstanding", "teamTrust", "deliveryReadiness"].reduce((lowest, key) =>
      state.scores[key] < state.scores[lowest] ? key : lowest
    );
  }

  function getCurrentScene() {
    return config.scenes.find((scene) => scene.id === state.currentSceneId) || null;
  }

  function render() {
    document.body.classList.toggle("intro-mode", state.view === "intro");
    restartButton.hidden = state.view === "intro";
    renderScoreBoard();
    renderInsightsPanel();
    renderStageTracker();
    renderScreen();
  }

  function renderScoreBoard() {
    scoreBoard.innerHTML = Object.entries(config.scoreMeta)
      .map(([metric, meta]) => {
        const value = state.scores[metric];
        return `
          <article class="metric-card" data-metric="${metric}">
            <div class="metric-top">
              <strong>${meta.label}</strong>
              <span>${getMetricStatus(metric, value)}</span>
            </div>
            <div class="meter" aria-hidden="true">
              <span style="width: ${value}%"></span>
            </div>
            <p>${meta.description}</p>
          </article>
        `;
      })
      .join("");
  }

  function renderInsightsPanel() {
    if (!state.insights.length) {
      insightsPanel.innerHTML =
        '<div class="empty-state">No case notes yet. Stronger BA questions will unlock insights that stay visible for later decisions.</div>';
      return;
    }

    insightsPanel.innerHTML = state.insights
      .map(
        (insight) => `
          <article class="insight-card">
            <h3>${insight.title}</h3>
            <p>${insight.detail}</p>
          </article>
        `
      )
      .join("");
  }

  function renderStageTracker() {
    const currentStageId =
      state.view === "scene"
        ? getCurrentScene().stageId
        : state.view === "ending"
          ? config.stages[config.stages.length - 1].id
          : config.stages[0].id;

    const currentIndex = config.stages.findIndex((stage) => stage.id === currentStageId);

    stageTracker.innerHTML = config.stages
      .map((stage, index) => {
        let status = "upcoming";
        let label = "Upcoming";

        if (state.view === "ending") {
          status = "complete";
          label = "Completed";
        } else if (index < currentIndex || (state.view === "scene" && index < currentIndex)) {
          status = "complete";
          label = "Completed";
        } else if (index === currentIndex) {
          status = "active";
          label = state.view === "intro" ? "Ready" : "Current";
        }

        return `
          <li class="stage-item is-${status}">
            <div class="stage-dot" aria-hidden="true"></div>
            <div class="stage-body">
              <strong>${stage.title}</strong>
              <p>${stage.focus}</p>
              <span class="stage-status">${label}</span>
            </div>
          </li>
        `;
      })
      .join("");
  }

  function renderScreen() {
    if (state.view === "intro") {
      renderIntro();
      return;
    }

    if (state.view === "ending") {
      renderEnding();
      return;
    }

    renderScene(getCurrentScene());
  }

  function renderIntro() {
    const stageLabels = [
      "Spot the pain",
      "Map the mess",
      "De-risk the build",
      "Make the call",
    ];
    const stagePreview = config.stages
      .map(
        (stage, index) => `
          <article class="stage-preview playful-stage-card" data-step="Stage ${index + 1}">
            <span class="stage-label">${stageLabels[index]}</span>
            <h3>${stage.title}</h3>
            <p>${stage.focus}</p>
          </article>
        `
      )
      .join("");

    screenRoot.innerHTML = `
      <section class="hero-card intro-hero">
        <div class="hero-badges">
          <span class="fun-badge">Choice-driven</span>
          <span class="fun-badge">Low-pressure practice</span>
          <span class="fun-badge">Replay-friendly</span>
        </div>

        <div class="intro-headline">
          <div class="intro-title-block">
            <p class="eyebrow intro-eyebrow">Step into the BA chair</p>
            <h2>${config.scenarioTitle}</h2>
            <p class="hero-copy">${config.intro.summary}</p>
          </div>
          <div class="intro-visual">
            <figure class="hero-illustration">
              <img
                class="hero-character"
                src="assets/ba-cartoon.svg"
                alt="Cartoon business analyst reviewing project notes with a laptop"
              >
            </figure>
            <aside class="intro-sidekick">
              <strong>What to expect</strong>
              <span>Stakeholder tension, messy requirements, and just enough project drama to keep it interesting.</span>
            </aside>
          </div>
        </div>

        <div class="hero-grid intro-card-grid">
          <article class="summary-card intro-summary intro-summary-role">
            <h3>Your role</h3>
            <p>${config.intro.roleBrief}</p>
          </article>
          <article class="summary-card intro-summary intro-summary-play">
            <h3>How to play</h3>
            <p>Read the dialogue, choose one response per scene, review the immediate feedback, then continue. Your choices shift score signals and unlock case notes.</p>
          </article>
          <article class="summary-card intro-summary intro-summary-score">
            <h3>Learning lens</h3>
            <p>${config.intro.scoringBrief}</p>
          </article>
        </div>

        <div class="hero-actions intro-actions">
          <button class="primary-button" data-action="start">Start scenario</button>
          <p class="microcopy intro-microcopy">One scenario, seven stakeholder conversations, one final MVP recommendation, full replay.</p>
        </div>
      </section>

      <section class="scene-card route-card">
        <div class="route-header">
          <div>
            <p class="eyebrow intro-eyebrow">Scenario route</p>
            <h2>What this run feels like</h2>
          </div>
          <p class="route-note">You will bounce between business pressure, team questions, and MVP trade-offs. Each stage teaches a different BA instinct.</p>
        </div>
        <div class="stage-preview-grid playful-stage-grid">
          ${stagePreview}
        </div>
      </section>
    `;
  }

  function renderScene(scene) {
    const sceneIndex = config.scenes.findIndex((item) => item.id === scene.id) + 1;
    const stage = config.stages.find((item) => item.id === scene.stageId);
    const selectedChoice = scene.choices.find((choice) => choice.id === state.selectedChoiceId);
    const choiceButtons = scene.choices
      .map((choice, index) => {
        const disabled = Boolean(state.selectedChoiceId);
        const isSelected = choice.id === state.selectedChoiceId;
        return `
          <button
            class="choice-button ${isSelected ? "is-selected" : ""}"
            data-choice-id="${choice.id}"
            ${disabled ? "disabled" : ""}
            style="--delay: ${index * 70}ms"
          >
            <span class="choice-index">${String.fromCharCode(65 + index)}</span>
            <span class="choice-copy">
              <strong>${choice.label}</strong>
              <span>${choice.detail}</span>
            </span>
          </button>
        `;
      })
      .join("");

    screenRoot.innerHTML = `
      <section class="scene-card">
        <div class="scene-header">
          <div>
            <div class="scene-meta">
              <span class="scene-chip">Stage ${config.stages.findIndex((item) => item.id === stage.id) + 1} - ${stage.title}</span>
              <span class="npc-tag">${scene.npc.role}</span>
              <span class="scene-count">Scene ${sceneIndex} of ${config.scenes.length}</span>
            </div>
            <div class="npc-header">
              <div class="npc-badge">${getInitials(scene.npc.name)}</div>
              <div>
                <p>${scene.npc.title}</p>
                <h2>${scene.npc.name}</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="scene-note">
          <strong>${scene.subtitle}</strong>
        </div>

        <div class="scene-dialogue">
          ${scene.dialogue.map((line) => `<p>${line}</p>`).join("")}
        </div>

        <div class="prompt-block">
          <strong>${scene.prompt}</strong>
          <span class="intro-note">Choose the BA response that best balances learning, alignment, and delivery judgement.</span>
        </div>

        <div class="choice-list">${choiceButtons}</div>

        ${
          selectedChoice
            ? `
              <aside class="feedback-panel" aria-live="polite">
                <p class="eyebrow">Immediate feedback</p>
                <h3>${state.lastFeedback}</h3>
                <div class="impact-row">
                  ${renderScoreImpactChips(selectedChoice.scoreEffects || {})}
                </div>
                ${
                  selectedChoice.insight
                    ? `
                      <div class="feedback-insight">
                        <strong>Insight unlocked</strong>
                        <span>${selectedChoice.insight.title}: ${selectedChoice.insight.detail}</span>
                      </div>
                    `
                    : ""
                }
                <button class="primary-button" data-action="continue">${
                  scene.type === "recommendation" ? "See outcome" : "Continue"
                }</button>
              </aside>
            `
            : ""
        }
      </section>
    `;
  }

  function renderEnding() {
    const ending = state.ending;
    const recommendationLabel = state.finalRecommendation
      ? state.finalRecommendation.label
      : "No final recommendation selected.";

    const scoreSummary = Object.entries(config.scoreMeta)
      .map(
        ([metric, meta]) => `
          <article class="score-summary-card">
            <strong>${meta.label}</strong>
            <span>${state.scores[metric]}</span>
            <p>${getMetricStatus(metric, state.scores[metric])}</p>
          </article>
        `
      )
      .join("");

    const strongestLabel = config.scoreMeta[ending.strongestMetric].label;
    const weakestLabel = config.scoreMeta[ending.weakestMetric].label;

    screenRoot.innerHTML = `
      <section class="ending-card">
        <div class="ending-banner">${ending.category}</div>
        <h2>${ending.title}</h2>
        <p class="ending-narrative">${ending.narrative}</p>

        <div class="ending-grid">
          <article class="summary-card">
            <h3>Best signal</h3>
            <p>${strongestLabel}</p>
          </article>
          <article class="summary-card">
            <h3>Biggest gap</h3>
            <p>${weakestLabel}</p>
          </article>
          <article class="summary-card">
            <h3>Insights unlocked</h3>
            <p>${state.insights.length}</p>
          </article>
        </div>

        <div class="recommendation-block">
          <strong>Your recommendation</strong>
          <span>${recommendationLabel}</span>
        </div>

        <div class="score-summary-grid">
          ${scoreSummary}
        </div>

        <div class="recommendation-block">
          <strong>Learning takeaway</strong>
          <span>${ending.takeaway}</span>
        </div>

        <div class="recommendation-block">
          <strong>What to improve next run</strong>
          <span>${ending.improvement}</span>
        </div>

        <div class="ending-actions">
          <button class="primary-button" data-action="restart">Play again</button>
        </div>
      </section>
    `;
  }

  function renderScoreImpactChips(scoreEffects) {
    return Object.entries(scoreEffects)
      .filter(([, value]) => value !== 0)
      .map(([metric, value]) => {
        const prefix = value > 0 ? "+" : "";
        return `<span class="impact-chip metric-chip" data-metric="${metric}">${config.scoreMeta[metric].label}: ${prefix}${value}</span>`;
      })
      .join("");
  }

  function getMetricStatus(metric, value) {
    if (metric === "riskExposure") {
      if (value <= 20) {
        return "Contained";
      }
      if (value <= 40) {
        return "Watchlist";
      }
      if (value <= 65) {
        return "Escalating";
      }
      return "Critical";
    }

    if (value <= 25) {
      return "Fragile";
    }
    if (value <= 50) {
      return "Emerging";
    }
    if (value <= 75) {
      return "Solid";
    }
    return "Strong";
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
