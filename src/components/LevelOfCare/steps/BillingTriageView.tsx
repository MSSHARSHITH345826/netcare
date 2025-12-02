import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Chip,
  Alert
} from '@mui/material';
import { Search as SearchIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { useQuery } from '../../../contexts/QueryContext';

interface BillingTriageViewProps {
  stepIndex: number;
  onComplete: () => void;
  onNext: () => void;
  onBack: () => void;
}

const BillingTriageView: React.FC<BillingTriageViewProps> = ({ onComplete }) => {
  const { queries, setSelectedQuery } = useQuery();
  const [filterAmount, setFilterAmount] = useState<string>('');
  const [filteredQueries, setFilteredQueries] = useState(queries);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  useEffect(() => {
    // Auto-filter for demo
    setFilterAmount('50000');
    setFilteredQueries(queries.filter(q => q.queryAmount >= 50000));
  }, []);

  const handleQueryClick = (query: typeof queries[0]) => {
    setSelectedCase(query.caseNumber);
    setSelectedQuery(query);
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Filtering queries by amount (R50,000+)
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Filter by Amount (Minimum)"
          type="number"
          value={filterAmount}
          onChange={(e) => {
            setFilterAmount(e.target.value);
            const amount = parseFloat(e.target.value) || 0;
            setFilteredQueries(queries.filter(q => q.queryAmount >= amount));
          }}
          size="small"
          sx={{ width: 250 }}
        />
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={() => {
            const amount = parseFloat(filterAmount) || 0;
            setFilteredQueries(queries.filter(q => q.queryAmount >= amount));
          }}
        >
          Filter
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Case Number</strong></TableCell>
              <TableCell><strong>Query Type</strong></TableCell>
              <TableCell><strong>Query Amount</strong></TableCell>
              <TableCell><strong>Medical Aid</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQueries.map((query) => (
              <TableRow
                key={query.id}
                hover
                sx={{
                  cursor: 'pointer',
                  backgroundColor: selectedCase === query.caseNumber ? '#e3f2fd' : 'inherit'
                }}
                onClick={() => handleQueryClick(query)}
              >
                <TableCell>{query.caseNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={query.queryType}
                    size="small"
                    color={query.queryType === 'Level of Care' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    R{query.queryAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell>{query.medicalAid}</TableCell>
                <TableCell>
                  <Chip
                    label={query.status.toUpperCase()}
                    size="small"
                    color={query.status === 'open' ? 'error' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  {selectedCase === query.caseNumber ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <Button variant="outlined" size="small">Select</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedCase && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <Typography variant="body2">
            Case {selectedCase} selected. Proceeding to SAP Scratchpad...
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default BillingTriageView;

