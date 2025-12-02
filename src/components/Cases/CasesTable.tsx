import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  IconButton,
  Tooltip,
  TablePagination
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';

interface CasesTableProps {
  onCaseClick?: (queryId: string, queryType: string) => void;
  queries?: any[];
}

const CasesTable: React.FC<CasesTableProps> = ({ onCaseClick, queries: propQueries }) => {
  const { queries: contextQueries } = useQuery();
  const queries = propQueries || contextQueries;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusChip = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: any; icon: React.ReactElement } } = {
      open: { label: 'Open', color: 'error', icon: <ScheduleIcon /> },
      in_progress: { label: 'In Progress', color: 'warning', icon: <ScheduleIcon /> },
      resolved: { label: 'Resolved', color: 'success', icon: <CheckCircleIcon /> },
      escalated: { label: 'Escalated', color: 'info', icon: <CancelIcon /> }
    };

    const config = statusConfig[status] || statusConfig.open;
    return (
      <Chip
        icon={config.icon as React.ReactElement}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  const getQueryTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Level of Care': '#1976d2',
      'No Authorization': '#f44336',
      'High-Cost Medication': '#ff9800',
      'Private Portion': '#9c27b0'
    };
    return colors[type] || '#757575';
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Card>
      <CardContent sx={{ pb: '0 !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            Active Queries
          </Typography>
        </Box>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Case #</strong></TableCell>
                <TableCell><strong>Query Type</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Medical Aid</strong></TableCell>
                <TableCell><strong>Hospital</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queries.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((query) => (
                <TableRow key={query.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {query.caseNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={query.queryType}
                      size="small"
                      sx={{
                        backgroundColor: getQueryTypeColor(query.queryType),
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#d32f2f' }}>
                      R{query.queryAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>{query.medicalAid}</TableCell>
                  <TableCell>{query.hospital}</TableCell>
                  <TableCell>{getStatusChip(query.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(query.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Start Workflow">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onCaseClick?.(query.id, query.queryType)}
                      >
                        <PsychologyIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 20, 50]}
          component="div"
          count={queries.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </CardContent>
    </Card>
  );
};

export default CasesTable;

