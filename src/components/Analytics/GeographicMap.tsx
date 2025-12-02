import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  LocationOn as LocationIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface GeographicMapProps {
  queryType?: string;
}

interface LocationData {
  name: string;
  cases: number;
  amount: number;
  coordinates: [number, number];
  approvalRate?: number;
}

const GeographicMap: React.FC<GeographicMapProps> = ({ queryType }) => {
  const [selectedMetric, setSelectedMetric] = useState<'cases' | 'amount'>('cases');

  // South African locations with coordinates
  const locations: LocationData[] = [
    { 
      name: 'Johannesburg', 
      cases: 45, 
      amount: 2500000, 
      coordinates: [-26.2041, 28.0473],
      approvalRate: 87.5
    },
    { 
      name: 'Cape Town', 
      cases: 32, 
      amount: 1800000, 
      coordinates: [-33.9249, 18.4241],
      approvalRate: 91.2
    },
    { 
      name: 'Durban', 
      cases: 28, 
      amount: 1500000, 
      coordinates: [-29.8587, 31.0218],
      approvalRate: 85.3
    },
    { 
      name: 'Pretoria', 
      cases: 22, 
      amount: 1200000, 
      coordinates: [-25.7479, 28.2293],
      approvalRate: 89.1
    },
    { 
      name: 'Port Elizabeth', 
      cases: 18, 
      amount: 950000, 
      coordinates: [-33.9608, 25.6022],
      approvalRate: 88.7
    },
    { 
      name: 'Bloemfontein', 
      cases: 15, 
      amount: 750000, 
      coordinates: [-29.0852, 26.1596],
      approvalRate: 86.4
    }
  ];

  const getColor = (value: number, maxValue: number) => {
    const ratio = value / maxValue;
    if (ratio >= 0.7) return '#d32f2f';
    if (ratio >= 0.4) return '#ff9800';
    return '#4caf50';
  };

  const chartData = locations.map(loc => ({
    name: loc.name,
    cases: loc.cases,
    amount: loc.amount / 1000, // Convert to thousands
    approvalRate: loc.approvalRate
  }));

  const maxValue = selectedMetric === 'cases' 
    ? Math.max(...locations.map(l => l.cases))
    : Math.max(...locations.map(l => l.amount / 1000));

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
            Geographic Distribution
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>View By</InputLabel>
            <Select
              value={selectedMetric}
              label="View By"
              onChange={(e) => setSelectedMetric(e.target.value as 'cases' | 'amount')}
            >
              <MenuItem value="cases">Number of Cases</MenuItem>
              <MenuItem value="amount">Query Amount (R'000)</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ height: 350, borderRadius: 2, border: '1px solid #e0e0e0', p: 2, backgroundColor: '#fafafa' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                label={selectedMetric === 'cases' ? 'Number of Cases' : "Amount (R'000)"}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value: any) => 
                  selectedMetric === 'cases' 
                    ? `${value} cases` 
                    : `R${value.toFixed(0)}k`
                }
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Bar 
                dataKey={selectedMetric === 'cases' ? 'cases' : 'amount'} 
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => {
                  const value = selectedMetric === 'cases' ? entry.cases : entry.amount;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getColor(value, maxValue)} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip 
            label="High" 
            size="small" 
            sx={{ backgroundColor: '#d32f2f', color: 'white' }}
          />
          <Chip 
            label="Medium" 
            size="small" 
            sx={{ backgroundColor: '#ff9800', color: 'white' }}
          />
          <Chip 
            label="Low" 
            size="small" 
            sx={{ backgroundColor: '#4caf50', color: 'white' }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1, alignSelf: 'center' }}>
            {selectedMetric === 'cases' ? 'Case Volume' : 'Amount Range'}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {locations.slice(0, 4).map((loc, idx) => (
            <Box key={idx} sx={{ flex: 1, minWidth: 120, textAlign: 'center', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <LocationIcon sx={{ color: getColor(selectedMetric === 'cases' ? loc.cases : loc.amount / 1000, maxValue), fontSize: 24, mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 'bold' }}>
                {loc.name}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {selectedMetric === 'cases' ? `${loc.cases} cases` : `R${(loc.amount / 1000).toFixed(0)}k`}
              </Typography>
              {loc.approvalRate && (
                <Typography variant="caption" color="text.secondary">
                  {loc.approvalRate}% approval
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default GeographicMap;
