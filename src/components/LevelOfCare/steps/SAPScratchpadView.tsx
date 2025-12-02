import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useQuery } from '../../../contexts/QueryContext';

interface SAPScratchpadViewProps {
  stepIndex: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

const SAPScratchpadView: React.FC<SAPScratchpadViewProps> = ({ stepIndex, onComplete }) => {
  const { selectedQuery, setCaseData } = useQuery();
  const [caseNumber, setCaseNumber] = useState(selectedQuery?.caseNumber || '123456789');
  const [caseData, setLocalCaseData] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (selectedQuery && !dataLoaded) {
      // Simulate loading case data
      setTimeout(() => {
        const mockCaseData = {
          caseNumber: selectedQuery.caseNumber,
          patientName: 'John',
          patientSurname: 'Doe',
          dateOfBirth: '1990-05-15',
          memberNumber: 'MEM123456',
          admissionDate: '2025-01-14',
          dischargeDate: '2025-01-29',
          outstandingBalance: 99148.50,
          shortPaymentReason: 'Level of Care days not approved - Authorization mismatch',
          levelOfCareBilled: 'Neonatal ICU',
          levelOfCareBilledCode: '58002'
        };
        setLocalCaseData(mockCaseData);
        setCaseData(mockCaseData);
        setDataLoaded(true);
        
        // Auto-complete after showing data
        setTimeout(() => {
          onComplete();
        }, 2000);
      }, 1000);
    }
  }, [selectedQuery, dataLoaded, setCaseData, onComplete]);

  if (stepIndex === 1) {
    // Step 2: Navigate to SAP Scratchpad
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Loading case information from SAP Scratchpad
        </Alert>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Case Number"
            value={caseNumber}
            onChange={(e) => setCaseNumber(e.target.value)}
            fullWidth
            sx={{ maxWidth: 400 }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={() => {
              const mockCaseData = {
                caseNumber: caseNumber,
                patientName: 'John',
                patientSurname: 'Doe',
                dateOfBirth: '1990-05-15',
                memberNumber: 'MEM123456',
                admissionDate: '2025-01-14',
                dischargeDate: '2025-01-29',
                outstandingBalance: 99148.50,
                shortPaymentReason: 'Level of Care days not approved - Authorization mismatch',
                levelOfCareBilled: 'Neonatal ICU',
                levelOfCareBilledCode: '58002'
              };
              setLocalCaseData(mockCaseData);
              setCaseData(mockCaseData);
              onComplete();
            }}
          >
            Search
          </Button>
        </Box>

        {caseData && (
          <Alert severity="success">
            <Typography variant="body2">
              Case {caseData.caseNumber} loaded successfully. Proceeding to review short payment reason...
            </Typography>
          </Alert>
        )}
      </Box>
    );
  }

  // Step 3: Review short payment reason
  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Extracting short payment reason
      </Alert>

      {caseData ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Outstanding Balance
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                R{caseData.outstandingBalance.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
              </Typography>
            </Alert>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Alert severity="error">
              <Typography variant="subtitle2" gutterBottom>
                Short Payment Reason
              </Typography>
              <Typography variant="body1">
                {caseData.shortPaymentReason}
              </Typography>
            </Alert>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={`Level of Care Billed: ${caseData.levelOfCareBilled} (${caseData.levelOfCareBilledCode})`}
                color="primary"
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Alert severity="warning">
          Please complete Step 2 first to load case data.
        </Alert>
      )}
    </Box>
  );
};

export default SAPScratchpadView;

