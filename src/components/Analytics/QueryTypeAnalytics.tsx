import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Chip
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface QueryTypeAnalyticsProps {
  queryType?: string;
  queries: any[];
}

const QueryTypeAnalytics: React.FC<QueryTypeAnalyticsProps> = ({ queryType, queries }) => {
  // If queryType is specified, only show data for that type
  const filteredQueries = queryType ? queries.filter(q => q.queryType === queryType) : queries;
  
  // Query Type - Pie Chart (only show if no specific type selected)
  const queryTypeData = queryType ? [
    { name: queryType, value: filteredQueries.length, color: '#1976d2' }
  ] : [
    { name: 'Level of Care', value: queries.filter(q => q.queryType === 'Level of Care').length, color: '#1976d2' },
    { name: 'No Authorization', value: queries.filter(q => q.queryType === 'No Authorization').length, color: '#f44336' },
    { name: 'High-Cost Medication', value: queries.filter(q => q.queryType === 'High-Cost Medication').length, color: '#ff9800' },
    { name: 'Private Portion', value: queries.filter(q => q.queryType === 'Private Portion').length, color: '#4caf50' }
  ];

  // Case Status - Query Type Wise (only for selected type if specified)
  const statusByType = queryType ? [{
    name: queryType,
    open: filteredQueries.filter(q => q.status === 'open').length,
    in_progress: filteredQueries.filter(q => q.status === 'in_progress').length,
    resolved: filteredQueries.filter(q => q.status === 'resolved').length,
    escalated: filteredQueries.filter(q => q.status === 'escalated').length
  }] : queryTypeData.map(type => {
    const typeQueries = queries.filter(q => q.queryType === type.name);
    return {
      name: type.name,
      open: typeQueries.filter(q => q.status === 'open').length,
      in_progress: typeQueries.filter(q => q.status === 'in_progress').length,
      resolved: typeQueries.filter(q => q.status === 'resolved').length,
      escalated: typeQueries.filter(q => q.status === 'escalated').length
    };
  });

  // E-Query Value - Query Type Wise (only for selected type if specified)
  const eQueryValueByType = queryType ? [{
    name: queryType,
    value: filteredQueries.reduce((sum, q) => sum + q.queryAmount, 0) / 1000
  }] : queryTypeData.map(type => ({
    name: type.name,
    value: queries
      .filter(q => q.queryType === type.name)
      .reduce((sum, q) => sum + q.queryAmount, 0) / 1000 // Convert to thousands
  }));

  // Outstanding Value - Query Type Wise (only open and in_progress)
  const outstandingValueByType = queryType ? [{
    name: queryType,
    value: filteredQueries
      .filter(q => q.status === 'open' || q.status === 'in_progress')
      .reduce((sum, q) => sum + q.queryAmount, 0) / 1000
  }] : queryTypeData.map(type => ({
    name: type.name,
    value: queries
      .filter(q => q.queryType === type.name && (q.status === 'open' || q.status === 'in_progress'))
      .reduce((sum, q) => sum + q.queryAmount, 0) / 1000
  }));

  // Priority based on outstanding value (only show if there's data)
  const priorityData = outstandingValueByType.length > 0 ? outstandingValueByType
    .map(type => ({
      name: type.name,
      outstanding: type.value,
      priority: type.value >= 500 ? 'High' : type.value >= 200 ? 'Medium' : 'Low'
    }))
    .sort((a, b) => b.outstanding - a.outstanding) : [];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return '#d32f2f';
      case 'Medium': return '#ff9800';
      case 'Low': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Query Type - Pie Chart */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Query Type Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={queryTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {queryTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Case Status - Query Type Wise */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Case Status by Query Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="open" stackId="a" fill="#f44336" name="Open" />
                <Bar dataKey="in_progress" stackId="a" fill="#ff9800" name="In Progress" />
                <Bar dataKey="resolved" stackId="a" fill="#4caf50" name="Resolved" />
                <Bar dataKey="escalated" stackId="a" fill="#2196f3" name="Escalated" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* E-Query Value - Query Type Wise */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              E-Query Value by Type (R'000)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eQueryValueByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `R${typeof value === 'number' ? value.toFixed(0) : value}k`} />
                <Bar dataKey="value" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Outstanding Value - Query Type Wise */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
              Outstanding Value by Type (R'000)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={outstandingValueByType}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `R${typeof value === 'number' ? value.toFixed(0) : value}k`} />
                <Bar dataKey="value" fill="#d32f2f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Priority based on Outstanding Value */}
      {priorityData.length > 0 && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', fontSize: '0.95rem' }}>
                Priority Ranking (Based on Outstanding Value)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                {priorityData.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      minWidth: 200,
                      p: 2,
                      border: `2px solid ${getPriorityColor(item.priority)}`,
                      borderRadius: 2,
                      backgroundColor: `${getPriorityColor(item.priority)}15`
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        #{idx + 1}
                      </Typography>
                      <Chip
                        label={item.priority}
                        size="small"
                        sx={{
                          backgroundColor: getPriorityColor(item.priority),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography variant="h6" sx={{ color: getPriorityColor(item.priority), fontWeight: 'bold' }}>
                      R{item.outstanding.toFixed(0)}k Outstanding
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

export default QueryTypeAnalytics;

