(function () {
  const config = window.GAME_CONFIG;
  const STORAGE_KEY = "ba-simulation-game-save-v1";
  const SAVE_STATUS_DURATION_MS = 1800;

  const screenRoot = document.getElementById("screenRoot");
  const scoreBoard = document.getElementById("scoreBoard");
  const insightsPanel = document.getElementById("insightsPanel");
  const stageTracker = document.getElementById("stageTracker");
  const saveButton = document.getElementById("saveButton");
  const restartButton = document.getElementById("restartButton");

  const state = loadSavedState() || createInitialState();
  let saveStatusTimeoutId = null;

  screenRoot.addEventListener("click", handleScreenClick);
  saveButton.addEventListener("click", saveGame);
  restartButton.addEventListener("click", restartGame);

  if (state.view === "ending" && !state.ending) {
    state.ending = evaluateEnding();
  }

  render();

  function createInitialState() {
    return {
      playerName: "",
      view: "intro",
      currentSceneId: config.firstSceneId,
      selectedChoiceId: null,
      lastFeedback: null,
      lastScoreEffects: null,
      pendingNextSceneId: null,
      insights: [],
      scores: { ...config.initialScores },
      choiceHistory: [],
      finalRecommendation: null,
      ending: null,
    };
  }

  function restartGame() {
    clearSavedGame();
    resetSaveButton();
    Object.assign(state, createInitialState());
    render();
  }

  function startGame() {
    const playerNameInput = document.getElementById("playerNameInput");
    const playerName = playerNameInput ? normalizePlayerName(playerNameInput.value) : state.playerName;
    resetSaveButton();
    Object.assign(state, createInitialState(), { view: "scene", playerName });
    render();
  }

  function saveGame() {
    const storage = getStorage();
    if (!storage || state.view === "intro") {
      return;
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(getSerializableState()));
      setSaveButtonStatus("Saved");
    } catch (error) {
      setSaveButtonStatus("Save failed");
    }
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
    state.lastScoreEffects = null;
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
    state.lastScoreEffects = sanitizeScoreEffects(choice.scoreEffects);
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
      addInsight(choice.insight, currentScene);
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

  function addInsight(insight, scene) {
    const exists = state.insights.some((item) => item.id === insight.id);
    if (!exists) {
      const currentStage = scene ? config.stages.find((stage) => stage.id === scene.stageId) : null;
      state.insights.push({
        ...insight,
        source: scene ? scene.npc.name : "Team",
        stageTitle: currentStage ? currentStage.title : "Scenario signal",
      });
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
      takeaway: buildTakeaway(endingKey, strongestMetric, weakestMetric, scores),
      improvementHeading: buildImprovementHeading(endingKey),
      improvement: buildImprovementNote(endingKey, weakestMetric, scores),
    };
  }

  function buildTakeaway(endingKey, strongestMetric, weakestMetric, scores) {
    const strongLabel = config.scoreMeta[strongestMetric].label;
    const weakLabel = config.scoreMeta[weakestMetric].label;
    const riskExposure = scores.riskExposure;

    if (endingKey === "strongOutcome") {
      return (
        "Best signal: " +
        strongLabel +
        ". You kept the team focused on the problem, then translated it into a release shape that delivery could actually support. Your next step is refinement, not recovery."
      );
    }

    if (endingKey === "poorOutcome") {
      let takeaway =
        "Biggest recovery area: " +
        weakLabel +
        ". This run needed more than a small tune-up: the team left without enough shared clarity to trust the MVP shape.";

      takeaway +=
        " Rebuild the next run in this order: understand the real complaint problem first, align the room on what matters most, make the rules testable, and cut scope wherever risk stays unresolved.";

      if (riskExposure > 40) {
        takeaway +=
          " Risk Exposure is the clearest warning signal here, so treat dependencies, audit constraints, vague ownership rules, and schedule assumptions as first-class discussion topics instead of leaving them implicit.";
      }

      return takeaway;
    }

    let takeaway =
      "Best signal: " +
      strongLabel +
      ". Biggest gap: " +
      weakLabel +
      ". You are close to a workable outcome, but the run still needs tighter scope control and clearer delivery framing before it feels fully safe.";

    if (riskExposure > 40) {
      takeaway += " Please take the project risks into account next time.";
    }

    return takeaway;
  }

  function buildImprovementHeading(endingKey) {
    if (endingKey === "strongOutcome") {
      return "Keep sharpening next run";
    }

    if (endingKey === "poorOutcome") {
      return "Recovery plan for next run";
    }

    return "What to tighten next run";
  }

  function buildImprovementNote(endingKey, weakestMetric, scores) {
    if (endingKey === "strongOutcome") {
      if (weakestMetric === "businessUnderstanding") {
        return "Push one layer deeper on diagnosis next time: ask for sharper examples of where the process breaks, who feels the impact first, and which outcome proves the MVP is working.";
      }

      if (weakestMetric === "teamTrust") {
        return "You already moved the team well. Next run, strengthen trust further by summarising stakeholder concerns back to them and showing clearly how their input affects what is included in the first release.";
      }

      return "You created a strong release shape. Next run, go one step further by turning more edge cases and acceptance examples into explicit build-ready detail before delivery starts.";
    }

    if (endingKey === "poorOutcome") {
      const riskStep =
        scores.riskExposure > 40
          ? "This is the red warning signal in your run. Name dependencies, timeline assumptions, compliance concerns, unresolved ownership rules, and edge cases early. If the risk stays open, reduce the MVP until the remaining scope is safe."
          : "Call out assumptions and dependencies early so the team knows what could still derail the MVP.";

      return `
        <ul class="ending-guidance-list">
          <li><strong>Business Understanding:</strong> Start by separating the real complaint-handling pain from feature requests. Ask where the workflow breaks, which complaint types hurt most, and what business outcome matters first.</li>
          <li><strong>Team Trust:</strong> Slow the room down enough to acknowledge each role's concern. Show stakeholders that their risks, constraints, and delivery pressures are shaping the recommendation rather than being ignored.</li>
          <li><strong>Delivery Readiness:</strong> Turn vague requests into rules, examples, ownership logic, and acceptance criteria before asking build or test to move. If engineers or QA are guessing, the BA work is not finished yet.</li>
          <li><strong>Risk Exposure:</strong> ${riskStep}</li>
        </ul>
      `;
    }

    if (weakestMetric === "businessUnderstanding") {
      return "Spend longer separating root causes from requested features before steering the room toward solution ideas, and validate which user group or pain point needs relief first.";
    }

    if (weakestMetric === "teamTrust") {
      return "Use stakeholder concerns as design input instead of pushing past them. Alignment is a delivery tool, not a soft extra, and it becomes visible when you reflect concerns back into scope choices.";
    }

    if (scores.riskExposure > 40) {
      return "Clarify unresolved risk earlier next time. Call out dependencies, schedule assumptions, and risky shortcuts explicitly, then trim the MVP until the remaining scope can be delivered with confidence.";
    }

    return "Turn uncertainty into explicit rules, examples, and acceptance criteria earlier so build and test can move without guesswork, especially around ownership changes, edge cases, and test conditions.";
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
    const showRunActions = state.view !== "intro";
    saveButton.hidden = !showRunActions;
    restartButton.hidden = !showRunActions;
    renderScoreBoard();
    renderInsightsPanel();
    renderStageTracker();
    renderScreen();
  }

  function getSerializableState() {
    return {
      playerName: state.playerName,
      view: state.view,
      currentSceneId: state.currentSceneId,
      selectedChoiceId: state.selectedChoiceId,
      lastFeedback: state.lastFeedback,
      lastScoreEffects: state.lastScoreEffects,
      pendingNextSceneId: state.pendingNextSceneId,
      insights: state.insights,
      scores: state.scores,
      choiceHistory: state.choiceHistory,
      finalRecommendationId: state.finalRecommendation ? state.finalRecommendation.id : null,
      finalRecommendationLabel: state.finalRecommendation ? state.finalRecommendation.label : null,
    };
  }

  function loadSavedState() {
    const storage = getStorage();
    if (!storage) {
      return null;
    }

    try {
      const rawState = storage.getItem(STORAGE_KEY);
      if (!rawState) {
        return null;
      }

      const savedState = JSON.parse(rawState);
      return sanitizeSavedState(savedState);
    } catch (error) {
      return null;
    }
  }

  function sanitizeSavedState(savedState) {
    if (!savedState || typeof savedState !== "object") {
      return null;
    }

    const baseState = createInitialState();
    const scene = getSceneById(savedState.currentSceneId) || getSceneById(baseState.currentSceneId);
    const validChoiceIds = new Set(scene.choices.map((choice) => choice.id));
    const selectedChoiceId =
      typeof savedState.selectedChoiceId === "string" && validChoiceIds.has(savedState.selectedChoiceId)
        ? savedState.selectedChoiceId
        : null;
    const choiceHistory = Array.isArray(savedState.choiceHistory)
      ? savedState.choiceHistory.filter(isChoiceHistoryShape).map((entry) => ({ ...entry }))
      : [];
    const finalRecommendation =
      getRecommendationChoice(savedState.finalRecommendationId) ||
      getRecommendationChoiceFromHistory(choiceHistory) ||
      (typeof savedState.finalRecommendationLabel === "string"
        ? { label: savedState.finalRecommendationLabel }
        : null);

    return {
      ...baseState,
      playerName: normalizePlayerName(savedState.playerName),
      view: savedState.view === "scene" || savedState.view === "ending" ? savedState.view : baseState.view,
      currentSceneId: scene.id,
      selectedChoiceId,
      lastFeedback:
        selectedChoiceId && typeof savedState.lastFeedback === "string" ? savedState.lastFeedback : null,
      lastScoreEffects: selectedChoiceId ? sanitizeScoreEffects(savedState.lastScoreEffects) : null,
      pendingNextSceneId:
        selectedChoiceId &&
        (savedState.pendingNextSceneId === "ending" || getSceneById(savedState.pendingNextSceneId))
          ? savedState.pendingNextSceneId
          : null,
      insights: Array.isArray(savedState.insights)
        ? savedState.insights.filter(isInsightShape).map((insight) => ({ ...insight }))
        : [],
      scores: sanitizeScores(savedState.scores),
      choiceHistory,
      finalRecommendation,
    };
  }

  function getRecommendationChoice(choiceId) {
    if (typeof choiceId !== "string") {
      return null;
    }

    const recommendationScene = getSceneById("recommendation");
    if (!recommendationScene) {
      return null;
    }

    return recommendationScene.choices.find((choice) => choice.id === choiceId) || null;
  }

  function getRecommendationChoiceFromHistory(choiceHistory) {
    const recommendationEntry = [...choiceHistory]
      .reverse()
      .find((entry) => entry.sceneId === "recommendation");

    return recommendationEntry ? getRecommendationChoice(recommendationEntry.choiceId) : null;
  }

  function sanitizeScores(scores) {
    const sanitized = { ...config.initialScores };
    if (!scores || typeof scores !== "object") {
      return sanitized;
    }

    Object.keys(config.scoreMeta).forEach((metric) => {
      const value = scores[metric];
      if (typeof value === "number" && Number.isFinite(value)) {
        sanitized[metric] = clamp(Math.round(value), 0, 100);
      }
    });

    return sanitized;
  }

  function sanitizeScoreEffects(scoreEffects) {
    if (!scoreEffects || typeof scoreEffects !== "object") {
      return null;
    }

    const sanitized = {};
    let hasChange = false;

    Object.keys(config.scoreMeta).forEach((metric) => {
      const value = scoreEffects[metric];
      if (typeof value === "number" && Number.isFinite(value) && value !== 0) {
        sanitized[metric] = Math.round(value);
        hasChange = true;
      }
    });

    return hasChange ? sanitized : null;
  }

  function isInsightShape(insight) {
    return (
      insight &&
      typeof insight === "object" &&
      typeof insight.id === "string" &&
      typeof insight.title === "string" &&
      typeof insight.detail === "string"
    );
  }

  function isChoiceHistoryShape(entry) {
    return (
      entry &&
      typeof entry === "object" &&
      typeof entry.sceneId === "string" &&
      typeof entry.choiceId === "string" &&
      typeof entry.label === "string"
    );
  }

  function getSceneById(sceneId) {
    return config.scenes.find((scene) => scene.id === sceneId) || null;
  }

  function getPersonalizedDialogue(scene) {
    if (!scene || !scene.dialogue.length || !state.playerName || scene.npc.name === "Decision Room") {
      return scene ? scene.dialogue : [];
    }

    return scene.dialogue.map((line, index) =>
      index === 0 ? `Hi ${escapeHtml(state.playerName)}, ${line}` : line
    );
  }

  function getStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      return null;
    }
  }

  function clearSavedGame() {
    const storage = getStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(STORAGE_KEY);
  }

  function setSaveButtonStatus(label) {
    saveButton.textContent = label;
    window.clearTimeout(saveStatusTimeoutId);
    saveStatusTimeoutId = window.setTimeout(resetSaveButton, SAVE_STATUS_DURATION_MS);
  }

  function resetSaveButton() {
    window.clearTimeout(saveStatusTimeoutId);
    saveStatusTimeoutId = null;
    saveButton.textContent = "Save";
  }

  function renderScoreBoard() {
    scoreBoard.innerHTML = Object.entries(config.scoreMeta)
      .map(([metric, meta]) => {
        const value = state.scores[metric];
        const delta = state.lastScoreEffects ? state.lastScoreEffects[metric] || 0 : 0;
        const deltaPrefix = delta > 0 ? "+" : "";
        const metricDirection = metric === "riskExposure" ? "Lower is better" : "Higher is better";
        const deltaToneClass = getMetricDeltaToneClass(metric, delta);
        const meterStartValue = clamp(value - delta, 0, 100);
        return `
          <article class="metric-card ${delta ? "metric-card-updated" : ""}" data-metric="${metric}">
            <div class="metric-top">
              <strong>${meta.label}</strong>
              <div class="metric-score-meta">
                ${delta ? `<span class="metric-delta ${deltaToneClass}">${deltaPrefix}${delta}</span>` : ""}
                <span class="metric-value">${value}</span>
              </div>
            </div>
            <div class="meter" aria-hidden="true">
              <span class="meter-fill" data-target-width="${value}" style="width: ${meterStartValue}%"></span>
            </div>
            <div class="metric-bottom">
              <span class="metric-status">${getMetricStatus(metric, value)}</span>
              <span class="metric-direction">${metricDirection}</span>
            </div>
            <p>${meta.description}</p>
          </article>
        `;
      })
      .join("");

    window.requestAnimationFrame(() => {
      scoreBoard.querySelectorAll(".meter-fill").forEach((fill) => {
        fill.style.width = `${fill.dataset.targetWidth}%`;
      });
    });
  }

  function getMetricDeltaToneClass(metric, delta) {
    if (!delta) {
      return "";
    }

    if (metric === "riskExposure") {
      return delta < 0 ? "is-positive" : "is-negative";
    }

    return delta > 0 ? "is-positive" : "is-negative";
  }

  function renderInsightsPanel() {
    if (!state.insights.length) {
      insightsPanel.innerHTML =
        '<div class="empty-state">Your wall is still blank. Stronger BA questions will pin risks, root causes, and delivery clues here as the case unfolds.</div>';
      return;
    }

    insightsPanel.innerHTML = state.insights
      .map((insight, index) => {
        const typeMeta = getInsightTypeMeta(insight.type);
        return `
          <article class="insight-card board-note" data-note-type="${typeMeta.key}" style="--delay: ${index * 60}ms">
            <div class="board-note-top">
              <span class="board-pin" aria-hidden="true"></span>
              <span class="board-type">${typeMeta.label}</span>
              <span class="board-source">${insight.source || "Team"}</span>
            </div>
            <h3>${insight.title}</h3>
            <p>${insight.detail}</p>
            <div class="board-note-footer">
              <span>${insight.stageTitle || "Scenario signal"}</span>
            </div>
          </article>
        `;
      })
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
          <article class="stage-preview playful-stage-card">
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
            <div class="name-entry-card">
              <label class="name-entry-label" for="playerNameInput">
                <span>Enter your name</span>
                <span class="name-entry-optional">Optional</span>
              </label>
              <div class="name-entry-row">
                <p class="name-entry-help">If you add a name here, your stakeholders will greet you with your name.</p>
                <input
                  id="playerNameInput"
                  class="name-entry-input"
                  type="text"
                  maxlength="30"
                  placeholder=""
                  value="${escapeHtml(state.playerName)}"
                >
              </div>
            </div>
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
            <p>Read the chat, choose one response per scene, watch how the room reacts, then pin new evidence to the Case Board as you move toward the MVP call.</p>
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
    const reactionMeta = selectedChoice ? getReactionMeta(selectedChoice) : null;
    const dialogueLines = getPersonalizedDialogue(scene);
    const sceneIllustration = scene.npc.illustration
      ? `
          <figure class="scene-illustration">
            <img
              class="scene-character"
              src="${scene.npc.illustration.src}"
              alt="${scene.npc.illustration.alt}"
            >
          </figure>
        `
      : "";
    const chatThread = dialogueLines
      .map(
        (line, index) => `
          <article class="chat-message chat-message-npc" style="--delay: ${index * 90}ms">
            <div class="chat-avatar" aria-hidden="true">${getInitials(scene.npc.name)}</div>
            <div class="chat-bubble">
              ${index === 0 ? `<span class="chat-speaker">${scene.npc.name}</span>` : ""}
              <p>${line}</p>
            </div>
          </article>
        `
      )
      .join("");
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
            </span>
          </button>
        `;
      })
      .join("");

    screenRoot.innerHTML = `
      <section class="scene-card chat-scene-card">
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
          ${sceneIllustration}
        </div>

        <div class="mission-banner">
          <span class="mission-label">Current mission</span>
          <strong>${scene.subtitle}</strong>
          <p>${stage.focus}</p>
        </div>

        <div class="chat-thread">
          ${chatThread}
          ${
            selectedChoice
              ? `
                <article class="chat-message chat-message-player">
                  <div class="chat-bubble">
                    <span class="chat-speaker">You</span>
                    <p>${selectedChoice.label}</p>
                  </div>
                </article>
                <article class="chat-message chat-message-reaction">
                  <div class="chat-avatar chat-avatar-reaction" aria-hidden="true">${getInitials(scene.npc.name)}</div>
                  <div class="chat-bubble reaction-bubble">
                    <div class="reaction-topline">
                      <span class="chat-speaker">${scene.npc.name} reacts</span>
                      <span class="reaction-chip reaction-chip-${reactionMeta.tone}">${reactionMeta.label}</span>
                    </div>
                    <p>${state.lastFeedback}</p>
                    <div class="impact-row">
                      ${renderScoreImpactChips(selectedChoice.scoreEffects || {})}
                    </div>
                    ${
                      selectedChoice.insight
                        ? `
                          <div class="feedback-insight case-unlock">
                            <strong>Case Board updated</strong>
                            <span>${selectedChoice.insight.title}: ${selectedChoice.insight.detail}</span>
                          </div>
                        `
                        : ""
                    }
                    <button class="primary-button" data-action="continue">${
                      scene.type === "recommendation" ? "See outcome" : "Continue"
                    }</button>
                  </div>
                </article>
              `
              : `
                <article class="chat-message chat-message-system">
                  <div class="chat-bubble system-bubble">
                    <span class="chat-speaker">Next BA move</span>
                    <p>Pick the response you want to send into the room. Your choice will shift trust, clarity, and delivery risk.</p>
                  </div>
                </article>
              `
          }
        </div>

        <div class="prompt-block chat-prompt-block">
          <span class="prompt-kicker">Your move</span>
          <strong>${scene.prompt}</strong>
          <span class="intro-note">Choose the response you want the BA to send into the conversation.</span>
        </div>

        <div class="choice-list">${choiceButtons}</div>
      </section>
    `;
  }

  function renderEnding() {
    const ending = state.ending;
    const recommendationChoice =
      getRecommendationChoice(state.finalRecommendation && state.finalRecommendation.id) ||
      getRecommendationChoiceFromHistory(state.choiceHistory);
    const recommendationLabel = recommendationChoice
      ? recommendationChoice.label
      : state.finalRecommendation
        ? state.finalRecommendation.label
        : "No final recommendation selected.";
    const highlightRiskExposureAlert =
      (ending.key === "mixedOutcome" || ending.key === "poorOutcome") &&
      state.scores.riskExposure > 40;
    const endingAward = getEndingAwardContent(ending.key, state.playerName);

    const scoreSummary = Object.entries(config.scoreMeta)
      .map(
        ([metric, meta]) => `
          <article class="score-summary-card ${
            highlightRiskExposureAlert && metric === "riskExposure" ? "score-summary-card-risk-alert" : ""
          }">
            <strong>${meta.label}</strong>
            <span>${state.scores[metric]}</span>
            <p>${getMetricStatus(metric, state.scores[metric])}</p>
          </article>
        `
      )
      .join("");

    const strongestLabel = config.scoreMeta[ending.strongestMetric].label;
    const weakestLabel = config.scoreMeta[ending.weakestMetric].label;
    const confettiPalette = [
      "#ff8f6f",
      "#ffd666",
      "#42b7a3",
      "#557a5a",
      "#4d8dd6",
      "#ffb94a",
      "#f06292",
      "#6f80d8",
      "#d3a23a",
      "#4db8a3",
    ];
    const confettiPieces = Array.from({ length: 30 }, (_, index) => {
      const left = 2 + ((index * 7) % 94);
      const delay = (index % 6) * 0.08 + Math.floor(index / 6) * 0.03;
      const duration = 3.4 + (index % 5) * 0.18 + Math.floor(index / 8) * 0.06;
      const rotation = (index % 2 === 0 ? -1 : 1) * (12 + (index % 6) * 4);
      const drift = (index % 2 === 0 ? -1 : 1) * (12 + (index % 5) * 7);
      return {
        left,
        delay,
        duration,
        rotation,
        drift,
        color: confettiPalette[index % confettiPalette.length],
      };
    })
      .map(
        (piece) => `
          <span
            class="confetti-piece"
            style="--left:${piece.left}%;--delay:${piece.delay}s;--duration:${piece.duration}s;--rotation:${piece.rotation}deg;--drift:${piece.drift}px;--color:${piece.color};"
            aria-hidden="true"
          ></span>
        `
      )
      .join("");

    screenRoot.innerHTML = `
      <section class="ending-card">
        <div class="confetti-layer" aria-hidden="true">
          ${confettiPieces}
        </div>
        <div class="ending-banner">${ending.category}</div>
        <div class="ending-title-row">
          <div class="ending-title-copy">
            <h2>${ending.title}</h2>
            ${endingAward.message}
          </div>
          ${endingAward.trophy}
        </div>
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
          <div class="recommendation-copy">${ending.takeaway}</div>
        </div>

        <div class="recommendation-block">
          <strong>${ending.improvementHeading}</strong>
          <div class="recommendation-copy">${ending.improvement}</div>
        </div>

        <div class="ending-actions">
          <button class="primary-button" data-action="restart">Play again</button>
        </div>
      </section>
    `;
  }

  function getEndingAwardContent(endingKey, playerName) {
    const safeName = playerName ? escapeHtml(playerName) : "";

    if (endingKey === "strongOutcome") {
      return {
        message: `<p class="ending-congrats">${
          safeName
            ? `Congrats ${safeName}, you have won a Gold BA Trophy for your hard work!`
            : "Congrats, you have won a Gold BA Trophy for your hard work!"
        }</p>`,
        trophy: `
          <figure class="ending-trophy" aria-hidden="true">
            <img src="assets/ba-trophy.svg" alt="">
          </figure>
        `,
      };
    }

    if (endingKey === "mixedOutcome") {
      return {
        message: `<p class="ending-congrats">${
          safeName
            ? `Congrats ${safeName}, you have won a Silver BA Trophy for your hard work!`
            : "Congrats, you have won a Silver BA Trophy for your hard work!"
        }</p>`,
        trophy: `
          <figure class="ending-trophy" aria-hidden="true">
            <img src="assets/ba-trophy-silver.svg" alt="">
          </figure>
        `,
      };
    }

    if (endingKey === "poorOutcome") {
      return {
        message: `<p class="ending-congrats">${
          safeName
            ? `Congrats ${safeName}, you have won a Bronze BA Trophy for your hard work!`
            : "Congrats, you have won a Bronze BA Trophy for your hard work!"
        }</p>`,
        trophy: `
          <figure class="ending-trophy" aria-hidden="true">
            <img src="assets/ba-trophy-bronze.svg" alt="">
          </figure>
        `,
      };
    }

    return { message: "", trophy: "" };
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

  function getInsightTypeMeta(type) {
    const insightTypes = {
      "root-cause": { key: "root-cause", label: "Root cause" },
      noise: { key: "noise", label: "Noise filter" },
      "mvp-scope": { key: "mvp-scope", label: "MVP scope" },
      "user-focus": { key: "user-focus", label: "User focus" },
      risk: { key: "risk", label: "Risk" },
      "user-pain": { key: "user-pain", label: "User pain" },
      constraint: { key: "constraint", label: "Constraint" },
      "logic-gap": { key: "logic-gap", label: "Logic gap" },
      quality: { key: "quality", label: "Quality" },
    };

    return insightTypes[type] || { key: "finding", label: "Finding" };
  }

  function getReactionMeta(choice) {
    const scoreEffects = choice.scoreEffects || {};
    const positiveShift =
      Math.max(scoreEffects.businessUnderstanding || 0, 0) +
      Math.max(scoreEffects.teamTrust || 0, 0) +
      Math.max(scoreEffects.deliveryReadiness || 0, 0) +
      Math.max(-(scoreEffects.riskExposure || 0), 0);
    const negativeShift =
      Math.abs(Math.min(scoreEffects.businessUnderstanding || 0, 0)) +
      Math.abs(Math.min(scoreEffects.teamTrust || 0, 0)) +
      Math.abs(Math.min(scoreEffects.deliveryReadiness || 0, 0)) +
      Math.max(scoreEffects.riskExposure || 0, 0);

    if (positiveShift >= negativeShift + 4) {
      return { tone: "positive", label: "Room opens up" };
    }

    if (negativeShift >= positiveShift + 4) {
      return { tone: "warning", label: "Pushback rises" };
    }

    return { tone: "mixed", label: "More proof needed" };
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

  function normalizePlayerName(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 30) : "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
})();
