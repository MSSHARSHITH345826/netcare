import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Divider,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';

interface CaseDetailsProps {
  queryId: string;
  onStartWorkflow: () => void;
  onBack: () => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ queryId, onStartWorkflow, onBack }) => {
  const { queries, caseData } = useQuery();
  const query = queries.find(q => q.id === queryId);

  if (!query) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Query not found</Alert>
      </Box>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'escalated': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Case Details
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            Back
          </Button>
          <Button 
            variant="contained" 
            startIcon={<PlayArrowIcon />} 
            onClick={onStartWorkflow}
            size="large"
          >
            Start Workflow
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon /> Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {caseData ? (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Name:</strong> {caseData.patientName} {caseData.patientSurname}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Date of Birth:</strong> {caseData.dateOfBirth}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Member Number:</strong> {caseData.memberNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Admission:</strong> {caseData.admissionDate} to {caseData.dischargeDate}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Case data will be loaded when workflow starts
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon /> Query Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Case Number:</strong> {query.caseNumber}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Query Type:</strong> 
                <Chip 
                  label={query.queryType} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 1 }} 
                />
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Query Amount:</strong> 
                <Typography component="span" sx={{ color: '#d32f2f', fontWeight: 'bold', ml: 1 }}>
                  R{query.queryAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Medical Aid:</strong> {query.medicalAid}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Hospital:</strong> {query.hospital}
              </Typography>
              <Typography variant="body2">
                <strong>Status:</strong> 
                <Chip 
                  label={query.status.toUpperCase()} 
                  size="small" 
                  color={getStatusColor(query.status) as any}
                  sx={{ ml: 1 }} 
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HospitalIcon /> Query Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body1" paragraph>
            This query requires investigation and resolution through the Level of Care EQuery workflow.
            The system will guide you through all necessary steps including SAP investigation, 
            B2B authorization review, clinical data retrieval, and final query closure.
          </Typography>
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Next Steps:
            </Typography>
            <Typography variant="body2" component="div">
              • Review billing triage information<br />
              • Investigate short payment reason in SAP<br />
              • Review B2B authorization communication<br />
              • Retrieve and submit clinical data<br />
              • Close query in DebtPack
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseDetails;

