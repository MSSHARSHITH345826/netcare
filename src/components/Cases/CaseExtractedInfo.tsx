import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  AccountBalance as AccountBalanceIcon,
  Description as DocumentIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';
import PsychologyIcon from '@mui/icons-material/Psychology';

const CaseExtractedInfo: React.FC = () => {
  const { selectedQuery } = useQuery();
  const [agentOutputs, setAgentOutputs] = useState<Record<string, string>>({});

  // Load agent outputs from orchestration
  useEffect(() => {
    const outputsKey = `agent_outputs_${selectedQuery?.id || 'default'}`;
    const savedOutputs = localStorage.getItem(outputsKey);
    if (savedOutputs) {
      try {
        const parsed = JSON.parse(savedOutputs);
        setAgentOutputs(parsed);
      } catch (e) {
        console.error('Error loading agent outputs:', e);
      }
    }

    // Listen for updates
    const handleStorageChange = () => {
      const updated = localStorage.getItem(outputsKey);
      if (updated) {
        try {
          const parsed = JSON.parse(updated);
          setAgentOutputs(parsed);
        } catch (e) {
          console.error('Error loading agent outputs:', e);
        }
      }
    };

    // Check for updates every second
    const interval = setInterval(handleStorageChange, 1000);
    return () => clearInterval(interval);
  }, [selectedQuery?.id]);

  // Sample extracted data based on user story
  const extractedData = {
    patient: {
      name: 'Sipho',
      surname: 'Khumalo',
      dateOfBirth: '15 March 1978',
      age: 46,
      gender: 'Male',
      idNumber: '7803155801085',
      patientType: 'Adult Medical/Surgical'
    },
    case: {
      caseNumber: selectedQuery?.caseNumber || 'GEMS-JHB-2024-092847',
      hospital: selectedQuery?.hospital || 'Netcare Milpark Hospital, Johannesburg',
      admissionDate: '14 July 2024',
      dischargeDate: '23 August 2024',
      lengthOfStay: 41,
      admissionReason: 'Post-surgical recovery, rehabilitation required',
      primaryDiagnosis: 'I21.9 - Acute myocardial infarction, unspecified',
      secondaryDiagnosis: 'Z47.1 - Aftercare following joint replacement surgery'
    },
    levelOfCare: {
      billedCode: '58201',
      billedDescription: 'High Care / Step-down Unit',
      billedDates: '14/07/2024 to 23/08/2024',
      totalBilledDays: 41,
      changes: [
        { period: 'Days 1-5', code: '58002', description: 'ICU' },
        { period: 'Days 6-41', code: '58201', description: 'High Care' }
      ]
    },
    medicalAid: {
      schemeName: selectedQuery?.medicalAid || 'GEMS',
      schemeType: 'B2B (Business-to-Business) Integrated System',
      b2bSystem: 'UMS (Unified Medical Scheme)',
      memberNumber: 'GEMS-847293-KH-01',
      principalMember: 'Sipho Khumalo',
      memberType: 'Principal member'
    },
    authorization: {
      authorizationNumber: 'AUTH-GEMS-2024-0728473',
      authorizationDate: '13 July 2024',
      approvedCode: '58201',
      approvedDates: [
        { period: '14/07/2024 to 28/07/2024', days: 15, status: 'Approved', type: 'Initially approved' },
        { period: '29/07/2024 to 12/08/2024', days: 15, status: 'Approved', type: 'Approved after appeal' },
        { period: '13/08/2024 to 23/08/2024', days: 11, status: 'Declined', type: 'Queried' }
      ],
      totalApprovedDays: 30,
      declinedDays: 15,
      status: 'Partial approval'
    },
    account: {
      totalValue: 485750.00,
      paidAmount: 386601.50,
      outstandingAmount: selectedQuery?.queryAmount || 99148.50,
      shortPaymentPercentage: 20.4
    },
    shortPayment: {
      reason: 'Level of Care days 29/07/2024 to 12/08/2024 not approved - clinical justification required',
      reasonCode: 'LOC-DEC-001',
      queryType: 'Level of Care',
      declinedAmount: 99148.50,
      declinedDays: 15,
      dailyRate: 6609.90
    },
    b2bCommunication: [
      {
        date: '13 July 2024',
        type: 'Outgoing',
        message: 'Authorization Request',
        status: 'Approved (Partial)',
        details: 'Request for 41 days High Care (58201)'
      },
      {
        date: '13 July 2024',
        type: 'Incoming',
        message: 'Authorization Response',
        status: 'Partial Approval',
        details: 'Approved: 15 days (14/07 to 28/07), Declined: 26 days (29/07 to 23/08)'
      },
      {
        date: '30 July 2024',
        type: 'Outgoing',
        message: 'Appeal Request',
        status: 'Pending Response',
        details: 'Appeal for additional 15 days (29/07 to 12/08) with clinical justification'
      },
      {
        date: '05 August 2024',
        type: 'Incoming',
        message: 'Appeal Response',
        status: 'Partial Approval',
        details: 'Approved: Additional 15 days (29/07 to 12/08), Remaining Declined: 11 days (13/08 to 23/08)'
      },
      {
        date: '29 August 2024',
        type: 'Outgoing',
        message: 'Clinical Data Submission',
        status: 'Pending Response',
        details: 'CareOn clinical notes for days 13/08 to 23/08'
      }
    ],
    discrepancy: {
      reason: 'Level of Care days 13/08/2024 to 23/08/2024 not approved - clinical justification required for extended High Care stay',
      costImpact: 72708.90,
      rootCause: 'Funder requires clinical evidence for extended High Care beyond initial 30 days',
      billedDays: 41,
      approvedDays: 30,
      declinedDays: 11
    }
  };

  const getCommunicationColor = (type: string) => {
    switch (type) {
      case 'Outgoing': return '#f44336'; // Red
      case 'Incoming': return '#4caf50'; // Green
      default: return '#ff9800'; // Orange
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
        Extracted Case Information
      </Typography>

      <Grid container spacing={3}>
        {/* Patient Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" /> Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {extractedData.patient.name} {extractedData.patient.surname}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Date of Birth:</strong> {extractedData.patient.dateOfBirth} ({extractedData.patient.age} years)
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Gender:</strong> {extractedData.patient.gender}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>ID Number:</strong> {extractedData.patient.idNumber}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Patient Type:</strong> {extractedData.patient.patientType}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Case Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HospitalIcon color="primary" /> Case Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Case Number:</strong> {extractedData.case.caseNumber}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Hospital:</strong> {extractedData.case.hospital}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Admission:</strong> {extractedData.case.admissionDate} to {extractedData.case.dischargeDate}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Length of Stay:</strong> {extractedData.case.lengthOfStay} days
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Primary Diagnosis:</strong> {extractedData.case.primaryDiagnosis}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Level of Care Information */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DocumentIcon color="primary" /> Level of Care Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2">
                    <strong>Billed Code:</strong> {extractedData.levelOfCare.billedCode} ({extractedData.levelOfCare.billedDescription})
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2">
                    <strong>Billed Period:</strong> {extractedData.levelOfCare.billedDates}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2">
                    <strong>Total Billed Days:</strong> {extractedData.levelOfCare.totalBilledDays} days
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Level of Care Changes:
                  </Typography>
                  {extractedData.levelOfCare.changes.map((change, index) => (
                    <Chip
                      key={index}
                      label={`${change.period}: ${change.code} (${change.description})`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Medical Aid & Authorization */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceIcon color="primary" /> Medical Aid Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Scheme:</strong> {extractedData.medicalAid.schemeName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>B2B System:</strong> {extractedData.medicalAid.b2bSystem}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Member Number:</strong> {extractedData.medicalAid.memberNumber}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Authorization Number:</strong> {extractedData.authorization.authorizationNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Authorization Date:</strong> {extractedData.authorization.authorizationDate}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Account Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Total Account Value:</strong> R{extractedData.account.totalValue.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: '#4caf50' }}>
                    <strong>Paid Amount:</strong> R{extractedData.account.paidAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    <strong>Outstanding Amount:</strong> R{extractedData.account.outstandingAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2">
                    <strong>Short Payment Percentage:</strong> {extractedData.account.shortPaymentPercentage}%
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Short Payment Details */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Short Payment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Reason:</strong> {extractedData.shortPayment.reason}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Reason Code:</strong> {extractedData.shortPayment.reasonCode}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Query Type:</strong> {extractedData.shortPayment.queryType}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Declined Amount:</strong> R{extractedData.shortPayment.declinedAmount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Declined Days:</strong> {extractedData.shortPayment.declinedDays} days
                  </Typography>
                  <Typography variant="body2">
                    <strong>Daily Rate:</strong> R{extractedData.shortPayment.dailyRate.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* B2B Communication History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                B2B Communication History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Message</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Details</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extractedData.b2bCommunication.map((comm, index) => (
                      <TableRow key={index}>
                        <TableCell>{comm.date}</TableCell>
                        <TableCell>
                          <Chip
                            label={comm.type}
                            size="small"
                            sx={{
                              backgroundColor: getCommunicationColor(comm.type),
                              color: 'white',
                              fontSize: '0.7rem'
                            }}
                          />
                        </TableCell>
                        <TableCell>{comm.message}</TableCell>
                        <TableCell>
                          <Chip
                            label={comm.status}
                            size="small"
                            color={comm.status.includes('Approved') ? 'success' : comm.status.includes('Pending') ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{comm.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Discrepancy Analysis */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Discrepancy Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Discrepancy Reason:</strong> {extractedData.discrepancy.reason}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2">
                    <strong>Billed Days:</strong> {extractedData.discrepancy.billedDays}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" sx={{ color: '#4caf50' }}>
                    <strong>Approved Days:</strong> {extractedData.discrepancy.approvedDays}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="body2" sx={{ color: '#d32f2f' }}>
                    <strong>Declined Days:</strong> {extractedData.discrepancy.declinedDays}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Cost Impact:</strong> R{extractedData.discrepancy.costImpact.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Root Cause:</strong> {extractedData.discrepancy.rootCause}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Approved Dates Breakdown */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Approved Dates Breakdown
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Period</strong></TableCell>
                      <TableCell><strong>Days</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extractedData.authorization.approvedDates.map((date, index) => (
                      <TableRow key={index}>
                        <TableCell>{date.period}</TableCell>
                        <TableCell>{date.days} days</TableCell>
                        <TableCell>
                          {date.status === 'Approved' ? (
                            <Chip label={date.status} size="small" color="success" icon={<CheckCircleIcon />} />
                          ) : (
                            <Chip label={date.status} size="small" color="error" icon={<CancelIcon />} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{date.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">
                  <strong>Total Approved:</strong> {extractedData.authorization.totalApprovedDays} days | 
                  <strong style={{ marginLeft: 10 }}>Total Declined:</strong> {extractedData.authorization.declinedDays} days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Agent Summary Section - Shows outputs from orchestration */}
        {Object.keys(agentOutputs).length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ mt: 3, border: '2px solid #1976d2' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PsychologyIcon sx={{ color: '#1a237e', mr: 1.5, fontSize: 32 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a237e', fontSize: '1.5rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                    Agent Summary & Outputs
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Real-time outputs from AI agents during workflow orchestration
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                  {Object.entries(agentOutputs)
                    .filter(([key]) => ['QueryDetector', 'LevelOfCareResolver', 'ShortPaymentAnalyzer', 'BilledDataExtractor', 'B2BCommunicationMonitor', 'DiscrepancyAnalyzer', 'ApprovedDatesRetriever', 'ClinicalDataAgent', 'ResponseHandler', 'QueryClosureAgent', 'ResubmissionAgent', 'ManagementReportingAgent'].includes(key))
                    .map(([agentName, output]) => (
                      <Grid size={{ xs: 12, md: 6 }} key={agentName}>
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor: '#e8f5e9',
                            border: '1px solid #4caf50',
                            borderRadius: 1,
                            height: '100%'
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1b5e20', mb: 1, fontSize: '0.95rem', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                            {agentName}
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6, color: '#212121', fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
                            {output}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CaseExtractedInfo;

