import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Grid,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PlayArrow as PlayArrowIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const WorkflowOrchestration: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Billing Triage Workbook',
      description: 'Filter and identify Level of Care queries from the daily triage workbook',
      route: '/billing-triage',
      details: [
        'Load the billing triage workbook',
        'Filter queries by amount (e.g., R99,148.50)',
        'Identify Level of Care query type',
        'Select case number: 123456789'
      ]
    },
    {
      label: 'SAP Scratchpad',
      description: 'Navigate to SAP Scratchpad using case number and review short payment reason',
      route: '/sap-scratchpad',
      details: [
        'Enter case number in SAP Scratchpad',
        'Review outstanding balance: R99,148.50',
        'Identify short payment reason: Level of Care days not approved',
        'Note Level of Care billed: Neonatal ICU (58002)'
      ]
    },
    {
      label: 'SAP Case Overview',
      description: 'Review billed Level of Care services and identify discrepancies',
      route: '/sap-case-overview',
      details: [
        'Navigate to Case Overview screen',
        'Review billed Level of Care: 15 days of Neonatal ICU',
        'Identify potential issue: Neonatal case - baby may not have been registered',
        'Note authorization may not have been released'
      ]
    },
    {
      label: 'SAP Auth Screen (B2B)',
      description: 'Review B2B communication, attach authorization, and request confirmation',
      route: '/sap-auth-screen',
      details: [
        'Navigate to Authorization screen',
        'Review B2B communication log (red = outgoing, green = incoming)',
        'Search for electronic authorization',
        'Verify patient details and attach authorization',
        'Send confirmation update request for LOS and Level of Care',
        'Wait for funder response'
      ]
    },
    {
      label: 'CareOn Clinical Data',
      description: 'Review clinical notes for queried dates to support appeal',
      route: '/careon-clinical',
      details: [
        'Access CareOn system',
        'Filter clinical notes for queried date range (14/01/2025 - 29/01/2025)',
        'Review clinical notes supporting Level of Care',
        'Prepare clinical summary for appeal',
        'Send clinical data to medical aid'
      ]
    },
    {
      label: 'DebtPack Query Management',
      description: 'Update query status, select predefined outcome, and close query',
      route: '/debtpack',
      details: [
        'Navigate to DebtPack using case number',
        'Select predefined outcome (e.g., "Additional Information Sent" or "Escalation Done")',
        'Review auto-suggested notes',
        'Add follow-up date if required',
        'Save query status',
        'Close query when resolved'
      ]
    }
  ];

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
    navigate(steps[stepIndex].route);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Level of Care EQuery Resolution Workflow
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Interactive workflow orchestration for managing Level of Care billing queries from identification to resolution
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Workflow Steps
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      optional={
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      }
                    >
                      <Typography variant="h6">{step.label}</Typography>
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {step.description}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          Key Actions:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          {step.details.map((detail, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{detail}</Typography>
                            </li>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleStepClick(index)}
                          sx={{ mr: 1 }}
                        >
                          Go to {step.label}
                        </Button>
                        {index > 0 && (
                          <Button onClick={handleBack} sx={{ mr: 1 }}>
                            Back
                          </Button>
                        )}
                        {index < steps.length - 1 && (
                          <Button
                            variant="outlined"
                            onClick={handleNext}
                          >
                            Next Step
                          </Button>
                        )}
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Workflow Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This workflow demonstrates the end-to-end process of resolving a Level of Care billing query:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography variant="body2">Identify query in billing triage workbook</Typography>
                </li>
                <li>
                  <Typography variant="body2">Investigate in SAP systems</Typography>
                </li>
                <li>
                  <Typography variant="body2">Review B2B authorization communication</Typography>
                </li>
                <li>
                  <Typography variant="body2">Gather clinical data from CareOn</Typography>
                </li>
                <li>
                  <Typography variant="body2">Update and close query in DebtPack</Typography>
                </li>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sample Data
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                <strong>Case Number:</strong> 123456789<br />
                <strong>Query Amount:</strong> R99,148.50<br />
                <strong>Medical Aid:</strong> GEMS<br />
                <strong>Query Type:</strong> Level of Care<br />
                <strong>Level of Care Code:</strong> 58002 (Neonatal ICU)
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Features
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Agentic Capabilities:</strong> The system automates data extraction, discrepancy detection, and workflow orchestration to reduce manual effort and improve accuracy.
                </Typography>
              </Alert>
              <Box component="ul" sx={{ pl: 2 }}>
                <li>
                  <Typography variant="body2">Real-time B2B communication tracking</Typography>
                </li>
                <li>
                  <Typography variant="body2">Automatic discrepancy detection</Typography>
                </li>
                <li>
                  <Typography variant="body2">Clinical data integration</Typography>
                </li>
                <li>
                  <Typography variant="body2">Predefined outcome suggestions</Typography>
                </li>
                <li>
                  <Typography variant="body2">Complete audit trail</Typography>
                </li>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WorkflowOrchestration;

