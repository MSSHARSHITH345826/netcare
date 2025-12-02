import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../contexts/QueryContext';
import { Save as SaveIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const DebtPack: React.FC = () => {
  const navigate = useNavigate();
  const { selectedQuery, caseData, setDebtPackQuery } = useQuery();
  const [queryId, setQueryId] = useState('QUERY-123456789');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [queryClosed, setQueryClosed] = useState(false);

  const predefinedOutcomes = [
    'Resubmit Approved',
    'Additional Information Sent',
    'Escalation Done - Follow Up Required',
    'Query Resolved',
    'Awaiting Funder Response'
  ];

  useEffect(() => {
    if (selectedQuery) {
      setDebtPackQuery({
        caseNumber: selectedQuery.caseNumber,
        queryId: queryId,
        status: selectedQuery.status,
        predefinedOutcomes: predefinedOutcomes,
        selectedOutcome: selectedOutcome,
        notes: notes
      });
    }
  }, [selectedQuery, queryId, selectedOutcome, notes, setDebtPackQuery]);

  const handleSave = () => {
    if (!selectedOutcome) {
      alert('Please select a predefined outcome');
      return;
    }

    // Auto-suggest note based on outcome
    let suggestedNote = '';
    if (selectedOutcome === 'Additional Information Sent') {
      suggestedNote = 'Additional information sent for length of stay and level of care. Confirmation update sent.';
    } else if (selectedOutcome === 'Escalation Done - Follow Up Required') {
      suggestedNote = 'Escalation mail sent to funder to approve level of care (LOS) and update authorization. Follow up in 7 days with medical aid.';
    } else if (selectedOutcome === 'Resubmit Approved') {
      suggestedNote = 'Authorization approved. Ready for resubmission.';
    }

    if (suggestedNote && !notes) {
      setNotes(suggestedNote);
    }

    // Update query status
    if (selectedQuery) {
      setDebtPackQuery({
        caseNumber: selectedQuery.caseNumber,
        queryId: queryId,
        status: selectedOutcome === 'Query Resolved' ? 'resolved' : 'in_progress',
        predefinedOutcomes: predefinedOutcomes,
        selectedOutcome: selectedOutcome,
        notes: notes || suggestedNote,
        followUpDate: followUpDate || undefined
      });
    }

    if (selectedOutcome === 'Query Resolved') {
      setQueryClosed(true);
    }
  };

  if (!selectedQuery || !caseData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          No query selected. Please navigate from the Billing Triage Workbook.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        DebtPack Query Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage query status, select predefined outcomes, and add notes
      </Typography>

      {queryClosed && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Query Successfully Closed
          </Typography>
          <Typography variant="body2">
            The query has been resolved and closed. The case can now be resubmitted for payment.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Query Information
              </Typography>
              <Typography variant="body2"><strong>Query ID:</strong> {queryId}</Typography>
              <Typography variant="body2"><strong>Case Number:</strong> {caseData.caseNumber}</Typography>
              <Typography variant="body2"><strong>Query Type:</strong> {selectedQuery.queryType}</Typography>
              <Typography variant="body2"><strong>Query Amount:</strong> R{selectedQuery.queryAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</Typography>
              <Chip
                label={selectedQuery.status.toUpperCase()}
                color={selectedQuery.status === 'resolved' ? 'success' : 'warning'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Typography variant="body2"><strong>Patient:</strong> {caseData.patientName} {caseData.patientSurname}</Typography>
              <Typography variant="body2"><strong>Member Number:</strong> {caseData.memberNumber}</Typography>
              <Typography variant="body2"><strong>Medical Aid:</strong> {selectedQuery.medicalAid}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Query Resolution
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Predefined Outcome</InputLabel>
                <Select
                  value={selectedOutcome}
                  onChange={(e) => setSelectedOutcome(e.target.value)}
                  label="Predefined Outcome"
                >
                  {predefinedOutcomes.map((outcome) => (
                    <MenuItem key={outcome} value={outcome}>
                      {outcome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                multiline
                rows={4}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes about the query resolution..."
                helperText="The system will suggest a note based on the selected outcome"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Follow-up Date (Optional)"
                type="date"
                fullWidth
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {selectedOutcome === 'Escalation Done - Follow Up Required' && (
                <Alert severity="info">
                  Follow up in 7 days with medical aid. Query will remain open until resolved.
                </Alert>
              )}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={queryClosed ? <CheckCircleIcon /> : <SaveIcon />}
              onClick={handleSave}
              disabled={!selectedOutcome}
            >
              {queryClosed ? 'Query Closed' : 'Save Query Status'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DebtPack;

