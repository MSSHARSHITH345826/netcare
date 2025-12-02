// Azure OpenAI Configuration
export const AZURE_ENDPOINT = process.env.REACT_APP_AZURE_ENDPOINT || "https://oai-mcm-agentic-flow-nprd01.openai.azure.com/";
export const AZURE_DEPLOYMENT = process.env.REACT_APP_AZURE_DEPLOYMENT || "gpt-4.1";
export const AZURE_API_KEY = process.env.REACT_APP_AZURE_API_KEY || "";
export const API_VERSION = process.env.REACT_APP_AZURE_API_VERSION || "2024-02-15-preview";

export interface AgentContext {
  agentName: string;
  agentType: string;
  agentDescription: string;
  caseNumber?: string;
  queryType?: string;
  queryAmount?: number;
  medicalAid?: string;
  hospital?: string;
  caseData?: any;
  previousAgentOutputs?: Record<string, string>;
  workflowStep?: number;
  totalSteps?: number;
}

export interface LLMResponse {
  output: string;
  reasoning?: string;
  nextActions?: string[];
}

/**
 * Calls Azure OpenAI to generate agentic output for a specific agent
 */
export const generateAgentOutput = async (
  context: AgentContext
): Promise<string> => {
  if (!AZURE_API_KEY) {
    console.warn('Azure OpenAI API key not configured. Using fallback output.');
    return getFallbackAgentOutput(context);
  }

  try {
    const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
      
      const systemPrompt = buildAgentSystemPrompt(context);
      const userPrompt = buildAgentUserPrompt(context);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_API_KEY
        },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      return getFallbackAgentOutput(context);
    }

    const data = await response.json();
    const generatedOutput = data.choices[0]?.message?.content || '';
    
    if (generatedOutput.trim()) {
      return generatedOutput.trim();
    }
    
    return getFallbackAgentOutput(context);
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    return getFallbackAgentOutput(context);
  }
};

/**
 * Builds the system prompt for agent output generation
 */
const buildAgentSystemPrompt = (context: AgentContext): string => {
  return `You are ${context.agentName}, a ${context.agentType} in Netcare's Level of Care Query Resolution system.

Your role: ${context.agentDescription}

Generate a realistic, detailed output based on the actual case data provided. The output should:
1. Reference specific case details (patient name, case number, dates, amounts)
2. Include actual data retrieved from systems (SAP, B2B, CareOn)
3. Show concrete findings with numbers, dates, and codes
4. Explain what data is being passed to next agents
5. Use South African Rand format (R X,XXX.XX)
6. Use dates in DD/MM/YYYY format
7. Reference actual Level of Care codes (e.g., 58201, 58002)

Make it sound like real system output - technical, precise, and data-driven. Keep it under 150 words but include specific details.`;
};

/**
 * Builds the user prompt with context for the agent
 */
const buildAgentUserPrompt = (context: AgentContext): string => {
  let prompt = `Generate the output for ${context.agentName} processing case ${context.caseNumber || 'GEMS-JHB-2024-092847'}.\n\n`;

  prompt += `Query Details:\n`;
  prompt += `- Query Type: ${context.queryType || 'Level of Care'}\n`;
  prompt += `- Query Amount: R ${context.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '99,148.50'}\n`;
  prompt += `- Medical Aid: ${context.medicalAid || 'GEMS'}\n`;
  prompt += `- Hospital: ${context.hospital || 'Netcare Milpark Hospital'}\n\n`;

  if (context.caseData) {
    prompt += `Case Data:\n`;
    prompt += `- Patient: ${context.caseData.patientName || 'Sipho'} ${context.caseData.patientSurname || 'Khumalo'}\n`;
    prompt += `- Admission: ${context.caseData.admissionDate || '14 July 2024'} to ${context.caseData.dischargeDate || '23 August 2024'}\n`;
    prompt += `- Outstanding Balance: R ${context.caseData.outstandingBalance?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '99,148.50'}\n`;
    prompt += `- Level of Care Billed: ${context.caseData.levelOfCareBilled || 'High Care / Step-down Unit'} (Code: ${context.caseData.levelOfCareBilledCode || '58201'})\n`;
    prompt += `- Short Payment Reason: ${context.caseData.shortPaymentReason || 'Level of Care days not approved'}\n\n`;
  }

  if (context.previousAgentOutputs && Object.keys(context.previousAgentOutputs).length > 0) {
    prompt += `Previous Agent Outputs:\n`;
    Object.entries(context.previousAgentOutputs).forEach(([agentName, output]) => {
      prompt += `- ${agentName}: ${output.substring(0, 100)}...\n`;
    });
    prompt += `\n`;
  }

  prompt += `Workflow Progress: Step ${context.workflowStep || 1} of ${context.totalSteps || 12}\n\n`;

  // Agent-specific prompts with detailed context
  const agentSpecificPrompts: Record<string, string> = {
    'QueryDetector': `Generate output for detecting query in Billing Triage Workbook. Include: case number ${context.caseNumber || 'GEMS-JHB-2024-092847'}, query amount R${context.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '99,148.50'}, query type, and priority level.`,
    'LevelOfCareResolver': `Generate output for workflow orchestration. Mention which 3 agents you're triggering in parallel (ShortPaymentAnalyzer, BilledDataExtractor, B2BCommunicationMonitor) and why.`,
    'ShortPaymentAnalyzer': `Generate output analyzing short payment from SAP Scratchpad. Include: specific dates declined, declined amount breakdown, reason code (LOC-DEC-001), and daily rate calculation. Reference patient ${context.caseData?.patientName || 'Sipho'} ${context.caseData?.patientSurname || 'Khumalo'}.`,
    'BilledDataExtractor': `Generate output for extracting billed Level of Care from SAP Case Overview. Include: LoC code ${context.caseData?.levelOfCareBilledCode || '58201'}, billed period dates, total days billed, and any LoC changes during admission.`,
    'B2BCommunicationMonitor': `Generate output for B2B communication retrieval. Include: number of messages found, latest message date, message types (authorization requests, responses), and current status.`,
    'DiscrepancyAnalyzer': `Generate output analyzing discrepancies. Include: specific dates not approved, cost impact calculation, root cause analysis, and which agents you're triggering next. Use actual dates from case data.`,
    'ApprovedDatesRetriever': `Generate output for approved dates from B2B. Include: breakdown by period with dates, approved vs declined days, and totals. Format: Period 1 (DD/MM-DD/MM): X days approved.`,
    'ClinicalDataAgent': `Generate output for CareOn clinical data extraction. Include: number of days of notes retrieved, date range, note types (progress, medication, justification), and Case Manager review status.`,
    'ResponseHandler': `Generate output for funder response monitoring. Include: response type (full/partial/denial), approved days and dates, approval percentage, and escalation status if needed.`,
    'QueryClosureAgent': `Generate output for DebtPack query closure. Include: selected outcome (Resubmit Approved), generated note text, status update, and handoff to next agent.`,
    'ResubmissionAgent': `Generate output for claim resubmission. Include: case number, resubmission amount, verification status, notifications sent, and final resolution status.`,
    'ManagementReportingAgent': `Generate output for management reporting. Include: query status progression, audit trail summary, dashboard metrics updated, resolution time, revenue recovered, and any exceptions.`
  };

  prompt += agentSpecificPrompts[context.agentName] || 'Generate your output based on your role and the context provided.';

  return prompt;
};

/**
 * Fallback output when LLM is not available
 */
const getFallbackAgentOutput = (context: AgentContext): string => {
  const fallbackOutputs: Record<string, string> = {
    'QueryDetector': `Query detected: Case ${context.caseNumber || 'GEMS-JHB-2024-092847'}, Amount: R ${context.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '99,148.50'}, Type: ${context.queryType || 'Level of Care'}, Priority: High (> R 50,000). Triggering LevelOfCareResolver.`,
    'LevelOfCareResolver': 'Workflow orchestration initialized. Triggering ShortPaymentAnalyzer, BilledDataExtractor, and B2BCommunicationMonitor in parallel.',
    'ShortPaymentAnalyzer': `Short payment reason: Level of Care days 29/07/2024 to 12/08/2024 not approved. Declined: R ${context.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '99,148.50'} (15 days @ R 6,609.90/day). Reason Code: LOC-DEC-001. Primary cost driver identified. Providing data to DiscrepancyAnalyzer.`,
    'BilledDataExtractor': 'Billed Level of Care: Code 58201 (High Care), Period: 14/07/2024 to 23/08/2024, Total Days: 41. Changes: Days 1-5 (ICU 58002), Days 6-41 (High Care 58201). Providing data to DiscrepancyAnalyzer.',
    'B2BCommunicationMonitor': 'B2B Communication retrieved: 5 messages found. Latest: Clinical data submission (29/08/2024) pending response. Communication history includes authorization requests and responses. Providing data to DiscrepancyAnalyzer and ResponseHandler.',
    'DiscrepancyAnalyzer': 'Discrepancy identified: Level of Care days 13/08/2024 to 23/08/2024 (11 days) not approved. Cost impact: R 72,708.90. Root cause: Clinical justification required for extended High Care beyond 30 days. Triggering ApprovedDatesRetriever and ClinicalDataAgent.',
    'ApprovedDatesRetriever': 'Approved dates retrieved: Period 1 (14/07-28/07): 15 days approved, Period 2 (29/07-12/08): 15 days approved, Period 3 (13/08-23/08): 11 days declined. Total: 30 approved, 11 declined. Providing data to DiscrepancyAnalyzer.',
    'ClinicalDataAgent': 'Clinical data extracted: 11 days of CareOn notes retrieved for period 13/08 to 23/08. Notes formatted and ready for Case Manager review. Data includes patient progress, medication management, and High Care justification. After Case Manager approval, submitting via B2B.',
    'ResponseHandler': 'Response detected: Full approval received for 11 days (13/08 to 23/08). All 41 days now approved. Approval percentage: 100%. No escalation needed. Routing to QueryClosureAgent.',
    'QueryClosureAgent': 'Query closed: Outcome "Resubmit Approved" selected. Note generated: "Full approval received for all 41 days after clinical data submission. Ready for resubmission." Status updated. Handing off to ResubmissionAgent.',
    'ResubmissionAgent': `Claim resubmitted: Case ${context.caseNumber || 'GEMS-JHB-2024-092847'} resubmitted for R ${context.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || '99,148.50'}. All approvals verified. Debtors Controller notified. Query marked as fully resolved.`,
    'ManagementReportingAgent': 'Management & Reporting: Query status tracked (Open → Investigation → Clinical Data Submitted → Response Received → Resolved). Audit trail created with 12 agent actions logged. Dashboard updated: Query resolved in 2.3 days (75% faster than average). Revenue recovered: R 99,148.50. No follow-ups required. No exceptions detected.'
  };

  return fallbackOutputs[context.agentName] || `${context.agentName}: Agent completed successfully.`;
};

/**
 * Calls Azure OpenAI for chat responses
 */
export const generateChatResponse = async (
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  systemContext?: string
): Promise<string> => {
  if (!AZURE_API_KEY) {
    return 'Azure OpenAI is not configured.';
  }

  try {
    const url = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
    
    const messageArray = systemContext 
      ? [{ role: 'system' as const, content: systemContext }, ...messages]
      : messages;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY
      },
      body: JSON.stringify({
        messages: messageArray,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
      return 'I apologize, but I encountered an error. Please try again.';
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    console.error('Error calling Azure OpenAI:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
};

