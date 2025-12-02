import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Psychology as PsychologyIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error' | 'awaiting_input';
  component: string;
  requiresHumanInput?: boolean;
  humanInputPrompt?: string;
  inputFields?: Array<{ label: string; type: string; required: boolean }>;
  nextSteps?: string[];
}

interface WorkflowOrchestrationProps {
  queryType: string;
  onComplete?: () => void;
  onStepComplete?: (stepId: string) => void;
}

const WorkflowOrchestration: React.FC<WorkflowOrchestrationProps> = ({ 
  queryType, 
  onComplete,
  onStepComplete 
}) => {
  const { selectedQuery } = useQuery();
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [stepDetailsOpen, setStepDetailsOpen] = useState(false);
  const [humanInputOpen, setHumanInputOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [sessionId] = useState(`session_${Date.now()}`);

  useEffect(() => {
    // Initialize workflow steps based on query type
    const workflowSteps: WorkflowStep[] = [
      {
        id: 'billing-triage',
        name: 'Billing Triage Workbook',
        description: 'Filter and identify queries from daily triage workbook',
        status: 'completed',
        component: 'BillingTriageView',
        nextSteps: ['sap-scratchpad']
      },
      {
        id: 'sap-scratchpad',
        name: 'SAP Scratchpad',
        description: 'Navigate to SAP and review case information',
        status: 'completed',
        component: 'SAPScratchpadView',
        nextSteps: ['short-payment']
      },
      {
        id: 'short-payment',
        name: 'Short Payment Analysis',
        description: 'Extract and analyze short payment reasons',
        status: 'completed',
        component: 'SAPScratchpadView',
        nextSteps: ['case-overview']
      },
      {
        id: 'case-overview',
        name: 'Case Overview Review',
        description: 'Review billed Level of Care services and verify accuracy',
        status: 'awaiting_input',
        component: 'SAPCaseOverviewView',
        requiresHumanInput: true,
        humanInputPrompt: 'Please review the billed Level of Care services. Do you confirm the billing is accurate?',
        inputFields: [
          { label: 'Billing Accuracy Confirmation', type: 'select', required: true },
          { label: 'Notes or Observations', type: 'textarea', required: false }
        ],
        nextSteps: ['b2b-communication']
      },
      {
        id: 'b2b-communication',
        name: 'B2B Communication Review',
        description: 'Review authorization communication log and search for electronic authorization',
        status: 'pending',
        component: 'SAPAuthScreenView',
        requiresHumanInput: true,
        humanInputPrompt: 'Please review B2B communications. Have you found the electronic authorization?',
        inputFields: [
          { label: 'Authorization Found', type: 'select', required: true },
          { label: 'Authorization Number', type: 'text', required: false },
          { label: 'Approved Days', type: 'number', required: false },
          { label: 'Comments', type: 'textarea', required: false }
        ],
        nextSteps: ['discrepancy']
      },
      {
        id: 'discrepancy',
        name: 'Discrepancy Identification',
        description: 'System identifies discrepancies automatically based on authorization data',
        status: 'pending',
        component: 'SAPAuthScreenView',
        nextSteps: ['approved-dates']
      },
      {
        id: 'approved-dates',
        name: 'Approved Dates Extraction',
        description: 'Extract approved Level of Care dates from B2B communication',
        status: 'pending',
        component: 'SAPAuthScreenView',
        nextSteps: ['clinical-data']
      },
      {
        id: 'clinical-data',
        name: 'CareOn Clinical Data',
        description: 'Retrieve clinical notes for appeal support and submit to medical aid',
        status: 'pending',
        component: 'CareOnClinicalView',
        requiresHumanInput: true,
        humanInputPrompt: 'Please confirm clinical data has been retrieved and is ready for submission.',
        inputFields: [
          { label: 'Clinical Data Status', type: 'select', required: true },
          { label: 'Case Manager Notes', type: 'textarea', required: false },
          { label: 'Ready for Submission', type: 'select', required: true }
        ],
        nextSteps: ['funder-response']
      },
      {
        id: 'funder-response',
        name: 'Funder Response Monitoring',
        description: 'Monitor and flag medical aid responses automatically',
        status: 'pending',
        component: 'SAPAuthScreenView',
        nextSteps: ['debtpack']
      },
      {
        id: 'debtpack',
        name: 'DebtPack Query Management',
        description: 'Navigate to DebtPack and open query for resolution',
        status: 'pending',
        component: 'DebtPackView',
        nextSteps: ['close-query']
      },
      {
        id: 'close-query',
        name: 'Close Query',
        description: 'Select outcome, add notes, and close the query',
        status: 'pending',
        component: 'DebtPackView',
        requiresHumanInput: true,
        humanInputPrompt: 'Please select the final outcome and provide closure notes.',
        inputFields: [
          { label: 'Query Outcome', type: 'select', required: true },
          { label: 'Closure Notes', type: 'textarea', required: true },
          { label: 'Follow-up Required', type: 'select', required: false }
        ],
        nextSteps: []
      }
    ];
    setSteps(workflowSteps);
    loadSessionState(workflowSteps);
  }, []);

  const loadSessionState = (initialSteps: WorkflowStep[]) => {
    const savedSession = localStorage.getItem(`workflow_session_${selectedQuery?.id || 'default'}`);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        const savedSteps = parsed.steps || [];
        if (savedSteps.length === initialSteps.length) {
          setSteps(savedSteps);
          setCurrentStep(parsed.currentStep || 0);
        }
      } catch (e) {
        console.error('Error loading session:', e);
      }
    }
  };

  const saveSessionState = (updatedSteps: WorkflowStep[], stepIndex: number) => {
    localStorage.setItem(
      `workflow_session_${selectedQuery?.id || 'default'}`,
      JSON.stringify({ steps: updatedSteps, currentStep: stepIndex })
    );
  };

  const handleStepClick = (step: WorkflowStep, index: number) => {
    setSelectedStep(step);
    if (step.requiresHumanInput && step.status === 'awaiting_input') {
      setHumanInputOpen(true);
    } else {
      setStepDetailsOpen(true);
    }
  };

  const handleHumanInputSubmit = () => {
    if (!selectedStep) return;

    // Validate required fields
    const requiredFields = selectedStep.inputFields?.filter(f => f.required) || [];
    const missingFields = requiredFields.filter(f => !inputValues[f.label]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    // Update step status
    const updatedSteps = steps.map(step => {
      if (step.id === selectedStep.id) {
        return { ...step, status: 'completed' as const };
      }
      // Auto-advance to next step
      if (step.id === selectedStep.nextSteps?.[0]) {
        if (step.requiresHumanInput) {
          return { ...step, status: 'awaiting_input' as const };
        } else {
          return { ...step, status: 'running' as const };
        }
      }
      return step;
    });

    setSteps(updatedSteps);
    const nextStepIndex = steps.findIndex(s => s.id === selectedStep.nextSteps?.[0]);
    if (nextStepIndex >= 0) {
      setCurrentStep(nextStepIndex);
      // If next step requires human input, open dialog
      const nextStep = updatedSteps[nextStepIndex];
      if (nextStep.requiresHumanInput && nextStep.status === 'awaiting_input') {
        setSelectedStep(nextStep);
        setHumanInputOpen(true);
      }
    }

    saveSessionState(updatedSteps, nextStepIndex >= 0 ? nextStepIndex : currentStep);
    setInputValues({});
    setHumanInputOpen(false);
    
    if (onStepComplete) {
      onStepComplete(selectedStep.id);
    }
  };

  const handleAutoAdvance = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    if (!step || step.requiresHumanInput) return;

    const updatedSteps = steps.map(s => {
      if (s.id === stepId) {
        return { ...s, status: 'completed' as const };
      }
      if (s.id === step.nextSteps?.[0]) {
        if (s.requiresHumanInput) {
          return { ...s, status: 'awaiting_input' as const };
        } else {
          return { ...s, status: 'running' as const };
        }
      }
      return s;
    });

    setSteps(updatedSteps);
    const nextStepIndex = steps.findIndex(s => s.id === step.nextSteps?.[0]);
    if (nextStepIndex >= 0) {
      setCurrentStep(nextStepIndex);
      const nextStep = updatedSteps[nextStepIndex];
      if (nextStep.requiresHumanInput && nextStep.status === 'awaiting_input') {
        setTimeout(() => {
          setSelectedStep(nextStep);
          setHumanInputOpen(true);
        }, 1000);
      }
    }
    saveSessionState(updatedSteps, nextStepIndex >= 0 ? nextStepIndex : currentStep);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'running':
        return <PlayArrowIcon sx={{ color: '#1976d2' }} />;
      case 'awaiting_input':
        return <PsychologyIcon sx={{ color: '#ff9800', animation: 'pulse 2s infinite' }} />;
      case 'pending':
        return <ScheduleIcon sx={{ color: '#9e9e9e' }} />;
      default:
        return <ScheduleIcon sx={{ color: '#9e9e9e' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'running': return '#1976d2';
      case 'awaiting_input': return '#ff9800';
      case 'pending': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progress = steps.length > 0 ? (completedCount / steps.length) * 100 : 0;
  const awaitingInputCount = steps.filter(s => s.status === 'awaiting_input').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Workflow Orchestration
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {queryType} Resolution Workflow - Agentic Process Execution
            </Typography>
          </Box>
          {awaitingInputCount > 0 && (
            <Alert severity="warning" sx={{ display: 'flex', alignItems: 'center' }}>
              <PsychologyIcon sx={{ mr: 1 }} />
              {awaitingInputCount} step{awaitingInputCount > 1 ? 's' : ''} awaiting your input
            </Alert>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Progress: {completedCount} / {steps.length} steps completed
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
        </Box>

        <Stepper activeStep={currentStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.slice(0, 6).map((step, index) => (
            <Step key={step.id} completed={step.status === 'completed'}>
              <StepLabel
                error={step.status === 'error'}
                icon={getStatusIcon(step.status)}
              >
                <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                  {step.name}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={2}>
        {steps.map((step, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={step.id}>
            <Card
              sx={{
                cursor: step.status === 'awaiting_input' ? 'pointer' : 'default',
                border: `3px solid ${getStatusColor(step.status)}`,
                backgroundColor: step.status === 'running' ? '#e3f2fd' : 
                                step.status === 'awaiting_input' ? '#fff3cd' : 'white',
                position: 'relative',
                '&:hover': {
                  boxShadow: 6,
                  transform: step.status === 'awaiting_input' ? 'translateY(-4px) scale(1.02)' : 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                },
                transition: 'all 0.3s ease',
                animation: step.status === 'awaiting_input' ? 'pulse 2s infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 152, 0, 0.7)' },
                  '50%': { boxShadow: '0 0 0 10px rgba(255, 152, 0, 0)' }
                }
              }}
              onClick={() => handleStepClick(step, index)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                    {index + 1}. {step.name}
                  </Typography>
                  {getStatusIcon(step.status)}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
                  {step.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {step.requiresHumanInput && (
                    <Chip 
                      label="Human in Loop" 
                      size="small" 
                      icon={<PsychologyIcon />}
                      sx={{ fontSize: '0.7rem', backgroundColor: '#ff9800', color: 'white' }}
                    />
                  )}
                  <Chip
                    label={step.status === 'awaiting_input' ? 'AWAITING INPUT' : step.status.toUpperCase()}
                    size="small"
                    sx={{
                      backgroundColor: getStatusColor(step.status),
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: step.status === 'awaiting_input' ? 'bold' : 'normal'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Human Input Dialog */}
      <Dialog 
        open={humanInputOpen} 
        onClose={() => setHumanInputOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 6
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#fff3cd', 
          borderBottom: '2px solid #ff9800',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon sx={{ color: '#ff9800' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Human Input Required
            </Typography>
          </Box>
          <IconButton onClick={() => setHumanInputOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {selectedStep?.name}
            </Typography>
            <Typography variant="body2">
              {selectedStep?.humanInputPrompt}
            </Typography>
          </Alert>

          {selectedStep?.inputFields?.map((field, idx) => (
            <Box key={idx} sx={{ mb: 2 }}>
              {field.type === 'select' ? (
                <TextField
                  fullWidth
                  select
                  label={field.label}
                  required={field.required}
                  value={inputValues[field.label] || ''}
                  onChange={(e) => setInputValues({ ...inputValues, [field.label]: e.target.value })}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Select...</option>
                  {field.label.includes('Confirmation') && (
                    <>
                      <option value="confirmed">Confirmed - Billing is Accurate</option>
                      <option value="needs_review">Needs Review - Discrepancies Found</option>
                      <option value="rejected">Rejected - Incorrect Billing</option>
                    </>
                  )}
                  {field.label.includes('Authorization') && (
                    <>
                      <option value="found">Found - Authorization Located</option>
                      <option value="not_found">Not Found - Authorization Missing</option>
                      <option value="partial">Partial - Some Authorization Found</option>
                    </>
                  )}
                  {field.label.includes('Status') && (
                    <>
                      <option value="retrieved">Retrieved - Data Available</option>
                      <option value="pending">Pending - Awaiting Data</option>
                      <option value="not_available">Not Available - Data Missing</option>
                    </>
                  )}
                  {field.label.includes('Outcome') && (
                    <>
                      <option value="resolved">Resolved - Query Closed</option>
                      <option value="resubmit">Resubmit - Ready for Resubmission</option>
                      <option value="escalated">Escalated - Requires Follow-up</option>
                      <option value="additional_info">Additional Information Sent</option>
                    </>
                  )}
                  {field.label.includes('Follow-up') && (
                    <>
                      <option value="yes">Yes - Follow-up Required</option>
                      <option value="no">No - No Follow-up Needed</option>
                    </>
                  )}
                  {field.label.includes('Ready') && (
                    <>
                      <option value="yes">Yes - Ready for Submission</option>
                      <option value="no">No - Not Ready</option>
                    </>
                  )}
                </TextField>
              ) : field.type === 'textarea' ? (
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={field.label}
                  required={field.required}
                  value={inputValues[field.label] || ''}
                  onChange={(e) => setInputValues({ ...inputValues, [field.label]: e.target.value })}
                  placeholder="Enter your notes or observations..."
                />
              ) : field.type === 'number' ? (
                <TextField
                  fullWidth
                  type="number"
                  label={field.label}
                  required={field.required}
                  value={inputValues[field.label] || ''}
                  onChange={(e) => setInputValues({ ...inputValues, [field.label]: e.target.value })}
                />
              ) : (
                <TextField
                  fullWidth
                  label={field.label}
                  required={field.required}
                  value={inputValues[field.label] || ''}
                  onChange={(e) => setInputValues({ ...inputValues, [field.label]: e.target.value })}
                />
              )}
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setHumanInputOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleHumanInputSubmit}
            startIcon={<SendIcon />}
            sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
          >
            Submit & Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Step Details Dialog */}
      <Dialog 
        open={stepDetailsOpen} 
        onClose={() => setStepDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedStep?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            {selectedStep?.description}
          </Typography>
          {selectedStep?.requiresHumanInput && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Human in Loop Required:</strong> This step requires user interaction and decision-making.
              </Typography>
            </Alert>
          )}
          {selectedStep?.status === 'awaiting_input' && (
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#ff9800' }}
              onClick={() => {
                setStepDetailsOpen(false);
                setHumanInputOpen(true);
              }}
            >
              Provide Input
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowOrchestration;
