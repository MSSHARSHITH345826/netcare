import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { useQuery } from '../../../contexts/QueryContext';

interface SAPCaseOverviewViewProps {
  stepIndex: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

const SAPCaseOverviewView: React.FC<SAPCaseOverviewViewProps> = ({ onComplete }) => {
  const { caseData } = useQuery();
  const [billedServices] = React.useState([
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
    // Auto-complete after showing data
    setTimeout(() => {
      onComplete();
    }, 2000);
  }, [onComplete]);

  if (!caseData) {
    return (
      <Alert severity="warning">
        Please complete previous steps first to load case data.
      </Alert>
    );
  }

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Reviewing billed Level of Care services
      </Alert>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Alert severity="info">
            <Typography variant="subtitle2" gutterBottom>
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
          </Alert>
        </Grid>
      </Grid>

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
            {billedServices.slice(0, 5).map((service, index) => (
              <TableRow key={index}>
                <TableCell>{service.date}</TableCell>
                <TableCell>{service.levelOfCare}</TableCell>
                <TableCell>{service.code}</TableCell>
                <TableCell>{service.days}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography variant="body2" color="text.secondary">
                  ... and {billedServices.length - 5} more days
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SAPCaseOverviewView;

