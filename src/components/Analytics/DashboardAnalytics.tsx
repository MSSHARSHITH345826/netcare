import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box
} from '@mui/material';
import GeographicMap from './GeographicMap';
import QueryTypeAnalytics from './QueryTypeAnalytics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface DashboardAnalyticsProps {
  queryType?: string;
  queries: any[];
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ queryType, queries }) => {
  const filteredQueries = queryType ? queries.filter(q => q.queryType === queryType) : queries;

  const statusData = [
    { name: 'Open', value: filteredQueries.filter(q => q.status === 'open').length, color: '#f44336' },
    { name: 'In Progress', value: filteredQueries.filter(q => q.status === 'in_progress').length, color: '#ff9800' },
    { name: 'Resolved', value: filteredQueries.filter(q => q.status === 'resolved').length, color: '#4caf50' },
    { name: 'Escalated', value: filteredQueries.filter(q => q.status === 'escalated').length, color: '#2196f3' }
  ];

  const queryTypeData = [
    { name: 'Level of Care', value: queries.filter(q => q.queryType === 'Level of Care').length },
    { name: 'No Authorization', value: queries.filter(q => q.queryType === 'No Authorization').length },
    { name: 'High-Cost Medication', value: queries.filter(q => q.queryType === 'High-Cost Medication').length },
    { name: 'Private Portion', value: queries.filter(q => q.queryType === 'Private Portion').length }
  ];

  const monthlyData = [
    { month: 'Oct', resolved: 12, open: 8 },
    { month: 'Nov', resolved: 18, open: 6 },
    { month: 'Dec', resolved: 22, open: 4 },
    { month: 'Jan', resolved: 15, open: 9 }
  ];

  const amountByType = queryTypeData.map(type => ({
    name: type.name,
    amount: queries
      .filter(q => q.queryType === type.name)
      .reduce((sum, q) => sum + q.queryAmount, 0) / 1000
  }));

  const resolutionTime = [
    { type: 'Level of Care', avgDays: 5.2 },
    { type: 'No Auth', avgDays: 3.8 },
    { type: 'Medication', avgDays: 4.5 },
    { type: 'Private', avgDays: 2.9 }
  ];

  return (
    <Box>
      <QueryTypeAnalytics queryType={queryType} queries={queries} />
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GeographicMap queryType={queryType} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
                Monthly Resolution Trend
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="resolved" stroke="#4caf50" strokeWidth={2} name="Resolved" />
                  <Line type="monotone" dataKey="open" stroke="#f44336" strokeWidth={2} name="Open" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardAnalytics;

