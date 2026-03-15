# BA Simulation Game - UAT Test Cases

## Purpose
This document provides manual UAT coverage for the MVP prototype so testers can validate the full user journey before broader sharing.

## Scope
In scope:
- Home page and scenario start
- Name personalisation
- Scene progression across all 8 scenes
- Response selection, feedback, and score updates
- BA Signal Board, Case Board, and Scenario Flow
- Save, restore, and restart behaviour
- Outcome screens, trophies, and confetti
- Desktop browser usability

Out of scope:
- Backend, authentication, analytics, and multi-user behaviour
- Mobile app packaging
- Cross-browser edge cases outside modern desktop browsers

## Test Environment
- URL: deployed GitHub Pages or local `index.html`
- Browser: latest Chrome recommended
- Secondary browser check: latest Safari or Edge
- Screen sizes:
  - Desktop: 1440x900 or similar
  - Laptop: 1280x800 or similar
  - Mobile-width responsive spot check: browser dev tools around 390x844

## Test Data
- Sample player name: `Angela`
- Max-length player name: `AlexandriaProductOwnerReview1` (30 chars)
- Over-length input sample: `AlexandriaProductOwnerReview123456`

## Outcome Paths
Use these verified choice paths when you need to force a specific ending.

### Strong Outcome Path
1. Maya: `Ask which complaint types are delayed most and where the handoff breaks down today.`
2. Lena: `Ask what outcome would define success even if most feature ideas are deferred.`
3. Chris: `Ask which date is truly fixed and which assumptions make the schedule risky.`
4. Nia: `Ask for a walkthrough of the current user journey and the exact moment people lose context.`
5. Omar: `Ask which constraints are non-negotiable and what low-risk integration path exists for MVP.`
6. Ethan: `Ask which rules or edge cases are ambiguous enough to block implementation confidence.`
7. Priya: `Define acceptance criteria with examples for reopen, pause, and ownership change scenarios.`
8. Recommendation: `Recommend a focused MVP for operations analysts: centralised intake, clear ownership, SLA visibility, and audit notes, while deferring broader redesign and heavy automation.`

Expected final scores:
- Business Understanding: `79`
- Team Trust: `63`
- Delivery Readiness: `75`
- Risk Exposure: `0`

### Mixed Outcome Path
1. Maya: `Ask which complaint types are delayed most and where the handoff breaks down today.`
2. Lena: `Ask what outcome would define success even if most feature ideas are deferred.`
3. Chris: `Ask which date is truly fixed and which assumptions make the schedule risky.`
4. Nia: `Ask for a walkthrough of the current user journey and the exact moment people lose context.`
5. Omar: `Ask which constraints are non-negotiable and what low-risk integration path exists for MVP.`
6. Ethan: `Ask which rules or edge cases are ambiguous enough to block implementation confidence.`
7. Priya: `Define acceptance criteria with examples for reopen, pause, and ownership change scenarios.`
8. Recommendation: `Recommend a broad transformation that redesigns every complaint channel, adds reporting, and automates all handoffs in the first release.`

Expected final scores:
- Business Understanding: `68`
- Team Trust: `58`
- Delivery Readiness: `63`
- Risk Exposure: `15`

### Improvement Needed Path
1. Maya: `Ask which complaint types are delayed most and where the handoff breaks down today.`
2. Lena: `Ask what outcome would define success even if most feature ideas are deferred.`
3. Chris: `Ask which date is truly fixed and which assumptions make the schedule risky.`
4. Nia: `Ask for a walkthrough of the current user journey and the exact moment people lose context.`
5. Omar: `Promise real-time automation across every handoff and worry about architecture later.`
6. Ethan: `Ask engineering to start coding from meeting notes and clarify details during UAT (User Acceptance Testing).`
7. Priya: `Say QA can infer the expected behaviour from story titles and meeting notes.`
8. Recommendation: `Recommend a broad transformation that redesigns every complaint channel, adds reporting, and automates all handoffs in the first release.`

Expected final scores:
- Business Understanding: `54`
- Team Trust: `41`
- Delivery Readiness: `24`
- Risk Exposure: `49`

## UAT Test Cases

### Home Page

**UAT-001 - Home page loads successfully**
- Priority: High
- Precondition: Open the app in a desktop browser.
- Steps:
  1. Load the home page.
- Expected result:
  1. The page loads without console-visible errors or broken layout.
  2. The title `BA Simulation Game` is visible.
  3. The scenario title `Complaint Case Tracker Improvement` is visible.
  4. The BA hero image is visible and floating.

**UAT-002 - Home page shows the required intro panels**
- Priority: High
- Steps:
  1. Review the home page content.
- Expected result:
  1. `Enter your name`, `Your role`, `How to play`, `Learning lens`, `BA Signal Board`, `Case Board`, and `Scenario Flow` are visible.
  2. The stage route section shows `Stage 1` to `Stage 4`.

**UAT-003 - BA Signal Board starts evenly**
- Priority: High
- Steps:
  1. Observe the BA Signal Board before starting.
- Expected result:
  1. All four starting scores are equal.
  2. All four colored meter bars show the same starting length.

**UAT-004 - Optional name field accepts up to 30 characters**
- Priority: High
- Steps:
  1. Enter a 30-character name.
  2. Try to type additional characters.
- Expected result:
  1. The field accepts up to 30 characters only.
  2. Additional characters are blocked.

**UAT-005 - Start scenario from home page**
- Priority: High
- Steps:
  1. Click `Start scenario`.
- Expected result:
  1. Scene 1 opens.
  2. Save and Restart buttons become visible.
  3. The current NPC is Maya.

### Name Personalisation

**UAT-006 - Scenario works with blank name**
- Priority: High
- Steps:
  1. Leave the name field blank.
  2. Start the scenario.
- Expected result:
  1. The app starts normally.
  2. NPC dialogue does not show awkward empty-name text such as `Hi ,`.

**UAT-007 - NPC greeting uses entered name**
- Priority: High
- Steps:
  1. Enter `Angela`.
  2. Start the scenario.
  3. Open Scene 1 and Scene 2.
- Expected result:
  1. The first dialogue line from NPCs begins with `Hi Angela, ...`
  2. The personalised greeting appears consistently across scenes with named NPCs.

**UAT-008 - Name persists after save and reload**
- Priority: High
- Steps:
  1. Enter `Angela`.
  2. Start the scenario and click `Save`.
  3. Reload the browser page.
- Expected result:
  1. The scenario restores.
  2. The player name remains `Angela`.
  3. NPC greetings still use the saved name.

### Scene Flow And Choices

**UAT-009 - Each scene shows correct NPC metadata**
- Priority: High
- Steps:
  1. Play through all scenes.
- Expected result:
  1. Each scene shows stage number, NPC role tag, NPC title, and NPC name.
  2. The correct cartoon image appears in the top-right of each NPC scene.

**UAT-010 - NPC portraits float during scenes**
- Priority: Medium
- Steps:
  1. Observe any NPC portrait for several seconds.
- Expected result:
  1. The portrait has a subtle floating animation similar to the BA hero image.

**UAT-011 - Each scene offers exactly three responses**
- Priority: High
- Steps:
  1. Review each scene before selecting an answer.
- Expected result:
  1. Three response options are shown.
  2. Only the main response text is visible.
  3. The cursor becomes a hand pointer when hovering over a choice.

**UAT-012 - Choice selection locks the scene**
- Priority: High
- Steps:
  1. Select any response in a scene.
  2. Try clicking another response in the same scene.
- Expected result:
  1. The selected response is shown as chosen.
  2. Other responses are disabled.
  3. Only one answer is counted for that scene.

**UAT-013 - Immediate feedback appears after each choice**
- Priority: High
- Steps:
  1. Select any response.
- Expected result:
  1. The chosen response appears as a player chat bubble.
  2. NPC reaction feedback appears below it.
  3. Score impact chips appear.
  4. A `Continue` button appears.

**UAT-014 - Continue advances to the next scene in sequence**
- Priority: High
- Steps:
  1. Select a response.
  2. Click `Continue`.
- Expected result:
  1. The next configured scene loads.
  2. The previous scene is not shown again unless the full run is restarted.

### BA Signal Board

**UAT-015 - Numeric scores update after a scene outcome**
- Priority: High
- Steps:
  1. Note the four scores before choosing an answer.
  2. Select a response.
- Expected result:
  1. The score values change immediately after the outcome appears.
  2. The changed metric shows a visible delta chip such as `+5` or `-3`.

**UAT-016 - Score meter bars update their length with score changes**
- Priority: High
- Steps:
  1. Note the bar lengths before choosing an answer.
  2. Select a response with a known score change.
- Expected result:
  1. The colored meter bar lengths animate to the new live score values.
  2. The bar changes match the displayed numeric score.

**UAT-017 - Score card status text matches current score band**
- Priority: Medium
- Steps:
  1. Play enough scenes to move a score up and down.
- Expected result:
  1. The label under each metric updates appropriately, for example `Fragile`, `Emerging`, `Solid`, `Strong`, or the risk equivalents.

**UAT-018 - Risk Exposure behaves inversely**
- Priority: High
- Steps:
  1. Choose a risky response.
  2. Choose a lower-risk response in another scene.
- Expected result:
  1. Risk Exposure increases after the risky choice.
  2. Risk Exposure decreases after the safer choice.
  3. The UI still clearly signals that lower risk is better.

### Case Board

**UAT-019 - Insights unlock only when configured**
- Priority: High
- Steps:
  1. Choose a response known to unlock an insight.
  2. In another scene, choose a response with no insight.
- Expected result:
  1. The first choice adds a new Case Board note.
  2. The second choice does not create a new note.

**UAT-020 - Case Board cards remain visible later in the run**
- Priority: High
- Steps:
  1. Unlock at least two insights.
  2. Continue through later scenes.
- Expected result:
  1. Previously unlocked notes remain visible.
  2. Note title, type, source, and stage label remain readable.

### Scenario Flow

**UAT-021 - Scenario Flow highlights current stage**
- Priority: Medium
- Steps:
  1. Start the scenario and move from Stage 1 to Stage 4.
- Expected result:
  1. The active stage changes as the player progresses.
  2. Completed stages show as completed.
  3. Upcoming stages remain clearly marked.

### Save, Restore, And Restart

**UAT-022 - Save stores progress**
- Priority: High
- Steps:
  1. Start a run and complete at least two scenes.
  2. Click `Save`.
- Expected result:
  1. The Save button gives visible success feedback.
  2. Progress is retained in browser storage.

**UAT-023 - Reload restores the same progress point**
- Priority: High
- Precondition: Complete UAT-022.
- Steps:
  1. Reload the browser tab.
- Expected result:
  1. The player returns to the saved scene and saved state.
  2. Scores, insights, selected outcome state, and player name are restored.

**UAT-024 - Restart clears saved state and resets the run**
- Priority: High
- Steps:
  1. During a run, click `Restart run`.
  2. Reload the browser.
- Expected result:
  1. The game returns to the home page.
  2. Scores reset to their initial equal values.
  3. Insights are cleared.
  4. The previous saved run does not reappear after reload.

### Outcome Screens

**UAT-025 - Strong outcome renders correct title, trophy, and message**
- Priority: High
- Precondition: Use the verified Strong Outcome Path.
- Steps:
  1. Finish the run.
- Expected result:
  1. The ending title is `Grounded MVP, Confident Team`.
  2. A gold BA trophy appears on the right.
  3. A gold congratulation message appears under the title.
  4. Confetti plays on landing.

**UAT-026 - Mixed outcome renders correct title, trophy, and message**
- Priority: High
- Precondition: Use the verified Mixed Outcome Path.
- Steps:
  1. Finish the run.
- Expected result:
  1. The ending title is `Progress Made, But Gaps Remain`.
  2. A silver BA trophy appears on the right.
  3. A silver congratulation message appears under the title.
  4. Confetti plays on landing.

**UAT-027 - Improvement needed outcome renders correct title, trophy, and message**
- Priority: High
- Precondition: Use the verified Improvement Needed Path.
- Steps:
  1. Finish the run.
- Expected result:
  1. The ending title is `Busy Delivery, Weak Diagnosis`.
  2. The ending category shows `IMPROVEMENT NEEDED`.
  3. A bronze BA trophy appears on the right.
  4. A bronze congratulation message appears under the title.
  5. Confetti plays on landing.

**UAT-028 - Mixed or improvement-needed high risk is highlighted in red**
- Priority: High
- Precondition: Use a path where final `Risk Exposure > 40`.
- Steps:
  1. Finish the run on mixed or improvement-needed.
- Expected result:
  1. `Risk Exposure` and its score are bold red on the ending score summary.

**UAT-029 - Recommendation text on outcome page matches latest wording**
- Priority: High
- Steps:
  1. Finish a run using the `rec-thin-tool` recommendation.
- Expected result:
  1. The ending page shows the latest plain-English recommendation text.
  2. It does not show outdated wording from older saved labels.

**UAT-030 - Outcome-specific guidance differs by ending**
- Priority: High
- Steps:
  1. Complete one strong, one mixed, and one improvement-needed run.
- Expected result:
  1. Strong outcome uses refinement-oriented guidance.
  2. Mixed outcome uses tighter-fix guidance.
  3. Improvement-needed uses a more detailed recovery plan.
  4. The guidance is not identical across all endings.

### Improvement Needed Detailed Coaching

**UAT-031 - Improvement-needed recovery plan covers all four BA metrics**
- Priority: High
- Precondition: Use the verified Improvement Needed Path.
- Steps:
  1. Review the second coaching block on the ending page.
- Expected result:
  1. The recovery plan contains concrete guidance for:
     - Business Understanding
     - Team Trust
     - Delivery Readiness
     - Risk Exposure

**UAT-032 - Improvement-needed recovery plan gives extra risk guidance when risk is high**
- Priority: High
- Precondition: Use the verified Improvement Needed Path with `Risk Exposure = 49`.
- Steps:
  1. Review the Risk Exposure item.
- Expected result:
  1. The risk item explicitly warns that this is the red warning signal.
  2. It tells the tester to name dependencies, assumptions, compliance concerns, unresolved rules, and cut scope if risk remains open.

### Responsive And Visual Checks

**UAT-033 - Laptop-width layout remains usable**
- Priority: Medium
- Steps:
  1. Resize the browser to around 1280px width.
- Expected result:
  1. Main content remains readable.
  2. BA Signal Board, main scene, and Scenario Flow remain usable without major overlap.

**UAT-034 - Mobile-width stack order remains understandable**
- Priority: Medium
- Steps:
  1. Resize to around 390px width in browser dev tools.
- Expected result:
  1. The content stacks in a sensible order.
  2. Buttons remain tappable.
  3. Text does not overflow the layout badly.

**UAT-035 - All major decorative motion remains non-blocking**
- Priority: Low
- Steps:
  1. Observe home page and ending page animations.
  2. Play through several scenes.
- Expected result:
  1. Floating portraits, confetti, and reaction transitions do not block buttons or text.
  2. The UI remains readable while animations are active.

## Exit Criteria
Recommended release confidence before external sharing:
- All High priority cases pass
- No blocker or critical usability issue remains open
- At least one full strong, mixed, and improvement-needed run is verified end to end
- Save, reload, and restart are confirmed working

## Tester Feedback Prompts
Ask each tester:
- Did the scenario feel realistic?
- Did you understand what the BA was supposed to do?
- Did the score and feedback feel fair?
- Which scene felt strongest?
- Which scene felt confusing?
- Did the ending feedback help you learn what to improve?
