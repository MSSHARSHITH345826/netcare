import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  LinearProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Psychology as PsychologyIcon,
  Error as ErrorIcon,
  BarChart as BarChartIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';
import { generateAgentOutput, AgentContext } from '../../services/azureOpenAIService';

interface AgentStep {
  id: string;
  name: string;
  agent: string;
  agentType: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  position: { x: number; y: number };
  nextSteps: string[];
  sessionMessage?: string;
  processingTime?: number;
  output?: string;
  triggeredBy?: string[];
}

interface WorkflowOrchestrationProps {
  queryType: string;
  onBack?: () => void;
}

const WorkflowOrchestration: React.FC<WorkflowOrchestrationProps> = ({ queryType, onBack }) => {
  const { selectedQuery, caseData } = useQuery();
  const [agents, setAgents] = useState<AgentStep[]>([]);
  const [showMessage, setShowMessage] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [completedAgents, setCompletedAgents] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [agentOutputDialogOpen, setAgentOutputDialogOpen] = useState(false);
  const [currentCompletedAgent, setCurrentCompletedAgent] = useState<AgentStep | null>(null);
  const [currentStepNumber, setCurrentStepNumber] = useState(0);

  // Initialize 12 consolidated agents (reduced from 17)
  const getInitialAgents = useCallback((): AgentStep[] => {
    return [
      {
        id: 'query-detector',
        name: 'Query Detection',
        agent: 'QueryDetector',
        agentType: 'Monitoring & Detection Agent',
        description: 'Continuously monitors Billing Triage Workbook for new Level of Care queries',
        status: 'pending',
        position: { x: 50, y: 50 },
        nextSteps: ['level-of-care-resolver'],
        sessionMessage: 'QueryDetector: Scanning Billing Triage Workbook for Level of Care queries...',
        processingTime: 0.5,
        output: 'Query detected: Case GEMS-JHB-2024-092847, Amount: R 99,148.50, Type: Level of Care, Priority: High (> R 50,000). Triggering LevelOfCareResolver.'
      },
      {
        id: 'level-of-care-resolver',
        name: 'Workflow Orchestration',
        agent: 'LevelOfCareResolver',
        agentType: 'Workflow Orchestration Agent',
        description: 'Orchestrates the end-to-end Level of Care query resolution process',
        status: 'pending',
        position: { x: 300, y: 50 },
        nextSteps: ['short-payment-analyzer', 'billed-data-extractor', 'b2b-communication-monitor'],
        triggeredBy: ['query-detector'],
        sessionMessage: 'LevelOfCareResolver: Initializing workflow orchestration and coordinating sub-agents...',
        processingTime: 0.3,
        output: 'Workflow orchestration initialized. Triggering ShortPaymentAnalyzer, BilledDataExtractor, and B2BCommunicationMonitor in parallel.'
      },
      {
        id: 'short-payment-analyzer',
        name: 'Short Payment Analysis',
        agent: 'ShortPaymentAnalyzer',
        agentType: 'Data Analysis Agent',
        description: 'Analyzes short payment reasons and breaks down declined amounts',
        status: 'pending',
        position: { x: 550, y: 50 },
        nextSteps: ['discrepancy-analyzer'],
        triggeredBy: ['level-of-care-resolver'],
        sessionMessage: 'ShortPaymentAnalyzer: Analyzing short payment reasons from SAP Scratchpad...',
        processingTime: 1.2,
        output: 'Short payment reason: Level of Care days 29/07/2024 to 12/08/2024 not approved. Declined: R 99,148.50 (15 days @ R 6,609.90/day). Reason Code: LOC-DEC-001. Primary cost driver identified. Providing data to DiscrepancyAnalyzer.'
      },
      {
        id: 'billed-data-extractor',
        name: 'Billed Data Extraction',
        agent: 'BilledDataExtractor',
        agentType: 'Data Retrieval Agent',
        description: 'Extracts billed Level of Care information from SAP',
        status: 'pending',
        position: { x: 800, y: 50 },
        nextSteps: ['discrepancy-analyzer'],
        triggeredBy: ['level-of-care-resolver'],
        sessionMessage: 'BilledDataExtractor: Extracting billed Level of Care data from SAP Case Overview...',
        processingTime: 0.8,
        output: 'Billed Level of Care: Code 58201 (High Care), Period: 14/07/2024 to 23/08/2024, Total Days: 41. Changes: Days 1-5 (ICU 58002), Days 6-41 (High Care 58201). Providing data to DiscrepancyAnalyzer.'
      },
      {
        id: 'b2b-communication-monitor',
        name: 'B2B Communication Monitoring',
        agent: 'B2BCommunicationMonitor',
        agentType: 'Integration & Monitoring Agent',
        description: 'Monitors and retrieves B2B communication history',
        status: 'pending',
        position: { x: 1050, y: 50 },
        nextSteps: ['discrepancy-analyzer', 'response-handler'],
        triggeredBy: ['level-of-care-resolver'],
        sessionMessage: 'B2BCommunicationMonitor: Retrieving B2B communication logs from UMS system...',
        processingTime: 1.5,
        output: 'B2B Communication retrieved: 5 messages found. Latest: Clinical data submission (29/08/2024) pending response. Communication history includes authorization requests and responses. Providing data to DiscrepancyAnalyzer and ResponseHandler.'
      },
      {
        id: 'discrepancy-analyzer',
        name: 'Discrepancy Analysis',
        agent: 'DiscrepancyAnalyzer',
        agentType: 'Analysis & Intelligence Agent',
        description: 'Analyzes discrepancies between billed and approved Level of Care',
        status: 'pending',
        position: { x: 50, y: 250 },
        nextSteps: ['approved-dates-retriever', 'clinical-data-agent'],
        triggeredBy: ['short-payment-analyzer', 'billed-data-extractor', 'b2b-communication-monitor'],
        sessionMessage: 'DiscrepancyAnalyzer: Comparing billed vs approved Level of Care dates and generating discrepancy reason...',
        processingTime: 2.1,
        output: 'Discrepancy identified: Level of Care days 13/08/2024 to 23/08/2024 (11 days) not approved. Cost impact: R 72,708.90. Root cause: Clinical justification required for extended High Care beyond 30 days. Triggering ApprovedDatesRetriever and ClinicalDataAgent.'
      },
      {
        id: 'approved-dates-retriever',
        name: 'Approved Dates Retrieval',
        agent: 'ApprovedDatesRetriever',
        agentType: 'Integration & Retrieval Agent',
        description: 'Retrieves detailed approved Level of Care dates from B2B systems',
        status: 'pending',
        position: { x: 300, y: 250 },
        nextSteps: ['discrepancy-analyzer'],
        triggeredBy: ['discrepancy-analyzer'],
        sessionMessage: 'ApprovedDatesRetriever: Querying UMS B2B system for detailed approved Level of Care dates...',
        processingTime: 1.0,
        output: 'Approved dates retrieved: Period 1 (14/07-28/07): 15 days approved, Period 2 (29/07-12/08): 15 days approved, Period 3 (13/08-23/08): 11 days declined. Total: 30 approved, 11 declined. Providing data to DiscrepancyAnalyzer.'
      },
      {
        id: 'clinical-data-agent',
        name: 'Clinical Data Management',
        agent: 'ClinicalDataAgent',
        agentType: 'Integration & Data Management Agent',
        description: 'Manages clinical data extraction from CareOn and submission to medical aids',
        status: 'pending',
        position: { x: 550, y: 250 },
        nextSteps: ['response-handler'],
        triggeredBy: ['discrepancy-analyzer'],
        sessionMessage: 'ClinicalDataAgent: Extracting clinical notes from CareOn for queried date range (13/08 to 23/08)...',
        processingTime: 3.5,
        output: 'Clinical data extracted: 11 days of CareOn notes retrieved. Notes formatted and ready for Case Manager review. Data includes patient progress, medication management, and High Care justification. After Case Manager approval, submitting via B2B.'
      },
      {
        id: 'response-handler',
        name: 'Funder Response & Escalation',
        agent: 'ResponseHandler',
        agentType: 'Analysis & Routing Agent',
        description: 'Monitors for and analyzes funder responses, handles escalations',
        status: 'pending',
        position: { x: 800, y: 250 },
        nextSteps: ['query-closure-agent'],
        triggeredBy: ['b2b-communication-monitor', 'clinical-data-agent'],
        sessionMessage: 'ResponseHandler: Monitoring B2B system for medical aid response to clinical data submission...',
        processingTime: 1.8,
        output: 'Response detected: Full approval received for 11 days (13/08 to 23/08). All 41 days now approved. Approval percentage: 100%. No escalation needed. Routing to QueryClosureAgent.'
      },
      {
        id: 'query-closure-agent',
        name: 'Query Closure',
        agent: 'QueryClosureAgent',
        agentType: 'Workflow & Documentation Agent',
        description: 'Manages query closure in DebtPack with intelligent note generation',
        status: 'pending',
        position: { x: 1050, y: 250 },
        nextSteps: ['resubmission-agent'],
        triggeredBy: ['response-handler'],
        sessionMessage: 'QueryClosureAgent: Preparing query closure in DebtPack with intelligent note generation...',
        processingTime: 1.2,
        output: 'Query closed: Outcome "Resubmit Approved" selected. Note generated: "Full approval received for all 41 days after clinical data submission. Ready for resubmission." Status updated. Handing off to ResubmissionAgent.'
      },
      {
        id: 'resubmission-agent',
        name: 'Claim Resubmission',
        agent: 'ResubmissionAgent',
        agentType: 'Action Execution Agent',
        description: 'Prepares and resubmits claims after query resolution',
        status: 'pending',
        position: { x: 1300, y: 250 },
        nextSteps: [],
        triggeredBy: ['query-closure-agent'],
        sessionMessage: 'ResubmissionAgent: Preparing claim resubmission with updated approvals...',
        processingTime: 1.5,
        output: 'Claim resubmitted: Case GEMS-JHB-2024-092847 resubmitted for R 99,148.50. All approvals verified. Debtors Controller notified. Query marked as fully resolved.'
      },
      {
        id: 'management-reporting-agent',
        name: 'Management & Reporting',
        agent: 'ManagementReportingAgent',
        agentType: 'Management & Reporting Agent',
        description: 'Tracks query status, creates audit trails, aggregates dashboard metrics, manages follow-ups, and monitors exceptions',
        status: 'pending',
        position: { x: 50, y: 450 },
        nextSteps: [],
        triggeredBy: ['query-detector'],
        sessionMessage: 'ManagementReportingAgent: Tracking query status, creating audit trails, and updating dashboard metrics...',
        processingTime: 0.8,
        output: 'Management & Reporting: Query status tracked (Open → Investigation → Clinical Data Submitted → Response Received → Resolved). Audit trail created with 12 agent actions logged. Dashboard updated: Query resolved in 2.3 days (75% faster than average). Revenue recovered: R 99,148.50. No follow-ups required. No exceptions detected.'
      }
    ];
  }, []);

  useEffect(() => {
    const initialAgents = getInitialAgents();
    setAgents(initialAgents);
    loadSessionState(initialAgents);
  }, [getInitialAgents]);

  const loadSessionState = (initialAgents: AgentStep[]) => {
    const sessionKey = `netcare_orchestration_${selectedQuery?.id || 'default'}`;
    const savedSession = localStorage.getItem(sessionKey);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        if (parsed.agents && parsed.agents.length === initialAgents.length) {
          setAgents(parsed.agents);
          setCurrentAgentIndex(parsed.currentAgentIndex || 0);
          setShowMessage(parsed.showMessage || '');
          setIsAnimating(parsed.isAnimating || false);
          setCompletedAgents(new Set(parsed.completedAgents || []));
        }
      } catch (e) {
        console.error('Error loading session:', e);
      }
    }
    setSessionLoaded(true);
  };

  const saveSessionState = (updatedAgents: AgentStep[], agentIndex: number, message: string, animating: boolean, completed: Set<string>) => {
    const sessionKey = `netcare_orchestration_${selectedQuery?.id || 'default'}`;
    localStorage.setItem(sessionKey, JSON.stringify({
      agents: updatedAgents,
      currentAgentIndex: agentIndex,
      showMessage: message,
      isAnimating: animating,
      completedAgents: Array.from(completed),
      lastUpdated: new Date().toISOString()
    }));
    
    // Save agent outputs to AgentSummary
    const agentNameMap: Record<string, string> = {
      'QueryDetector': 'QueryDetector',
      'LevelOfCareResolver': 'LevelOfCareResolver',
      'ShortPaymentAnalyzer': 'ShortPaymentAnalyzer',
      'BilledDataExtractor': 'BilledDataExtractor',
      'B2BCommunicationMonitor': 'B2BCommunicationMonitor',
      'DiscrepancyAnalyzer': 'DiscrepancyAnalyzer',
      'ApprovedDatesRetriever': 'ApprovedDatesRetriever',
      'ClinicalDataAgent': 'ClinicalDataAgent',
      'ResponseHandler': 'ResponseHandler',
      'QueryClosureAgent': 'QueryClosureAgent',
      'ResubmissionAgent': 'ResubmissionAgent',
      'ManagementReportingAgent': 'ManagementReportingAgent'
    };
    
    const outputs: Record<string, string> = {};
    updatedAgents.forEach(agent => {
      if (agent.status === 'completed' && agent.output) {
        const agentName = agentNameMap[agent.agent] || agent.agent;
        outputs[agentName] = agent.output;
        outputs[agent.id] = agent.output;
        outputs[agent.agent] = agent.output;
      }
    });
    localStorage.setItem(`agent_outputs_${selectedQuery?.id || 'default'}`, JSON.stringify(outputs));
  };

  const startWorkflow = () => {
    setIsAnimating(true);
    setCurrentAgentIndex(0);
    setCurrentStepNumber(1);
    setCompletedAgents(new Set());
    const updatedAgents = agents.map((agent, index) => {
      if (index === 0) {
        return { ...agent, status: 'running' as const };
      }
      return agent;
    });
    setAgents(updatedAgents);
    if (updatedAgents[0]?.sessionMessage) {
      setShowMessage(updatedAgents[0].sessionMessage);
    }
    saveSessionState(updatedAgents, 0, updatedAgents[0]?.sessionMessage || '', true, new Set());
    // Start sequential processing
    processNextAgentSequential(updatedAgents, 0, new Set());
  };

  // Sequential processing - one agent at a time with popup
  const processNextAgentSequential = async (currentAgents: AgentStep[], index: number, completed: Set<string>) => {
    if (index >= currentAgents.length) {
      setIsAnimating(false);
      setShowMessage('✓ All 12 agents completed successfully! Workflow resolved.');
      return;
    }

    const agent = currentAgents[index];
    if (!agent) {
      // Find next available agent
      const nextIndex = currentAgents.findIndex((a, i) => i > index && a.status === 'pending');
      if (nextIndex >= 0) {
        setTimeout(() => processNextAgentSequential(currentAgents, nextIndex, completed), 1000);
      } else {
        setIsAnimating(false);
        setShowMessage('✓ All agents completed successfully! Workflow resolved.');
      }
      return;
    }

    // Mark agent as running
    const updatedAgents = currentAgents.map((a, i) => 
      i === index ? { ...a, status: 'running' as const } : a
    );
    setAgents(updatedAgents);
    setCurrentAgentIndex(index);
    setCurrentStepNumber(index + 1);
    
    if (agent.sessionMessage) {
      setShowMessage(agent.sessionMessage);
    }

    // Collect previous agent outputs for context
    const previousOutputs: Record<string, string> = {};
    completed.forEach(completedId => {
      const completedAgent = currentAgents.find(a => a.id === completedId);
      if (completedAgent && completedAgent.output) {
        previousOutputs[completedAgent.agent] = completedAgent.output;
      }
    });

    // Generate agent output using LLM
    const agentContext: AgentContext = {
      agentName: agent.agent,
      agentType: agent.agentType,
      agentDescription: agent.description,
      caseNumber: selectedQuery?.caseNumber,
      queryType: selectedQuery?.queryType,
      queryAmount: selectedQuery?.queryAmount,
      medicalAid: selectedQuery?.medicalAid,
      hospital: selectedQuery?.hospital,
      caseData: caseData || undefined,
      previousAgentOutputs: previousOutputs,
      workflowStep: index + 1,
      totalSteps: currentAgents.length
    };

    // Generate output using LLM
    let generatedOutput = agent.output || '';
    try {
      generatedOutput = await generateAgentOutput(agentContext);
    } catch (error) {
      console.error(`Error generating output for ${agent.agent}:`, error);
      generatedOutput = agent.output || `${agent.agent}: Agent completed successfully.`;
    }

    // Simulate processing time (slower for better UX)
    const processingTime = Math.max((agent.processingTime || 2) * 1000, 2000);
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Mark agent as completed
    const finalAgents = updatedAgents.map((a, i) => 
      i === index ? { ...a, status: 'completed' as const, output: generatedOutput } : a
    );

    const newCompleted = new Set(completed);
    newCompleted.add(agent.id);
    setCompletedAgents(newCompleted);
    setAgents(finalAgents);

    // Show completion message
    if (generatedOutput) {
      setShowMessage(`${agent.agent}: ${generatedOutput}`);
    } else {
      setShowMessage(`${agent.agent}: Completed successfully`);
    }

    // Save agent outputs to localStorage for Agent Summary
    const outputsKey = `agent_outputs_${selectedQuery?.id || 'default'}`;
    const existingOutputs = JSON.parse(localStorage.getItem(outputsKey) || '{}');
    const updatedOutputs = {
      ...existingOutputs,
      [agent.agent]: generatedOutput,
      [agent.id]: generatedOutput,
      [agent.name]: generatedOutput
    };
    localStorage.setItem(outputsKey, JSON.stringify(updatedOutputs));

    // Show popup dialog with agent output
    setCurrentCompletedAgent({ ...agent, output: generatedOutput });
    setAgentOutputDialogOpen(true);

    saveSessionState(finalAgents, index, generatedOutput || `${agent.agent}: Completed`, true, newCompleted);
  };

  const handleDialogClose = () => {
    setAgentOutputDialogOpen(false);
    // Continue to next agent after dialog closes
    const nextIndex = currentAgentIndex + 1;
    if (nextIndex < agents.length) {
      setTimeout(() => {
        processNextAgentSequential(agents, nextIndex, completedAgents);
      }, 500);
    } else {
      setIsAnimating(false);
      setShowMessage('✓ All 12 agents completed successfully! Workflow resolved.');
    }
  };

  // Old parallel processing function (kept for reference but not used)
  const processNextAgent = async (currentAgents: AgentStep[], index: number, completed: Set<string>) => {
    if (index >= currentAgents.length) {
      setIsAnimating(false);
      setShowMessage('✓ All 12 agents completed successfully! Workflow resolved.');
      return;
    }

    const agent = currentAgents[index];
    if (!agent) return;

    // Check if all triggering agents are completed
    if (agent.triggeredBy && agent.triggeredBy.length > 0) {
      const allTriggersCompleted = agent.triggeredBy.every(triggerId => {
        const triggerAgent = currentAgents.find(a => a.id === triggerId);
        return triggerAgent && completed.has(triggerAgent.id);
      });
      if (!allTriggersCompleted && agent.id !== 'query-detector') {
        // Wait for triggers - find next agent that can run
        const nextAvailable = currentAgents.findIndex((a, i) => 
          i > index && 
          (!a.triggeredBy || a.triggeredBy.every(tid => {
            const t = currentAgents.find(ta => ta.id === tid);
            return t && completed.has(t.id);
          }))
        );
        if (nextAvailable >= 0) {
          setTimeout(() => processNextAgent(currentAgents, nextAvailable, completed), 500);
        }
        return;
      }
    }

    // Show running message
    if (agent.sessionMessage) {
      setShowMessage(agent.sessionMessage);
    }

    // Collect previous agent outputs for context
    const previousOutputs: Record<string, string> = {};
    completed.forEach(completedId => {
      const completedAgent = currentAgents.find(a => a.id === completedId);
      if (completedAgent && completedAgent.output) {
        previousOutputs[completedAgent.agent] = completedAgent.output;
      }
    });

    // Generate agent output using LLM
    const agentContext: AgentContext = {
      agentName: agent.agent,
      agentType: agent.agentType,
      agentDescription: agent.description,
      caseNumber: selectedQuery?.caseNumber,
      queryType: selectedQuery?.queryType,
      queryAmount: selectedQuery?.queryAmount,
      medicalAid: selectedQuery?.medicalAid,
      hospital: selectedQuery?.hospital,
      caseData: caseData || undefined,
      previousAgentOutputs: previousOutputs,
      workflowStep: index + 1,
      totalSteps: currentAgents.length
    };

    // Generate output using LLM (async) - start immediately
    let generatedOutput = agent.output || '';
    const generateOutputPromise = generateAgentOutput(agentContext).catch(error => {
      console.error(`Error generating output for ${agent.agent}:`, error);
      return agent.output || `${agent.agent}: Agent completed successfully.`;
    });

    // Simulate processing time
    const processingTime = (agent.processingTime || 2) * 1000;

    // Wait for both LLM call and processing time
    Promise.all([
      generateOutputPromise,
      new Promise(resolve => setTimeout(resolve, processingTime))
    ]).then(([output]) => {
      generatedOutput = output as string;
      
      // Mark current agent as completed
      const updatedAgents = currentAgents.map((a, i) => {
        if (i === index) {
          return { ...a, status: 'completed' as const, output: generatedOutput };
        }
        // Start next agents if they're triggered by this one
        if (agent.nextSteps.includes(a.id)) {
          // Check if all triggers are met
          const allTriggersMet = !a.triggeredBy || a.triggeredBy.every(tid => {
            const triggerAgent = currentAgents.find(ta => ta.id === tid);
            return triggerAgent && (triggerAgent.id === agent.id || completed.has(triggerAgent.id));
          });
          if (allTriggersMet && a.status === 'pending') {
            return { ...a, status: 'running' as const };
          }
        }
        return a;
      });

      const newCompleted = new Set(completed);
      newCompleted.add(agent.id);
      setCompletedAgents(newCompleted);
      setAgents(updatedAgents);

      // Show completion message with output - clean format like IPAS
      if (generatedOutput) {
        setShowMessage(`${agent.agent}: ${generatedOutput}`);
      } else {
        setShowMessage(`${agent.agent}: Completed successfully`);
      }

      // Find next agents to process
      const nextAgents = updatedAgents.filter(a => 
        a.status === 'running' && 
        (!a.triggeredBy || a.triggeredBy.every(tid => newCompleted.has(tid)))
      );

      if (nextAgents.length > 0) {
        // Process parallel agents
        nextAgents.forEach(nextAgent => {
          const nextIndex = updatedAgents.findIndex(a => a.id === nextAgent.id);
          if (nextIndex >= 0) {
            setTimeout(() => {
              processNextAgent(updatedAgents, nextIndex, newCompleted);
            }, 500);
          }
        });
      } else {
        // Find next sequential agent
        const nextPending = updatedAgents.findIndex(a => 
          a.status === 'pending' && 
          (!a.triggeredBy || a.triggeredBy.every(tid => newCompleted.has(tid)))
        );
        
        if (nextPending >= 0) {
          setTimeout(() => {
            processNextAgent(updatedAgents, nextPending, newCompleted);
          }, 500);
        } else {
          // Check if all agents are done
          const allDone = updatedAgents.every(a => a.status === 'completed' || a.status === 'error');
          if (allDone) {
            setIsAnimating(false);
            setShowMessage('✓ All 12 agents completed successfully! Workflow resolved.');
          }
        }
      }

      saveSessionState(updatedAgents, index, generatedOutput || `✓ ${agent.agent}: Completed`, true, newCompleted);
    });
  };

  const resetWorkflow = () => {
    const initialAgents = getInitialAgents();
    setAgents(initialAgents);
    setCurrentAgentIndex(0);
    setCurrentStepNumber(0);
    setShowMessage('');
    setIsAnimating(false);
    setCompletedAgents(new Set());
    setAgentOutputDialogOpen(false);
    setCurrentCompletedAgent(null);
    const sessionKey = `netcare_orchestration_${selectedQuery?.id || 'default'}`;
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(`agent_outputs_${selectedQuery?.id || 'default'}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'running': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />;
      case 'running':
        return <PlayArrowIcon sx={{ color: '#ff9800', fontSize: 20 }} />;
      case 'error':
        return <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />;
      default:
        return <ScheduleIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />;
    }
  };

  const renderConnector = (fromAgent: AgentStep, toAgent: AgentStep) => {
    // Calculate proper connection points (center of boxes)
    const fromX = fromAgent.position.x + 100; // Center of 200px wide box
    const fromY = fromAgent.position.y + 60; // Bottom of box (approx)
    const toX = toAgent.position.x + 100; // Center of target box
    const toY = toAgent.position.y + 10; // Top of target box

    const isActive = fromAgent.status === 'completed' && (toAgent.status === 'running' || toAgent.status === 'pending');
    const isCompleted = fromAgent.status === 'completed' && toAgent.status === 'completed';

    // Use curved path for better visual flow
    const midY = (fromY + toY) / 2;
    const controlX = (fromX + toX) / 2;
    const pathData = `M ${fromX} ${fromY} Q ${controlX} ${midY} ${toX} ${toY}`;

    const arrowId = isCompleted ? 'arrowhead' : isActive ? 'arrowhead-blue' : 'arrowhead-gray';
    const strokeColor = isCompleted ? '#4caf50' : isActive ? '#1976d2' : '#9e9e9e';

    return (
      <g key={`connector-${fromAgent.id}-${toAgent.id}`}>
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isActive || isCompleted ? 3 : 2}
          strokeDasharray={isActive || isCompleted ? '0' : '5,5'}
          markerEnd={`url(#${arrowId})`}
          style={{
            transition: 'all 0.3s ease'
          }}
        />
      </g>
    );
  };

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const progress = agents.length > 0 ? (completedCount / agents.length) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ color: '#1a237e', fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.5px' }}>
            Agentic Workflow Orchestration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', fontWeight: 400 }}>
            {queryType} Resolution - 12 AI Agents Working in Harmony
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            label={isAnimating ? "In Progress" : "Ready"}
            color={isAnimating ? "warning" : "success"}
            size="small"
          />
          <Chip
            label={`${completedCount}/${agents.length} Agents Complete`}
            color="info"
            size="small"
          />
          {!isAnimating && completedCount === 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={startWorkflow}
            >
              Start Workflow
            </Button>
          )}
          {(isAnimating || completedCount > 0) && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={resetWorkflow}
            >
              Reset
            </Button>
          )}
        </Box>
      </Box>

      {/* Step Indicator - Like IPAS */}
      {isAnimating && (
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflowX: 'auto', pb: 1 }}>
            {agents.map((agent, idx) => (
              <Box
                key={agent.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: 150,
                  position: 'relative',
                  '&::after': idx < agents.length - 1 ? {
                    content: '""',
                    position: 'absolute',
                    right: -75,
                    top: 20,
                    width: 150,
                    height: 2,
                    backgroundColor: idx < currentStepNumber - 1 ? '#4caf50' : '#e0e0e0',
                    zIndex: 0
                  } : {}
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: idx < currentStepNumber - 1 ? '#4caf50' : idx === currentStepNumber - 1 ? '#1976d2' : '#e0e0e0',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    zIndex: 1,
                    position: 'relative'
                  }}
                >
                  {idx < currentStepNumber - 1 ? <CheckCircleIcon /> : idx + 1}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    textAlign: 'center',
                    fontWeight: idx === currentStepNumber - 1 ? 'bold' : 'normal',
                    color: idx === currentStepNumber - 1 ? '#1976d2' : 'text.secondary',
                    fontSize: '0.7rem'
                  }}
                >
                  Step {idx + 1}: {agent.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Progress Bar */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(progress)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>

      {/* Session Message Display - Clean and Aligned like IPAS */}
      {showMessage && (
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            p: 3,
            backgroundColor: showMessage.includes('✓') || showMessage.includes('completed') ? '#e8f5e9' : '#e3f2fd',
            border: `2px solid ${showMessage.includes('✓') || showMessage.includes('completed') ? '#4caf50' : '#1976d2'}`,
            borderRadius: 2,
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: showMessage.includes('✓') || showMessage.includes('completed') ? '#4caf50' : '#1976d2'
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                minWidth: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: showMessage.includes('✓') || showMessage.includes('completed') ? '#4caf50' : '#1976d2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {showMessage.includes('✓') || showMessage.includes('completed') ? (
                <CheckCircleIcon sx={{ color: 'white', fontSize: 24 }} />
              ) : (
                <PsychologyIcon sx={{ color: 'white', fontSize: 24 }} />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  color: showMessage.includes('✓') || showMessage.includes('completed') ? '#1b5e20' : '#0d47a1',
                  fontWeight: 600,
                  mb: 0.5,
                  fontSize: '1.05rem',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                }}
              >
                {showMessage.includes('✓') ? 'Agent Completed' : 'Agent Processing'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#212121',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 400
                }}
              >
                {showMessage}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Agent Flow Visualization */}
      <Box
        ref={containerRef}
        sx={{
          height: 700,
          width: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          position: 'relative',
          overflow: 'auto',
          backgroundColor: '#fafafa'
        }}
      >
        <svg width="100%" height="680" style={{ position: 'absolute', top: 0, left: 0, minWidth: '1800px' }}>
          <defs>
            <marker
              id="arrowhead"
              markerWidth="12"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 12 5 L 0 10 z" fill="#4caf50" />
            </marker>
            <marker
              id="arrowhead-blue"
              markerWidth="12"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 12 5 L 0 10 z" fill="#1976d2" />
            </marker>
            <marker
              id="arrowhead-gray"
              markerWidth="12"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M 0 0 L 12 5 L 0 10 z" fill="#9e9e9e" />
            </marker>
            <style>
              {`
                @keyframes pulse {
                  0% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.02); opacity: 0.95; }
                  100% { transform: scale(1); opacity: 1; }
                }
              `}
            </style>
          </defs>

          {/* Render connectors - from nextSteps */}
          {agents.map(agent =>
            agent.nextSteps.map(nextStepId => {
              const nextAgent = agents.find(a => a.id === nextStepId);
              if (!nextAgent) return null;
              return renderConnector(agent, nextAgent);
            })
          )}
          {/* Render connectors - from triggeredBy (for parallel flows) */}
          {agents.map(agent => {
            if (agent.triggeredBy && agent.triggeredBy.length > 0) {
              return agent.triggeredBy.map(triggerId => {
                const triggerAgent = agents.find(a => a.id === triggerId);
                if (!triggerAgent) return null;
                // Only render if not already rendered via nextSteps
                const alreadyRendered = triggerAgent.nextSteps.includes(agent.id);
                if (!alreadyRendered) {
                  return renderConnector(triggerAgent, agent);
                }
                return null;
              });
            }
            return null;
          })}
        </svg>

        {/* Render agent boxes */}
        {agents.map((agent, index) => (
          <Paper
            key={agent.id}
            sx={{
              position: 'absolute',
              left: agent.position.x,
              top: agent.position.y,
              width: 200,
              p: 2,
              cursor: 'pointer',
              border: `2px solid ${getStatusColor(agent.status)}`,
              borderRadius: 3,
              backgroundColor: agent.status === 'running' ? '#fff8e1' : agent.status === 'completed' ? '#f1f8e9' : '#ffffff',
              boxShadow: agent.status === 'running' ? '0 4px 12px rgba(255, 152, 0, 0.3)' : agent.status === 'completed' ? '0 4px 12px rgba(76, 175, 80, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 8,
                transform: 'scale(1.05)',
                zIndex: 10
              },
              animation: agent.status === 'running' ? 'pulse 1s ease-in-out infinite' : 'none'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PsychologyIcon sx={{ mr: 1, color: getStatusColor(agent.status), fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1, fontSize: '0.9rem', color: '#1a237e', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                {index + 1}. {agent.name}
              </Typography>
              {getStatusIcon(agent.status)}
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontSize: '0.75rem', fontWeight: 500, color: '#424242' }}>
              {agent.agent}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.7rem', mb: 1, lineHeight: 1.4, color: '#616161' }}>
              {agent.description.substring(0, 70)}...
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                label={agent.status.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(agent.status),
                  color: 'white',
                  fontSize: '0.65rem',
                  height: 20
                }}
              />
              {agent.processingTime && agent.processingTime > 0 && (
                <Chip
                  label={`${agent.processingTime}s`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 20 }}
                />
              )}
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Agent Summary Stats */}
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                {agents.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Agents
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                {agents.filter(a => a.status === 'running').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Running
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: '#9e9e9e', fontWeight: 'bold' }}>
                {agents.filter(a => a.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Agent Output Dialog - Like IPAS */}
      <Dialog
        open={agentOutputDialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 6
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PsychologyIcon sx={{ color: '#1a237e', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#1a237e', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
              {currentCompletedAgent ? `Step ${currentStepNumber}: ${currentCompletedAgent.name}` : 'Agent Output'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {currentCompletedAgent && (
            <Box>
              {/* Agent Information */}
              <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BarChartIcon sx={{ color: '#1a237e', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#1a237e', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                    Agent Information
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#616161' }}>
                      Agent Name
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1a237e', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {currentCompletedAgent.agent}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#616161' }}>
                      Step Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1a237e', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {currentStepNumber}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#616161' }}>
                      Step Title
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1rem', color: '#1a237e', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {currentCompletedAgent.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#616161' }}>
                      Agent Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '0.95rem', color: '#424242', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {currentCompletedAgent.agentType}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontSize: '0.85rem', fontWeight: 500, color: '#616161' }}>
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#616161', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                      {currentCompletedAgent.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Output Data */}
              <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DescriptionIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2e7d32', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                    Output Data
                  </Typography>
                </Box>
                <Paper
                  sx={{
                    p: 2.5,
                    backgroundColor: '#fafafa',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.8,
                      color: '#212121',
                      fontSize: '0.95rem',
                      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                      fontWeight: 400
                    }}
                  >
                    {currentCompletedAgent.output || 'No output generated.'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={handleDialogClose} variant="contained" color="primary" fullWidth>
            Continue to Next Step
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowOrchestration;
