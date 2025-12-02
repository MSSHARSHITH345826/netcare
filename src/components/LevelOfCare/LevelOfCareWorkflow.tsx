import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Grid
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Description as DocumentIcon,
  Timeline as TimelineIcon,
  Psychology as PsychologyIcon
} from '@mui/icons-material';
import BillingTriageView from './steps/BillingTriageView';
import SAPScratchpadView from './steps/SAPScratchpadView';
import SAPCaseOverviewView from './steps/SAPCaseOverviewView';
import SAPAuthScreenView from './steps/SAPAuthScreenView';
import CareOnClinicalView from './steps/CareOnClinicalView';
import DebtPackView from './steps/DebtPackView';
import WorkflowOrchestration from './WorkflowOrchestration';
import { useQuery } from '../../contexts/QueryContext';

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

interface LevelOfCareWorkflowProps {
  queryType?: string;
  onBack?: () => void;
}

const LevelOfCareWorkflow: React.FC<LevelOfCareWorkflowProps> = ({ queryType = 'Level of Care', onBack }) => {
  const [tabValue, setTabValue] = useState(0);
  const { selectedQuery } = useQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            {queryType} Resolution
          </Typography>
          {selectedQuery && (
            <Typography variant="body2" color="text.secondary">
              Case: {selectedQuery.caseNumber} | Amount: R{selectedQuery.queryAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
            </Typography>
          )}
        </Box>
        {onBack && (
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
            Back to Cases
          </Button>
        )}
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="workflow tabs">
            <Tab label="Orchestration" icon={<PsychologyIcon />} iconPosition="start" />
            <Tab label="Billing Triage" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="SAP Scratchpad" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="Case Overview" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="Auth Screen" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="CareOn Clinical" icon={<DocumentIcon />} iconPosition="start" />
            <Tab label="DebtPack" icon={<DocumentIcon />} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={tabValue} index={0}>
            <WorkflowOrchestration queryType={queryType} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <BillingTriageView stepIndex={0} onComplete={() => {}} onNext={() => setTabValue(2)} onBack={() => {}} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <SAPScratchpadView stepIndex={1} onComplete={() => {}} onNext={() => setTabValue(3)} onBack={() => setTabValue(1)} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <SAPCaseOverviewView stepIndex={3} onComplete={() => {}} onNext={() => setTabValue(4)} onBack={() => setTabValue(2)} />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <SAPAuthScreenView stepIndex={4} onComplete={() => {}} onNext={() => setTabValue(5)} onBack={() => setTabValue(3)} />
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <CareOnClinicalView stepIndex={7} onComplete={() => {}} onNext={() => setTabValue(6)} onBack={() => setTabValue(4)} />
          </TabPanel>

          <TabPanel value={tabValue} index={6}>
            <DebtPackView stepIndex={9} onComplete={() => {}} onNext={() => {}} onBack={() => setTabValue(5)} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LevelOfCareWorkflow;
