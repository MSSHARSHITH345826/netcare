import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useQuery } from '../../../contexts/QueryContext';

interface CareOnClinicalViewProps {
  stepIndex: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

const CareOnClinicalView: React.FC<CareOnClinicalViewProps> = ({ onComplete }) => {
  const { caseData } = useQuery();
  const [notes] = React.useState([
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
        Retrieving clinical data from CareOn
      </Alert>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
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
            {notes.map((note) => (
              <TableRow key={note.id} hover>
                <TableCell>{note.date}</TableCell>
                <TableCell>{note.time}</TableCell>
                <TableCell>{note.note}</TableCell>
                <TableCell>{note.author}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Clinical Summary for Appeal
        </Typography>
        <Typography variant="body2">
          • Patient required intensive respiratory support<br />
          • Neuro status monitoring required<br />
          • Oral intake remained poor, necessitating continued ICU care<br />
          • Patient required specialized neonatal intensive care for 15 days
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => {
            alert('Clinical data sent to medical aid');
            onComplete();
          }}
        >
          Send Clinical Data to Funder
        </Button>
      </Box>
    </Box>
  );
};

export default CareOnClinicalView;

