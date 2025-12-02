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
  Divider,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../contexts/QueryContext';
import { ArrowForward as ArrowForwardIcon, Search as SearchIcon } from '@mui/icons-material';

const SAPScratchpad: React.FC = () => {
  const navigate = useNavigate();
  const { selectedQuery, setCaseData } = useQuery();
  const [caseNumber, setCaseNumber] = useState(selectedQuery?.caseNumber || '123456789');
  const [caseData, setLocalCaseData] = useState<any>(null);

  useEffect(() => {
    if (selectedQuery) {
      setCaseNumber(selectedQuery.caseNumber);
    }
  }, [selectedQuery]);

  const handleSearch = () => {
    // Simulate loading case data
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
  };

  const handleNavigateToCaseOverview = () => {
    navigate('/sap-case-overview');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        SAP Scratchpad
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Enter case number to view case details and short payment information
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
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
              onClick={handleSearch}
            >
              Search
            </Button>
          </Box>

          {caseData && (
            <>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Patient Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Name:</strong> {caseData.patientName} {caseData.patientSurname}</Typography>
                    <Typography variant="body2"><strong>Date of Birth:</strong> {caseData.dateOfBirth}</Typography>
                    <Typography variant="body2"><strong>Member Number:</strong> {caseData.memberNumber}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Admission Details
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2"><strong>Admission Date:</strong> {caseData.admissionDate}</Typography>
                    <Typography variant="body2"><strong>Discharge Date:</strong> {caseData.dischargeDate}</Typography>
                    <Typography variant="body2"><strong>Length of Stay:</strong> 15 days</Typography>
                  </Box>
                </Grid>
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
            </>
          )}
        </CardContent>
      </Card>

      {caseData && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Next Steps
              </Typography>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNavigateToCaseOverview}
              >
                View Case Overview
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SAPScratchpad;

