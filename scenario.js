window.GAME_CONFIG = {
  title: "BA Simulation Game",
  scenarioTitle: "Complaint Case Tracker Improvement",
  playerRole: "Business Analyst",
  intro: {
    summary:
      "A complaints operations manager says the company's complaint handling process is fragmented, manual, and risky. Leadership wants visible progress quickly. Your job is to turn noise into a realistic MVP.",
    roleBrief:
      "You are the BA on a company's project delivery team. Ask sharper questions, align competing perspectives, and recommend an MVP that solves the real problem without overreaching.",
    scoringBrief:
      "Four live signals track your run: Business Understanding, Team Trust, Delivery Readiness, and Risk Exposure. Higher is better for the first three. Lower is better for risk.",
  },
  initialScores: {
    businessUnderstanding: 30,
    teamTrust: 30,
    deliveryReadiness: 30,
    riskExposure: 30,
  },
  firstSceneId: "business-person",
  scoreMeta: {
    businessUnderstanding: {
      label: "Business Understanding",
      description: "How clearly you diagnose the actual complaint problem.",
    },
    teamTrust: {
      label: "Team Trust",
      description: "How well you collaborate and respect delivery perspectives.",
    },
    deliveryReadiness: {
      label: "Delivery Readiness",
      description: "How much clarity you create for build and test.",
    },
    riskExposure: {
      label: "Risk Exposure",
      description: "How much unresolved risk your choices leave behind.",
    },
  },
  stages: [
    {
      id: "stage-1",
      title: "Understand the problem",
      focus: "Pain, business outcome, and delivery pressure.",
    },
    {
      id: "stage-2",
      title: "Explore user and solution space",
      focus: "Workflow friction, constraints, and feasibility.",
    },
    {
      id: "stage-3",
      title: "Prepare for build and test",
      focus: "Logic, edge cases, and quality detail.",
    },
    {
      id: "stage-4",
      title: "Make recommendation",
      focus: "Balance value, scope, and risk into an MVP.",
    },
  ],
  scenes: [
    {
      id: "business-person",
      stageId: "stage-1",
      npc: {
        name: "Maya",
        role: "Business stakeholder",
        title: "Head of Complaints Operations",
        illustration: {
          src: "assets/maya-cartoon.svg",
          alt: "Cartoon illustration of Maya, Head of Complaints Operations, with long hair and a blue top",
        },
      },
      subtitle: "Business pain and current-state frustration",
      dialogue: [
        "Our complaint handlers track cases in email, a shared spreadsheet, and the core CRM. We lose time just figuring out who owns what.",
        "The worst part is customers calling back before we have even noticed a case breached its target date. Leadership keeps asking for a tracker upgrade, but the team just wants the chaos to stop.",
      ],
      prompt: "How do you open the conversation as the BA?",
      nextSceneId: "product-owner",
      choices: [
        {
          id: "bp-root-cause",
          label:
            "Ask which complaint types are delayed most and where the handoff breaks down today.",
          detail:
            "Start with the process failure before discussing features.",
          feedback:
            "Strong BA move. You separate symptoms from solution ideas and expose where the workflow actually fails.",
          scoreEffects: {
            businessUnderstanding: 10,
            teamTrust: 4,
            riskExposure: -5,
          },
          insight: {
            id: "fragmented-intake",
            type: "root-cause",
            title: "Fragmented intake",
            detail:
              "Handlers re-enter complaint details across email, spreadsheet, and CRM, so ownership and SLA status drift quickly.",
          },
        },
        {
          id: "bp-dashboard",
          label:
            "Suggest building a dashboard so leadership can track complaint volumes more easily.",
          detail:
            "Jump straight to a visible solution without validating the core pain.",
          feedback:
            "You moved too fast into solution mode. Visibility might help leaders, but it does not fix the broken handling workflow.",
          scoreEffects: {
            businessUnderstanding: -4,
            deliveryReadiness: 1,
            riskExposure: 6,
          },
        },
        {
          id: "bp-feature-list",
          label: "Ask for the team's top requested features for a new tracker.",
          detail:
            "Useful signal, but feature requests can blur the real business problem.",
          feedback:
            "You collected useful input, but a feature list alone can mix actual pain with preferred solutions.",
          scoreEffects: {
            businessUnderstanding: 3,
            teamTrust: 2,
            riskExposure: 2,
          },
          insight: {
            id: "wishlist-noise",
            type: "noise",
            title: "Wishlist noise",
            detail:
              "The business already has a long list of improvement ideas, but many requests describe preferred features rather than root causes.",
          },
        },
      ],
    },
    {
      id: "product-owner",
      stageId: "stage-1",
      npc: {
        name: "Lena",
        role: "Product Owner",
        title: "Complaints Platform Product Owner",
        illustration: {
          src: "assets/lena-cartoon.svg",
          alt: "Cartoon illustration of Lena, Complaints Platform Product Owner, with short auburn curls, glasses, and a green blazer",
        },
      },
      subtitle: "Value, scope, and MVP outcome",
      dialogue: [
        "Exec sponsors want something visible in six weeks. They keep mentioning reporting, bulk actions, better search, and maybe a cleaner intake form.",
        "I care less about shipping everything and more about proving we can reduce missed complaint targets quickly.",
      ],
      prompt: "How do you help shape the MVP discussion?",
      nextSceneId: "project-manager",
      choices: [
        {
          id: "po-outcome",
          label:
            "Ask what outcome would define success even if most feature ideas are deferred.",
          detail:
            "Anchor scope on measurable value instead of a large wishlist.",
          feedback:
            "This keeps the conversation outcome-led and gives the team permission to cut scope intelligently.",
          scoreEffects: {
            businessUnderstanding: 8,
            teamTrust: 5,
            deliveryReadiness: 2,
            riskExposure: -3,
          },
          insight: {
            id: "outcome-over-features",
            type: "mvp-scope",
            title: "Outcome over feature count",
            detail:
              "The Product Owner will trade breadth for a release that clearly reduces missed SLA breaches.",
          },
        },
        {
          id: "po-lock-backlog",
          label:
            "Push to lock the full backlog immediately so sponsors stay excited about the release.",
          detail:
            "Treat breadth as confidence instead of validating what matters first.",
          feedback:
            "This creates false certainty. It raises expectation pressure before the team understands what is truly essential.",
          scoreEffects: {
            teamTrust: -3,
            deliveryReadiness: 1,
            riskExposure: 7,
          },
        },
        {
          id: "po-user-group",
          label:
            "Ask which user group should benefit first and what can wait for a later release.",
          detail:
            "A strong move toward MVP framing through target users.",
          feedback:
            "Good scope discipline. You steer the conversation toward a narrower audience and away from trying to serve everyone at once.",
          scoreEffects: {
            businessUnderstanding: 6,
            teamTrust: 3,
            deliveryReadiness: 3,
            riskExposure: -1,
          },
          insight: {
            id: "primary-user",
            type: "user-focus",
            title: "Primary MVP user",
            detail:
              "Operations analysts are the first users who need relief. Branch staff requests can be deferred.",
          },
        },
      ],
    },
    {
      id: "project-manager",
      stageId: "stage-1",
      npc: {
        name: "Chris",
        role: "Project Manager",
        title: "Delivery Lead",
        illustration: {
          src: "assets/chris-cartoon.svg",
          alt: "Cartoon illustration of Chris, Delivery Lead, with short dark hair, a trimmed beard, and a burgundy shirt under a charcoal jacket",
        },
      },
      subtitle: "Timeline pressure and coordination risk",
      dialogue: [
        "The steering committee wants an update before quarter end. Dev and test capacity are tight because another regulatory project is already taking people.",
        "Any change that depends on the customer data service could slip if that external team is slow to respond.",
      ],
      prompt: "What do you clarify next?",
      nextSceneId: "ux-designer",
      choices: [
        {
          id: "pm-assumptions",
          label:
            "Ask which date is truly fixed and which assumptions make the schedule risky.",
          detail:
            "Separate real constraints from pressure language.",
          feedback:
            "Strong risk management. You expose dependency assumptions early instead of treating the plan as a fixed fact.",
          scoreEffects: {
            businessUnderstanding: 3,
            teamTrust: 6,
            deliveryReadiness: 6,
            riskExposure: -4,
          },
          insight: {
            id: "dependency-window",
            type: "risk",
            title: "Dependency window",
            detail:
              "The quarter-end steering date is fixed, but anything tied to the customer data service is a schedule risk.",
          },
        },
        {
          id: "pm-go-faster",
          label:
            "Say the team should just move faster and absorb the pressure to protect the date.",
          detail:
            "Treat pressure as a plan instead of clarifying risk.",
          feedback:
            "This lowers trust quickly. Delivery pressure without risk management usually creates rework rather than progress.",
          scoreEffects: {
            teamTrust: -5,
            riskExposure: 8,
          },
        },
        {
          id: "pm-later",
          label:
            "Defer risk discussion until after solution design is complete so meetings stay quick.",
          detail:
            "Keep momentum now, but push key planning detail into later churn.",
          feedback:
            "You saved time in the moment but left schedule and dependency assumptions unchallenged.",
          scoreEffects: {
            businessUnderstanding: -1,
            deliveryReadiness: -2,
            riskExposure: 6,
          },
        },
      ],
    },
    {
      id: "ux-designer",
      stageId: "stage-2",
      npc: {
        name: "Nia",
        role: "UX Designer",
        title: "Service and Workflow Designer",
        illustration: {
          src: "assets/nia-cartoon.svg",
          alt: "Cartoon illustration of Nia, Service and Workflow Designer, with textured hair in two puffs, a coral jacket, and a workflow sketch board",
        },
      },
      subtitle: "User journey and workflow pain points",
      dialogue: [
        "Handlers triage complaints while switching between multiple screens. They often copy notes from one place to another, then lose the context behind a status change.",
        "If we do not design around their actual workflow, a prettier screen will just hide the mess.",
      ],
      prompt: "How do you explore the user side of the problem?",
      nextSceneId: "solution-designer",
      choices: [
        {
          id: "ux-journey",
          label:
            "Ask for a walkthrough of the current user journey and the exact moment people lose context.",
          detail:
            "Probe for the workflow break, not just the interface preference.",
          feedback:
            "This keeps the analysis grounded in how work really happens. It also gives the team something concrete to improve.",
          scoreEffects: {
            businessUnderstanding: 7,
            teamTrust: 4,
            deliveryReadiness: 3,
            riskExposure: -2,
          },
          insight: {
            id: "context-loss",
            type: "user-pain",
            title: "Context loss in triage",
            detail:
              "Users lose context when complaint notes, ownership, and SLA dates sit in different places during triage.",
          },
        },
        {
          id: "ux-polish",
          label:
            "Prioritise a more modern visual redesign so users feel the tool is improved.",
          detail:
            "Aesthetics matter, but they are not the core workflow problem here.",
          feedback:
            "You focused on surface polish before confirming the workflow failure. That makes the design discussion shallower than it needs to be.",
          scoreEffects: {
            businessUnderstanding: -3,
            teamTrust: -2,
            riskExposure: 4,
          },
        },
        {
          id: "ux-reuse",
          label:
            "Skip the walkthrough and reuse the current form with minor tweaks to save time.",
          detail:
            "Efficient on paper, but it assumes the current interaction model is acceptable.",
          feedback:
            "This keeps the team moving, but it risks carrying the same usability problems into the MVP.",
          scoreEffects: {
            deliveryReadiness: 1,
            teamTrust: -1,
            riskExposure: 3,
          },
        },
      ],
    },
    {
      id: "solution-designer",
      stageId: "stage-2",
      npc: {
        name: "Omar",
        role: "Solution Designer",
        title: "Architecture and Platform Lead",
        illustration: {
          src: "assets/omar-cartoon.svg",
          alt: "Cartoon illustration of Omar, Architecture and Platform Lead, with a shaved head, glasses, a gold jacket, and a platform diagram card",
        },
      },
      subtitle: "Feasibility, dependencies, and constraints",
      dialogue: [
        "We can extend the existing complaint platform, but the status engine only behaves properly if we keep the audit trail intact.",
        "Auto-updating customer details means calling a shared service owned by another team. That is doable, but not a cheap dependency.",
      ],
      prompt: "How do you approach the solution discussion?",
      nextSceneId: "developer",
      choices: [
        {
          id: "sd-constraints",
          label:
            "Ask which constraints are non-negotiable and what low-risk integration path exists for MVP.",
          detail:
            "Clarify the safe design envelope before proposing ambitious scope.",
          feedback:
            "This is disciplined solution analysis. You preserve feasibility while still moving toward a practical release shape.",
          scoreEffects: {
            businessUnderstanding: 5,
            teamTrust: 3,
            deliveryReadiness: 8,
            riskExposure: -4,
          },
          insight: {
            id: "audit-trail",
            type: "constraint",
            title: "Audit trail is mandatory",
            detail:
              "The safest MVP keeps core complaint tracking inside the existing platform and avoids heavy external automation.",
          },
        },
        {
          id: "sd-automate-all",
          label:
            "Promise real-time automation across every handoff and worry about architecture later.",
          detail:
            "Oversell ambition before validating dependencies and core platform limits.",
          feedback:
            "This creates solution debt immediately. The team now has a bigger promise than the current constraints support.",
          scoreEffects: {
            teamTrust: -2,
            deliveryReadiness: -3,
            riskExposure: 8,
          },
        },
        {
          id: "sd-ignore-audit",
          label:
            "Ignore the audit trail for the MVP and use a manual workaround outside the platform.",
          detail:
            "Temporarily simpler, but dangerous in a regulated complaint process.",
          feedback:
            "You reduced scope in the wrong place. In this context, dropping audit integrity increases delivery and compliance risk.",
          scoreEffects: {
            businessUnderstanding: -2,
            deliveryReadiness: 1,
            riskExposure: 7,
          },
        },
      ],
    },
    {
      id: "developer",
      stageId: "stage-3",
      npc: {
        name: "Ethan",
        role: "Developer",
        title: "Lead Engineer",
      },
      subtitle: "Implementation logic and ambiguity reduction",
      dialogue: [
        "I can build status, owner, and due-date updates quickly, but the business rules are still fuzzy.",
        "For example, who owns a complaint when it moves between teams, and what happens when a customer sends more evidence after a case is nearly closed?",
      ],
      prompt: "How do you improve build readiness?",
      nextSceneId: "tester",
      choices: [
        {
          id: "dev-ambiguity",
          label:
            "Ask which rules or edge cases are ambiguous enough to block implementation confidence.",
          detail:
            "Turn vague concern into explicit build questions.",
          feedback:
            "This is exactly what the team needs from a BA. You surface implementation blockers before they become churn during build.",
          scoreEffects: {
            businessUnderstanding: 4,
            teamTrust: 5,
            deliveryReadiness: 9,
            riskExposure: -3,
          },
          insight: {
            id: "rule-gaps",
            type: "logic-gap",
            title: "Rule gaps",
            detail:
              "Ownership transfer and reopened complaints are the main logic gaps blocking confident implementation.",
          },
        },
        {
          id: "dev-code-now",
          label:
            "Ask engineering to start coding from meeting notes and clarify details during UAT.",
          detail:
            "Move quickly now and accept avoidable churn later.",
          feedback:
            "This speeds up the wrong part of delivery. Ambiguity during build almost always returns as rework and trust loss.",
          scoreEffects: {
            teamTrust: -2,
            deliveryReadiness: -4,
            riskExposure: 7,
          },
        },
        {
          id: "dev-happy-path",
          label:
            "Focus on the happy path only and leave complex scenarios for later once the core build is done.",
          detail:
            "Sometimes valid for MVP, but risky here because the edge cases shape complaint handling rules.",
          feedback:
            "You trimmed complexity, but the edge cases here are core business logic rather than optional extras.",
          scoreEffects: {
            deliveryReadiness: 1,
            riskExposure: 4,
          },
        },
      ],
    },
    {
      id: "tester",
      stageId: "stage-3",
      npc: {
        name: "Priya",
        role: "Tester",
        title: "Quality Analyst",
      },
      subtitle: "Acceptance criteria and quality risk",
      dialogue: [
        "Right now I have story titles and a rough description, not testable acceptance criteria.",
        "We also need examples for paused SLA timers, reopened complaints, ownership changes, and cases with missing customer contact details.",
      ],
      prompt: "What do you do with the quality concerns?",
      nextSceneId: "recommendation",
      choices: [
        {
          id: "qa-examples",
          label:
            "Define acceptance criteria with examples for reopen, pause, and ownership change scenarios.",
          detail:
            "Translate analysis into something development and QA can both execute against.",
          feedback:
            "Strong delivery thinking. You convert fuzzy concern into testable, shared understanding.",
          scoreEffects: {
            businessUnderstanding: 5,
            teamTrust: 2,
            deliveryReadiness: 10,
            riskExposure: -4,
          },
          insight: {
            id: "test-examples",
            type: "quality",
            title: "Quality needs examples",
            detail:
              "Testing needs explicit examples for reopened complaints, paused SLA clocks, ownership changes, and incomplete customer data.",
          },
        },
        {
          id: "qa-infer",
          label:
            "Say QA can infer the expected behaviour from story titles and meeting notes.",
          detail:
            "Treat test design as guesswork instead of shared clarity.",
          feedback:
            "This leaves the team exposed. In regulated complaint handling, implied logic is not reliable enough for build and test.",
          scoreEffects: {
            teamTrust: -3,
            deliveryReadiness: -5,
            riskExposure: 8,
          },
        },
        {
          id: "qa-phase-two",
          label:
            "Leave edge cases for phase two so the team can finish the happy path first.",
          detail:
            "That may sound like MVP discipline, but it can cut core quality expectations.",
          feedback:
            "You reduced immediate scope, but the delayed scenarios still shape whether the first release is genuinely workable.",
          scoreEffects: {
            deliveryReadiness: -1,
            riskExposure: 5,
          },
        },
      ],
    },
    {
      id: "recommendation",
      type: "recommendation",
      stageId: "stage-4",
      npc: {
        name: "Decision Room",
        role: "Final Recommendation",
        title: "Steering Committee Prep",
      },
      subtitle: "Recommend the MVP path",
      dialogue: [
        "You now have enough signal to frame a realistic recommendation. Leadership wants something useful, credible, and fast.",
        "Choose the MVP approach you will take into the steering committee.",
      ],
      prompt: "Which recommendation best balances pain, feasibility, and delivery confidence?",
      nextSceneId: "ending",
      choices: [
        {
          id: "rec-focused-mvp",
          label:
            "Recommend a focused MVP for operations analysts: centralised intake, clear ownership, SLA visibility, and audit notes, while deferring broader redesign and heavy automation.",
          detail:
            "Solve the operational bottleneck first and protect the schedule from avoidable dependency risk.",
          feedback:
            "This recommendation shows good BA judgement. It links the release shape to the real pain, core users, and technical constraints.",
          scoreEffects: {
            businessUnderstanding: 7,
            teamTrust: 4,
            deliveryReadiness: 7,
            riskExposure: -5,
          },
        },
        {
          id: "rec-big-bang",
          label:
            "Recommend a broad transformation that redesigns every complaint channel, adds reporting, and automates all handoffs in the first release.",
          detail:
            "High ambition, weak MVP discipline.",
          feedback:
            "The recommendation sounds exciting, but it ignores the delivery constraints and turns the release into a risky transformation programme.",
          scoreEffects: {
            businessUnderstanding: -4,
            teamTrust: -1,
            deliveryReadiness: -5,
            riskExposure: 10,
          },
        },
        {
          id: "rec-thin-tool",
          label:
            "Recommend a slim analyst workspace with manual triage support and basic reporting, but defer complex reopen and pause logic to a follow-up release.",
          detail:
            "Closer to MVP thinking, but still leaves important complaint rules unresolved.",
          feedback:
            "This is more credible than a big-bang approach, but deferring critical handling rules leaves delivery and compliance risk exposed.",
          scoreEffects: {
            businessUnderstanding: 3,
            teamTrust: 1,
            deliveryReadiness: 1,
            riskExposure: 2,
          },
        },
      ],
    },
  ],
  endings: {
    strongOutcome: {
      title: "Grounded MVP, Confident Team",
      category: "Strong outcome",
      narrative:
        "You diagnosed the real complaint-handling pain, aligned the team around a smaller release, and gave delivery enough clarity to move with confidence. The MVP feels credible because it solves the core workflow problem without pretending to transform everything at once.",
    },
    mixedOutcome: {
      title: "Progress Made, But Gaps Remain",
      category: "Mixed outcome",
      narrative:
        "You moved the team forward and identified part of the right solution, but some ambiguity or avoidable risk stayed in play. The release may still help, yet unresolved questions are likely to create churn once implementation starts.",
    },
    poorOutcome: {
      title: "Busy Delivery, Weak Diagnosis",
      category: "Poor outcome",
      narrative:
        "The team left with activity but not enough shared understanding. Scope drift and unresolved risk now threaten the release, and the chosen direction may not address the actual complaint-handling pain.",
    },
  },
};
