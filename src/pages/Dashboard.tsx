import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import CasesTable from '../components/Cases/CasesTable';
import DashboardAnalytics from '../components/Analytics/DashboardAnalytics';
import QueryTypeSidebar from '../components/Layout/QueryTypeSidebar';
import LevelOfCareWorkflow from '../components/LevelOfCare/LevelOfCareWorkflow';
import CaseDetails from '../components/Cases/CaseDetails';
import { useQuery } from '../contexts/QueryContext';

const Dashboard: React.FC = () => {
  const [selectedQueryId, setSelectedQueryId] = useState<string | null>(null);
  const [selectedQueryType, setSelectedQueryType] = useState<string | null>(null);
  const [selectedFilterType, setSelectedFilterType] = useState<string | null>(null);
  const [showWorkflow, setShowWorkflow] = useState(false);
  const { queries, setSelectedQuery } = useQuery();

  const handleCaseClick = (queryId: string, queryType: string) => {
    const query = queries.find(q => q.id === queryId);
    if (query) {
      setSelectedQuery(query);
      setSelectedQueryId(queryId);
      setSelectedQueryType(queryType);
      setShowWorkflow(false);
    }
  };

  const handleStartWorkflow = () => {
    setShowWorkflow(true);
  };

  const handleBackFromWorkflow = () => {
    setShowWorkflow(false);
  };

  const handleBackFromDetails = () => {
    setSelectedQueryId(null);
    setSelectedQueryType(null);
    setSelectedQuery(null);
    setShowWorkflow(false);
  };

  const filteredQueries = selectedFilterType 
    ? queries.filter(q => q.queryType === selectedFilterType)
    : queries;

  const stats = {
    total: queries.length,
    open: queries.filter(q => q.status === 'open').length,
    inProgress: queries.filter(q => q.status === 'in_progress').length,
    resolved: queries.filter(q => q.status === 'resolved').length,
    totalAmount: queries.reduce((sum, q) => sum + q.queryAmount, 0)
  };

  if (selectedQueryId && selectedQueryType) {
    if (showWorkflow) {
      return (
        <Box sx={{ display: 'flex' }}>
          <QueryTypeSidebar 
            selectedType={selectedFilterType} 
            onTypeSelect={setSelectedFilterType} 
          />
          <Box sx={{ marginLeft: '240px', width: 'calc(100% - 240px)' }}>
            <LevelOfCareWorkflow queryType={selectedQueryType} onBack={handleBackFromWorkflow} />
          </Box>
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex' }}>
        <QueryTypeSidebar 
          selectedType={selectedFilterType} 
          onTypeSelect={setSelectedFilterType} 
        />
        <Box sx={{ marginLeft: '240px', width: 'calc(100% - 240px)' }}>
          <CaseDetails 
            queryId={selectedQueryId} 
            onStartWorkflow={handleStartWorkflow}
            onBack={handleBackFromDetails}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <QueryTypeSidebar 
        selectedType={selectedFilterType} 
        onTypeSelect={setSelectedFilterType} 
      />
      <Box sx={{ marginLeft: '240px', width: 'calc(100% - 240px)', p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            EQuery Resolution Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 'normal' }}>
            {selectedFilterType ? `${selectedFilterType} Analysis` : 'Executive Overview'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive analytics and insights for query management and resolution
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Queries
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  R{(stats.totalAmount / 1000).toFixed(0)}k total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Open
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                  {stats.open}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((stats.open / stats.total) * 100).toFixed(0)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  In Progress
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                  {stats.inProgress}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((stats.inProgress / stats.total) * 100).toFixed(0)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ backgroundColor: '#f8f9fa', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Resolved
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                  {stats.resolved}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {((stats.resolved / stats.total) * 100).toFixed(0)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Analytics */}
        <Box sx={{ mb: 3 }}>
          <DashboardAnalytics queryType={selectedFilterType || undefined} queries={queries} />
        </Box>

        {/* Cases Table */}
        <CasesTable 
          onCaseClick={handleCaseClick}
          queries={filteredQueries}
        />
      </Box>
    </Box>
  );
};

export default Dashboard;
