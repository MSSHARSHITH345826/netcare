import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useQuery } from '../../../contexts/QueryContext';

interface SAPAuthScreenViewProps {
  stepIndex: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

const SAPAuthScreenView: React.FC<SAPAuthScreenViewProps> = ({ stepIndex, onComplete }) => {
  const { caseData, b2bCommunications, setB2BCommunications } = useQuery();
  const [showResponse, setShowResponse] = useState(false);
  const [authFound, setAuthFound] = useState(false);
  const [authAttached, setAuthAttached] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    // Initialize B2B communications based on step
    if (stepIndex === 4 && b2bCommunications.length === 0) {
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

    // Auto-advance logic
    if (stepIndex === 5 || stepIndex === 6) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }

    if (stepIndex === 8) {
      // Simulate receiving funder response
      setTimeout(() => {
        setShowResponse(true);
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
        setTimeout(() => {
          onComplete();
        }, 3000);
      }, 2000);
    }
  }, [stepIndex, b2bCommunications, setB2BCommunications, onComplete]);

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'incoming':
        return '#4caf50';
      case 'outgoing':
        return '#f44336';
      case 'discrepancy':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  if (stepIndex === 4) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Reviewing B2B communication log
        </Alert>

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
                secondary={comm.message}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  }

  if (stepIndex === 5) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Identifying discrepancy
        </Alert>

        <Alert severity="warning">
          <Typography variant="subtitle2" gutterBottom>
            Discrepancy Identified
          </Typography>
          <Typography variant="body1">
            <strong>Reason:</strong> Only 1 day of Level of Care approved, but 15 days were billed.
            This indicates a potential authorization mismatch or registration delay (neonatal case).
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (stepIndex === 6) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Extracting approved Level of Care dates
        </Alert>

        <Alert severity="success">
          <Typography variant="subtitle2" gutterBottom>
            Approved Level of Care Dates
          </Typography>
          <Typography variant="body2"><strong>Auth Number:</strong> AUTH-12345</Typography>
          <Typography variant="body2"><strong>Approved Days:</strong> 1 day</Typography>
          <Typography variant="body2"><strong>Approved Date:</strong> 2025-01-14</Typography>
          <Typography variant="body2"><strong>Level of Care:</strong> Neonatal ICU (58002)</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Discrepancy:</strong> Only 1 day approved, but 15 days were billed. Need to request confirmation update.
          </Alert>
        </Alert>
      </Box>
    );
  }

  if (stepIndex === 8) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Monitoring for funder response
        </Alert>

        {showResponse ? (
          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>
              Funder Response Received
            </Typography>
            <Typography variant="body1">
              The medical aid has responded. They approved only 3 days out of 15 requested.
              This requires escalation with additional clinical data.
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => setShowResponse(true)}
            >
              Refresh (Wait for Response)
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  return null;
};

export default SAPAuthScreenView;

