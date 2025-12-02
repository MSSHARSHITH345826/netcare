import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Query, CaseData, B2BCommunication, CareOnNote, DebtPackQuery } from '../types';
import { generateMockQueries, getMockDataForQuery } from '../services/mockDataService';

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
  // Generate mock data from Billing Triage Workbook (BTW) structure
  const [queries] = useState<Query[]>(() => generateMockQueries(50));

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

