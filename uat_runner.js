const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = __dirname;
const STORAGE_KEY = "ba-simulation-game-save-v1";

class FakeClassList {
  constructor() {
    this.classes = new Set();
  }

  toggle(name, force) {
    if (force === undefined) {
      if (this.classes.has(name)) {
        this.classes.delete(name);
        return false;
      }

      this.classes.add(name);
      return true;
    }

    if (force) {
      this.classes.add(name);
      return true;
    }

    this.classes.delete(name);
    return false;
  }

  contains(name) {
    return this.classes.has(name);
  }
}

class FakeLocalStorage {
  constructor(seed = {}) {
    this.map = new Map(Object.entries(seed));
  }

  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }

  setItem(key, value) {
    this.map.set(key, String(value));
  }

  removeItem(key) {
    this.map.delete(key);
  }

  snapshot() {
    return Object.fromEntries(this.map.entries());
  }
}

class FakeSubElement {
  constructor(targetWidth, startWidth) {
    this.dataset = { targetWidth: String(targetWidth) };
    this.style = { width: `${startWidth}%` };
  }
}

class FakeElement {
  constructor(documentRef, id) {
    this.documentRef = documentRef;
    this.id = id;
    this.hidden = false;
    this.value = "";
    this.textContent = "";
    this.listeners = {};
    this._innerHTML = "";
    this._meterFills = [];
  }

  addEventListener(type, callback) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  dispatch(type, event = {}) {
    for (const callback of this.listeners[type] || []) {
      callback(event);
    }
  }

  set innerHTML(value) {
    this._innerHTML = value;

    if (this.id === "screenRoot") {
      this.documentRef.registerIdsFromHTML(value);
    }

    if (this.id === "scoreBoard") {
      this._meterFills = parseMeterFills(value);
    } else {
      this._meterFills = [];
    }
  }

  get innerHTML() {
    return this._innerHTML;
  }

  querySelectorAll(selector) {
    if (selector === ".meter-fill") {
      return this._meterFills;
    }

    return [];
  }
}

class FakeDocument {
  constructor() {
    this.elements = {};
    this.body = { classList: new FakeClassList() };

    [
      "screenRoot",
      "scoreBoard",
      "insightsPanel",
      "stageTracker",
      "saveButton",
      "restartButton",
    ].forEach((id) => {
      this.elements[id] = new FakeElement(this, id);
    });
  }

  getElementById(id) {
    return this.elements[id] || null;
  }

  registerIdsFromHTML(html) {
    const idMatches = html.matchAll(/id="([^"]+)"/g);
    for (const match of idMatches) {
      const id = match[1];
      if (!this.elements[id]) {
        this.elements[id] = new FakeElement(this, id);
      }
    }
  }
}

function parseMeterFills(html) {
  const fills = [];
  const regex =
    /class="meter-fill"[^>]*data-target-width="([^"]+)"[^>]*style="width:\s*([0-9.]+)%"/g;
  let match = regex.exec(html);

  while (match) {
    fills.push(new FakeSubElement(Number(match[1]), Number(match[2])));
    match = regex.exec(html);
  }

  return fills;
}

function loadStyles() {
  return fs.readFileSync(path.join(ROOT, "styles.css"), "utf8");
}

function createApp(initialStorage = {}) {
  const documentRef = new FakeDocument();
  const storage = new FakeLocalStorage(initialStorage);
  let timeoutId = 0;

  const windowRef = {
    localStorage: storage,
    setTimeout() {
      timeoutId += 1;
      return timeoutId;
    },
    clearTimeout() {},
    requestAnimationFrame(callback) {
      callback();
      return 1;
    },
  };

  const context = {
    window: windowRef,
    document: documentRef,
    console,
    Math,
    JSON,
    Set,
    Map,
    Array,
    Object,
    Number,
    String,
    Boolean,
    RegExp,
  };

  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "scenario.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "app.js"), "utf8"), context);

  return {
    window: windowRef,
    document: documentRef,
    storage,
    styles: loadStyles(),
  };
}

function makeClickTarget(type, value) {
  return {
    closest(selector) {
      if (type === "action" && selector === "[data-action]") {
        return { dataset: { action: value } };
      }

      if (type === "choice" && selector === "[data-choice-id]") {
        return { dataset: { choiceId: value } };
      }

      return null;
    },
  };
}

function startScenario(app, playerName = "") {
  const input = app.document.getElementById("playerNameInput");
  if (input) {
    input.value = playerName;
  }

  app.document.getElementById("screenRoot").dispatch("click", {
    target: makeClickTarget("action", "start"),
  });
}

function clickChoice(app, choiceId) {
  app.document.getElementById("screenRoot").dispatch("click", {
    target: makeClickTarget("choice", choiceId),
  });
}

function clickContinue(app) {
  app.document.getElementById("screenRoot").dispatch("click", {
    target: makeClickTarget("action", "continue"),
  });
}

function clickRestart(app) {
  app.document.getElementById("restartButton").dispatch("click");
}

function clickSave(app) {
  app.document.getElementById("saveButton").dispatch("click");
}

function playPath(app, playerName, choiceIds) {
  startScenario(app, playerName);
  for (let i = 0; i < choiceIds.length; i += 1) {
    clickChoice(app, choiceIds[i]);
    if (i < choiceIds.length - 1) {
      clickContinue(app);
    }
  }
  clickContinue(app);
}

function countOccurrences(text, pattern) {
  const matches = text.match(pattern);
  return matches ? matches.length : 0;
}

function getScoreValues(app) {
  const html = app.document.getElementById("scoreBoard").innerHTML;
  const scores = {};
  const regex =
    /<article class="metric-card[^"]*" data-metric="([^"]+)">[\s\S]*?<span class="metric-value">([0-9]+)<\/span>/g;
  let match = regex.exec(html);

  while (match) {
    scores[match[1]] = Number(match[2]);
    match = regex.exec(html);
  }

  return scores;
}

function getMeterFillState(app) {
  return app.document
    .getElementById("scoreBoard")
    .querySelectorAll(".meter-fill")
    .map((fill) => ({
      targetWidth: Number(fill.dataset.targetWidth),
      width: fill.style.width,
    }));
}

function getCaseBoardNoteCount(app) {
  return countOccurrences(app.document.getElementById("insightsPanel").innerHTML, /class="insight-card board-note"/g);
}

function getChoiceButtonCount(app) {
  return countOccurrences(app.document.getElementById("screenRoot").innerHTML, /data-choice-id="/g);
}

function getDisabledChoiceCount(app) {
  return countOccurrences(app.document.getElementById("screenRoot").innerHTML, /data-choice-id="[^"]+"[^>]*disabled/g);
}

function getCurrentScreenHTML(app) {
  return app.document.getElementById("screenRoot").innerHTML;
}

function getStageStatuses(app) {
  const html = app.document.getElementById("stageTracker").innerHTML;
  const statuses = [];
  const regex = /<li class="stage-item is-([^"]+)">[\s\S]*?<strong>([^<]+)<\/strong>/g;
  let match = regex.exec(html);

  while (match) {
    statuses.push({ status: match[1], title: match[2] });
    match = regex.exec(html);
  }

  return statuses;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runTest(id, title, fn) {
  try {
    const evidence = fn();
    return { id, title, status: "PASS", evidence };
  } catch (error) {
    return { id, title, status: "FAIL", evidence: error.message };
  }
}

function staticTest(id, title, status, evidence) {
  return { id, title, status, evidence };
}

const STRONG_PATH = [
  "bp-root-cause",
  "po-outcome",
  "pm-assumptions",
  "ux-journey",
  "sd-constraints",
  "dev-ambiguity",
  "qa-examples",
  "rec-focused-mvp",
];

const MIXED_PATH = [
  "bp-root-cause",
  "po-outcome",
  "pm-assumptions",
  "ux-journey",
  "sd-constraints",
  "dev-ambiguity",
  "qa-examples",
  "rec-big-bang",
];

const IMPROVEMENT_PATH = [
  "bp-root-cause",
  "po-outcome",
  "pm-assumptions",
  "ux-journey",
  "sd-automate-all",
  "dev-code-now",
  "qa-infer",
  "rec-big-bang",
];

const results = [];

results.push(
  runTest("UAT-001", "Home page loads successfully", () => {
    const app = createApp();
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Complaint Case Tracker Improvement"), "Scenario title missing");
    assert(html.includes("Step into the BA chair"), "Intro copy missing");
    return "Intro page rendered with scenario title and hero content.";
  })
);

results.push(
  runTest("UAT-002", "Home page shows the required intro panels", () => {
    const app = createApp();
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Enter your name"), "Name field missing");
    assert(html.includes("Your role"), "Your role missing");
    assert(html.includes("How to play"), "How to play missing");
    assert(html.includes("Learning lens"), "Learning lens missing");
    assert(app.document.getElementById("scoreBoard").innerHTML.includes("Business Understanding"), "Signal board missing");
    assert(app.document.getElementById("insightsPanel").innerHTML.includes("Your wall is still blank"), "Case Board empty state missing");
    assert(app.document.getElementById("stageTracker").innerHTML.includes("Understand the problem"), "Scenario Flow missing");
    return "All required home-page panels rendered.";
  })
);

results.push(
  runTest("UAT-003", "BA Signal Board starts evenly", () => {
    const app = createApp();
    const scores = getScoreValues(app);
    const widths = getMeterFillState(app).map((item) => item.targetWidth);
    assert(Object.values(scores).every((value) => value === 30), "Initial scores are not all 30");
    assert(widths.every((value) => value === 30), "Initial meter widths are not all 30");
    return "All four metrics start at 30 with matching meter widths.";
  })
);

results.push(
  runTest("UAT-004", "Optional name field accepts up to 30 characters", () => {
    const app = createApp();
    const html = getCurrentScreenHTML(app);
    assert(html.includes('maxlength="30"'), "Name input maxlength is not 30");
    return "Name input is configured with maxlength 30.";
  })
);

results.push(
  runTest("UAT-005", "Start scenario from home page", () => {
    const app = createApp();
    startScenario(app, "");
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Head of Complaints Operations"), "Scene 1 did not load");
    assert(app.document.getElementById("saveButton").hidden === false, "Save button still hidden");
    assert(app.document.getElementById("restartButton").hidden === false, "Restart button still hidden");
    return "Start action loads Maya scene and reveals run actions.";
  })
);

results.push(
  runTest("UAT-006", "Scenario works with blank name", () => {
    const app = createApp();
    startScenario(app, "");
    const html = getCurrentScreenHTML(app);
    assert(!html.includes("Hi ,"), "Blank name produced awkward greeting");
    return "Blank-name run starts without malformed greeting.";
  })
);

results.push(
  runTest("UAT-007", "NPC greeting uses entered name", () => {
    const app = createApp();
    startScenario(app, "Angela");
    let html = getCurrentScreenHTML(app);
    assert(html.includes("Hi Angela,"), "Scene 1 greeting missing player name");
    clickChoice(app, "bp-root-cause");
    clickContinue(app);
    html = getCurrentScreenHTML(app);
    assert(html.includes("Hi Angela,"), "Scene 2 greeting missing player name");
    return "Player name appears in NPC greetings across scenes.";
  })
);

results.push(
  runTest("UAT-008", "Name persists after save and reload", () => {
    const app = createApp();
    startScenario(app, "Angela");
    clickChoice(app, "bp-root-cause");
    clickSave(app);
    const reloaded = createApp(app.storage.snapshot());
    const html = getCurrentScreenHTML(reloaded);
    assert(html.includes("Hi Angela,"), "Reloaded run did not preserve player name");
    return "Saved run restores Angela greeting after reload.";
  })
);

results.push(
  runTest("UAT-009", "Each scene shows correct NPC metadata", () => {
    const app = createApp();
    startScenario(app, "Angela");
    const pairs = [
      ["bp-root-cause", "Maya", "Business stakeholder"],
      ["po-outcome", "Lena", "Product Owner"],
      ["pm-assumptions", "Chris", "Project Manager"],
      ["ux-journey", "Nia", "UX Designer"],
      ["sd-constraints", "Omar", "Solution Designer"],
      ["dev-ambiguity", "Ethan", "Developer"],
      ["qa-examples", "Priya", "Tester"],
    ];
    for (const [choiceId, npcName, role] of pairs) {
      const html = getCurrentScreenHTML(app);
      assert(html.includes(npcName), `NPC name ${npcName} missing`);
      assert(html.includes(role), `Role ${role} missing`);
      assert(html.includes("Scene "), "Scene count missing");
      assert(html.includes('class="scene-illustration"'), `Illustration missing for ${npcName}`);
      clickChoice(app, choiceId);
      clickContinue(app);
    }
    return "All seven NPC scenes show expected metadata and portraits.";
  })
);

results.push(
  staticTest(
    "UAT-010",
    "NPC portraits float during scenes",
    /\\.scene-illustration[\s\S]*animation:\s*float-bob/.test(loadStyles()) ? "PASS" : "FAIL",
    "Verified from CSS that `.scene-illustration` uses `float-bob` animation. Visual motion not browser-confirmed."
  )
);

results.push(
  runTest("UAT-011", "Each scene offers exactly three responses", () => {
    const app = createApp();
    startScenario(app, "");
    assert(getChoiceButtonCount(app) === 3, "Scene does not show exactly 3 choices");
    assert(/\\.choice-button[\s\S]*cursor:\s*pointer/.test(loadStyles()), "Choice button cursor pointer rule missing");
    return "Scene renders 3 choices and CSS includes hand cursor rule.";
  })
);

results.push(
  runTest("UAT-012", "Choice selection locks the scene", () => {
    const app = createApp();
    startScenario(app, "");
    clickChoice(app, "bp-root-cause");
    assert(getDisabledChoiceCount(app) === 3, "Choices were not disabled after selection");
    return "All three choice buttons render disabled after selection.";
  })
);

results.push(
  runTest("UAT-013", "Immediate feedback appears after each choice", () => {
    const app = createApp();
    startScenario(app, "");
    clickChoice(app, "bp-root-cause");
    const html = getCurrentScreenHTML(app);
    assert(html.includes("You"), "Player chat bubble missing");
    assert(html.includes("reacts"), "NPC reaction missing");
    assert(html.includes("Continue"), "Continue button missing");
    assert(html.includes("Business Understanding: +10"), "Impact chips missing");
    return "Player bubble, reaction, impact chips, and continue button render after selection.";
  })
);

results.push(
  runTest("UAT-014", "Continue advances to the next scene in sequence", () => {
    const app = createApp();
    startScenario(app, "");
    clickChoice(app, "bp-root-cause");
    clickContinue(app);
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Complaints Platform Product Owner"), "Did not advance to Lena scene");
    return "Continue moves from Maya to Lena.";
  })
);

results.push(
  runTest("UAT-015", "Numeric scores update after a scene outcome", () => {
    const app = createApp();
    startScenario(app, "");
    const before = getScoreValues(app);
    clickChoice(app, "bp-root-cause");
    const after = getScoreValues(app);
    assert(after.businessUnderstanding === before.businessUnderstanding + 10, "Business Understanding did not update");
    assert(after.teamTrust === before.teamTrust + 4, "Team Trust did not update");
    assert(after.riskExposure === before.riskExposure - 5, "Risk Exposure did not update");
    return `Scores updated from ${JSON.stringify(before)} to ${JSON.stringify(after)}.`;
  })
);

results.push(
  runTest("UAT-016", "Score meter bars update their length with score changes", () => {
    const app = createApp();
    startScenario(app, "");
    clickChoice(app, "bp-root-cause");
    const fills = getMeterFillState(app);
    const widths = fills.map((fill) => Number.parseFloat(fill.style.width));
    assert(widths.includes(40), "Updated BU width not found");
    assert(widths.includes(34), "Updated TT width not found");
    assert(widths.includes(25), "Updated Risk width not found");
    return `Meter fill widths updated to ${widths.join(", ")}.`;
  })
);

results.push(
  runTest("UAT-017", "Score card status text matches current score band", () => {
    const app = createApp();
    playPath(app, "Angela", STRONG_PATH);
    const html = app.document.getElementById("scoreBoard").innerHTML;
    assert(html.includes("Strong"), "Strong status missing");
    assert(html.includes("Solid"), "Solid status missing");
    assert(html.includes("Contained"), "Contained risk status missing");
    return "Score status bands match end-state score ranges.";
  })
);

results.push(
  runTest("UAT-018", "Risk Exposure behaves inversely", () => {
    const risky = createApp();
    startScenario(risky, "");
    clickChoice(risky, "bp-dashboard");
    const riskyScore = getScoreValues(risky).riskExposure;

    const safe = createApp();
    startScenario(safe, "");
    clickChoice(safe, "bp-root-cause");
    const safeScore = getScoreValues(safe).riskExposure;

    assert(riskyScore > 30, "Risk did not increase after risky choice");
    assert(safeScore < 30, "Risk did not decrease after safer choice");
    return `Risk moved to ${riskyScore} for risky choice and ${safeScore} for safer choice.`;
  })
);

results.push(
  runTest("UAT-019", "Insights unlock only when configured", () => {
    const app = createApp();
    startScenario(app, "");
    clickChoice(app, "bp-root-cause");
    assert(getCaseBoardNoteCount(app) === 1, "Expected 1 note after insight choice");
    clickContinue(app);
    clickChoice(app, "po-lock-backlog");
    assert(getCaseBoardNoteCount(app) === 1, "Unexpected new note from non-insight choice");
    return "Insight count changes only on configured choices.";
  })
);

results.push(
  runTest("UAT-020", "Case Board cards remain visible later in the run", () => {
    const app = createApp();
    startScenario(app, "");
    clickChoice(app, "bp-root-cause");
    clickContinue(app);
    clickChoice(app, "po-user-group");
    clickContinue(app);
    clickChoice(app, "pm-assumptions");
    assert(getCaseBoardNoteCount(app) === 3, "Expected 3 notes after three insight choices");
    return "Unlocked Case Board notes persist across later scenes.";
  })
);

results.push(
  runTest("UAT-021", "Scenario Flow highlights current stage", () => {
    const app = createApp();
    startScenario(app, "");
    let statuses = getStageStatuses(app);
    assert(statuses[0].status === "active", "Stage 1 should start active");
    clickChoice(app, "bp-root-cause");
    clickContinue(app);
    clickChoice(app, "po-outcome");
    clickContinue(app);
    clickChoice(app, "pm-assumptions");
    clickContinue(app);
    statuses = getStageStatuses(app);
    assert(statuses[0].status === "complete", "Stage 1 should be complete by Scene 4");
    assert(statuses[1].status === "active", "Stage 2 should be active by Scene 4");
    return "Stage tracker updates active and completed states across progression.";
  })
);

results.push(
  runTest("UAT-022", "Save stores progress", () => {
    const app = createApp();
    startScenario(app, "Angela");
    clickChoice(app, "bp-root-cause");
    clickContinue(app);
    clickChoice(app, "po-outcome");
    clickSave(app);
    const snapshot = app.storage.snapshot();
    assert(snapshot[STORAGE_KEY], "Saved state missing from localStorage");
    assert(app.document.getElementById("saveButton").textContent === "Saved", "Save button did not show Saved state");
    return "Run persisted into localStorage with Saved button feedback.";
  })
);

results.push(
  runTest("UAT-023", "Reload restores the same progress point", () => {
    const app = createApp();
    startScenario(app, "Angela");
    clickChoice(app, "bp-root-cause");
    clickContinue(app);
    clickChoice(app, "po-outcome");
    clickSave(app);
    const reloaded = createApp(app.storage.snapshot());
    const html = getCurrentScreenHTML(reloaded);
    const scores = getScoreValues(reloaded);
    assert(html.includes("Complaints Platform Product Owner"), "Reload did not return to Lena scene outcome state");
    assert(html.includes("Room opens up"), "Reload did not preserve selected outcome state");
    assert(scores.businessUnderstanding === 48, "Reloaded scores incorrect");
    return "Reload restored current scene, selected outcome state, scores, and player name.";
  })
);

results.push(
  runTest("UAT-024", "Restart clears saved state and resets the run", () => {
    const app = createApp();
    startScenario(app, "Angela");
    clickChoice(app, "bp-root-cause");
    clickSave(app);
    clickRestart(app);
    assert(!app.storage.snapshot()[STORAGE_KEY], "Saved state not cleared");
    assert(getCurrentScreenHTML(app).includes("Step into the BA chair"), "Home page not restored");
    const scores = getScoreValues(app);
    assert(Object.values(scores).every((value) => value === 30), "Scores not reset to 30");
    return "Restart clears save and returns to intro with reset scores.";
  })
);

results.push(
  runTest("UAT-025", "Strong outcome renders correct title, trophy, and message", () => {
    const app = createApp();
    playPath(app, "Angela", STRONG_PATH);
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Grounded MVP, Confident Team"), "Strong title missing");
    assert(html.includes("ba-trophy.svg"), "Gold trophy missing");
    assert(html.includes("Congrats Angela, you have won a Gold BA Trophy"), "Gold congrats message missing");
    assert(countOccurrences(html, /class="confetti-piece"/g) === 30, "Confetti count mismatch");
    return "Strong outcome title, gold trophy, message, and confetti rendered.";
  })
);

results.push(
  runTest("UAT-026", "Mixed outcome renders correct title, trophy, and message", () => {
    const app = createApp();
    playPath(app, "Angela", MIXED_PATH);
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Progress Made, But Gaps Remain"), "Mixed title missing");
    assert(html.includes("ba-trophy-silver.svg"), "Silver trophy missing");
    assert(html.includes("Congrats Angela, you have won a Silver BA Trophy"), "Silver congrats missing");
    assert(countOccurrences(html, /class="confetti-piece"/g) === 30, "Confetti count mismatch");
    return "Mixed outcome title, silver trophy, message, and confetti rendered.";
  })
);

results.push(
  runTest("UAT-027", "Improvement needed outcome renders correct title, trophy, and message", () => {
    const app = createApp();
    playPath(app, "Angela", IMPROVEMENT_PATH);
    const html = getCurrentScreenHTML(app);
    assert(html.includes("Busy Delivery, Weak Diagnosis"), "Improvement title missing");
    assert(html.includes("IMPROVEMENT NEEDED"), "Improvement category missing");
    assert(html.includes("ba-trophy-bronze.svg"), "Bronze trophy missing");
    assert(html.includes("Congrats Angela, you have won a Bronze BA Trophy"), "Bronze congrats missing");
    return "Improvement-needed title, category, bronze trophy, and message rendered.";
  })
);

results.push(
  runTest("UAT-028", "Mixed or improvement-needed high risk is highlighted in red", () => {
    const app = createApp();
    playPath(app, "Angela", IMPROVEMENT_PATH);
    const html = getCurrentScreenHTML(app);
    assert(html.includes("score-summary-card-risk-alert"), "Risk alert class missing");
    return "High-risk ending applies risk-alert class to Risk Exposure summary.";
  })
);

results.push(
  runTest("UAT-029", "Recommendation text on outcome page matches latest wording", () => {
    const app = createApp();
    playPath(app, "Angela", [
      "bp-root-cause",
      "po-outcome",
      "pm-assumptions",
      "ux-journey",
      "sd-constraints",
      "dev-ambiguity",
      "qa-examples",
      "rec-thin-tool",
    ]);
    const html = getCurrentScreenHTML(app);
    assert(
      html.includes("leaving more complicated situations, such as complaints being reopened or deadline timers being paused, for a later release."),
      "Outcome page is not using latest recommendation wording"
    );
    return "Ending page resolves the current plain-English recommendation wording.";
  })
);

results.push(
  runTest("UAT-030", "Outcome-specific guidance differs by ending", () => {
    const strong = createApp();
    playPath(strong, "Angela", STRONG_PATH);
    const strongHtml = getCurrentScreenHTML(strong);

    const mixed = createApp();
    playPath(mixed, "Angela", MIXED_PATH);
    const mixedHtml = getCurrentScreenHTML(mixed);

    const poor = createApp();
    playPath(poor, "Angela", IMPROVEMENT_PATH);
    const poorHtml = getCurrentScreenHTML(poor);

    assert(strongHtml.includes("Keep sharpening next run"), "Strong improvement heading missing");
    assert(mixedHtml.includes("What to tighten next run"), "Mixed improvement heading missing");
    assert(poorHtml.includes("Recovery plan for next run"), "Improvement-needed heading missing");
    return "Each ending renders distinct guidance and headings.";
  })
);

results.push(
  runTest("UAT-031", "Improvement-needed recovery plan covers all four BA metrics", () => {
    const app = createApp();
    playPath(app, "Angela", IMPROVEMENT_PATH);
    const html = getCurrentScreenHTML(app);
    ["Business Understanding:", "Team Trust:", "Delivery Readiness:", "Risk Exposure:"].forEach((label) => {
      assert(html.includes(label), `Recovery plan missing ${label}`);
    });
    return "Recovery plan includes all four BA metric areas.";
  })
);

results.push(
  runTest("UAT-032", "Improvement-needed recovery plan gives extra risk guidance when risk is high", () => {
    const app = createApp();
    playPath(app, "Angela", IMPROVEMENT_PATH);
    const html = getCurrentScreenHTML(app);
    assert(html.includes("red warning signal"), "High-risk warning text missing");
    assert(html.includes("dependencies"), "Dependency guidance missing");
    assert(html.includes("reduce the MVP until the remaining scope is safe"), "Risk mitigation guidance missing");
    return "High-risk recovery guidance includes explicit risk-management steps.";
  })
);

results.push(
  staticTest(
    "UAT-033",
    "Laptop-width layout remains usable",
    /@media \(max-width: 1320px\)/.test(loadStyles()) ? "PARTIAL" : "FAIL",
    "Code-level check only: laptop breakpoint rules exist at 1320px, but no live browser rendering was available."
  )
);

results.push(
  staticTest(
    "UAT-034",
    "Mobile-width stack order remains understandable",
    /@media \(max-width: 760px\)[\s\S]*\.content-panel[\s\S]*order:\s*1;[\s\S]*\.sidebar-right[\s\S]*order:\s*2;[\s\S]*\.sidebar-left[\s\S]*order:\s*3;/.test(
      loadStyles()
    )
      ? "PARTIAL"
      : "FAIL",
    "Code-level check only: mobile stack order rules are present, but no live browser rendering was available."
  )
);

results.push(
  staticTest(
    "UAT-035",
    "All major decorative motion remains non-blocking",
    /\.confetti-layer[\s\S]*pointer-events:\s*none;/.test(loadStyles()) &&
      /\.scene-illustration[\s\S]*animation:\s*float-bob/.test(loadStyles())
      ? "PARTIAL"
      : "FAIL",
    "Code-level check only: confetti is non-interactive and motion styles are present, but interaction overlap was not visually confirmed."
  )
);

const summary = results.reduce(
  (acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  },
  { PASS: 0, FAIL: 0, PARTIAL: 0 }
);

let markdown = "# UAT Results\n\n";
markdown += `Generated from local Node-based harness and static code inspection.\n\n`;
markdown += `- PASS: ${summary.PASS}\n`;
markdown += `- PARTIAL: ${summary.PARTIAL}\n`;
markdown += `- FAIL: ${summary.FAIL}\n\n`;
markdown +=
  "Note: full GUI-browser execution was attempted, but Safari automation could not be used because local GUI control was not approved. Visual and responsive-only cases are marked `PARTIAL` where the code supports the behavior but live browser confirmation is still recommended.\n\n";
markdown += "| ID | Result | Title | Evidence |\n";
markdown += "|---|---|---|---|\n";
for (const result of results) {
  markdown += `| ${result.id} | ${result.status} | ${result.title} | ${String(result.evidence).replace(/\n/g, "<br>")} |\n`;
}

fs.writeFileSync(path.join(ROOT, "UAT_RESULTS.md"), markdown);
console.log(markdown);
