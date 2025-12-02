import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import {
  LocalHospital as LevelOfCareIcon,
  VerifiedUser as NoAuthIcon,
  Medication as MedicationIcon,
  AccountBalance as PrivatePortionIcon
} from '@mui/icons-material';

interface QueryTypeSidebarProps {
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

const QueryTypeSidebar: React.FC<QueryTypeSidebarProps> = ({ selectedType, onTypeSelect }) => {
  const queryTypes = [
    { id: 'Level of Care', label: 'Level of Care', icon: <LevelOfCareIcon /> },
    { id: 'No Authorization', label: 'No Authorization', icon: <NoAuthIcon /> },
    { id: 'High-Cost Medication', label: 'High-Cost Medication', icon: <MedicationIcon /> },
    { id: 'Private Portion', label: 'Private Portion', icon: <PrivatePortionIcon /> }
  ];

  return (
    <Box
      sx={{
        width: 240,
        position: 'fixed',
        left: 0,
        top: 64,
        height: 'calc(100vh - 64px)',
        backgroundColor: '#fafafa',
        borderRight: '1px solid #e0e0e0',
        zIndex: 1100,
        overflowY: 'auto'
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1rem' }}>
          Query Types
        </Typography>
      </Box>
      <List sx={{ pt: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedType === null}
            onClick={() => onTypeSelect(null)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid #1976d2',
                '& .MuiListItemIcon-root': {
                  color: '#1976d2',
                },
                '& .MuiListItemText-primary': {
                  color: '#1976d2',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ListItemText primary="All Queries" />
          </ListItemButton>
        </ListItem>
        <Divider />
        {queryTypes.map((type) => (
          <ListItem key={type.id} disablePadding>
            <ListItemButton
              selected={selectedType === type.id}
              onClick={() => onTypeSelect(type.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: '#e3f2fd',
                  borderLeft: '4px solid #1976d2',
                  '& .MuiListItemIcon-root': {
                    color: '#1976d2',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#1976d2',
                    fontWeight: 'bold',
                  },
                },
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemIcon sx={{ color: selectedType === type.id ? '#1976d2' : 'inherit', minWidth: 40 }}>
                {type.icon}
              </ListItemIcon>
              <ListItemText primary={type.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default QueryTypeSidebar;

