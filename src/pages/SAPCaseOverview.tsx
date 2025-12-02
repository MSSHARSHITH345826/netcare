import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../contexts/QueryContext';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

const SAPCaseOverview: React.FC = () => {
  const navigate = useNavigate();
  const { caseData } = useQuery();
  const [billedServices, setBilledServices] = useState([
    { date: '2025-01-14', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-15', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-16', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-17', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-18', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-19', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-20', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-21', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-22', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-23', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-24', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-25', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-26', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-27', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 },
    { date: '2025-01-28', levelOfCare: 'Neonatal ICU', code: '58002', days: 1 }
  ]);

  useEffect(() => {
    if (!caseData) {
      navigate('/sap-scratchpad');
    }
  }, [caseData, navigate]);

  const handleNavigateToAuthScreen = () => {
    navigate('/sap-auth-screen');
  };

  if (!caseData) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        SAP Case Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review billed Level of Care services and identify discrepancies
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Case Summary
              </Typography>
              <Typography variant="body2"><strong>Case Number:</strong> {caseData.caseNumber}</Typography>
              <Typography variant="body2"><strong>Patient:</strong> {caseData.patientName} {caseData.patientSurname}</Typography>
              <Typography variant="body2"><strong>Admission:</strong> {caseData.admissionDate}</Typography>
              <Typography variant="body2"><strong>Discharge:</strong> {caseData.dischargeDate}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Billing Summary
              </Typography>
              <Typography variant="body2"><strong>Level of Care Billed:</strong> {caseData.levelOfCareBilled}</Typography>
              <Typography variant="body2"><strong>Code:</strong> {caseData.levelOfCareBilledCode}</Typography>
              <Typography variant="body2"><strong>Total Days Billed:</strong> {billedServices.length} days</Typography>
              <Chip
                label="Neonatal Case - Possible Registration Issue"
                color="warning"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Billed Level of Care Services
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a neonatal case. The baby may not have been registered at the time of billing, and the authorization may not have been released.
          </Alert>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Level of Care</strong></TableCell>
                  <TableCell><strong>Code</strong></TableCell>
                  <TableCell><strong>Days</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {billedServices.map((service, index) => (
                  <TableRow key={index}>
                    <TableCell>{service.date}</TableCell>
                    <TableCell>{service.levelOfCare}</TableCell>
                    <TableCell>{service.code}</TableCell>
                    <TableCell>{service.days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Next: Review B2B Authorization Communication
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNavigateToAuthScreen}
            >
              View Auth Screen
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SAPCaseOverview;

