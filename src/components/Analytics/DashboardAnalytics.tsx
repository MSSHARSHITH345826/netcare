import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box
} from '@mui/material';
import GeographicMap from './GeographicMap';
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
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Query Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Query Types
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={queryTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Amount by Query Type (R'000)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={amountByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={120} />
                <Tooltip formatter={(value: any) => `R${typeof value === 'number' ? value.toFixed(0) : value}k`} />
                <Bar dataKey="amount" fill="#1976d2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Average Resolution Time (Days)
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resolutionTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `${value} days`} />
                <Bar dataKey="avgDays" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <GeographicMap queryType={queryType} />
      </Grid>
    </Grid>
  );
};

export default DashboardAnalytics;

