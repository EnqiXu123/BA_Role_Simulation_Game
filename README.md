# BA_Role_Simulation_Game

Browser-based MVP prototype for a Business Analyst simulation game.

## Prototype contents

- `index.html`: single-page UI shell
- `styles.css`: visual system and responsive layout
- `scenario.js`: structured scenario data, score model, and ending copy
- `app.js`: rendering, state management, progression, and replay logic

## How to run

Open `index.html` in a modern desktop browser.

## Current MVP coverage

- Start screen with scenario briefing
- Seven NPC conversations across four stages
- Choice-driven responses with immediate feedback
- Live score indicators for BA learning dimensions
- Unlockable insights panel
- Final MVP recommendation screen
- Threshold-based ending summary with replay

Product Requirements Document (PRD)
Product name

BA Simulation Game – MVP

Document version

v1.0

Product owner

Enqi Xu


The MVP is intended to be lightweight, browser-based, choice-driven, and suitable for iterative build using vibe coding / Codex.

1. Product overview
1.1 Product vision

Create an interactive educational game where a player takes the role of a Business Analyst in a bank project team, works with NPCs across delivery and business roles, uncovers a real business problem, and guides the team toward an MVP solution.

The product should make BA learning:

practical

engaging

low-pressure

realistic

replayable

1.2 Product goal

Help beginner BAs learn core BA behaviours through simulation rather than passive reading.

1.3 Background

New BAs often understand BA concepts in theory but struggle to understand:

who they should talk to

what questions they should ask

how different project roles think

how to balance conflicting priorities

how to move from pain point to workable MVP

This game addresses that gap through a guided scenario with realistic stakeholder interactions.

2. Problem statement

People new to BA roles often lack safe, practical ways to build confidence in stakeholder engagement, elicitation, prioritisation, and delivery thinking before working on real projects.

Traditional learning methods such as documents, templates, or theory-based training do not fully prepare them for:

ambiguous business requests

conflicting team priorities

incomplete information

delivery pressure

translating needs into clear, practical outcomes

There is a need for an interactive learning experience that simulates real project conversations and decisions in a simple, beginner-friendly way.

3. Objectives
3.1 Primary objective

Enable new BAs to practise core BA thinking and stakeholder interaction skills in a realistic but manageable scenario.

3.2 Secondary objectives

Make BA learning feel fun and interactive

Demonstrate the value of the BA role across a project team

Show that strong BA work is about problem understanding, alignment, and clarity

Create a strong foundation for future expansion into more scenarios

3.3 MVP success objective

Deliver a playable browser-based prototype where a user can complete one scenario from start to finish and receive meaningful outcome feedback.

4. Target users
4.1 Primary users

People who are:

new to Business Analyst roles

aspiring BAs

junior BAs

professionals transitioning into BA work

4.2 Secondary users

managers or mentors supporting BA onboarding

students learning business analysis

professionals curious about project delivery roles

4.3 User characteristics

Target users are likely to:

have limited real project exposure

need structured guidance

prefer practical examples

benefit from simplified but realistic scenarios

feel uncertain about how to talk to different stakeholders

5. In scope for MVP

The MVP will include:

one playable scenario

one player role: Business Analyst

seven NPC roles

dialogue-based interaction

pre-defined multiple-choice responses

score impact from player choices

simple insight/unlock mechanic

one scenario outcome based on player decisions

end-of-game summary and learning feedback

browser-based experience using HTML/CSS/JavaScript

a simple visual interface suitable for early iteration

6. Out of scope for MVP

The MVP will not include:

free text chat with NPCs

AI-generated live conversations

voice input or voice output

multiplayer mode

character movement or open-world navigation

animation-heavy gameplay

inventory/task systems

multiple scenarios

save/load profile system

account creation

advanced analytics dashboard

mobile app packaging

accessibility optimisation beyond basic good practice

localisation / multiple languages

backend database

admin content management system

7. Key product principles

The MVP should be:

7.1 Realistic

NPC roles and project dynamics should reflect real project delivery behaviour in a bank-like environment.

7.2 Beginner-friendly

The user should not need BA experience to understand how to play.

7.3 Educational

Each interaction should teach something meaningful about BA work.

7.4 Simple

The game should stay lightweight and easy to change during build.

7.5 Replayable

Users should feel they can replay and improve outcomes.

8. Core concept
8.1 Player role

The player is a Business Analyst.

8.2 Team members

The scenario includes these team roles:

Main player – BA

NPC – Product Owner

NPC – UX Designer

NPC – Solution Designer

NPC – Developer

NPC – Tester

NPC – Business Person

NPC – Project Manager

8.3 Scenario concept

A Business Person raises a pain point related to the complaint handling process in a bank. The player must work with the project team to understand the real problem, clarify scope, identify constraints, and recommend a realistic MVP.

9. User journey
9.1 High-level user journey
Step 1 – Start game

The user opens the game and sees:

title

short scenario intro

explanation of their role as the BA

Step 2 – Understand the business problem

The user interacts with early NPCs to learn:

current pain points

business impact

timeline pressure

initial scope expectations

Step 3 – Explore user and technical perspectives

The user interacts with team members to understand:

workflow pain points

user experience concerns

technical dependencies

feasibility constraints

Step 4 – Prepare for delivery

The user interacts with build/test roles to understand:

missing logic

edge cases

acceptance criteria

quality concerns

Step 5 – Make final recommendation

The user selects a recommended MVP path.

Step 6 – Review outcome

The game presents:

ending result

score summary

learning feedback

10. Gameplay structure
10.1 Stage model

The MVP scenario should be divided into four stages:

Stage 1 – Understand the problem

NPCs:

Business Person

Product Owner

Project Manager

Stage 2 – Explore user and solution space

NPCs:

UX Designer

Solution Designer

Stage 3 – Prepare for build and test

NPCs:

Developer

Tester

Stage 4 – Make recommendation

NPC:

final summary / recommendation screen

11. Functional requirements
11.1 Game start and scenario intro
FR-001 – Start game screen

User story
As a player, I want to see a clear introduction so that I understand the scenario and my role before starting.

Acceptance criteria

GIVEN the user opens the game

WHEN the start screen loads

THEN the system displays the game title

AND displays a short scenario summary

AND explains that the player role is BA

AND provides a clear way to begin the scenario

11.2 NPC conversation flow
FR-002 – Display NPC scene

User story
As a player, I want each scene to clearly show which NPC I am talking to so that I can understand the context of the interaction.

Acceptance criteria

GIVEN the player is in a conversation scene

WHEN the scene loads

THEN the system displays the NPC name

AND displays the current stage

AND displays the NPC dialogue text

FR-003 – Display response choices

User story
As a player, I want to choose from response options so that I can decide how to interact as the BA.

Acceptance criteria

GIVEN a conversation scene is displayed

WHEN the player is ready to respond

THEN the system displays a set of selectable response options

AND each option is clearly readable

AND only one option can be selected per scene

FR-004 – Process selected choice

User story
As a player, I want my selected response to affect the scenario so that my choices matter.

Acceptance criteria

GIVEN the player selects a response option

WHEN the selection is submitted

THEN the system applies the defined score impact

AND shows immediate feedback for that response

AND stores any unlocked insight associated with that choice

AND allows the player to continue to the next scene

11.3 Score tracking
FR-005 – Maintain hidden scores

User story
As a player, I want the game to track my behaviour so that the ending reflects how I played.

Acceptance criteria

GIVEN the player makes choices throughout the scenario

WHEN each choice is processed

THEN the system updates the hidden score values

FR-006 – Score categories

User story
As a product owner, I want score categories aligned to BA learning goals so that results are educational.

Acceptance criteria

GIVEN the scoring model is configured

WHEN the game is played

THEN the system tracks at minimum:

Business Understanding

Team Trust

Delivery Readiness

Risk Exposure

FR-007 – Display score status

User story
As a player, I want to see score indicators so that I can understand progress and consequence direction.

Acceptance criteria

GIVEN the player is in the game

WHEN score panels are shown

THEN the system displays current values or visual indicators for the four score categories

AND the indicators update after each choice

11.4 Insight unlocks
FR-008 – Unlock insights

User story
As a player, I want to unlock useful findings from stakeholder conversations so that the scenario feels investigative and rewarding.

Acceptance criteria

GIVEN a choice includes an unlockable insight

WHEN the player selects that choice

THEN the system adds the insight to the unlocked insights list

AND the insight remains visible for later reference

FR-009 – Show unlocked insights panel

User story
As a player, I want to see what I have learned so far so that I can use it in later decisions.

Acceptance criteria

GIVEN the player has unlocked one or more insights

WHEN the sidebar or notes panel is shown

THEN the system displays all unlocked insights in readable form

11.5 Scene progression
FR-010 – Sequential progression

User story
As a player, I want the scenario to progress in a structured way so that I can follow the learning flow.

Acceptance criteria

GIVEN the player completes a scene

WHEN the player clicks continue

THEN the system loads the next defined scene in sequence

FR-011 – Prevent duplicate choice selection

User story
As a player, I want only my final selected answer to count so that scene logic stays clean.

Acceptance criteria

GIVEN the player has selected an option in a scene

WHEN feedback is displayed

THEN other options in that scene are disabled

11.6 Final recommendation and ending
FR-012 – Final recommendation screen

User story
As a player, I want to make a final MVP recommendation so that I can see whether I balanced stakeholder needs well.

Acceptance criteria

GIVEN the player reaches the final stage

WHEN the final decision screen loads

THEN the system displays multiple recommendation options

AND each option can affect final scores

FR-013 – Determine ending

User story
As a player, I want the ending to reflect my decisions so that the game feels meaningful.

Acceptance criteria

GIVEN the player completes the final recommendation

WHEN ending logic is evaluated

THEN the system determines an ending based on score thresholds

AND displays one ending outcome from a defined set

FR-014 – Display learning summary

User story
As a player, I want feedback on my performance so that I can learn what I did well and what to improve.

Acceptance criteria

GIVEN the ending is displayed

WHEN the result screen loads

THEN the system displays:

ending title

ending narrative

final score summary

learning takeaway

11.7 Replayability
FR-015 – Restart game

User story
As a player, I want to replay the scenario so that I can try different choices and improve my result.

Acceptance criteria

GIVEN the user is on the ending screen

WHEN the user selects restart

THEN the system resets all scores

AND clears unlocked insights

AND restarts the scenario from the beginning

12. NPC design requirements
12.1 NPC role purpose

Each NPC must represent a distinct project perspective.

Business Person

Represents:

business pain

current-state frustration

examples of real issues

Product Owner

Represents:

value

MVP scope

priority

outcome focus

UX Designer

Represents:

user journey

usability

workflow pain points

Solution Designer

Represents:

feasibility

architecture constraints

dependencies

Developer

Represents:

implementation logic

ambiguity reduction

edge cases

Tester

Represents:

acceptance criteria

scenario completeness

quality risk

Project Manager

Represents:

timeline

project risk

coordination pressure

12.2 NPC writing requirement

NPC dialogue should:

sound realistic

reflect role-specific concerns

stay concise enough for a beginner-friendly game

reveal more detail when the player asks stronger BA questions

13. Content requirements
13.1 Scenario content

The MVP must include one complete scenario:
Complaint Case Tracker Improvement

13.2 Educational content requirement

The content must teach users to:

distinguish problem from solution

ask follow-up questions

consider user, technical, delivery, and quality perspectives

think in MVP terms

identify ambiguity and risk

13.3 Tone requirement

The tone should be:

realistic

professional but approachable

slightly light to keep the game engaging

not overly corporate or overly academic

14. Scoring requirements
14.1 Scoring model

The scoring model must include four dimensions:

1. Business Understanding

Measures how well the player uncovers the actual business problem and context.

2. Team Trust

Measures how effectively the player collaborates with team members and respects their perspectives.

3. Delivery Readiness

Measures how well the player creates clarity for implementation and testing.

4. Risk Exposure

Measures how much unresolved risk or poor judgement the player introduces.

14.2 Scoring behaviour

Positive BA choices should increase one or more positive dimensions

Weak choices may reduce positive dimensions or increase Risk Exposure

Risk Exposure should be interpreted inversely, where lower is better

14.3 Ending thresholds

The system should support threshold-based ending logic such as:

Strong outcome

Mixed outcome

Poor outcome

Thresholds may be tuned during build.

15. UX requirements
15.1 Interface structure

The MVP interface should include:

title/header area

main dialogue panel

choice buttons

feedback panel

score panel

unlocked insights panel

ending screen

15.2 Interaction model

The player should interact primarily by:

reading dialogue

selecting responses

reviewing immediate feedback

continuing through scenes

15.3 Usability requirements

The interface should be:

simple to understand

low clutter

easy to click

readable on desktop browser

visually clear about current NPC and stage

16. Non-functional requirements
16.1 Performance

The game should load quickly in a standard browser

Scene transitions should feel responsive

No backend dependency should be required for MVP

16.2 Maintainability

Game content should be easy to change

Dialogue and logic should ideally be stored in structured data objects rather than hard-coded all over the UI logic

Code should be modular enough to support later content expansion

16.3 Compatibility

MVP should run in modern desktop browsers

Responsive support for smaller screens is preferred but not core MVP success criteria

16.4 Reliability

The game should not crash if the player restarts

The scoring state should remain valid through the scenario

The player should not get stuck between scenes

16.5 Security

No authentication or sensitive user data should be required for MVP

No personal data storage should be required for MVP

16.6 Accessibility

Basic good practice should be followed where reasonable:

readable font sizes

sufficient contrast

button labels that are understandable

keyboard accessibility desirable, but not mandatory for first MVP

17. Technical approach
17.1 Recommended stack

For MVP:

HTML

CSS

JavaScript

17.2 Reason for stack choice

This stack is suitable because it is:

fast to prototype

easy to host

easy to modify

compatible with Codex/vibe coding workflows

enough for a dialogue-based game MVP

17.3 Architecture guidance

Preferred approach:

keep scenario content in a structured data model

keep rendering logic separate from content

use lightweight state management in JavaScript

avoid unnecessary frameworks for first MVP unless build speed improves materially

18. Suggested data model

The game should ideally support scene-based structured content.

Each scene may contain:

scene id

stage

npc name

subtitle

dialogue text

prompt text

response options array

Each response option may contain:

response label

score effects

optional unlocked insight

immediate feedback text

next scene id or index

flag indicating final ending decision

This will make future editing easier as requirements change.

19. Success metrics for MVP
19.1 Product success indicators

The MVP is successful if:

a user can complete one scenario end-to-end

the experience is understandable without external explanation

choices visibly affect outcomes

players feel they learned something about BA work

the codebase is easy to modify during iteration

19.2 User validation questions

During testing, ask users:

Did the scenario feel realistic?

Did you understand what the BA was supposed to do?

Did choices feel meaningful?

Did you learn something useful?

Was the game easy to follow?

Which NPC interactions felt strongest or weakest?

20. Risks
20.1 Scope creep

Risk:
Too many features added too early.

Mitigation:
Keep MVP to one scenario, structured dialogue, and simple scoring.

20.2 Overengineering

Risk:
Building heavy game systems before proving the concept.

Mitigation:
Use simple browser implementation and minimal architecture.

20.3 Weak educational value

Risk:
Game becomes just a click-through story without meaningful BA learning.

Mitigation:
Ensure each NPC interaction teaches a distinct BA lesson.

20.4 Unrealistic role behaviour

Risk:
NPCs feel generic or inaccurate.

Mitigation:
Base dialogue and tensions on real project behaviour from banking experience.

20.5 Content change during build

Risk:
Scenario content changes often.

Mitigation:
Store scenario content in editable structured objects and keep logic flexible.

21. Dependencies
21.1 Content dependency

The quality of the MVP depends heavily on:

strong scenario writing

realistic NPC behaviour

good choice design

meaningful feedback copy

21.2 Technical dependency

The MVP depends on:

a browser-based front-end build

clean state management

maintainable scene configuration

21.3 Product dependency

The long-term value depends on:

validating that users enjoy and learn from the scenario

deciding whether to expand into more scenarios later

22. Future enhancements after MVP

Potential future releases may include:

multiple scenarios

branching routes based on role trust

deeper replayability

badges/skill progression

free text interaction with AI-assisted NPCs

save progress

mobile optimisation

stronger visual identity

mentor mode / explanation mode

scenario builder tools

These are not MVP requirements.

23. Open questions

These can remain flexible for now:

whether score values should be fully visible or partly hidden

whether scenes should stay fully linear or become semi-branching

whether feedback should be immediate after every choice or partly deferred

whether stronger gamification is needed in MVP

whether the tone should be more serious or slightly more playful

24. MVP summary

The MVP is a browser-based educational simulation game where the player acts as a BA in a bank project team and works through one realistic scenario using dialogue choices, stakeholder analysis, simple scoring, and end-of-game feedback.

The MVP should prove three things:

the concept is fun enough to engage users

the scenario teaches real BA behaviours

the product can be built and iterated quickly using vibe coding / Codex