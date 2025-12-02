# Netcare Level of Care EQuery Resolution Demo

A React-based demonstration application showcasing an agentic system for managing and resolving Level of Care billing queries. This application demonstrates the end-to-end workflow from query identification to resolution across multiple integrated systems.

## Overview

This demo application simulates the complex workflow involved in resolving Level of Care billing queries, including:

- **Billing Triage Workbook**: Daily triage and filtering of outstanding queries
- **SAP Integration**: Case investigation across Scratchpad, Case Overview, and Auth Screen
- **B2B Communication**: Real-time authorization tracking and management
- **CareOn Clinical Data**: Clinical notes retrieval and submission
- **DebtPack**: Query status management and resolution

## Features

### Agentic Capabilities

- **Automated Data Extraction**: System automatically extracts case information, billing details, and authorization data
- **Discrepancy Detection**: Intelligent detection of mismatches between billed and approved services
- **Workflow Orchestration**: Guided step-by-step workflow with automatic navigation
- **Smart Suggestions**: Pre-filled notes and outcomes based on query context
- **Real-time Updates**: B2B communication tracking with automatic status updates

### Key Workflows

1. **Query Identification**: Filter and identify Level of Care queries from billing triage workbook
2. **Case Investigation**: Navigate through SAP systems to review short payment reasons
3. **Authorization Management**: Review B2B communications, attach authorizations, and request confirmations
4. **Clinical Data Integration**: Retrieve and submit clinical notes to support appeals
5. **Query Resolution**: Update query status, select outcomes, and close queries in DebtPack

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd netcare
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
netcare/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   ├── contexts/
│   │   └── QueryContext.tsx
│   ├── pages/
│   │   ├── WorkflowOrchestration.tsx
│   │   ├── BillingTriageWorkbook.tsx
│   │   ├── SAPScratchpad.tsx
│   │   ├── SAPCaseOverview.tsx
│   │   ├── SAPAuthScreen.tsx
│   │   ├── CareOnClinicalData.tsx
│   │   └── DebtPack.tsx
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── README.md
```

## Sample Data

The application uses hardcoded sample data for demonstration purposes:

- **Case Number**: 123456789
- **Query Amount**: R99,148.50
- **Medical Aid**: GEMS
- **Level of Care Code**: 58002 (Neonatal ICU)
- **Query Type**: Level of Care

## Usage

### Workflow Orchestration

Start at the main workflow orchestration page (`/workflow`) to see the complete end-to-end process with step-by-step guidance.

### Individual Pages

Navigate through individual pages using the sidebar:

1. **Billing Triage Workbook**: Filter queries by amount and select cases to investigate
2. **SAP Scratchpad**: Enter case number and review short payment information
3. **SAP Case Overview**: Review billed Level of Care services
4. **SAP Auth Screen**: Manage B2B communications and authorizations
5. **CareOn Clinical Data**: Review and send clinical notes
6. **DebtPack**: Update query status and close queries

## Technologies Used

- **React 19**: UI framework
- **TypeScript**: Type safety
- **Material-UI (MUI)**: Component library
- **React Router**: Navigation
- **TanStack Query**: Data fetching and state management

## Demo Scenarios

### Scenario 1: No Authorization Query
1. Start at Billing Triage Workbook
2. Identify "No Authorization" query
3. Navigate to SAP Scratchpad
4. Review case and identify missing authorization
5. Search and attach electronic authorization
6. Send confirmation update
7. Update DebtPack query status

### Scenario 2: Level of Care Discrepancy
1. Start at Billing Triage Workbook
2. Identify "Level of Care" query
3. Review short payment reason in SAP
4. Check B2B authorization (only 1 day approved vs 15 billed)
5. Request confirmation update
6. Review funder response (partial approval)
7. Retrieve clinical data from CareOn
8. Send clinical data to funder
9. Escalate in DebtPack with follow-up

## Notes

- This is a demonstration application with hardcoded data
- All system integrations are simulated
- The application demonstrates UI/UX patterns and workflow orchestration
- In a production environment, this would connect to real SAP, CareOn, and DebtPack systems

## License

This is a demonstration application for vendor software evaluation purposes.
