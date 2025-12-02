import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box
      sx={{
        width: 240,
        position: 'fixed',
        left: 0,
        top: 64,
        height: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5',
        borderRight: '1px solid #e0e0e0',
        zIndex: 1100,
        overflowY: 'auto',
        p: 2
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem', mb: 2 }}>
        Netcare System
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Welcome, {user?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Role: {user?.role}
      </Typography>
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Modules:</strong><br />
          • Private Portion Collection<br />
          • Level of Care EQuery<br />
          • High-Cost Medication<br />
          • No Authorization Query
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;

