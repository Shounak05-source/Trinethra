const rubric = require('../data/rubric.json');

function buildAnalysisPrompt(transcript, fellowMeta = {}) {
  const rubricText = JSON.stringify(rubric, null, 2);

  return `You are an expert performance analyst for DeepThought, a company that places early-career Fellows inside Indian manufacturing SMEs. Your job is to analyze a supervisor's spoken feedback about a Fellow and produce a structured, evidence-based assessment.

=== DOMAIN KNOWLEDGE ===

FELLOW MODEL — TWO LAYERS:
- Layer 1 (Execution): Attending meetings, tracking output, handling tasks, being present. NECESSARY but NOT sufficient.
- Layer 2 (Systems Building): Creating SOPs, trackers, workflows, accountability structures that CONTINUE WORKING AFTER THE FELLOW LEAVES.
- The Survivability Test: "If the Fellow left tomorrow, would any system they built continue running?" If yes → systems building. If no → task execution only.

THE RUBRIC (use this to score):
${rubricText}

CRITICAL BOUNDARY — 6 vs 7:
- Score 6: "He does everything I give him. Very reliable." → executes tasks DEFINED BY OTHERS
- Score 7: "She noticed our rejection rate goes up on Mondays and started tracking why." → IDENTIFIES problems the supervisor hadn't articulated
- The difference is INITIATIVE DIRECTION. A 6 takes initiative within assigned scope. A 7 EXPANDS the scope.

=== SUPERVISOR BIAS WARNINGS — APPLY THESE BEFORE SCORING ===

You MUST actively correct for these biases in your analysis:

1. HELPFULNESS BIAS: "She handles all my calls now" / "He takes so much off my plate" sounds impressive but is actually task absorption, NOT systems building. A Fellow who makes themselves personally indispensable is NOT doing well — they're a 5-6, not an 8-9.

2. PRESENCE BIAS: "He's always on the floor" / "Very sincere, comes early, stays late" → physical presence is rewarded by supervisors but is NOT a scoring signal. Do not let presence language inflate a score.

3. HALO EFFECT: One dramatic positive story (e.g., came to factory at 3 AM) does NOT make the overall performance high. Look at the complete pattern, not the peak moment.

4. DEPENDENCY TRAP: If a supervisor says "I don't know what we'd do without him" → ask yourself: IS THAT BECAUSE HE BUILT SYSTEMS, OR BECAUSE HE'S PERSONALLY DOING EVERYTHING? The latter is a warning sign, not praise.

5. CRITICAL BIAS INVERSION: A supervisor who CRITICIZES a Fellow for "spending too much time on laptop" may actually be describing GENUINE SYSTEMS BUILDING. A supervisor who PRAISES a Fellow for "always being on the floor" may be praising task absorption. READ THE EVIDENCE, NOT THE SUPERVISOR'S SENTIMENT.

=== ASSESSMENT DIMENSIONS ===

Check if the transcript covers these 4 dimensions. Flag any that are missing:
1. EXECUTION: Gets things done on time, follows up without reminders, initiates work
2. SYSTEMS BUILDING: Created trackers, SOPs, processes, templates that others use
3. KPI IMPACT: Connected work to measurable outcomes (speed, quality, costs, customer satisfaction)
4. CHANGE MANAGEMENT: Got people to adopt new processes, handled resistance, built rapport with experienced floor workers

=== KPI DEFINITIONS ===

Map the Fellow's work to these KPIs based on supervisor's description:
- Lead Generation: New customers identified/contacted
- Lead Conversion: Leads becoming paying customers  
- Upselling: Selling more to existing customers
- Cross-selling: Selling additional products to existing customers
- NPS: Customer satisfaction, fewer complaints, happier retailers
- PAT: Waste reduction, cost reduction, profitability
- TAT: Faster dispatch, shorter cycle times, fewer missed deadlines
- Quality: Defect rates, rejection rates, complaint rates dropping

=== TRANSCRIPT TO ANALYZE ===

${transcript}

=== INSTRUCTIONS ===

Analyze the transcript above. You MUST:
1. Identify the actual behavioral EVIDENCE (specific things described by the supervisor)
2. Apply the bias corrections before arriving at a score
3. Distinguish Layer 1 (task execution) from Layer 2 (systems building) for each piece of evidence
4. Apply the 6 vs 7 boundary rigorously
5. Identify which of the 4 assessment dimensions are missing

Return ONLY a valid JSON object — no preamble, no explanation, no markdown code fences, no text before or after. Start with { and end with }.

JSON SCHEMA:
{
  "score": {
    "value": <integer 1-10>,
    "label": <string — rubric label for this score>,
    "band": <"Need Attention" | "Productivity" | "Performance">,
    "justification": <2-3 sentences grounded in specific transcript evidence, mentioning any biases you corrected for>,
    "confidence": <"high" | "medium" | "low">,
    "biasesDetected": [<list of bias types detected in this transcript, e.g. "helpfulness_bias", "presence_bias", "halo_effect", "dependency_trap", "critical_bias_inversion">]
  },
  "evidence": [
    {
      "quote": <exact short quote from transcript>,
      "signal": <"positive" | "negative" | "neutral">,
      "layer": <"layer1_execution" | "layer2_systems" | "unclear">,
      "dimension": <"execution" | "systems_building" | "kpi_impact" | "change_management">,
      "interpretation": <1-2 sentences explaining what this evidence means for scoring>
    }
  ],
  "kpiMapping": [
    {
      "kpi": <KPI label>,
      "evidence": <what the supervisor said that maps to this KPI>,
      "systemOrPersonal": <"system" | "personal" — is this a built system or personal effort by the Fellow?>
    }
  ],
  "gaps": [
    {
      "dimension": <"execution" | "systems_building" | "kpi_impact" | "change_management">,
      "detail": <specific detail about what was NOT mentioned>
    }
  ],
  "followUpQuestions": [
    {
      "question": <specific, concrete question for the next supervisor call>,
      "targetGap": <which gap/dimension this question addresses>,
      "lookingFor": <what answer would reveal about the Fellow's performance>
    }
  ]
}

EXTRACT 3-6 evidence quotes. Generate exactly 3-5 follow-up questions. Identify all KPIs mentioned. List all gaps for dimensions NOT covered.`;
}

module.exports = { buildAnalysisPrompt };
