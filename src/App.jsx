import React, { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, BarChart3, BookOpen, Download, Plus, Trash2, ChevronDown, ChevronUp, AlertTriangle, HelpCircle, Sparkles, Loader2 } from 'lucide-react';

// Comprehensive scoring categories with detailed descriptions and examples
const SCORING_CATEGORIES = [
  {
    id: 'problem',
    name: '1. Problem + ICP Clarity',
    maxPoints: 15,
    description: 'Evaluates how well the team has identified a real, painful problem and defined exactly who experiences it.',
    whyItMatters: 'Judges want to see that you\'re solving a real problem for real people, not a hypothetical problem you invented.',
    subcriteria: [
      { 
        id: 'problem_severity', 
        name: 'Problem Severity', 
        max: 5, 
        hint: 'How painful? Quantified with $ or hours?',
        description: 'Measures how urgent and painful the problem is for customers.',
        whatToLookFor: ['Quantified pain: specific dollar amounts lost or hours wasted', 'Evidence that customers are actively seeking solutions', 'Frequency: Is this a daily pain or annual inconvenience?', 'Consequences of not solving: What happens if they ignore it?'],
        excellent: { score: '5 points', example: '"Procurement teams spend 40+ hours/month calling dealers. This costs $8,000/month in labor."', why: 'Specific role, quantified time, quantified cost' },
        good: { score: '3-4 points', example: '"Small business owners spend several hours each week on bookkeeping."', why: 'Real problem but vague quantification' },
        weak: { score: '0-2 points', example: '"We think businesses struggle with efficiency."', why: 'No specific problem, no quantification' }
      },
      { 
        id: 'icp_specificity', 
        name: 'ICP Specificity', 
        max: 5, 
        hint: 'Can they name exact job titles, company sizes?',
        description: 'Measures how precisely the team can describe their ideal first customer.',
        whatToLookFor: ['Job title of buyer/user', 'Company size', 'Industry vertical', 'Current tools they use'],
        excellent: { score: '5 points', example: '"Parts procurement managers at equipment rental companies with 50-500 employees"', why: 'Specific title, industry, company size' },
        good: { score: '3-4 points', example: '"CFOs at mid-sized SaaS companies"', why: 'Good title but "mid-sized" is vague' },
        weak: { score: '0-2 points', example: '"Businesses that want to be more efficient"', why: 'Could be anyone' }
      },
      { 
        id: 'market_evidence', 
        name: 'Market Evidence', 
        max: 5, 
        hint: 'Customer quotes, competitor traction, market research?',
        description: 'Measures whether the team has validated that real customers want this solution.',
        whatToLookFor: ['Direct customer quotes', 'Number interviewed', 'Waitlist signups', 'Competitor traction'],
        excellent: { score: '5 points', example: '"We interviewed 15 managers. 12 said they would pay immediately."', why: 'Specific count, conversion rate' },
        good: { score: '3-4 points', example: '"We talked to several people and they said it sounds useful."', why: 'Some validation but vague' },
        weak: { score: '0-2 points', example: '"We haven\'t talked to customers yet but we\'re confident."', why: 'No validation' }
      }
    ]
  },
  {
    id: 'automation',
    name: '2. Automation Depth + Demo',
    maxPoints: 20,
    description: 'Evaluates the technical sophistication of the AI automation and quality of the live demonstration.',
    whyItMatters: 'This separates "AI-native" products from ChatGPT wrappers. The demo is your proof.',
    subcriteria: [
      { 
        id: 'ai_autonomy', 
        name: 'AI Autonomy Level', 
        max: 7, 
        hint: 'Full automation vs co-pilot vs wrapper?',
        description: 'Measures how much the AI does independently vs. requiring human guidance.',
        whatToLookFor: ['Does AI complete entire tasks?', 'How much human input required?', 'Edge case handling?'],
        excellent: { score: '6-7 points', example: '"AI automatically scrapes catalogs, parses PDFs, reconstructs matrix—all without human intervention."', why: 'Complete end-to-end automation' },
        good: { score: '4-5 points', example: '"AI drafts the email. User reviews and clicks send."', why: 'Good co-pilot model' },
        weak: { score: '0-3 points', example: '"User types question, app sends to ChatGPT, displays response."', why: 'Thin wrapper' }
      },
      { 
        id: 'e2e_completeness', 
        name: 'End-to-End Completeness', 
        max: 7, 
        hint: 'Full workflow from trigger to output?',
        description: 'Measures whether the solution handles the complete workflow.',
        whatToLookFor: ['What triggers automation?', 'All steps covered?', 'Usable output?'],
        excellent: { score: '6-7 points', example: '"Input: part number. Process: search 50+ databases. Output: CSV ready for ERP import."', why: 'Clear input → process → output' },
        good: { score: '4-5 points', example: '"User uploads document, AI extracts info to dashboard."', why: 'Good but what happens next?' },
        weak: { score: '0-3 points', example: '"AI analyzes data and provides insights."', why: 'Incomplete workflow' }
      },
      { 
        id: 'demo_execution', 
        name: 'Live Demo Execution', 
        max: 6, 
        hint: 'Smooth, clear, confidence-inspiring?',
        description: 'Evaluates how well the live demonstration is executed.',
        whatToLookFor: ['Does demo work live?', 'Response time <5 seconds?', 'Presenter confident?', 'Backup plan?'],
        excellent: { score: '5-6 points', example: 'Live demo with real data, <3 second response, handles spontaneous requests.', why: 'Confident execution' },
        good: { score: '3-4 points', example: 'Demo works but takes 10-15 seconds. One minor glitch recovered.', why: 'Functional but not polished' },
        weak: { score: '0-2 points', example: 'Demo crashes, presenter says "imagine this would show..."', why: 'Broken demo destroys credibility' }
      }
    ]
  },
  {
    id: 'roi',
    name: '3. Measured ROI + Evaluation',
    maxPoints: 15,
    description: 'Evaluates whether the team can prove their solution delivers value.',
    whyItMatters: 'Without measured ROI, customers can\'t justify purchasing.',
    subcriteria: [
      { 
        id: 'roi_quantification', 
        name: 'ROI Quantification', 
        max: 6, 
        hint: 'Time saved, cost reduced, revenue increased?',
        description: 'Measures whether the team can articulate specific value delivered.',
        whatToLookFor: ['Time savings', 'Cost savings', 'Revenue impact', 'Before vs After comparison'],
        excellent: { score: '5-6 points', example: '"45 minutes → 3 seconds. At $60/hr, saves $44.50 per lookup = $46K/year."', why: 'Specific comparison, cost calculation' },
        good: { score: '3-4 points', example: '"Saves about 2 hours per week."', why: 'Time savings but no dollar conversion' },
        weak: { score: '0-2 points', example: '"Makes businesses more efficient."', why: 'No specific measurement' }
      },
      { 
        id: 'accuracy_metrics', 
        name: 'Accuracy/Quality Metrics', 
        max: 5, 
        hint: 'Precision, recall, F1, error rate?',
        description: 'Measures whether the team has quantified AI accuracy.',
        whatToLookFor: ['Accuracy percentage', 'Error rate', 'Confidence scoring', 'Baseline comparison'],
        excellent: { score: '4-5 points', example: '"94% accuracy on 500-lookup test set. 6% flagged as uncertain."', why: 'Specific metrics, confidence scoring' },
        good: { score: '2-3 points', example: '"Usually accurate based on user feedback."', why: 'Claims but no measurement' },
        weak: { score: '0-1 points', example: '"We haven\'t measured this yet."', why: 'No accuracy metrics' }
      },
      { 
        id: 'eval_methodology', 
        name: 'Evaluation Methodology', 
        max: 4, 
        hint: 'Credible test set, pilot results?',
        description: 'Evaluates whether the testing approach is rigorous.',
        whatToLookFor: ['Test set size 100+', 'Diverse test cases', 'Ground truth verification', 'Independent test data'],
        excellent: { score: '4 points', example: '"500 part lookups, 10 equipment types, verified by 2 specialists."', why: 'Large diverse test set, expert verification' },
        good: { score: '2-3 points', example: '"Tested on 50 examples we manually verified."', why: 'Some testing but small sample' },
        weak: { score: '0-1 points', example: '"We tried it on a few examples and it worked."', why: 'Anecdotal testing' }
      }
    ]
  },
  {
    id: 'reliability',
    name: '4. Reliability + Failure Handling',
    maxPoints: 10,
    description: 'Evaluates system stability and graceful error handling.',
    whyItMatters: 'Enterprise customers won\'t adopt tools that crash or give wrong answers without warning.',
    subcriteria: [
      { 
        id: 'system_stability', 
        name: 'System Stability', 
        max: 4, 
        hint: 'Crashes? Timeouts? Load tested?',
        description: 'Measures basic technical reliability.',
        whatToLookFor: ['Response time consistent?', 'Any crashes?', 'Load tested?', 'Recovery after failure?'],
        excellent: { score: '4 points', example: '"2.3 second avg response, 99.9% uptime, load tested 50 concurrent users."', why: 'Measured metrics' },
        good: { score: '2-3 points', example: '"Usually responds in 5-10 seconds. Had one timeout."', why: 'Works but not rigorous' },
        weak: { score: '0-1 points', example: 'Demo crashes, "it usually works better than this."', why: 'Unreliable' }
      },
      { 
        id: 'ai_failure_handling', 
        name: 'AI Failure Handling', 
        max: 4, 
        hint: 'Confidence scores? Human review queue?',
        description: 'Evaluates how the system handles AI uncertainty.',
        whatToLookFor: ['Confidence scores visible?', 'Uncertain results flagged?', 'Human review queue?', 'Graceful degradation?'],
        excellent: { score: '4 points', example: '"Results show confidence %. <80% marked \'Needs Review\'. Users can flag errors."', why: 'Confidence visible, uncertain flagged' },
        good: { score: '2-3 points', example: '"We show a disclaimer that results should be verified."', why: 'Basic awareness' },
        weak: { score: '0-1 points', example: 'All results shown with same confidence, no warnings.', why: 'Can\'t tell when to trust' }
      },
      { 
        id: 'demo_resilience', 
        name: 'Demo Resilience', 
        max: 2, 
        hint: 'Backup plan? Pre-cached responses?',
        description: 'Preparation for demo-day risks (network issues, API limits).',
        whatToLookFor: ['Video backup?', 'Pre-cached responses?', 'Offline fallback?', 'Tested on bad network?'],
        excellent: { score: '2 points', example: '"Video backup, key flows work offline, tested on mobile hotspot."', why: 'Multiple fallbacks' },
        good: { score: '1 point', example: '"Have a video backup if needed."', why: 'Basic backup' },
        weak: { score: '0 points', example: '"We\'ll hope the WiFi works."', why: 'Unprepared' }
      }
    ]
  },
  {
    id: 'integrations',
    name: '5. Integrations + Adoption Ease',
    maxPoints: 10,
    description: 'Evaluates how easily the product fits into existing workflows.',
    whyItMatters: 'Adoption friction kills products. If users have to change everything, they won\'t adopt.',
    subcriteria: [
      { 
        id: 'integration_points', 
        name: 'Integration Points', 
        max: 4, 
        hint: 'Connects to CRM, email, Slack, ERP?',
        description: 'Measures how well the product connects to existing tools.',
        whatToLookFor: ['Export formats (CSV, API)?', 'Import from existing sources?', 'Workflow integrations (Slack, email)?'],
        excellent: { score: '4 points', example: '"CSV export for ERP, API available, Slack notifications, Chrome extension."', why: 'Multiple integration paths' },
        good: { score: '2-3 points', example: '"Results can be exported to CSV."', why: 'Basic export' },
        weak: { score: '0-1 points', example: '"Users can copy/paste from dashboard."', why: 'Manual transfer' }
      },
      { 
        id: 'onboarding_friction', 
        name: 'Onboarding Friction', 
        max: 4, 
        hint: 'Time to value? IT involvement needed?',
        description: 'Measures how quickly a new user can get value.',
        whatToLookFor: ['Time to first value?', 'IT/admin needed?', 'Training required?', 'Data migration easy?'],
        excellent: { score: '4 points', example: '"Paste a part number, get results in 3 seconds. No account for trial."', why: 'Immediate value' },
        good: { score: '2-3 points', example: '"Sign up, upload data, see results within an hour."', why: 'Reasonable but not instant' },
        weak: { score: '0-1 points', example: '"Schedule onboarding call, IT configures SSO, 2-week implementation."', why: 'High friction' }
      },
      { 
        id: 'change_management', 
        name: 'Change Management', 
        max: 2, 
        hint: 'How much behavior change required?',
        description: 'Can users adopt within existing habits?',
        whatToLookFor: ['Replaces existing step or adds new?', 'New interface paradigms?', 'Gradual adoption possible?'],
        excellent: { score: '2 points', example: '"Replaces manual Google searches. Same input, faster output."', why: 'Drops into existing workflow' },
        good: { score: '1 point', example: '"Log into our dashboard instead of spreadsheet, but similar process."', why: 'Minor change' },
        weak: { score: '0 points', example: '"Completely restructure how you track parts."', why: 'Major behavior change' }
      }
    ]
  },
  {
    id: 'security',
    name: '6. Security/Compliance/Audit',
    maxPoints: 10,
    description: 'Evaluates data protection, compliance, and auditability.',
    whyItMatters: 'Enterprise buyers require security reviews. AI decisions may need audit trails.',
    subcriteria: [
      { 
        id: 'data_handling', 
        name: 'Data Handling', 
        max: 4, 
        hint: 'Where stored? Encrypted? Retention policy?',
        description: 'How carefully the team handles user data.',
        whatToLookFor: ['Data location?', 'Encryption (transit/rest)?', 'Access controls?', 'Retention policy? Deletion?'],
        excellent: { score: '4 points', example: '"TLS 1.3 + AES-256. US-West AWS. 90-day retention. User-controlled deletion."', why: 'Specific encryption, clear policies' },
        good: { score: '2-3 points', example: '"Standard cloud security practices."', why: 'Aware but no specifics' },
        weak: { score: '0-1 points', example: '"Haven\'t thought about that yet."', why: 'Red flag' }
      },
      { 
        id: 'audit_trail', 
        name: 'Audit Trail', 
        max: 4, 
        hint: 'AI decisions traceable with timestamps?',
        description: 'Can AI decisions be traced and reviewed later?',
        whatToLookFor: ['Inputs/outputs logged?', 'Timestamps?', 'Source attribution?', 'User actions logged?'],
        excellent: { score: '4 points', example: '"Full audit log: query, response, confidence, sources, timestamp. Exportable."', why: 'Complete traceability' },
        good: { score: '2-3 points', example: '"We log queries and responses."', why: 'Basic logging' },
        weak: { score: '0-1 points', example: '"We don\'t save any data."', why: 'Can\'t debug or comply' }
      },
      { 
        id: 'compliance_readiness', 
        name: 'Compliance Readiness', 
        max: 2, 
        hint: 'SOC 2, GDPR awareness?',
        description: 'Awareness of compliance frameworks.',
        whatToLookFor: ['Relevant frameworks known?', 'Appropriate disclaimers?', 'Privacy policy?', 'Compliance roadmap?'],
        excellent: { score: '2 points', example: '"SOC 2 Type 1 in progress. GDPR compliant. Clear \'not legal advice\' disclaimer."', why: 'Active progress, disclaimers' },
        good: { score: '1 point', example: '"Aware we\'ll need SOC 2, on our roadmap."', why: 'Awareness but no progress' },
        weak: { score: '0 points', example: '"Haven\'t thought about compliance."', why: 'Liability risk' }
      }
    ]
  },
  {
    id: 'business',
    name: '7. Business Model + GTM',
    maxPoints: 15,
    description: 'Evaluates viable path to revenue and customer acquisition.',
    whyItMatters: 'Great technology with no business model is a hobby, not a startup.',
    subcriteria: [
      { 
        id: 'revenue_model', 
        name: 'Revenue Model Clarity', 
        max: 5, 
        hint: 'Clear pricing with specific numbers?',
        description: 'Specific, defensible pricing model.',
        whatToLookFor: ['Specific pricing?', 'Value-based logic?', 'Compared to alternatives?', 'Validated willingness to pay?'],
        excellent: { score: '5 points', example: '"$99/seat/month. Saves $600/month value. 3 pilots agreed to this price."', why: 'Specific, value-based, validated' },
        good: { score: '3-4 points', example: '"Planning $50-100/month based on competitors."', why: 'Range but not validated' },
        weak: { score: '0-2 points', example: '"We\'ll figure out pricing later."', why: 'No business model' }
      },
      { 
        id: 'unit_economics', 
        name: 'Unit Economics', 
        max: 5, 
        hint: 'AI costs, gross margin, CAC/LTV?',
        description: 'Understanding of cost structure.',
        whatToLookFor: ['Cost per transaction?', 'Gross margin?', 'Customer acquisition cost?', 'Lifetime value?'],
        excellent: { score: '5 points', example: '"$0.02/lookup API cost. 200 lookups/month = $4. At $99 price = 96% margin."', why: 'Specific cost calculation' },
        good: { score: '3-4 points', example: '"AI costs are pretty low, maybe a few cents per query."', why: 'Awareness but not calculated' },
        weak: { score: '0-2 points', example: '"Haven\'t calculated costs yet."', why: 'AI costs can be high' }
      },
      { 
        id: 'gtm_strategy', 
        name: 'Go-to-Market Strategy', 
        max: 5, 
        hint: 'Specific acquisition channel and wedge?',
        description: 'How the team plans to find and acquire customers.',
        whatToLookFor: ['Specific channel?', 'First narrow segment?', 'Sequenced steps?', 'Unfair advantages?'],
        excellent: { score: '5 points', example: '"Phase 1: LinkedIn to procurement managers at CAT dealers. Phase 2: Distributor partnerships."', why: 'Specific channel, sequenced' },
        good: { score: '3-4 points', example: '"Content marketing and trade shows."', why: 'Reasonable but not specific' },
        weak: { score: '0-2 points', example: '"Word of mouth will spread."', why: 'No plan' }
      }
    ]
  },
  {
    id: 'defensibility',
    name: '8. Defensibility',
    maxPoints: 5,
    description: 'Sustainable competitive advantage.',
    whyItMatters: 'Most AI products are easily replicable. Defensibility determines if this can be a real business.',
    subcriteria: [
      { 
        id: 'moat_identification', 
        name: 'Moat Identification', 
        max: 3, 
        hint: 'Data, network effects, regulatory barrier?',
        description: 'Credible source of long-term competitive advantage.',
        whatToLookFor: ['Data moat?', 'Network effects?', 'Switching costs?', 'Regulatory barriers?', 'Unique distribution?'],
        excellent: { score: '3 points', example: '"Every lookup improves our database. After 100K lookups, competitors can\'t replicate."', why: 'Clear data moat' },
        good: { score: '2 points', example: '"Building supplier relationships for exclusive data."', why: 'Potential moat' },
        weak: { score: '0-1 points', example: '"Our moat is our team."', why: 'Not a moat' }
      },
      { 
        id: 'moat_evidence', 
        name: 'Moat Evidence', 
        max: 2, 
        hint: 'Is moat real today or theoretical?',
        description: 'Does the claimed moat exist today?',
        whatToLookFor: ['Being built today?', 'Measurable progress?', 'Timeline?', 'Dependencies?'],
        excellent: { score: '2 points', example: '"50,000 mappings already. Growing 1,000/week. 2 distributor partnerships signed."', why: 'Measurable progress' },
        good: { score: '1 point', example: '"We\'ll build the moat once we have customers."', why: 'Theoretical' },
        weak: { score: '0 points', example: 'No evidence of moat building.', why: 'Competitors can catch up' }
      }
    ]
  }
];

const TIER_CONFIG = [
  { min: 85, label: 'STRONG CONTENDER', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', borderColor: 'border-green-500', description: 'High probability of top 3 finish.' },
  { min: 70, label: 'COMPETITIVE', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', borderColor: 'border-blue-500', description: 'Solid entry. Could win with strong demo.' },
  { min: 55, label: 'RISKY', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', borderColor: 'border-yellow-500', description: 'Significant gaps to address.' },
  { min: 40, label: 'UNLIKELY', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', borderColor: 'border-orange-500', description: 'Fundamental issues.' },
  { min: 0, label: 'NOT READY', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', borderColor: 'border-red-500', description: 'Should not compete.' }
];

const RED_FLAGS = [
  { flag: '"We think this is a problem"', issue: 'No validation evidence.' },
  { flag: '"Then the AI would..."', issue: 'Not shown in live demo.' },
  { flag: '"We\'ll monetize later"', issue: 'No business model.' },
  { flag: '"Our moat is our team"', issue: 'Not a defensible moat.' },
  { flag: '"It usually works"', issue: 'No reliability metrics.' },
  { flag: 'Demo requires "imagine this"', issue: 'Incomplete demo.' },
  { flag: 'No working prototype', issue: 'Cannot compete without software.' }
];

// Helper functions
const getTier = (score) => {
  for (const tier of TIER_CONFIG) {
    if (score >= tier.min) return tier;
  }
  return TIER_CONFIG[TIER_CONFIG.length - 1];
};

const calculateCategoryTotal = (scores, category) => {
  return category.subcriteria.reduce((sum, sub) => sum + (scores[sub.id] || 0), 0);
};

const calculateTotalScore = (scores) => {
  return SCORING_CATEGORIES.reduce((sum, cat) => sum + calculateCategoryTotal(scores, cat), 0);
};

// AI Scoring function using our serverless backend (calls Claude API securely)
const getAIScoring = async (project) => {
  const projectContext = `
Project Name: ${project.placeholder_project_name || 'Unknown'}
Owner: ${project.your_name || 'Unknown'}
Symptoms: ${project.symptoms || 'Not provided'}
Root Cause: ${project.root_cause || 'Not provided'}
Core Deficit: ${project.core_deficit || 'Not provided'}
Problem Statement: ${project.one_line_problem_statement || 'Not provided'}
Solution Statement: ${project.one_line_solution_statement || 'Not provided'}
Must Have Features: ${project.must_have || 'Not provided'}
Should Have Features: ${project.should_have || 'Not provided'}
Could Have Features: ${project.could_have || 'Not provided'}
Won't Have Features: ${project.wont_have || 'Not provided'}
`;

  const rubricContext = SCORING_CATEGORIES.map(cat => 
    `${cat.name} (${cat.maxPoints} points total):\n` +
    cat.subcriteria.map(sub => 
      `  - ${sub.name} (max ${sub.max} points): ${sub.description}\n` +
      `    Excellent: ${sub.excellent?.example || 'N/A'}\n` +
      `    Weak: ${sub.weak?.example || 'N/A'}`
    ).join('\n')
  ).join('\n\n');

  const allSubcriteria = SCORING_CATEGORIES.flatMap(cat => cat.subcriteria);
  
  const prompt = `You are an expert judge for an AI automation MVP competition. Evaluate this project based on the provided rubric.

PROJECT DETAILS:
${projectContext}

SCORING RUBRIC:
${rubricContext}

IMPORTANT: Score ONLY based on the information provided. If information is missing for a criterion, give a lower score and note that in your reasoning.

For each of the following ${allSubcriteria.length} criteria, provide a JSON object with:
- "id": the criterion id
- "score": integer score (0 to max for that criterion)
- "reasoning": 1-2 sentence explanation for the score

Respond with a JSON array containing exactly ${allSubcriteria.length} objects, one for each criterion in this exact order:
${allSubcriteria.map(s => `- ${s.id} (max: ${s.max})`).join('\n')}

Return ONLY the JSON array, no other text.`;

  try {
    // Call our serverless backend (which securely calls Anthropic)
    const response = await fetch("/api/ai-score", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const aiScores = {};
      const aiReasoning = {};
      
      parsed.forEach(item => {
        if (item.id && typeof item.score === 'number') {
          aiScores[item.id] = item.score;
          aiReasoning[item.id] = item.reasoning || '';
        }
      });
      
      return { aiScores, aiReasoning };
    }
    
    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('AI Scoring error:', error);
    throw error;
  }
};

// PROPER CSV Parser that handles multi-line quoted fields
const parseCSV = (text) => {
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  
  const parseCSVToRows = (csvText) => {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];
      
      if (inQuotes) {
        if (char === '"') {
          if (nextChar === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          currentField += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          currentRow.push(currentField.trim());
          currentField = '';
        } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
          currentRow.push(currentField.trim());
          if (currentRow.some(field => field !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
          if (char === '\r') i++;
        } else if (char !== '\r') {
          currentField += char;
        }
      }
    }
    
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field !== '')) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  };
  
  const rows = parseCSVToRows(text);
  if (rows.length < 2) return [];
  
  const headers = rows[0];
  const headerIndex = {};
  headers.forEach((header, idx) => {
    const h = header.toLowerCase().trim();
    if (h === 'no' || h === 'no.') headerIndex.no = idx;
    else if (h === 'your name') headerIndex.yourName = idx;
    else if (h === 'placeholder project name' || h.includes('project name')) headerIndex.projectName = idx;
    else if (h === 'symptom(s)' || h.includes('symptom')) headerIndex.symptoms = idx;
    else if (h === 'root cause') headerIndex.rootCause = idx;
    else if (h === 'core deficit') headerIndex.coreDeficit = idx;
    else if (h === 'one-line problem statement' || h.includes('problem statement')) headerIndex.problemStatement = idx;
    else if (h === 'one-line solution statement' || h.includes('solution statement')) headerIndex.solutionStatement = idx;
    else if (h === 'must have (1-2)' || h.includes('must have')) headerIndex.mustHave = idx;
    else if (h === 'should have') headerIndex.shouldHave = idx;
    else if (h === 'could have') headerIndex.couldHave = idx;
    else if (h === "won't have" || h === 'wont have') headerIndex.wontHave = idx;
  });
  
  const projects = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const noIdx = headerIndex.no !== undefined ? headerIndex.no : 0;
    const projectNum = row[noIdx];
    
    if (!projectNum || !/^\d+$/.test(projectNum.trim())) continue;
    
    const project = {
      id: `project-${Date.now()}-${i}`,
      project_number: parseInt(projectNum.trim()),
      scores: {},
      notes: {},
      aiScores: {},
      aiReasoning: {},
      aiScoringStatus: 'idle',
      your_name: headerIndex.yourName !== undefined ? (row[headerIndex.yourName] || '') : '',
      placeholder_project_name: headerIndex.projectName !== undefined ? (row[headerIndex.projectName] || '') : '',
      symptoms: headerIndex.symptoms !== undefined ? (row[headerIndex.symptoms] || '') : '',
      root_cause: headerIndex.rootCause !== undefined ? (row[headerIndex.rootCause] || '') : '',
      core_deficit: headerIndex.coreDeficit !== undefined ? (row[headerIndex.coreDeficit] || '') : '',
      one_line_problem_statement: headerIndex.problemStatement !== undefined ? (row[headerIndex.problemStatement] || '') : '',
      one_line_solution_statement: headerIndex.solutionStatement !== undefined ? (row[headerIndex.solutionStatement] || '') : '',
      must_have: headerIndex.mustHave !== undefined ? (row[headerIndex.mustHave] || '') : '',
      should_have: headerIndex.shouldHave !== undefined ? (row[headerIndex.shouldHave] || '') : '',
      could_have: headerIndex.couldHave !== undefined ? (row[headerIndex.couldHave] || '') : '',
      wont_have: headerIndex.wontHave !== undefined ? (row[headerIndex.wontHave] || '') : ''
    };
    
    if (project.placeholder_project_name || project.your_name) {
      projects.push(project);
    }
  }
  
  projects.sort((a, b) => a.project_number - b.project_number);
  return projects;
};

// Components
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 font-medium transition-all rounded-t-lg ${
      active ? 'bg-white text-blue-600 border-t-2 border-x border-blue-600 -mb-px' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}>
    <Icon size={18} />{label}
  </button>
);

// Manual Score Input Component
const ManualScoreInput = ({ value, max, onChange }) => {
  const percentage = (value / max) * 100;
  const bgColor = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <input type="range" min="0" max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
        <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0</span><span>{max}</span></div>
      </div>
      <div className={`w-12 h-10 rounded-lg ${bgColor} flex items-center justify-center text-white font-bold`}>{value}</div>
    </div>
  );
};

// AI Score Display Component (read-only)
const AIScoreDisplay = ({ value, max, reasoning }) => {
  const percentage = (value / max) * 100;
  const bgColor = percentage >= 80 ? 'bg-purple-500' : percentage >= 60 ? 'bg-purple-400' : percentage >= 40 ? 'bg-purple-300' : 'bg-purple-200';
  
  return (
    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={16} className="text-purple-600" />
        <span className="text-sm font-medium text-purple-700">Opus 4.5 AI Score</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="w-full h-2 bg-purple-100 rounded-lg">
            <div className={`h-2 rounded-lg ${bgColor}`} style={{ width: `${percentage}%` }} />
          </div>
          <div className="flex justify-between text-xs text-purple-400 mt-1"><span>0</span><span>{max}</span></div>
        </div>
        <div className={`w-12 h-10 rounded-lg ${bgColor} flex items-center justify-center text-white font-bold`}>{value}</div>
      </div>
      {reasoning && (
        <p className="mt-2 text-sm text-purple-700 italic">{reasoning}</p>
      )}
    </div>
  );
};

// Combined Score Input with Help
const ScoreInputWithAI = ({ value, max, onChange, subcriterion, aiScore, aiReasoning }) => {
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <div className="space-y-2">
      {/* Manual Score */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">Manual Score</div>
          <ManualScoreInput value={value} max={max} onChange={onChange} />
        </div>
        <button onClick={() => setShowHelp(!showHelp)}
          className={`p-2 rounded-lg transition ${showHelp ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
          <HelpCircle size={16} />
        </button>
      </div>
      
      {/* AI Score (if available) */}
      {aiScore !== undefined && (
        <AIScoreDisplay value={aiScore} max={max} reasoning={aiReasoning} />
      )}
      
      {/* Help Panel */}
      {showHelp && subcriterion && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm space-y-3">
          <p className="text-gray-700">{subcriterion.description}</p>
          <div>
            <h5 className="font-semibold text-gray-700 mb-1">What to look for:</h5>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              {subcriterion.whatToLookFor?.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          {subcriterion.excellent && (
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="font-semibold text-green-800 mb-1">✓ Excellent ({subcriterion.excellent.score}):</div>
              <p className="text-green-700 italic text-sm">{subcriterion.excellent.example}</p>
            </div>
          )}
          {subcriterion.weak && (
            <div className="p-3 bg-red-50 rounded border border-red-200">
              <div className="font-semibold text-red-800 mb-1">✗ Weak ({subcriterion.weak.score}):</div>
              <p className="text-red-700 italic text-sm">{subcriterion.weak.example}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Project Input Tab
const ProjectInputTab = ({ projects, setProjects }) => {
  const [dragActive, setDragActive] = useState(false);
  
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);
  
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, []);
  
  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      if (parsed.length > 0) setProjects(parsed);
    };
    reader.readAsText(file);
  };
  
  const addManualProject = () => {
    setProjects([...projects, {
      id: `project-${Date.now()}`,
      project_number: projects.length + 1,
      your_name: '', placeholder_project_name: '', symptoms: '', root_cause: '', core_deficit: '',
      one_line_problem_statement: '', one_line_solution_statement: '',
      must_have: '', should_have: '', could_have: '', wont_have: '',
      scores: {}, notes: {}, aiScores: {}, aiReasoning: {}, aiScoringStatus: 'idle'
    }]);
  };
  
  const updateProject = (id, field, value) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };
  
  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
        <p className="text-lg font-medium text-gray-700 mb-2">Drag & drop your CSV file here</p>
        <p className="text-sm text-gray-500 mb-4">Supports multi-line fields in quoted cells</p>
        <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" id="csv-upload" />
        <label htmlFor="csv-upload" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">Select CSV File</label>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Projects ({projects.length})</h3>
          <button onClick={addManualProject} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus size={18} /> Add Project Manually
          </button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileSpreadsheet className="mx-auto mb-4 text-gray-300" size={64} />
            <p className="text-gray-500">No projects yet. Upload a CSV file to get started.</p>
          </div>
        ) : (
          projects.map((project, idx) => (
            <ProjectCard key={project.id} project={project} index={idx} onUpdate={updateProject} onDelete={deleteProject} />
          ))
        )}
      </div>
    </div>
  );
};

// Project Card
const ProjectCard = ({ project, index, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const projectName = project.placeholder_project_name || `Project ${index + 1}`;
  const score = calculateTotalScore(project.scores || {});
  const tier = getTier(score);
  
  const truncate = (text, maxLen = 100) => {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  };
  
  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {project.project_number || index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{truncate(projectName, 60)}</h4>
            <p className="text-sm text-gray-500">by {project.your_name || 'Unknown'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {score > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">{score}/100</span>
              <span className={`px-2 py-1 rounded text-xs text-white ${tier.color}`}>{tier.label.split(' ')[0]}</span>
            </div>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(project.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
            <Trash2 size={18} />
          </button>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4 border-t bg-gray-50 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input type="text" value={project.placeholder_project_name || ''} 
                onChange={(e) => onUpdate(project.id, 'placeholder_project_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
              <input type="text" value={project.your_name || ''} 
                onChange={(e) => onUpdate(project.id, 'your_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptom(s)</label>
            <textarea value={project.symptoms || ''} onChange={(e) => onUpdate(project.id, 'symptoms', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
              <textarea value={project.root_cause || ''} onChange={(e) => onUpdate(project.id, 'root_cause', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Core Deficit</label>
              <textarea value={project.core_deficit || ''} onChange={(e) => onUpdate(project.id, 'core_deficit', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={3} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">One-Line Problem Statement</label>
            <textarea value={project.one_line_problem_statement || ''} onChange={(e) => onUpdate(project.id, 'one_line_problem_statement', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">One-Line Solution Statement</label>
            <textarea value={project.one_line_solution_statement || ''} onChange={(e) => onUpdate(project.id, 'one_line_solution_statement', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Must Have (1-2)</label>
              <textarea value={project.must_have || ''} onChange={(e) => onUpdate(project.id, 'must_have', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Should Have</label>
              <textarea value={project.should_have || ''} onChange={(e) => onUpdate(project.id, 'should_have', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={4} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Could Have</label>
              <textarea value={project.could_have || ''} onChange={(e) => onUpdate(project.id, 'could_have', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={4} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Won't Have</label>
              <textarea value={project.wont_have || ''} onChange={(e) => onUpdate(project.id, 'wont_have', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={4} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Scoring Tab with AI Integration
const ScoringTab = ({ projects, setProjects }) => {
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || null);
  const [expandedCategories, setExpandedCategories] = useState(
    SCORING_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: true }), {})
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  const project = projects.find(p => p.id === selectedProject);
  
  const updateScore = (subcriterionId, value) => {
    if (!project) return;
    setProjects(projects.map(p => 
      p.id === selectedProject ? { ...p, scores: { ...p.scores, [subcriterionId]: value } } : p
    ));
  };
  
  const runAIScoring = async () => {
    if (!project) return;
    
    setAiLoading(true);
    setAiError(null);
    
    setProjects(projects.map(p => 
      p.id === selectedProject ? { ...p, aiScoringStatus: 'loading' } : p
    ));
    
    try {
      const result = await getAIScoring(project);
      
      setProjects(projects.map(p => 
        p.id === selectedProject ? { 
          ...p, 
          aiScores: result.aiScores,
          aiReasoning: result.aiReasoning,
          aiScoringStatus: 'done'
        } : p
      ));
    } catch (error) {
      setAiError(error.message || 'Failed to get AI scoring');
      setProjects(projects.map(p => 
        p.id === selectedProject ? { ...p, aiScoringStatus: 'error' } : p
      ));
    } finally {
      setAiLoading(false);
    }
  };
  
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto mb-4 text-yellow-500" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects to Score</h3>
        <p className="text-gray-500">Upload projects in the Project Input tab first.</p>
      </div>
    );
  }
  
  const scores = project?.scores || {};
  const aiScores = project?.aiScores || {};
  const aiReasoning = project?.aiReasoning || {};
  const totalScore = calculateTotalScore(scores);
  const aiTotalScore = calculateTotalScore(aiScores);
  const tier = getTier(totalScore);
  const aiTier = getTier(aiTotalScore);
  
  return (
    <div className="flex gap-6">
      {/* Project Selector */}
      <div className="w-72 shrink-0">
        <h3 className="font-semibold text-gray-700 mb-3">Select Project</h3>
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
          {projects.map((p, idx) => {
            const pScore = calculateTotalScore(p.scores || {});
            const pAiScore = calculateTotalScore(p.aiScores || {});
            const pTier = getTier(pScore);
            return (
              <button key={p.id} onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left p-3 rounded-lg border transition ${selectedProject === p.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className="font-medium text-gray-800 truncate text-sm">{p.placeholder_project_name || `Project ${idx + 1}`}</div>
                <div className="text-xs text-gray-500 truncate">{p.your_name || 'Unknown'}</div>
                <div className="flex items-center justify-between mt-1 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-gray-700">{pScore}</span>
                    {pAiScore > 0 && (
                      <>
                        <span className="text-gray-400">/</span>
                        <span className="text-sm font-bold text-purple-600">{pAiScore}</span>
                        <Sparkles size={12} className="text-purple-500" />
                      </>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${pTier.color} text-white`}>{pTier.label.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Scoring Panel */}
      <div className="flex-1 space-y-4">
        {/* Score Header */}
        <div className={`p-6 rounded-xl ${tier.bgLight} border-2 ${tier.borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{project?.placeholder_project_name || 'Project'}</h2>
              <p className="text-gray-600">by {project?.your_name || 'Unknown'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Manual</div>
                  <div className="text-3xl font-bold text-gray-800">{totalScore}<span className="text-lg text-gray-500">/100</span></div>
                  <div className={`inline-block px-2 py-0.5 rounded ${tier.color} text-white text-xs font-medium mt-1`}>{tier.label}</div>
                </div>
                {aiTotalScore > 0 && (
                  <div className="border-l pl-4 border-gray-300">
                    <div className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                      <Sparkles size={12} /> AI
                    </div>
                    <div className="text-3xl font-bold text-purple-700">{aiTotalScore}<span className="text-lg text-purple-400">/100</span></div>
                    <div className={`inline-block px-2 py-0.5 rounded ${aiTier.color} text-white text-xs font-medium mt-1`}>{aiTier.label}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={runAIScoring}
              disabled={aiLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                aiLoading 
                  ? 'bg-purple-200 text-purple-400 cursor-not-allowed' 
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {aiLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing with Opus 4.5...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  {Object.keys(aiScores).length > 0 ? 'Re-run AI Scoring' : 'Get AI Scoring'}
                </>
              )}
            </button>
            {aiError && (
              <p className="mt-2 text-sm text-red-600">{aiError}</p>
            )}
          </div>
        </div>
        
        {/* Project Details Preview */}
        {project && (project.one_line_problem_statement || project.one_line_solution_statement || project.symptoms) && (
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-3">Project Details</h3>
            <div className="space-y-2 text-sm">
              {project.symptoms && <div><span className="font-medium text-gray-600">Symptoms:</span> <span className="text-gray-700">{project.symptoms.substring(0, 300)}{project.symptoms.length > 300 ? '...' : ''}</span></div>}
              {project.root_cause && <div><span className="font-medium text-gray-600">Root Cause:</span> <span className="text-gray-700">{project.root_cause.substring(0, 300)}{project.root_cause.length > 300 ? '...' : ''}</span></div>}
              {project.one_line_problem_statement && <div><span className="font-medium text-gray-600">Problem:</span> <span className="text-gray-700">{project.one_line_problem_statement.substring(0, 300)}{project.one_line_problem_statement.length > 300 ? '...' : ''}</span></div>}
              {project.one_line_solution_statement && <div><span className="font-medium text-gray-600">Solution:</span> <span className="text-gray-700">{project.one_line_solution_statement.substring(0, 300)}{project.one_line_solution_statement.length > 300 ? '...' : ''}</span></div>}
            </div>
          </div>
        )}
        
        {/* Scoring Categories */}
        <div className="space-y-3">
          {SCORING_CATEGORIES.map(category => {
            const catTotal = calculateCategoryTotal(scores, category);
            const catAiTotal = calculateCategoryTotal(aiScores, category);
            const catPercentage = (catTotal / category.maxPoints) * 100;
            const isExpanded = expandedCategories[category.id];
            
            return (
              <div key={category.id} className="border rounded-lg bg-white overflow-hidden">
                <button onClick={() => setExpandedCategories(prev => ({ ...prev, [category.id]: !prev[category.id] }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition">
                  <span className="font-semibold text-gray-800">{category.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">{catTotal}/{category.maxPoints}</span>
                      {catAiTotal > 0 && (
                        <span className="text-sm font-bold text-purple-600 flex items-center gap-1">
                          <Sparkles size={12} />{catAiTotal}
                        </span>
                      )}
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${catPercentage >= 80 ? 'bg-green-500' : catPercentage >= 60 ? 'bg-blue-500' : catPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${catPercentage}%` }} />
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-blue-800 font-medium mb-1">Why this matters:</p>
                      <p className="text-blue-700">{category.whyItMatters}</p>
                    </div>
                    
                    {category.subcriteria.map(sub => (
                      <div key={sub.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">{sub.name}</span>
                          <span className="text-sm text-gray-500">Max: {sub.max} pts</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3 italic">{sub.hint}</p>
                        <ScoreInputWithAI 
                          value={scores[sub.id] || 0} 
                          max={sub.max} 
                          onChange={(val) => updateScore(sub.id, val)} 
                          subcriterion={sub}
                          aiScore={aiScores[sub.id]}
                          aiReasoning={aiReasoning[sub.id]}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Comparison Tab with AI Scores
const ComparisonTab = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto mb-4 text-gray-300" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects to Compare</h3>
        <p className="text-gray-500">Add and score projects first.</p>
      </div>
    );
  }
  
  const projectsWithScores = projects.map((p, idx) => ({
    ...p,
    totalScore: calculateTotalScore(p.scores || {}),
    aiTotalScore: calculateTotalScore(p.aiScores || {}),
    categoryScores: SCORING_CATEGORIES.map(cat => ({ 
      ...cat, 
      score: calculateCategoryTotal(p.scores || {}, cat),
      aiScore: calculateCategoryTotal(p.aiScores || {}, cat)
    })),
    name: p.placeholder_project_name || `Project ${idx + 1}`
  })).sort((a, b) => b.totalScore - a.totalScore);
  
  const exportToCSV = () => {
    const headers = [
      'Rank', 'Project', 'Owner', 
      'Manual Score', 'Manual Tier',
      'AI Score', 'AI Tier',
      ...SCORING_CATEGORIES.flatMap(c => [`${c.name} (Manual)`, `${c.name} (AI)`])
    ];
    
    const reasoningHeaders = SCORING_CATEGORIES.flatMap(cat => 
      cat.subcriteria.map(sub => `AI Reasoning: ${sub.name}`)
    );
    
    const allHeaders = [...headers, ...reasoningHeaders];
    
    const rows = projectsWithScores.map((p, idx) => {
      const baseRow = [
        idx + 1, 
        p.name, 
        p.your_name || '',
        p.totalScore, 
        getTier(p.totalScore).label,
        p.aiTotalScore,
        p.aiTotalScore > 0 ? getTier(p.aiTotalScore).label : 'Not Scored',
        ...p.categoryScores.flatMap(c => [c.score, c.aiScore || 0])
      ];
      
      const reasoningRow = SCORING_CATEGORIES.flatMap(cat => 
        cat.subcriteria.map(sub => (p.aiReasoning?.[sub.id] || '').replace(/"/g, '""'))
      );
      
      return [...baseRow, ...reasoningRow];
    });
    
    const csv = [allHeaders, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); 
    a.href = URL.createObjectURL(blob); 
    a.download = 'project_rankings_with_ai.csv'; 
    a.click();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Project Rankings</h3>
        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download size={18} /> Export to CSV (with AI Reasoning)
        </button>
      </div>
      
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700 rounded"></div>
          <span className="text-gray-600">Manual Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span className="text-gray-600">AI Score (Opus 4.5)</span>
        </div>
      </div>
      
      <div className="grid gap-4">
        {projectsWithScores.map((project, idx) => {
          const tier = getTier(project.totalScore);
          const aiTier = project.aiTotalScore > 0 ? getTier(project.aiTotalScore) : null;
          return (
            <div key={project.id} className={`p-4 rounded-xl border-2 overflow-hidden ${idx === 0 ? 'border-yellow-400 bg-yellow-50' : idx === 1 ? 'border-gray-300 bg-gray-50' : idx === 2 ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}>
              <div className="flex flex-wrap items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-bold ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-300 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                  #{idx + 1}
                </div>
                <div className="flex-1 min-w-0" style={{ minWidth: '200px' }}>
                  <h4 className="font-semibold text-lg text-gray-800 break-words">{project.name}</h4>
                  <p className="text-sm text-gray-500">by {project.your_name || 'Unknown'}</p>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0 ml-auto">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">Manual</div>
                    <div className="text-3xl font-bold text-gray-800">{project.totalScore}</div>
                    <span className={`text-xs px-2 py-1 rounded ${tier.color} text-white inline-block mt-1`}>{tier.label}</span>
                  </div>
                  <div className="text-center border-l pl-6 border-gray-200">
                    <div className="text-xs text-purple-600 mb-1 flex items-center gap-1 justify-center">
                      <Sparkles size={12} /> AI
                    </div>
                    <div className="text-3xl font-bold text-purple-700">{project.aiTotalScore || '—'}</div>
                    {aiTier ? (
                      <span className={`text-xs px-2 py-1 rounded ${aiTier.color} text-white inline-block mt-1`}>{aiTier.label}</span>
                    ) : (
                      <span className="text-xs text-gray-400 inline-block mt-1">Not scored</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Rubric Reference Tab
const RubricReferenceTab = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Tiers</h3>
        <div className="grid gap-2">
          {TIER_CONFIG.map(tier => (
            <div key={tier.label} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
              <div className={`w-20 text-center py-1 rounded ${tier.color} text-white text-sm font-bold`}>{tier.min}+</div>
              <div className={`font-semibold ${tier.textColor} w-40`}>{tier.label}</div>
              <div className="text-gray-600 text-sm">{tier.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Scoring Categories (100 points)</h3>
        <div className="space-y-2">
          {SCORING_CATEGORIES.map(cat => (
            <div key={cat.id} className="border rounded-lg overflow-hidden">
              <button onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left">
                <span className="font-semibold text-gray-800">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-bold">{cat.maxPoints} pts</span>
                  {expandedCategory === cat.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              
              {expandedCategory === cat.id && (
                <div className="p-4 bg-gray-50 border-t space-y-4">
                  <p className="text-gray-700">{cat.description}</p>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 font-medium mb-1">Why this matters:</p>
                    <p className="text-blue-700 text-sm">{cat.whyItMatters}</p>
                  </div>
                  
                  {cat.subcriteria.map(sub => (
                    <div key={sub.id} className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-700">{sub.name}</span>
                        <span className="text-blue-600 font-bold">{sub.max} pts</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{sub.description}</p>
                      <div className="grid gap-2 text-sm">
                        {sub.excellent && (
                          <div className="p-2 bg-green-50 rounded border border-green-200">
                            <span className="font-medium text-green-800">✓ Excellent:</span>
                            <span className="text-green-700 ml-1">{sub.excellent.example}</span>
                          </div>
                        )}
                        {sub.weak && (
                          <div className="p-2 bg-red-50 rounded border border-red-200">
                            <span className="font-medium text-red-800">✗ Weak:</span>
                            <span className="text-red-700 ml-1">{sub.weak.example}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Red Flags
        </h3>
        <div className="space-y-2">
          {RED_FLAGS.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
              <span className="text-red-500">✗</span>
              <div>
                <span className="font-medium text-red-800">{item.flag}</span>
                <p className="text-red-600 text-sm">{item.issue}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [activeTab, setActiveTab] = useState('input');
  const [projects, setProjects] = useState([]);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">AI Competition Scoring Tool</h1>
          <p className="text-blue-100">AIGF Cohort 5 - Build Team 2 | Demo: 03/28/2026 | Bangalore</p>
        </div>
      </header>
      
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 pt-4 flex-wrap">
            <TabButton active={activeTab === 'input'} onClick={() => setActiveTab('input')} icon={Upload} label="Project Input" />
            <TabButton active={activeTab === 'scoring'} onClick={() => setActiveTab('scoring')} icon={FileSpreadsheet} label="Scoring" />
            <TabButton active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')} icon={BarChart3} label="Comparison" />
            <TabButton active={activeTab === 'rubric'} onClick={() => setActiveTab('rubric')} icon={BookOpen} label="Rubric Reference" />
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'input' && <ProjectInputTab projects={projects} setProjects={setProjects} />}
        {activeTab === 'scoring' && <ScoringTab projects={projects} setProjects={setProjects} />}
        {activeTab === 'comparison' && <ComparisonTab projects={projects} />}
        {activeTab === 'rubric' && <RubricReferenceTab />}
      </main>
      
      <footer className="bg-gray-800 text-gray-400 py-4 px-4 text-center text-sm">
        <p>100-Point Scoring System | 8 Categories | 21 Subcriteria | Powered by Claude Opus 4.5</p>
      </footer>
    </div>
  );
}
