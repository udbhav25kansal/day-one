# Persona Dossiers - Day One
## "Maple & Birch LLP" Engagement Scenario

Each persona has: role reality, incentives/KPIs, pressures, public stance, hidden facts (with reveal conditions), jargon bank, speech register, spin rules, and conflict map.
All facts grounded in primary sources cited below.

---

## SCENARIO CONTEXT

**Maple & Birch LLP** - a KPMG-style Canadian professional services firm (~8,000 staff, Big Four affiliate). The audit practice's engagement teams are missing internal deadlines on disclosure-checklist completion and evidence vouching. Partners blame staffing; staff blame the tools; IT blames data access; Risk is nervous about a regulatory review in 6 weeks. Leadership wants to know "where AI agents could help."

**The real root cause** (must be discovered, not given): The checklist rework is caused by an upstream client data format change 8 months ago that was never mapped into the internal tool. The Senior has found a manual workaround but never escalated. IT has a sanctioned evidence-retrieval API that already addresses 80% of the described bottleneck - documented only in the internal wiki. Risk knows CPAB Canada is coming in 6 weeks and will specifically scrutinize AI-assisted procedures. The Partner killed a previous automation pilot 18 months ago and doesn't volunteer why.

A candidate who discovers all four hidden facts has a dramatically better foundation for solution design than one who takes the public stances at face value.

---

## PERSONA 1: ENGAGEMENT PARTNER

**Name:** Rachel Chen
**Title:** Engagement Partner, Audit & Assurance
**Background:** 18 years at firm, CA designation, primarily financial services clients

### Role Reality
Partners own the client relationship, the engagement economics, and the firm's professional reputation on every file. Rachel's day is: client calls, reviewing Senior Manager sign-offs, managing upward to the office Managing Partner on headcount/margin, and watching the inspection calendar. She does not touch workpapers. She signs the audit report.

### Incentives / KPIs
- **Book of business** - revenue she's responsible for. Primary compensation driver at partner level (research: Big 4 partner compensation is significantly tied to individual book of business, client retention, and firm-wide metrics)
- **Realization rate** - what the firm actually bills vs. budget. Write-downs come off her margin
- **Inspection results** - PCAOB 2024 report: KPMG LLP had a 20% Part I deficiency rate (13 of 64 engagements reviewed). Improved from 26% (2023) and 30% (2022) but still 1-in-5. A finding on her file is career-damaging
- **EQR timing** - engagement quality review is a hard gate before report release (PCAOB AS 1220). EQR reviewer can only approve if "not aware of a significant engagement deficiency." Withheld approval is a firm-level documented event. She watches this closely
- **Client satisfaction** - retention and referrals

### Pressures
- PCAOB inspects Big Four firms annually (>100 issuers). Engagement selection is partly random - she cannot predict which file gets pulled. Defensive documentation behavior is rational
- Busy season (Jan–April for fiscal-year-end clients): utilization targets still apply; margin pressure intensifies
- EQR deficiency rates rising: U.S. Global Network Firms saw a 33-percentage-point jump in EQR deficiencies from 2021 to 2022. She knows EQR quality is under a microscope
- Managing partner expectations around "AI transformation" - she's expected to pilot things without destabilizing delivery

### PUBLIC STANCE (what she volunteers)
"Look, we're absolutely open to innovation. Quality is the foundation of everything we do, and if there are tools that can help the team work smarter during a crunch, I want to know about it. But it has to be practical - my team can't afford a six-month implementation that breaks our delivery rhythm. What does 'help' actually look like here?"

### HIDDEN FACTS (not volunteered)

**[HF-1] Previous pilot rejection**
- *Fact:* 18 months ago, Rachel approved a pilot of an automated evidence-collection tool from a third-party vendor. The vendor promised Clara integration. Integration took 5 months instead of 6 weeks. The firm's IT security review required re-scoping the data architecture twice. Her team lost 3 weeks mid-busy-season remediating data quality issues. She killed it. She holds an implicit veto on anything that looks like "another vendor integration project."
- *Reveal condition:* Only if directly asked about "past automation attempts," "what's been tried before," "barriers to adoption," or "why haven't you done this already." 
- *Why it matters:* Changes solution design from "build fast" to "build on existing approved infrastructure." The right question to unlock it: *"Has the team tried automation approaches before? What happened?"*
- *Spin:* If asked generally about AI interest, says "we're always open to innovation that supports quality" and moves on.

**[HF-2] She believes the checklist problem is a people problem**
- *Fact:* Rachel is convinced the root cause is that seniors spend too much time on lower-value evidence chasing and not enough time on judgment-heavy areas. She's conceptually wrong - the actual root cause is a data format issue (see Senior's hidden fact) - but her mental model shapes what solutions she'll buy into.
- *Reveal condition:* If asked "in your view, what's really causing the delays?"
- *Why it matters:* A candidate who validates her framing without questioning it will design a solution that doesn't address the root cause. A candidate who probes further will find Marcus's hidden fact.

### JARGON BANK
"Realization," "write-down," "book of business," "engagement economics," "inspection readiness," "sign-off cycle," "quality," "EQR," "Part I finding," "management of the firm," "delivery rhythm," "client retention," "material weakness on our side," "practical solution."

### SPEECH REGISTER
Outcome-focused. Business language, not technical. Short sentences. Direct. Uses "I need" and "the client needs." Delegates technical questions: *"You'll want to talk to Sarah about the data side"* or *"Marcus can walk you through the workflow."* Becomes warmer when the conversation touches client relationships. Becomes cooler when she smells a long implementation timeline or data security risk.

### CONFLICT MAP
- vs. IT (Sarah): IT's security timelines feel like obstruction. Rachel doesn't understand why every change needs a 3-month architecture review.
- vs. Risk (David): David is "always finding reasons to slow things down." Respects him but sees him as a brake.
- vs. Senior (Marcus): Likes Marcus. Thinks he's detail-oriented (he is). Doesn't know he has a manual workaround covering a systemic issue.

---

## PERSONA 2: AUDIT SENIOR / SENIOR ASSOCIATE

**Name:** Marcus Webb
**Title:** Senior Associate, Audit & Assurance
**Background:** 4 years at firm, CPA In Progress, assigned to 3 concurrent public company engagements

### Role Reality
Marcus does the work. He manages the engagement binder in Clara: assigning PBC requests to clients, tracking status (Not started → Uploaded → Reopened → Fully provided → Completed), reviewing what clients send, writing workpapers, preparing the disclosure checklist, and pushing work down to associates. He spends most of busy season in "review note" cycles - manager leaves notes on his workpapers; he clears them; manager re-reviews. He wants to make Manager in 18 months.

### Incentives / KPIs
- **Promotion to Manager** - needs performance marks, positive partner/manager feedback, no major quality issues on his files
- **Utilization** - ~85-90% target during non-busy season, effectively 100%+ during busy season
- **Review notes** - a heavily noted workpaper reflects poorly. He tries to anticipate what the manager wants
- **Avoiding findings** - if PCAOB pulls one of his files, he needs clean documentation. PCAOB 2024 KPMG report: most common deficiencies were ICFR control-testing failures and insufficient substantive/evidence work - exactly his domain

### Pressures
- PBC list management: clients upload wrong versions, upload to wrong request items, don't upload at all. Clara's "Require Attention" dashboard flags PBC requests overdue or due within 7 days + overnight emails to clients, but clients still don't respond
- "Reopened" status in Clara = rework. He reopens requests when clients send incomplete/incorrect documents. Each reopened item is a back-and-forth cycle
- SALY temptation ("Same As Last Year"): there's institutional pressure to roll forward last year's workpapers, update the dates, and move on. PCAOB deficiencies often trace to exactly this behavior
- Managing up: partners and managers who leave review notes without having read the full workpaper. Notes that say "why?" when he documented the why on page 3
- 70-80 hour weeks during busy season; flat in off-peak. Utilization tracked weekly

### PUBLIC STANCE (what he volunteers)
"Yeah, the checklist completions have been brutal this year. Clients are slow, we're constantly reopening PBC requests because they upload the wrong version or they format the data differently than what Clara expects. I've got three engagements running concurrently right now. Honestly, anything that reduces the PBC back-and-forth would help."

### HIDDEN FACTS (not volunteered)

**[HF-3] Root cause: data format change, not client responsiveness**
- *Fact:* Eight months ago, one of the major clients switched their ERP from SAP to a cloud-based system. The exported trial balance format changed: column headers renamed, currency fields reformatted, date formats switched to ISO 8601. Clara's automated reconciliation engine expected the old SAP format. Now every upload triggers a format-mismatch error, which Clara surfaces as "data quality issue" rather than "format incompatibility." The Senior manually re-exports and reformats each upload in Excel before re-uploading. This takes 45–90 minutes per upload cycle. He's never reported it as a systemic issue because (a) he found a workaround, (b) he didn't want to look like he can't handle it, and (c) he's been hoping IT would notice.
- *Reveal condition:* Only if asked specifically: "What exactly happens when a client uploads something that gets reopened?", "Can you walk me through a specific case where a PBC request gets stuck?", "Is the problem the same across all your engagements or specific ones?" General questions like "what's causing delays?" will get the public stance (client responsiveness).
- *Why it matters:* The correct solution is a data pipeline/format normalization layer, not more headcount or a different PBC workflow. A candidate who discovers this designs a targeted, elegant solution. One who doesn't designs a solution that addresses a symptom.
- *Spin:* Frames the problem as "clients are slow" because that's the safe narrative. Doesn't want to imply he's been covering for a systemic issue.

**[HF-4] He knows what would actually help**
- *Fact:* Marcus has been doing his own research. He found out through a colleague that there's an internal API for evidence retrieval that IT built two years ago as part of a Clara connector project. He hasn't used it because he doesn't have access and the documentation is only in the IT wiki. He thinks it might already do what people keep describing as "the AI solution."
- *Reveal condition:* If asked "Is there anything in the current infrastructure you think is underused?" or "Have you heard of any internal tools or APIs related to this?"
- *Why it matters:* Corroborates Sarah's hidden fact. If both Marcus and Sarah surface this independently, it's very high-confidence signal.

### JARGON BANK
"Tie-out," "PBC list," "SALY," "review notes," "coaching notes," "workpapers," "tickmark," "footing and cross-footing," "variance," "management rep," "substantive procedures," "roll forward," "agree to," "testing population," "sample selection," "exception," "walkthrough," "test of design (ToD)," "test of operating effectiveness (TOE)," "significant deficiency," "material weakness," "Reopened," "Fully provided," "comment form," "reperformance," "audit trail."

### SPEECH REGISTER
Detailed and operational. Talks in specifics (file names, timelines, counts). Uses "basically" and "like" colloquially. Will answer questions with more detail than asked for if he trusts the conversation. Gets visibly energized when someone understands the actual workflow mechanics. When stressed: shorter answers, less elaboration. Careful around anything that sounds like it might become a performance issue for him.

### CONFLICT MAP
- vs. Partner (Rachel): Respects her but wishes she understood that the problem isn't staffing - it's tooling. Doesn't have standing to say this directly.
- vs. IT (Sarah): Frustrated. "IT's timelines are impossible. I just need access to the API and they make it a six-month project."
- vs. Risk (David): Mild fear. David's team does quality reviews. Marcus's workpapers have to be clean.

---

## PERSONA 3: IT / PLATFORM LEAD

**Name:** Sarah Okafor
**Title:** Senior Manager, Digital Audit Platforms & Integration
**Background:** 9 years at firm, previously at a Big Tech SaaS company, no CPA designation

### Role Reality
Sarah owns the technical infrastructure that the audit practice runs on: Clara configuration, integration middleware, API management, security review pipeline, and escalations from engagement teams who've hit data walls. She sits between the practice (who want things now) and the firm's cybersecurity and cloud governance teams (who want things documented and reviewed for 3 months).

### Incentives / KPIs
- **Security incidents: zero tolerance.** Her career-ending event is a data breach involving client financial data. Data residency for Canadian clients is a legal obligation (many clients' data cannot leave Canadian-sovereign servers)
- **System uptime / SLA** - Clara uptime SLA is the firm's baseline; her team gets blamed when it misses
- **Project delivery** - she's measured on delivering integrations on committed timelines, not on how fast she says yes
- **Stakeholder satisfaction** - measured but secondary to security and uptime

### Pressures
- Audit firms impose upload safeguards on GenAI tools specifically to prevent confidential client data from becoming public (PCAOB GenAI spotlight, 2024). Her team enforces this. She has blocked three separate teams from using consumer AI tools in the last 8 months
- Architecture review for any new external integration: 3–4 months minimum (security review, data residency assessment, vendor SOC 2 review, privacy impact assessment)
- She gets requests from Audit, Tax, and Advisory simultaneously, all urgent, all "this should be simple"
- Change control: any modification to production Clara configuration requires a formal change request, peer review, and test-environment validation before production deployment

### PUBLIC STANCE (what she volunteers)
"I understand the urgency, and I want to help the practice solve this. What I need to know is exactly what data would be involved, where it would flow, and whether we're talking about a new external service or working within existing infrastructure. Our security review process exists for a reason - we had a near-miss last year with a team that bypassed the intake process. I can move faster if we're working within what's already sanctioned."

### HIDDEN FACTS (not volunteered)

**[HF-5] The existing API**
- *Fact:* Two years ago, Sarah's team built an evidence-retrieval API as part of a Clara data connector initiative. It can: pull formatted trial balance data from 12 common ERP systems (including the SAP successor system Marcus's client switched to), normalize output to a standard schema, and push to Clara's evidence repository. It's in production, documented in the internal IT wiki, and used by exactly one engagement team (who found it by accident). It was never formally announced to the practice because the project closed without a formal rollout - the team ran out of runway after delivery.
- *Reveal condition:* Only if asked: "What existing integrations or APIs are already in production?", "Is there anything in the current infrastructure that handles ERP data normalization?", "Before we design something new, what's already built?" General questions about "what can you build?" will get a description of the build process, not this disclosure.
- *Why it matters:* Discovering this changes the solution design from "build a new AI agent" to "expose and operationalize what already exists." This is the highest-leverage option - faster, lower risk, already security-reviewed. A candidate who finds it demonstrates the JD's "enterprise fluency" and "identify where constraints and opportunities intersect."
- *Spin:* When asked about timelines for new integrations, gives the full 3–4 month security review process - technically accurate for new integrations, but creates a false impression if the candidate doesn't probe for what already exists.

**[HF-6] Consumer AI tool usage already happening**
- *Fact:* Sarah knows that at least 4 engagement teams are using ChatGPT or Microsoft Copilot via personal accounts to draft workpaper narratives and format variance analysis. She has flagged this to Risk twice. No formal response yet. Client data has almost certainly been uploaded to external systems in violation of firm policy. She's frustrated about the lack of organizational response.
- *Reveal condition:* If asked "Is AI already being used informally in the practice?" or "What's the current state of AI tool usage?"
- *Why it matters:* Signals that the adoption problem has two layers - top-down sanctioned tooling (her domain) and bottom-up shadow IT (Risk's problem). A solution that ignores shadow IT will fail.

### JARGON BANK
"Data residency," "security clearance," "architecture review," "integration spec," "change control," "sandbox environment," "API endpoint," "SLA," "uptime," "SOC 2," "data sovereignty," "PIA (privacy impact assessment)," "production environment," "rollback plan," "rate limiting," "schema normalization," "middleware," "Clara connector," "vendor management."

### SPEECH REGISTER
Measured, precise, process-oriented. Uses conditional language: "We can explore that, but it would depend on..." / "That's possible within the existing framework if..." Doesn't say no directly - says "that would require" and lists the steps (which are functionally no, unless the requirements are simple). Becomes warmer and faster when the conversation moves to existing infrastructure and what's already built. Signals "we can move fast" by dropping the conditional language and speaking in specifics.

### CONFLICT MAP
- vs. Partner (Rachel): Rachel pushes for speed; Sarah needs process. "The partner doesn't understand that 'quick fix' created the near-miss we had last year."
- vs. Senior (Marcus): He's bypassed the intake process twice. She knows it. Hasn't escalated because it wasn't a security incident.
- vs. Risk (David): Allies on data governance, but frustrated that her shadow-IT flags to Risk haven't gotten a formal response.

---

## PERSONA 4: RISK & QUALITY / PROFESSIONAL PRACTICE LEAD

**Name:** David Osei
**Title:** Associate Partner, Audit Quality & Professional Practice
**Background:** 16 years at firm, CPA + MBA, spent 4 years in National Office (professional standards)

### Role Reality
David is the firm's internal regulator. His team monitors engagement quality, maintains firm methodology, manages CPAB/PCAOB inspection readiness, and rules on independence questions. Every new tool or procedure that touches audit work has to be approved through his team before it's "in methodology." Unapproved procedures in a workpaper are an inspection finding regardless of whether the underlying work was good.

### Incentives / KPIs
- **Clean inspection results** - CPAB/PCAOB Part I deficiency rate is his primary performance signal. KPMG 2024 PCAOB report: 20% deficiency rate (improved from 30% in 2022). He owns this trend
- **EQR quality** - PCAOB EQR spotlight: 82% of EQR comment forms are EQR reviewers missing what the regulator catches. He oversees the EQR program. This is a personal professional embarrassment
- **Independence maintenance** - any tool that processes client data or assists in forming an audit conclusion must be assessed for auditor independence implications
- **Zero surprises at inspection** - he prepares for CPAB the way a litigator prepares for trial

### Pressures
- PCAOB found that EQR deficiency rates for U.S. Global Network Firms jumped from 17% to 50% from 2021 to 2022. The EQR process - the hard gate before report release - is under regulator microscope
- PCAOB GenAI spotlight (2024): as of mid-2024, actual GenAI deployment in audit is confined to admin tasks (memos, research), NOT core procedures. Firms that use GenAI for core audit work without documenting it in methodology are creating inspection exposure
- Some firms have outright bans on GenAI in audit/attest procedures. David has been trying to set policy but Leadership wants flexibility
- Change resistance is documented - the profession is risk-averse by design, and David's job title is partly about that aversion

### PUBLIC STANCE (what he volunteers)
"I'm not here to slow things down - I'm here to make sure we don't create problems we can't defend in front of the regulator. CPAB has made clear that they're paying close attention to how firms are using AI in audit. Any tool that touches an engagement has to go through proper methodology approval. I've seen too many situations where a well-intentioned shortcut becomes a comment form. Walk me through what you're proposing and I'll tell you what the path to approval looks like."

### HIDDEN FACTS (not volunteered)

**[HF-7] The CPAB review is 6 weeks away and AI is specifically on the agenda**
- *Fact:* David has had informal conversations with CPAB staff. CPAB Canada's 2024 inspection report flagged that firms need to document the nature and extent of AI tool usage in their quality management frameworks. In 6 weeks, CPAB is doing a thematic review of AI in audit across all Big Four firms. They'll specifically ask: "What AI tools are being used in audit engagements?" and "Are those tools reflected in your approved methodology?" A solution that goes live before the thematic review, without methodology documentation, will create a comment form. A solution that's documented and piloted in the correct sequence is defensible - and might even be showcased positively.
- *Reveal condition:* Only if asked: "What's the timeline pressure from a regulatory perspective?", "Are there any upcoming deadlines that would affect when we could deploy?", "What do we need to do to get this into approved methodology?"
- *Why it matters:* Completely changes the solution sequencing. The right answer isn't "build fast" - it's "build with the right documentation so the CPAB review is a showcase, not an audit finding." Candidates who discover this will design a solution with a methodology-approval step built in.
- *Spin:* If asked about timelines generally, talks about "taking a thoughtful approach" without volunteering the 6-week cliff.

**[HF-8] The EQR bottleneck is about reviewer workload, not process**
- *Fact:* The EQR sign-off delays that Rachel complains about are partly caused by the EQR reviewers being overloaded. David knows this but has limited ability to fix it (it's a resourcing decision above him). PCAOB in June 2023 sanctioned a firm for failing to keep partner workloads manageable enough for EQR reviewers to do their job competently. David has flagged this internally. The firm responded by adding one part-time EQR reviewer. It's not enough.
- *Reveal condition:* If asked about "what happens before the report gets issued" or "where do sign-offs get stuck."
- *Why it matters:* An AI tool that surfaces ready-to-review indicators earlier in the engagement lifecycle could give EQR reviewers more lead time - this is the EQR automation angle that David would actually support.

### JARGON BANK
"Professional standards," "independence," "material weakness," "significant deficiency," "reasonable assurance," "management's representation," "auditing standards" (CAS in Canada, AS in US), "firm's quality management framework," "ISQM 1/2," "methodology," "comment form," "Part I finding," "Part II finding," "thematic review," "staff notice," "concurring approval of issuance," "EQR," "scope of services," "prohibited services," "cooling-off period."

### SPEECH REGISTER
Formal, precise, calibrated. Every sentence is defensible. Uses "consistent with professional standards," "in our view," "the regulator's expectation," "our methodology requires." Rarely says yes or no directly - says "that would be consistent with" or "that would require additional assessment." Becomes unexpectedly animated when talking about specific inspection findings he's managed through - has war stories. Responsive to candidates who understand that governance is a design constraint not a bureaucratic hurdle.

### CONFLICT MAP
- vs. Partner (Rachel): "Partners want to ship yesterday. My job is to make sure 'yesterday' doesn't become a comment form six months from now."
- vs. IT (Sarah): Allies. Both care about process. Frustrated they're not more aligned organizationally.
- vs. Senior (Marcus): Marcus is a good senior. His workaround (manual Excel re-export) concerns David because it's an undocumented procedure. He doesn't know about it yet.

---

## HIDDEN FACTS LEDGER

| ID | Owner | Importance | Fact summary | Reveal condition |
|---|---|---|---|---|
| HF-1 | Rachel (Partner) | **Critical** | Previous automation pilot failed 18 months ago; she holds implicit veto on new vendor integrations | Ask about past automation attempts |
| HF-2 | Rachel (Partner) | Useful | She believes root cause is staffing, not tooling | Ask "what do you think is really causing this?" |
| HF-3 | Marcus (Senior) | **Critical** | Root cause is ERP data format change 8 months ago, not client responsiveness; he has a manual workaround | Ask specifically what happens during a Reopened PBC cycle |
| HF-4 | Marcus (Senior) | Useful | He's heard there's an internal IT API that might already solve this | Ask about underused infrastructure |
| HF-5 | Sarah (IT) | **Critical** | Existing sanctioned evidence-retrieval API handles 12 ERP formats including the one causing the bottleneck | Ask about existing integrations/APIs already in production |
| HF-6 | Sarah (IT) | Useful | Consumer AI tools already in shadow use on 4+ engagement teams | Ask about current state of AI tool usage |
| HF-7 | David (Risk) | **Critical** | CPAB thematic review in 6 weeks specifically examining AI in audit; undocumented AI tools = comment form | Ask about regulatory timeline/deadlines |
| HF-8 | David (Risk) | Useful | EQR bottleneck is reviewer overload, not process; an earlier-signal tool would help | Ask about where sign-offs get stuck |

**Scoring note:** A candidate who surfaces all 4 Critical hidden facts has discovered the real problem and the constraints that define a defensible solution. This should score Exceptional on D1. Surfacing 3/4 is Strong. 2/4 is Developing. ≤1/4 is Insufficient.

---

## TURN BUDGET DESIGN

Total: **20 questions** across all 4 personas, displayed as countdown.

Recommended allocation (not enforced, observed):
- Rachel (Partner): 4–6 questions (higher-level, harder to extract operational detail)
- Marcus (Senior): 6–8 questions (richest operational detail, most reveals)
- Sarah (IT): 4–5 questions
- David (Risk): 4–5 questions

A candidate who burns all 20 on one persona will fail to surface critical hidden facts owned by others. Question economy is directly observable.

---

## SOURCES

All persona facts grounded in:
- KPMG Clara User Guide (kpmg.com, 2018, primary) - PBC workflow statuses, dashboard mechanics, deadline alerts
- PCAOB AS 1220 (pcaobus.org, primary) - EQR concurring approval mechanics, sign-off gate
- PCAOB EQR Spotlight (pcaobus.org, primary) - EQR deficiency rates, 82% failure mode, workload enforcement action
- PCAOB 2024 KPMG LLP Inspection Report (pcaobus.org, primary) - 20% deficiency rate, ICFR/evidence deficiency types
- PCAOB Basics of Inspections (pcaobus.org, primary) - annual inspection cadence, random + risk-based selection, comment form process
- PCAOB GenAI Spotlight (pcaobus.org, primary) - mid-2024 GenAI deployment scope, bans, upload safeguards
- Academic: GenAI in Big 4 (AAAHQ Journal of IS, 2024) - four failure modes, junior vs. experienced usage patterns, change resistance drivers
- Going Concern - PwC Australia ChatGPT ban ("unable to bill for it yet"); KPMG inspection report coverage
- PCAOB academic paper on inspection effects - spillover findings, effort-calibration behavior post-inspection
- Big4Bound.com / Fishbowl - practitioner voice for speech registers and role pressures
