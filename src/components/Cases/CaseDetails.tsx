import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Psychology as PsychologyIcon,
  Description as DocumentIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';
import { getMockDataForQuery } from '../../services/mockDataService';
import CaseExtractedInfo from './CaseExtractedInfo';
import WorkflowOrchestration from '../LevelOfCare/WorkflowOrchestration';
import AgentSummary from '../Agents/AgentSummary';
import AIChat from '../Chat/AIChat';

interface CaseDetailsProps {
  queryId: string;
  onStartWorkflow: () => void;
  onBack: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ queryId, onStartWorkflow, onBack }) => {
  const { queries, selectedQuery, setCaseData, setB2BCommunications, setCareOnNotes } = useQuery();
  const [tabValue, setTabValue] = useState(0);
  const query = queries.find(q => q.id === queryId);

  // Load mock data when query is selected
  React.useEffect(() => {
    if (query) {
      const { caseData: mockCaseData, b2bCommunications: mockB2B, careOnNotes: mockNotes } = getMockDataForQuery(query);
      setCaseData(mockCaseData);
      setB2BCommunications(mockB2B);
      setCareOnNotes(mockNotes);
    }
  }, [query, setCaseData, setB2BCommunications, setCareOnNotes]);

  if (!query) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Case not found.</Typography>
        <Button variant="contained" onClick={onBack} sx={{ mt: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
          Case Details: {query.caseNumber}
        </Typography>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBackIcon />}>
          Back to Dashboard
        </Button>
      </Box>

      <Card sx={{ boxShadow: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="case details tabs">
            <Tab label="Orchestration" icon={<PsychologyIcon />} iconPosition="start" />
            <Tab label="Extracted Info & Summary" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="AI Chat" icon={<ChatIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={tabValue} index={0}>
            <WorkflowOrchestration queryType={query.queryType} onBack={onBack} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <CaseExtractedInfo />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ height: '600px' }}>
              <AIChat caseId={query.caseNumber} queryType={query.queryType} />
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CaseDetails;
