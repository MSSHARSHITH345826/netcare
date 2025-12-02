import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Chip
} from '@mui/material';
import { Save as SaveIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useQuery } from '../../../contexts/QueryContext';

interface DebtPackViewProps {
  stepIndex: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

const DebtPackView: React.FC<DebtPackViewProps> = ({ stepIndex, onComplete }) => {
  const { selectedQuery, caseData } = useQuery();
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [queryClosed, setQueryClosed] = useState(false);

  const predefinedOutcomes = [
    'Resubmit Approved',
    'Additional Information Sent',
    'Escalation Done - Follow Up Required',
    'Query Resolved',
    'Awaiting Funder Response'
  ];

  useEffect(() => {
    if (stepIndex === 9) {
      // Auto-load query
      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  }, [stepIndex, onComplete]);

  const handleSave = () => {
    if (!selectedOutcome) {
      alert('Please select a predefined outcome');
      return;
    }

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

    if (selectedOutcome === 'Query Resolved') {
      setQueryClosed(true);
    }

    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  if (stepIndex === 9) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Opening DebtPack query screen
        </Alert>

        {selectedQuery && caseData ? (
          <Alert severity="success">
            <Typography variant="body2">
              DebtPack query screen loaded for Case {caseData.caseNumber}.
              Query ID: QUERY-{caseData.caseNumber}
            </Typography>
          </Alert>
        ) : (
          <Alert severity="warning">
            Please complete previous steps first.
          </Alert>
        )}
      </Box>
    );
  }

  if (stepIndex === 10) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Select outcome and close query
        </Alert>

        {selectedQuery && caseData ? (
          <Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
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

            <TextField
              label="Notes"
              multiline
              rows={4}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes about the query resolution..."
              helperText="The system will suggest a note based on the selected outcome"
              sx={{ mb: 2 }}
            />

            {selectedOutcome && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Suggested note: {selectedOutcome === 'Additional Information Sent' 
                    ? 'Additional information sent for length of stay and level of care. Confirmation update sent.'
                    : selectedOutcome === 'Escalation Done - Follow Up Required'
                    ? 'Escalation mail sent to funder to approve level of care (LOS) and update authorization. Follow up in 7 days with medical aid.'
                    : 'Authorization approved. Ready for resubmission.'}
                </Typography>
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={queryClosed ? <CheckCircleIcon /> : <SaveIcon />}
                onClick={handleSave}
                disabled={!selectedOutcome}
              >
                {queryClosed ? 'Query Closed' : 'Save Query Status'}
              </Button>
            </Box>

            {queryClosed && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Query successfully closed. The case can now be resubmitted for payment.
                </Typography>
              </Alert>
            )}
          </Box>
        ) : (
          <Alert severity="warning">
            Please complete previous steps first.
          </Alert>
        )}
      </Box>
    );
  }

  return null;
};

export default DebtPackView;

