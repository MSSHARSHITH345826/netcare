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
  Button,
  Alert,
  Chip,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../contexts/QueryContext';
import { ArrowForward as ArrowForwardIcon, Send as SendIcon } from '@mui/icons-material';

const CareOnClinicalData: React.FC = () => {
  const navigate = useNavigate();
  const { caseData, setCareOnNotes } = useQuery();
  const [notes, setNotes] = useState([
    {
      id: '1',
      date: '2025-01-14',
      time: '08:00',
      note: 'Patient admitted to Neonatal ICU. Respiratory support required. Neuro status stable.',
      author: 'Dr. Smith'
    },
    {
      id: '2',
      date: '2025-01-15',
      time: '14:30',
      note: 'Oral intake remains poor. Continued monitoring in ICU setting.',
      author: 'Dr. Smith'
    },
    {
      id: '3',
      date: '2025-01-16',
      time: '10:00',
      note: 'Neuro unchanged. Patient requires continued intensive care monitoring.',
      author: 'Dr. Jones'
    },
    {
      id: '4',
      date: '2025-01-17',
      time: '16:45',
      note: 'Transferred to rehab. Patient showing improvement but still requires specialized care.',
      author: 'Dr. Jones'
    }
  ]);

  useEffect(() => {
    if (caseData) {
      setCareOnNotes(notes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData]);

  const handleSendToFunder = () => {
    // In real system, this would send clinical data to funder
    alert('Clinical data has been sent to the medical aid for review. The funder will review and respond.');
    navigate('/sap-auth-screen');
  };

  if (!caseData) {
    return null;
  }

  const queriedDateRange = {
    start: '2025-01-14',
    end: '2025-01-29'
  };

  const relevantNotes = notes.filter(note => 
    note.date >= queriedDateRange.start && note.date <= queriedDateRange.end
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        CareOn Clinical Data
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review clinical notes for the queried date range to support Level of Care appeal
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
              <Typography variant="body2"><strong>Admission:</strong> {caseData.admissionDate}</Typography>
              <Typography variant="body2"><strong>Discharge:</strong> {caseData.dischargeDate}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Query Date Range
              </Typography>
              <Typography variant="body2"><strong>Start Date:</strong> {queriedDateRange.start}</Typography>
              <Typography variant="body2"><strong>End Date:</strong> {queriedDateRange.end}</Typography>
              <Chip
                label={`${relevantNotes.length} Clinical Notes Found`}
                color="primary"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Clinical Notes for Queried Period
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            These clinical notes correspond to the dates being queried and can be used to support the Level of Care appeal.
          </Alert>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Time</strong></TableCell>
                  <TableCell><strong>Clinical Note</strong></TableCell>
                  <TableCell><strong>Author</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {relevantNotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No clinical notes found for the queried date range
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  relevantNotes.map((note) => (
                    <TableRow key={note.id} hover>
                      <TableCell>{note.date}</TableCell>
                      <TableCell>{note.time}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{note.note}</Typography>
                      </TableCell>
                      <TableCell>{note.author}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Clinical Summary for Appeal
          </Typography>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Clinical Indicators Supporting Level of Care:
            </Typography>
            <Typography variant="body2" component="div">
              • Patient required intensive respiratory support<br />
              • Neuro status monitoring required<br />
              • Oral intake remained poor, necessitating continued ICU care<br />
              • Patient required specialized neonatal intensive care for 15 days<br />
              • Gradual improvement noted, but continued specialized care was medically necessary
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Send Clinical Data to Funder
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send the clinical notes and summary to the medical aid to support the Level of Care appeal
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              onClick={handleSendToFunder}
            >
              Send to Medical Aid
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CareOnClinicalData;

