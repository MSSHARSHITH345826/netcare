import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../contexts/QueryContext';
import { ArrowForward as ArrowForwardIcon, CheckCircle as CheckCircleIcon, Cancel as CancelIcon, Warning as WarningIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const SAPAuthScreen: React.FC = () => {
  const navigate = useNavigate();
  const { caseData, b2bCommunications, setB2BCommunications } = useQuery();
  const [showAttachAuth, setShowAttachAuth] = useState(false);
  const [authAttached, setAuthAttached] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [funderResponse, setFunderResponse] = useState(false);

  useEffect(() => {
    if (!caseData) {
      navigate('/sap-scratchpad');
    }
    // Initialize B2B communications
    if (b2bCommunications.length === 0) {
      setB2BCommunications([
        {
          id: '1',
          type: 'outgoing',
          timestamp: '2025-01-14T08:00:00Z',
          message: 'Authorization request sent',
          status: 'pending'
        }
      ]);
    }
  }, [caseData, navigate, b2bCommunications.length, setB2BCommunications]);

  const handleSearchAuth = () => {
    setShowAttachAuth(true);
    // Simulate finding authorization
    setB2BCommunications([
      ...b2bCommunications,
      {
        id: '2',
        type: 'incoming',
        timestamp: '2025-01-15T10:30:00Z',
        message: 'Authorization received from medical aid',
        authNumber: 'AUTH-12345',
        approvedDays: 1,
        approvedDates: ['2025-01-14'],
        levelOfCare: 'Neonatal ICU',
        status: 'approved'
      }
    ]);
  };

  const handleAttachAuth = () => {
    setAuthAttached(true);
    // Verify patient details match
    if (caseData) {
      // In real system, this would verify patient details
      alert('Authorization attached successfully. Patient details verified.');
    }
  };

  const handleSendConfirmation = () => {
    setConfirmationSent(true);
    // Simulate sending confirmation request
    setB2BCommunications([
      ...b2bCommunications,
      {
        id: '3',
        type: 'outgoing',
        timestamp: new Date().toISOString(),
        message: 'Confirmation update request sent - Requesting LOS and Level of Care update',
        status: 'pending'
      }
    ]);
  };

  const handleRefresh = () => {
    // Simulate receiving response after a few seconds
    setTimeout(() => {
      setFunderResponse(true);
      setB2BCommunications([
        ...b2bCommunications,
        {
          id: '4',
          type: 'incoming',
          timestamp: new Date().toISOString(),
          message: 'Funder response received - Approved 3 days of Level of Care',
          approvedDays: 3,
          approvedDates: ['2025-01-14', '2025-01-15', '2025-01-16'],
          status: 'approved',
          discrepancyReason: 'Partial approval - Only 3 days approved out of 15 requested'
        }
      ]);
    }, 2000);
  };

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return '#4caf50'; // Green
      case 'outgoing':
        return '#f44336'; // Red
      case 'discrepancy':
        return '#ff9800'; // Orange
      default:
        return '#757575';
    }
  };

  if (!caseData) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        SAP Authorization Screen (B2B Communication)
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review B2B communication with medical aid and manage authorization
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Case Information
              </Typography>
              <Typography variant="body2"><strong>Case Number:</strong> {caseData.caseNumber}</Typography>
              <Typography variant="body2"><strong>Patient:</strong> {caseData.patientName} {caseData.patientSurname}</Typography>
              <Typography variant="body2"><strong>Member Number:</strong> {caseData.memberNumber}</Typography>
              <Typography variant="body2"><strong>Admission Date:</strong> {caseData.admissionDate}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Authorization Status
              </Typography>
              {!authAttached ? (
                <Alert severity="warning">
                  No authorization attached. Search for electronic authorization.
                </Alert>
              ) : (
                <Alert severity="success">
                  Authorization attached and verified.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              B2B Communication Log
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!showAttachAuth && (
                <Button
                  variant="outlined"
                  onClick={handleSearchAuth}
                >
                  Search Electronic Auth
                </Button>
              )}
              {authAttached && !confirmationSent && (
                <Button
                  variant="contained"
                  onClick={handleSendConfirmation}
                >
                  Send Confirmation Update
                </Button>
              )}
              {confirmationSent && !funderResponse && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                >
                  Refresh (Wait for Response)
                </Button>
              )}
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {b2bCommunications.map((comm) => (
              <ListItem
                key={comm.id}
                sx={{
                  borderLeft: `4px solid ${getCommunicationColor(comm.type)}`,
                  mb: 1,
                  backgroundColor: '#f9f9f9',
                  borderRadius: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={comm.type === 'incoming' ? 'INCOMING' : 'OUTGOING'}
                        size="small"
                        sx={{
                          backgroundColor: getCommunicationColor(comm.type),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(comm.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body1">{comm.message}</Typography>
                      {comm.authNumber && (
                        <Typography variant="body2"><strong>Auth Number:</strong> {comm.authNumber}</Typography>
                      )}
                      {comm.approvedDays && (
                        <Typography variant="body2"><strong>Approved Days:</strong> {comm.approvedDays}</Typography>
                      )}
                      {comm.approvedDates && (
                        <Typography variant="body2"><strong>Approved Dates:</strong> {comm.approvedDates.join(', ')}</Typography>
                      )}
                      {comm.levelOfCare && (
                        <Typography variant="body2"><strong>Level of Care:</strong> {comm.levelOfCare}</Typography>
                      )}
                      {comm.discrepancyReason && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          {comm.discrepancyReason}
                        </Alert>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {showAttachAuth && !authAttached && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Alert severity="info" sx={{ mb: 2 }}>
              Electronic authorization found. Verify patient details match before attaching.
            </Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Authorization Details</Typography>
                <Typography variant="body2"><strong>Auth Number:</strong> AUTH-12345</Typography>
                <Typography variant="body2"><strong>Patient Name:</strong> {caseData.patientName} {caseData.patientSurname}</Typography>
                <Typography variant="body2"><strong>Date of Birth:</strong> {caseData.dateOfBirth}</Typography>
                <Typography variant="body2"><strong>Member Number:</strong> {caseData.memberNumber}</Typography>
                <Typography variant="body2"><strong>Admission Date:</strong> {caseData.admissionDate}</Typography>
                <Typography variant="body2"><strong>Authorized Date:</strong> 2025-01-14</Typography>
                <Typography variant="body2"><strong>Approved Days:</strong> 1 day</Typography>
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <strong>Discrepancy:</strong> Only 1 day approved, but 15 days were billed. Need to request confirmation update.
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleAttachAuth}
                  >
                    Attach Authorization (Details Match)
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setShowAttachAuth(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {funderResponse && (
        <Card>
          <CardContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Partial Approval Received
              </Typography>
              <Typography variant="body2">
                The funder has approved only 3 days out of 15 requested. This requires escalation to the medical aid with additional clinical data.
              </Typography>
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/careon-clinical')}
              >
                View Clinical Data (CareOn)
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/debtpack')}
              >
                Update DebtPack Query
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SAPAuthScreen;

