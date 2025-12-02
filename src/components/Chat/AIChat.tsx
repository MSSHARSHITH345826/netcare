import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as AIIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useQuery } from '../../contexts/QueryContext';
import { generateChatResponse } from '../../services/azureOpenAIService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  caseId?: string;
  queryType?: string;
}

const AIChat: React.FC<AIChatProps> = ({ caseId, queryType }) => {
  const { selectedQuery, caseData, b2bCommunications, careOnNotes } = useQuery();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: caseId 
        ? `Hi! I'm your Netcare assistant for case ${caseId}. I can help with ${queryType || 'query'} questions. What do you need?`
        : 'Hi! I\'m your Netcare assistant. How can I help?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const callAzureOpenAI = async (userMessage: string): Promise<string> => {
    // Build context from case data
    const systemContext = buildSystemContext();
    
    // Prepare message history (last 5 messages)
    const messageHistory = messages
      .slice(-5)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
    
    // Use the Azure OpenAI service
    try {
      const response = await generateChatResponse(
        [
          ...messageHistory,
          { role: 'user' as const, content: userMessage }
        ],
        systemContext
      );
      return response;
    } catch (error) {
      console.error('Error calling Azure OpenAI:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const buildSystemContext = (): string => {
    // Load agent outputs for context
    const outputsKey = `agent_outputs_${selectedQuery?.id || 'default'}`;
    const agentOutputs = JSON.parse(localStorage.getItem(outputsKey) || '{}');
    const agentOutputsText = Object.entries(agentOutputs)
      .filter(([key]) => ['QueryDetector', 'LevelOfCareResolver', 'ShortPaymentAnalyzer', 'BilledDataExtractor', 'B2BCommunicationMonitor', 'DiscrepancyAnalyzer', 'ApprovedDatesRetriever', 'ClinicalDataAgent', 'ResponseHandler', 'QueryClosureAgent', 'ResubmissionAgent', 'ManagementReportingAgent'].includes(key))
      .map(([agent, output]) => `${agent}: ${output}`)
      .join('\n');

    // Build comprehensive case context from extracted info
    let caseContext = `=== CASE INFORMATION ===
Case Number: ${selectedQuery?.caseNumber || caseId || 'N/A'}
Query Type: ${selectedQuery?.queryType || queryType || 'Level of Care'}
Query Amount: R ${selectedQuery?.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || 'N/A'}
Medical Aid: ${selectedQuery?.medicalAid || 'N/A'}
Hospital: ${selectedQuery?.hospital || 'N/A'}
Status: ${selectedQuery?.status || 'N/A'}

`;

    if (caseData) {
      caseContext += `=== PATIENT INFORMATION ===
Patient Name: ${caseData.patientName} ${caseData.patientSurname}
Date of Birth: ${caseData.dateOfBirth}
Member Number: ${caseData.memberNumber}
Admission Date: ${caseData.admissionDate}
Discharge Date: ${caseData.dischargeDate}
Outstanding Balance: R ${caseData.outstandingBalance?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || 'N/A'}
Short Payment Reason: ${caseData.shortPaymentReason || 'N/A'}
Level of Care Billed: ${caseData.levelOfCareBilled || 'N/A'} (Code: ${caseData.levelOfCareBilledCode || 'N/A'})

`;
    }

    if (b2bCommunications && b2bCommunications.length > 0) {
      caseContext += `=== B2B COMMUNICATION HISTORY ===
${b2bCommunications.map((comm, idx) => 
  `${idx + 1}. ${comm.type.toUpperCase()} - ${new Date(comm.timestamp).toLocaleDateString()}: ${comm.message}${comm.authNumber ? ` (Auth: ${comm.authNumber})` : ''}${comm.status ? ` [Status: ${comm.status}]` : ''}`
).join('\n')}

`;
    }

    if (careOnNotes && careOnNotes.length > 0) {
      caseContext += `=== CAREOON CLINICAL NOTES ===
${careOnNotes.map((note, idx) => 
  `${idx + 1}. ${note.date} ${note.time} (${note.author}): ${note.note}`
).join('\n')}

`;
    }

    if (Object.keys(agentOutputs).length > 0) {
      caseContext += `=== AGENT OUTPUTS FROM ORCHESTRATION ===
${agentOutputsText}

`;
    }

    caseContext += `You are a helpful AI assistant for Netcare's Query Resolution system. You have access to all the extracted case information, B2B communications, clinical notes, and agent outputs shown in the "Extracted Info & Summary" tab.

Provide accurate, context-aware responses based on the case data above. Reference specific details like patient names, dates, amounts, and agent outputs when answering questions. Keep responses concise but informative.`;

    return caseContext;
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('workflow') || lowerMessage.includes('step')) {
      return `The workflow has 12 agents that work together to resolve queries. They detect queries, analyze data, retrieve information, and close queries automatically.`;
    } else if (lowerMessage.includes('agent')) {
      return `There are 12 AI agents working on this case. Most are fully autonomous. Ask about a specific agent for details.`;
    } else if (lowerMessage.includes('status') || lowerMessage.includes('progress')) {
      return `Case ${caseId || selectedQuery?.caseNumber || 'N/A'} status: ${selectedQuery?.status || 'N/A'}. I can check workflow progress or agent status.`;
    } else if (lowerMessage.includes('patient') && caseData) {
      return `Patient: ${caseData.patientName} ${caseData.patientSurname}\nMember Number: ${caseData.memberNumber}\nAdmission: ${caseData.admissionDate} to ${caseData.dischargeDate}\nOutstanding: R ${caseData.outstandingBalance?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || 'N/A'}`;
    } else if (lowerMessage.includes('b2b') && b2bCommunications && b2bCommunications.length > 0) {
      return `B2B Communications: ${b2bCommunications.length} messages found. Latest: ${b2bCommunications[b2bCommunications.length - 1].message}`;
    } else if (lowerMessage.includes('clinical') || lowerMessage.includes('careon') && careOnNotes && careOnNotes.length > 0) {
      return `CareOn Notes: ${careOnNotes.length} notes found. Latest: ${careOnNotes[careOnNotes.length - 1].note.substring(0, 100)}...`;
    } else if (lowerMessage.includes('help')) {
      return `I can help with:\n- Case information\n- Patient details\n- B2B communications\n- Clinical notes\n- Workflow steps\n- Agent details\n- Query status\n\nWhat do you need?`;
    } else if (lowerMessage.includes('case')) {
      return `Case: ${caseId || selectedQuery?.caseNumber || 'N/A'}\nType: ${queryType || 'N/A'}\nAmount: R ${selectedQuery?.queryAmount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) || 'N/A'}\nStatus: ${selectedQuery?.status || 'N/A'}`;
    } else {
      return `I can help with case info, patient details, B2B communications, clinical notes, workflow steps, or agent details. What do you need?`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await callAzureOpenAI(currentInput);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {(!process.env.REACT_APP_AZURE_OPENAI_KEY || process.env.REACT_APP_AZURE_OPENAI_KEY === "") && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Azure OpenAI not configured. Using fallback responses. Configure REACT_APP_AZURE_OPENAI_KEY environment variable for full AI capabilities.
        </Alert>
      )}
      
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #e0e0e0' }}>
          <AIIcon sx={{ color: '#1976d2', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            AI Assistant
          </Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              {message.role === 'assistant' && (
                <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                  <AIIcon />
                </Avatar>
              )}
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: message.role === 'user' ? '#1976d2' : '#f5f5f5',
                  color: message.role === 'user' ? 'white' : 'inherit'
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.7,
                    fontSize: '0.7rem'
                  }}
                >
                  {formatTime(message.timestamp)}
                </Typography>
              </Box>
              {message.role === 'user' && (
                <Avatar sx={{ bgcolor: '#9e9e9e', ml: 1 }}>
                  <PersonIcon />
                </Avatar>
              )}
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 1 }}>
                <AIIcon />
              </Avatar>
              <Box sx={{ flex: 1, maxWidth: '70%' }}>
                <LinearProgress sx={{ borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  AI is thinking...
                </Typography>
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask me anything about the case or workflow..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default AIChat;
