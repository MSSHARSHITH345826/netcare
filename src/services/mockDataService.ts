/**
 * Mock Data Service - Generates realistic data based on Billing Triage Workbook (BTW) structure
 * This service provides comprehensive mock data for all query types and cases
 */

import { Query, CaseData, B2BCommunication, CareOnNote } from '../types';

// Medical Aid Schemes in South Africa
const MEDICAL_AIDS = [
  'GEMS', 'Discovery Health', 'Bonitas Medical Fund', 'MedScheme', 
  'Momentum Health', 'Fedhealth', 'Bestmed', 'Medihelp', 'Profmed'
];

// Netcare Hospitals
const HOSPITALS = [
  'Netcare Milpark Hospital', 'Netcare Sunninghill Hospital', 
  'Netcare Waterfall City Hospital', 'Netcare Alberton Hospital',
  'Netcare Pretoria East Hospital', 'Netcare Rosebank Hospital',
  'Netcare Unitas Hospital', 'Netcare Linksfield Hospital',
  'Netcare Pinehaven Hospital', 'Netcare Krugersdorp Hospital',
  'Netcare Olivedale Hospital', 'Netcare Park Lane Hospital',
  'Netcare Ferncrest Hospital'
];

// Query Types
const QUERY_TYPES = [
  'Level of Care', 'No Authorization', 'High-Cost Medication', 'Private Portion'
];

// Level of Care Codes
const LOC_CODES = [
  { code: '58002', name: 'ICU' },
  { code: '58201', name: 'High Care / Step-down Unit' },
  { code: '58001', name: 'General Ward' },
  { code: '58003', name: 'Isolation Ward' }
];

// Common first names (South African)
const FIRST_NAMES = [
  'Sipho', 'Thabo', 'Lerato', 'Nomsa', 'John', 'Mary', 'David', 'Sarah',
  'James', 'Patricia', 'Michael', 'Linda', 'Robert', 'Barbara', 'William'
];

// Common surnames (South African)
const SURNAMES = [
  'Khumalo', 'Dlamini', 'Nkosi', 'Mthembu', 'Smith', 'Johnson', 'Williams',
  'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
];

/**
 * Generates a random date between start and end dates
 */
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

/**
 * Generates a random case number
 */
const generateCaseNumber = (index: number): string => {
  const prefix = ['GEMS', 'DISC', 'BONI', 'MEDS', 'MOM', 'FED', 'BEST', 'MEDI'][index % 8] || 'NET';
  const year = '2024';
  const hospitalCode = ['JHB', 'CPT', 'DBN', 'PTA', 'PE'][index % 5] || 'JHB';
  const sequence = String(1000000 + index).padStart(7, '0');
  return `${prefix}-${hospitalCode}-${year}-${sequence}`;
};

/**
 * Generates mock queries based on BTW structure
 */
export const generateMockQueries = (count: number = 50): Query[] => {
  const queries: Query[] = [];
  const statuses: Array<'open' | 'in_progress' | 'resolved' | 'escalated'> = 
    ['open', 'in_progress', 'resolved', 'escalated'];
  
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-11-25');

  for (let i = 0; i < count; i++) {
    const queryType = QUERY_TYPES[i % QUERY_TYPES.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const medicalAid = MEDICAL_AIDS[i % MEDICAL_AIDS.length];
    const hospital = HOSPITALS[i % HOSPITALS.length];
    
    // Generate realistic amounts based on query type
    let baseAmount = 0;
    switch (queryType) {
      case 'Level of Care':
        baseAmount = 50000 + Math.random() * 150000; // R50k - R200k
        break;
      case 'No Authorization':
        baseAmount = 20000 + Math.random() * 80000; // R20k - R100k
        break;
      case 'High-Cost Medication':
        baseAmount = 80000 + Math.random() * 120000; // R80k - R200k
        break;
      case 'Private Portion':
        baseAmount = 10000 + Math.random() * 40000; // R10k - R50k
        break;
    }

    const createdAt = randomDate(startDate, endDate);

    queries.push({
      id: String(i + 1),
      caseNumber: generateCaseNumber(i),
      queryType,
      queryAmount: Math.round(baseAmount * 100) / 100,
      medicalAid,
      hospital,
      status,
      createdAt: createdAt.toISOString()
    });
  }

  return queries;
};

/**
 * Generates mock case data for a specific query
 */
export const generateMockCaseData = (query: Query): CaseData => {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  
  // Generate date of birth (age 30-80)
  const age = 30 + Math.floor(Math.random() * 50);
  const birthYear = new Date().getFullYear() - age;
  const birthMonth = Math.floor(Math.random() * 12) + 1;
  const birthDay = Math.floor(Math.random() * 28) + 1;
  const dateOfBirth = `${birthDay} ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][birthMonth - 1]} ${birthYear}`;
  
  // Generate admission/discharge dates (within last 6 months)
  const dischargeDate = new Date();
  dischargeDate.setDate(dischargeDate.getDate() - Math.floor(Math.random() * 180));
  const lengthOfStay = 5 + Math.floor(Math.random() * 50); // 5-55 days
  const admissionDate = new Date(dischargeDate);
  admissionDate.setDate(admissionDate.getDate() - lengthOfStay);
  
  const admissionDateStr = admissionDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  const dischargeDateStr = dischargeDate.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });
  
  // Generate member number
  const memberNumber = `${query.medicalAid.substring(0, 4)}-${Math.floor(Math.random() * 900000) + 100000}-${surname.substring(0, 2).toUpperCase()}-01`;
  
  // Select LOC code
  const locCode = LOC_CODES[Math.floor(Math.random() * LOC_CODES.length)];
  
  // Generate outstanding balance (80-100% of query amount)
  const outstandingBalance = query.queryAmount * (0.8 + Math.random() * 0.2);
  
  // Generate short payment reason based on query type
  let shortPaymentReason = '';
  let reasonCode = '';
  
  switch (query.queryType) {
    case 'Level of Care':
      const declinedDays = Math.floor(Math.random() * 20) + 5;
      const startDay = Math.floor(Math.random() * 20) + 1;
      const endDay = startDay + declinedDays;
      shortPaymentReason = `Level of Care days ${startDay}/07/2024 to ${endDay}/08/2024 not approved - clinical justification required`;
      reasonCode = 'LOC-DEC-001';
      break;
    case 'No Authorization':
      shortPaymentReason = 'No prior authorization obtained for admission';
      reasonCode = 'NO-AUTH-001';
      break;
    case 'High-Cost Medication':
      shortPaymentReason = 'High-cost medication not pre-authorized';
      reasonCode = 'MED-AUTH-001';
      break;
    case 'Private Portion':
      shortPaymentReason = 'Private portion not covered by medical scheme';
      reasonCode = 'PRIV-PORT-001';
      break;
  }

  return {
    caseNumber: query.caseNumber,
    patientName: firstName,
    patientSurname: surname,
    dateOfBirth,
    memberNumber,
    admissionDate: admissionDateStr,
    dischargeDate: dischargeDateStr,
    outstandingBalance: Math.round(outstandingBalance * 100) / 100,
    shortPaymentReason,
    levelOfCareBilled: locCode.name,
    levelOfCareBilledCode: locCode.code
  };
};

/**
 * Generates mock B2B communications
 */
export const generateMockB2BCommunications = (caseNumber: string, count: number = 5): B2BCommunication[] => {
  const communications: B2BCommunication[] = [];
  const types: Array<'incoming' | 'outgoing' | 'discrepancy'> = ['incoming', 'outgoing', 'discrepancy'];
  
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 30);

  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 5);
    
    let message = '';
    let authNumber = '';
    let approvedDays = 0;
    let status: 'approved' | 'pending' | 'declined' | undefined = undefined;
    
    if (type === 'outgoing') {
      message = `Authorization request sent for case ${caseNumber}`;
      authNumber = `AUTH-${caseNumber.substring(0, 8)}-${i + 1}`;
      status = 'pending';
    } else if (type === 'incoming') {
      message = `Authorization response received: ${i % 2 === 0 ? 'Approved' : 'Partially Approved'}`;
      authNumber = `AUTH-${caseNumber.substring(0, 8)}-${i + 1}`;
      approvedDays = i % 2 === 0 ? 30 : 15;
      status = i % 2 === 0 ? 'approved' : 'pending';
    } else {
      message = `Discrepancy detected: Level of Care mismatch`;
      status = 'pending';
    }

    communications.push({
      id: `b2b-${i + 1}`,
      type,
      timestamp: date.toISOString(),
      message,
      authNumber,
      approvedDays: approvedDays > 0 ? approvedDays : undefined,
      status
    });
  }

  return communications;
};

/**
 * Generates mock CareOn notes
 */
export const generateMockCareOnNotes = (caseNumber: string, count: number = 10): CareOnNote[] => {
  const notes: CareOnNote[] = [];
  const authors = ['Dr. Smith', 'Dr. Johnson', 'Nurse Williams', 'Dr. Brown', 'Dr. Davis'];
  
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 20);

  const noteTemplates = [
    'Patient stable, vitals normal, continuing High Care monitoring',
    'Medication adjusted per protocol, patient responding well',
    'Clinical progress noted, considering step-down to general ward',
    'Vital signs stable, no acute concerns',
    'Patient improving, reduced oxygen requirements',
    'Care plan reviewed and updated',
    'Family consultation completed',
    'Laboratory results reviewed, within normal limits',
    'Physical therapy session completed',
    'Nutritional assessment updated'
  ];

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i * 2);
    
    notes.push({
      id: `note-${i + 1}`,
      date: date.toLocaleDateString('en-ZA'),
      time: `${8 + (i % 12)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      note: noteTemplates[i % noteTemplates.length],
      author: authors[i % authors.length]
    });
  }

  return notes;
};

/**
 * Gets all mock data for a specific query
 */
export const getMockDataForQuery = (query: Query) => {
  return {
    caseData: generateMockCaseData(query),
    b2bCommunications: generateMockB2BCommunications(query.caseNumber),
    careOnNotes: generateMockCareOnNotes(query.caseNumber)
  };
};

