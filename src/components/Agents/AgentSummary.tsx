import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  LinearProgress,
  Alert
} from '@mui/material';
import { keyframes } from '@emotion/react';
import {
  Psychology as PsychologyIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';

interface Agent {
  id: string;
  name: string;
  type: string;
  function: string;
  keyCapability: string;
  autonomy: string;
  humanIntervention: string;
  category: string;
  output?: string;
  processingTime?: number;
}

interface AgentSummaryProps {
  queryType: string;
}

const AgentSummary: React.FC<AgentSummaryProps> = ({ queryType }) => {
  const { selectedQuery, caseData } = useQuery();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [runningAgent, setRunningAgent] = useState<string | null>(null);
  const [agentOutputs, setAgentOutputs] = useState<Record<string, string>>({});
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepByStepOutputs, setStepByStepOutputs] = useState<Record<string, string>>({});

  // Load agent outputs from orchestration workflow
  useEffect(() => {
    const outputsKey = `agent_outputs_${selectedQuery?.id || 'default'}`;
    const savedOutputs = localStorage.getItem(outputsKey);
    if (savedOutputs) {
      try {
        const parsed = JSON.parse(savedOutputs);
        setAgentOutputs(parsed);
      } catch (e) {
        console.error('Error loading agent outputs:', e);
      }
    }
    
    // Also listen for storage events to update in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === outputsKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAgentOutputs(parsed);
        } catch (e) {
          console.error('Error loading agent outputs from storage event:', e);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for updates (since storage events don't fire in same window)
    const interval = setInterval(() => {
      const updated = localStorage.getItem(outputsKey);
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setAgentOutputs(parsed);
        } catch (e) {
          console.error('Error loading agent outputs:', e);
        }
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedQuery?.id]);

  // Agent outputs based on user story (12 consolidated agents)
  const agentOutputsData: Record<string, string> = {
    'QueryDetector': 'Query detected: Case GEMS-JHB-2024-092847, Amount: R 99,148.50, Type: Level of Care, Priority: High (> R 50,000). Triggering LevelOfCareResolver.',
    'LevelOfCareResolver': 'Workflow orchestration initialized. Triggering ShortPaymentAnalyzer, BilledDataExtractor, and B2BCommunicationMonitor in parallel.',
    'ShortPaymentAnalyzer': 'Short payment reason: Level of Care days 29/07/2024 to 12/08/2024 not approved. Declined: R 99,148.50 (15 days @ R 6,609.90/day). Reason Code: LOC-DEC-001. Primary cost driver identified. Providing data to DiscrepancyAnalyzer.',
    'BilledDataExtractor': 'Billed Level of Care: Code 58201 (High Care), Period: 14/07/2024 to 23/08/2024, Total Days: 41. Changes: Days 1-5 (ICU 58002), Days 6-41 (High Care 58201). Providing data to DiscrepancyAnalyzer.',
    'B2BCommunicationMonitor': 'B2B Communication retrieved: 5 messages found. Latest: Clinical data submission (29/08/2024) pending response. Communication history includes authorization requests and responses. Providing data to DiscrepancyAnalyzer and ResponseHandler.',
    'DiscrepancyAnalyzer': 'Discrepancy identified: Level of Care days 13/08/2024 to 23/08/2024 (11 days) not approved. Cost impact: R 72,708.90. Root cause: Clinical justification required for extended High Care beyond 30 days. Triggering ApprovedDatesRetriever and ClinicalDataAgent.',
    'ApprovedDatesRetriever': 'Approved dates retrieved: Period 1 (14/07-28/07): 15 days approved, Period 2 (29/07-12/08): 15 days approved, Period 3 (13/08-23/08): 11 days declined. Total: 30 approved, 11 declined. Providing data to DiscrepancyAnalyzer.',
    'ClinicalDataAgent': 'Clinical data extracted: 11 days of CareOn notes retrieved for period 13/08 to 23/08. Notes formatted and ready for Case Manager review. Data includes patient progress, medication management, and High Care justification. After Case Manager approval, submitting via B2B.',
    'ResponseHandler': 'Response detected: Full approval received for 11 days (13/08 to 23/08). All 41 days now approved. Approval percentage: 100%. No escalation needed. Routing to QueryClosureAgent.',
    'QueryClosureAgent': 'Query closed: Outcome "Resubmit Approved" selected. Note generated: "Full approval received for all 41 days after clinical data submission. Ready for resubmission." Status updated. Handing off to ResubmissionAgent.',
    'ResubmissionAgent': 'Claim resubmitted: Case GEMS-JHB-2024-092847 resubmitted for R 99,148.50. All approvals verified. Debtors Controller notified. Query marked as fully resolved.',
    'ManagementReportingAgent': 'Management & Reporting: Query status tracked (Open → Investigation → Clinical Data Submitted → Response Received → Resolved). Audit trail created with 12 agent actions logged. Dashboard updated: Query resolved in 2.3 days (75% faster than average). Revenue recovered: R 99,148.50. No follow-ups required. No exceptions detected.'
  };

  // Level of Care Agents with outputs
  const levelOfCareAgents: Agent[] = [
    {
      id: '1',
      name: 'QueryDetector',
      type: 'Monitoring & Detection Agent',
      function: 'Continuously monitors Billing Triage Workbook for new Level of Care queries',
      keyCapability: 'Real-time detection, automatic classification, priority assignment, filtering',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'None required',
      category: 'Monitoring',
      output: agentOutputsData['QueryDetector'],
      processingTime: 0.5
    },
    {
      id: '2',
      name: 'LevelOfCareResolver',
      type: 'Workflow Orchestration Agent',
      function: 'Orchestrates the end-to-end Level of Care query resolution process',
      keyCapability: 'Coordinates all sub-agents, makes high-level workflow decisions',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Exception routing only',
      category: 'Orchestration',
      output: agentOutputsData['LevelOfCareResolver'],
      processingTime: 0.3
    },
    {
      id: '3',
      name: 'ShortPaymentAnalyzer',
      type: 'Data Analysis Agent',
      function: 'Analyzes short payment reasons and breaks down declined amounts',
      keyCapability: 'SAP integration, reason extraction, cost driver identification',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Unclear reasons only',
      category: 'Data',
      output: agentOutputsData['ShortPaymentAnalyzer'],
      processingTime: 1.2
    },
    {
      id: '4',
      name: 'BilledDataExtractor',
      type: 'Data Retrieval Agent',
      function: 'Extracts billed Level of Care information from SAP',
      keyCapability: 'SAP case overview integration, Level of Care code extraction',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Data incomplete only',
      category: 'Data',
      output: agentOutputsData['BilledDataExtractor'],
      processingTime: 0.8
    },
    {
      id: '5',
      name: 'B2BCommunicationMonitor',
      type: 'Integration & Monitoring Agent',
      function: 'Monitors and retrieves B2B communication history',
      keyCapability: 'Multi-scheme B2B integration, communication history retrieval',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'No communication found',
      category: 'Monitoring',
      output: agentOutputsData['B2BCommunicationMonitor'],
      processingTime: 1.5
    },
    {
      id: '6',
      name: 'DiscrepancyAnalyzer',
      type: 'Analysis & Intelligence Agent',
      function: 'Analyzes discrepancies between billed and approved Level of Care',
      keyCapability: 'Multi-source data comparison, discrepancy reason generation',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'None required',
      category: 'Data',
      output: agentOutputsData['DiscrepancyAnalyzer'],
      processingTime: 2.1
    },
    {
      id: '7',
      name: 'ApprovedDatesRetriever',
      type: 'Integration & Retrieval Agent',
      function: 'Retrieves detailed approved Level of Care dates from B2B systems',
      keyCapability: 'B2B system integration, date-specific approval extraction',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'System errors only',
      category: 'Data',
      output: agentOutputsData['ApprovedDatesRetriever'],
      processingTime: 1.0
    },
    {
      id: '8',
      name: 'ClinicalDataAgent',
      type: 'Integration & Data Management Agent',
      function: 'Manages clinical data extraction from CareOn and submission to medical aids',
      keyCapability: 'CareOn integration, date range filtering, clinical note formatting',
      autonomy: 'Semi-Autonomous',
      humanIntervention: 'Case Manager review required',
      category: 'Data',
      output: agentOutputsData['ClinicalDataAgent'],
      processingTime: 3.5
    },
    {
      id: '9',
      name: 'ResponseHandler',
      type: 'Analysis & Routing Agent',
      function: 'Monitors for and analyzes funder responses, handles escalations when needed',
      keyCapability: 'B2B response monitoring, automatic detection, approval analysis, escalation handling',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Denials only',
      category: 'Monitoring',
      output: agentOutputsData['ResponseHandler'],
      processingTime: 1.8
    },
    {
      id: '10',
      name: 'QueryClosureAgent',
      type: 'Workflow & Documentation Agent',
      function: 'Manages query closure in DebtPack with intelligent note generation',
      keyCapability: 'DebtPack integration, predefined outcome selection',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Note review optional',
      category: 'Action',
      output: agentOutputsData['QueryClosureAgent'],
      processingTime: 1.2
    },
    {
      id: '11',
      name: 'ResubmissionAgent',
      type: 'Action Execution Agent',
      function: 'Prepares and resubmits claims after query resolution',
      keyCapability: 'Claim preparation, resubmission tracking, success monitoring',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Resubmission failures only',
      category: 'Action',
      output: agentOutputsData['ResubmissionAgent'],
      processingTime: 1.5
    },
    {
      id: '12',
      name: 'ManagementReportingAgent',
      type: 'Management & Reporting Agent',
      function: 'Tracks query status, creates audit trails, aggregates dashboard metrics, manages follow-ups, and monitors exceptions',
      keyCapability: 'Query tracking, audit logging, dashboard aggregation, follow-up management, exception monitoring',
      autonomy: 'Fully Autonomous',
      humanIntervention: 'Exception handling only',
      category: 'Management',
      output: agentOutputsData['ManagementReportingAgent'],
      processingTime: 0.8
    }
  ];

  const agents = queryType === 'Level of Care' ? levelOfCareAgents : levelOfCareAgents;

  const categories = ['Monitoring', 'Orchestration', 'Data', 'Action', 'Management'];
  const agentsByCategory = categories.map(cat => ({
    category: cat,
    agents: agents.filter(a => a.category === cat)
  }));

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleRunAgent = async (agent: Agent) => {
    setRunningAgent(agent.id);
    setAgentOutputs(prev => ({ ...prev, [agent.name]: 'Running...' }));
    if (stepByStepMode) {
      setStepByStepOutputs(prev => ({ ...prev, [agent.name]: 'Running...' }));
    }

    // Simulate agent execution with LLM call
    const processingTime = (agent.processingTime || 2) * 1000;
    
    // Try to generate output using LLM
    let output = agent.output || 'Agent completed successfully';
    try {
      const { generateAgentOutput } = await import('../../services/azureOpenAIService');
      const agentContext = {
        agentName: agent.name,
        agentType: agent.type,
        agentDescription: agent.function,
        caseNumber: selectedQuery?.caseNumber,
        queryType: selectedQuery?.queryType,
        queryAmount: selectedQuery?.queryAmount,
        medicalAid: selectedQuery?.medicalAid,
        hospital: selectedQuery?.hospital,
        caseData: caseData || undefined,
        previousAgentOutputs: stepByStepOutputs,
        workflowStep: agents.findIndex(a => a.id === agent.id) + 1,
        totalSteps: agents.length
      };
      output = await generateAgentOutput(agentContext);
    } catch (error) {
      console.error('Error generating agent output:', error);
      output = agent.output || 'Agent completed successfully';
    }
    
    setTimeout(() => {
      setAgentOutputs(prev => ({ ...prev, [agent.name]: output }));
      if (stepByStepMode) {
        setStepByStepOutputs(prev => ({ ...prev, [agent.name]: output }));
      }
      
      // Save to localStorage
      const outputsKey = `agent_outputs_${selectedQuery?.id || 'default'}`;
      const updatedOutputs = { ...agentOutputs, [agent.name]: output };
      localStorage.setItem(outputsKey, JSON.stringify(updatedOutputs));
      
      setRunningAgent(null);
      
      // Auto-advance in step-by-step mode
      if (stepByStepMode) {
        const currentIndex = agents.findIndex(a => a.id === agent.id);
        if (currentIndex < agents.length - 1) {
          setTimeout(() => {
            setCurrentStepIndex(currentIndex + 1);
            handleRunAgent(agents[currentIndex + 1]);
          }, 1000);
        } else {
          setStepByStepMode(false);
          setCurrentStepIndex(0);
        }
      }
    }, processingTime);
  };

  const handleStartStepByStep = () => {
    setStepByStepMode(true);
    setCurrentStepIndex(0);
    setStepByStepOutputs({});
    if (agents.length > 0) {
      handleRunAgent(agents[0]);
    }
  };

  const handleStopStepByStep = () => {
    setStepByStepMode(false);
    setCurrentStepIndex(0);
    setRunningAgent(null);
  };

  const getAutonomyColor = (autonomy: string) => {
    if (autonomy.includes('Fully')) return '#4caf50';
    if (autonomy.includes('Semi')) return '#ff9800';
    return '#9e9e9e';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
        Agent Ecosystem Overview - {queryType}
      </Typography>
      
      {/* Step-by-Step Mode Controls */}
      <Box sx={{ mb: 3, p: 2, backgroundColor: stepByStepMode ? '#fff3cd' : '#f5f5f5', borderRadius: 2, border: stepByStepMode ? '2px solid #ff9800' : 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Key Statistics
          </Typography>
          {!stepByStepMode ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartStepByStep}
            >
              Start Step-by-Step Mode
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={`Step ${currentStepIndex + 1} of ${agents.length}`} color="warning" />
              <Button
                variant="outlined"
                color="error"
                onClick={handleStopStepByStep}
              >
                Stop
              </Button>
            </Box>
          )}
        </Box>
        {stepByStepMode && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Running agents sequentially. Current: {agents[currentStepIndex]?.name || 'N/A'}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Total Agents</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>12</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Fully Autonomous</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
              {agents.filter(a => a.autonomy.includes('Fully')).length}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Semi-Autonomous</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
              {agents.filter(a => a.autonomy.includes('Semi')).length}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="body2" color="text.secondary">Manual</Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9e9e9e' }}>
              {agents.filter(a => a.autonomy.includes('Manual')).length}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {agentsByCategory.map((categoryGroup, idx) => (
        <Accordion key={idx} defaultExpanded={idx === 0}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {categoryGroup.category} Agents ({categoryGroup.agents.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {categoryGroup.agents.map((agent) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={agent.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
                      transition: 'all 0.2s',
                      border: '1px solid #e0e0e0'
                    }}
                    onClick={() => handleAgentClick(agent)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', mb: 1 }}>
                        <PsychologyIcon sx={{ color: '#1976d2', mr: 1, mt: 0.5 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                            {agent.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {agent.type}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                        {agent.function}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Chip
                          label={agent.autonomy}
                          size="small"
                          sx={{
                            backgroundColor: getAutonomyColor(agent.autonomy),
                            color: 'white',
                            fontSize: '0.7rem'
                          }}
                        />
                        {agent.processingTime && agent.processingTime > 0 && (
                          <Chip
                            label={`${agent.processingTime}s`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      {(agentOutputs[agent.name] || agentOutputs[agent.id] || agent.output || stepByStepOutputs[agent.name]) && (
                        <Paper 
                          sx={{ 
                            p: 1.5, 
                            mt: 1, 
                            backgroundColor: stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? '#fff3cd' : '#e8f5e9', 
                            fontSize: '0.75rem', 
                            border: `2px solid ${stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? '#ff9800' : '#4caf50'}`,
                            ...(stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? {
                              animation: 'pulse 1.5s ease-in-out infinite'
                            } : {})
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#2e7d32' }}>
                            {stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? '🔄 Running...' : '✓ Output:'}
                          </Typography>
                          <Typography variant="caption" sx={{ whiteSpace: 'pre-wrap', display: 'block' }}>
                            {stepByStepOutputs[agent.name] || agentOutputs[agent.name] || agentOutputs[agent.id] || agent.output || ''}
                          </Typography>
                        </Paper>
                      )}
                      <Button
                        size="small"
                        variant={stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? "contained" : "outlined"}
                        color={stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? "warning" : "primary"}
                        startIcon={runningAgent === agent.id ? <ScheduleIcon /> : <PlayArrowIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!stepByStepMode) {
                            handleRunAgent(agent);
                          }
                        }}
                        disabled={runningAgent === agent.id || (stepByStepMode && currentStepIndex !== agents.findIndex(a => a.id === agent.id))}
                        sx={{ mt: 1, width: '100%' }}
                      >
                        {runningAgent === agent.id ? 'Running...' : stepByStepMode && currentStepIndex === agents.findIndex(a => a.id === agent.id) ? 'Current Step' : 'Run Agent'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon sx={{ color: '#1976d2' }} />
            <Typography variant="h6">{selectedAgent?.name}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {selectedAgent.type}
              </Typography>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                <strong>Function:</strong> {selectedAgent.function}
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Key Capability:</strong> {selectedAgent.keyCapability}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={selectedAgent.autonomy}
                  sx={{ backgroundColor: getAutonomyColor(selectedAgent.autonomy), color: 'white' }}
                />
                <Chip label={selectedAgent.category} variant="outlined" />
                {selectedAgent.processingTime && selectedAgent.processingTime > 0 && (
                  <Chip label={`${selectedAgent.processingTime}s processing`} variant="outlined" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Human Intervention:</strong> {selectedAgent.humanIntervention}
              </Typography>
              
              {selectedAgent.output && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CodeIcon /> Step-by-Step Output
                  </Typography>
                  <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {selectedAgent.output}
                    </Typography>
                  </Paper>
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon />}
                    onClick={() => {
                      setDialogOpen(false);
                      handleRunAgent(selectedAgent);
                    }}
                    disabled={runningAgent === selectedAgent.id}
                    sx={{ mt: 2 }}
                  >
                    {runningAgent === selectedAgent.id ? 'Running...' : 'Run This Agent'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AgentSummary;
