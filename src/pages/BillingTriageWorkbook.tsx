import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
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
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '../contexts/QueryContext';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';

const BillingTriageWorkbook: React.FC = () => {
  const navigate = useNavigate();
  const { queries, setSelectedQuery } = useQuery();
  const [filterAmount, setFilterAmount] = useState<string>('');
  const [filteredQueries, setFilteredQueries] = useState(queries);

  const handleFilter = () => {
    if (!filterAmount) {
      setFilteredQueries(queries);
      return;
    }
    const amount = parseFloat(filterAmount);
    setFilteredQueries(queries.filter(q => q.queryAmount >= amount));
  };

  const handleQueryClick = (query: typeof queries[0]) => {
    setSelectedQuery(query);
    navigate('/sap-scratchpad');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'error';
      case 'in_progress':
        return 'warning';
      case 'resolved':
        return 'success';
      case 'escalated':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
        Billing Triage Workbook
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Daily triage workbook for managing outstanding billing queries
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <TextField
              label="Filter by Amount (Minimum)"
              type="number"
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value)}
              size="small"
              sx={{ width: 250 }}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleFilter}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => {
                setFilterAmount('');
                setFilteredQueries(queries);
              }}
            >
              Clear
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
                  <TableCell><strong>Hospital</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQueries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No queries found matching the filter criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredQueries.map((query) => (
                    <TableRow
                      key={query.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleQueryClick(query)}
                    >
                      <TableCell>{query.caseNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={query.queryType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                          R{query.queryAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell>{query.medicalAid}</TableCell>
                      <TableCell>{query.hospital}</TableCell>
                      <TableCell>
                        <Chip
                          label={query.status.replace('_', ' ').toUpperCase()}
                          size="small"
                          color={getStatusColor(query.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(query.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQueryClick(query);
                          }}
                        >
                          Investigate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Filter queries by minimum amount to focus on high-value cases<br />
            • Click on any row or the "Investigate" button to navigate to SAP Scratchpad<br />
            • Outstanding queries are automatically flagged in the workbook
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BillingTriageWorkbook;

