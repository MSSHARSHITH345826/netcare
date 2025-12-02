export interface Query {
  id: string;
  caseNumber: string;
  queryType: string;
  queryAmount: number;
  medicalAid: string;
  hospital: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  createdAt: string;
}

export interface CaseData {
  caseNumber: string;
  patientName: string;
  patientSurname: string;
  dateOfBirth: string;
  memberNumber: string;
  admissionDate: string;
  dischargeDate: string;
  outstandingBalance: number;
  shortPaymentReason: string;
  levelOfCareBilled: string;
  levelOfCareBilledCode: string;
}

export interface B2BCommunication {
  id: string;
  type: 'incoming' | 'outgoing' | 'discrepancy';
  timestamp: string;
  message: string;
  authNumber?: string;
  approvedDays?: number;
  approvedDates?: string[];
  levelOfCare?: string;
  status?: 'approved' | 'pending' | 'declined';
  discrepancyReason?: string;
}

export interface CareOnNote {
  id: string;
  date: string;
  time: string;
  note: string;
  author: string;
}

export interface DebtPackQuery {
  caseNumber: string;
  queryId: string;
  status: string;
  predefinedOutcomes: string[];
  selectedOutcome?: string;
  notes: string;
  followUpDate?: string;
}

