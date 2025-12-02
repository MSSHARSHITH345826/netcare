import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Query, CaseData, B2BCommunication, CareOnNote, DebtPackQuery } from '../types';

interface QueryContextType {
  queries: Query[];
  selectedQuery: Query | null;
  caseData: CaseData | null;
  b2bCommunications: B2BCommunication[];
  careOnNotes: CareOnNote[];
  debtPackQuery: DebtPackQuery | null;
  setSelectedQuery: (query: Query | null) => void;
  setCaseData: (data: CaseData | null) => void;
  setB2BCommunications: (comms: B2BCommunication[]) => void;
  setCareOnNotes: (notes: CareOnNote[]) => void;
  setDebtPackQuery: (query: DebtPackQuery | null) => void;
  updateQueryStatus: (queryId: string, status: Query['status']) => void;
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQuery must be used within QueryProvider');
  }
  return context;
};

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  // Sample data from Billing Triage Workbook (BTW) - 25 November 2025
  const [queries] = useState<Query[]>([
    {
      id: '1',
      caseNumber: '123456789',
      queryType: 'Level of Care',
      queryAmount: 99148.50,
      medicalAid: 'GEMS',
      hospital: 'Netcare Milpark Hospital',
      status: 'open',
      createdAt: '2025-11-25T08:00:00Z'
    },
    {
      id: '2',
      caseNumber: '987654321',
      queryType: 'No Authorization',
      queryAmount: 45000.00,
      medicalAid: 'Discovery Health',
      hospital: 'Netcare Sunninghill Hospital',
      status: 'in_progress',
      createdAt: '2025-11-25T10:30:00Z'
    },
    {
      id: '3',
      caseNumber: '456789123',
      queryType: 'High-Cost Medication',
      queryAmount: 125000.00,
      medicalAid: 'Bonitas Medical Fund',
      hospital: 'Netcare Waterfall City Hospital',
      status: 'open',
      createdAt: '2025-11-25T09:15:00Z'
    },
    {
      id: '4',
      caseNumber: '789123456',
      queryType: 'Private Portion',
      queryAmount: 32000.00,
      medicalAid: 'MedScheme',
      hospital: 'Netcare Alberton Hospital',
      status: 'in_progress',
      createdAt: '2025-11-25T14:20:00Z'
    },
    {
      id: '5',
      caseNumber: '321654987',
      queryType: 'Level of Care',
      queryAmount: 75000.00,
      medicalAid: 'GEMS',
      hospital: 'Netcare Pretoria East Hospital',
      status: 'resolved',
      createdAt: '2025-11-24T11:00:00Z'
    },
    {
      id: '6',
      caseNumber: '654987321',
      queryType: 'No Authorization',
      queryAmount: 28000.00,
      medicalAid: 'Discovery Health',
      hospital: 'Netcare Rosebank Hospital',
      status: 'open',
      createdAt: '2025-11-25T16:45:00Z'
    },
    {
      id: '7',
      caseNumber: '112233445',
      queryType: 'Level of Care',
      queryAmount: 156789.25,
      medicalAid: 'Momentum Health',
      hospital: 'Netcare Unitas Hospital',
      status: 'open',
      createdAt: '2025-11-25T07:30:00Z'
    },
    {
      id: '8',
      caseNumber: '556677889',
      queryType: 'High-Cost Medication',
      queryAmount: 89000.00,
      medicalAid: 'Fedhealth',
      hospital: 'Netcare Linksfield Hospital',
      status: 'in_progress',
      createdAt: '2025-11-25T12:15:00Z'
    },
    {
      id: '9',
      caseNumber: '998877665',
      queryType: 'Private Portion',
      queryAmount: 18500.00,
      medicalAid: 'Bestmed',
      hospital: 'Netcare Pinehaven Hospital',
      status: 'open',
      createdAt: '2025-11-25T15:00:00Z'
    },
    {
      id: '10',
      caseNumber: '223344556',
      queryType: 'No Authorization',
      queryAmount: 67000.00,
      medicalAid: 'Medihelp',
      hospital: 'Netcare Krugersdorp Hospital',
      status: 'in_progress',
      createdAt: '2025-11-25T13:45:00Z'
    },
    {
      id: '11',
      caseNumber: '334455667',
      queryType: 'Level of Care',
      queryAmount: 134567.80,
      medicalAid: 'GEMS',
      hospital: 'Netcare Olivedale Hospital',
      status: 'open',
      createdAt: '2025-11-25T09:20:00Z'
    },
    {
      id: '12',
      caseNumber: '445566778',
      queryType: 'High-Cost Medication',
      queryAmount: 98000.00,
      medicalAid: 'Discovery Health',
      hospital: 'Netcare Park Lane Hospital',
      status: 'resolved',
      createdAt: '2025-11-24T10:30:00Z'
    },
    {
      id: '13',
      caseNumber: '667788990',
      queryType: 'Private Portion',
      queryAmount: 24500.00,
      medicalAid: 'Bonitas Medical Fund',
      hospital: 'Netcare Ferncrest Hospital',
      status: 'open',
      createdAt: '2025-11-25T11:10:00Z'
    },
    {
      id: '14',
      caseNumber: '778899001',
      queryType: 'No Authorization',
      queryAmount: 52000.00,
      medicalAid: 'Momentum Health',
      hospital: 'Netcare Milpark Hospital',
      status: 'in_progress',
      createdAt: '2025-11-25T14:30:00Z'
    },
    {
      id: '15',
      caseNumber: '889900112',
      queryType: 'Level of Care',
      queryAmount: 178900.50,
      medicalAid: 'Fedhealth',
      hospital: 'Netcare Waterfall City Hospital',
      status: 'open',
      createdAt: '2025-11-25T08:45:00Z'
    }
  ]);

  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [b2bCommunications, setB2BCommunications] = useState<B2BCommunication[]>([]);
  const [careOnNotes, setCareOnNotes] = useState<CareOnNote[]>([]);
  const [debtPackQuery, setDebtPackQuery] = useState<DebtPackQuery | null>(null);

  const updateQueryStatus = (queryId: string, status: Query['status']) => {
    // In a real app, this would update the backend
    console.log(`Updating query ${queryId} to status ${status}`);
  };

  return (
    <QueryContext.Provider
      value={{
        queries,
        selectedQuery,
        caseData,
        b2bCommunications,
        careOnNotes,
        debtPackQuery,
        setSelectedQuery,
        setCaseData,
        setB2BCommunications,
        setCareOnNotes,
        setDebtPackQuery,
        updateQueryStatus
      }}
    >
      {children}
    </QueryContext.Provider>
  );
};

