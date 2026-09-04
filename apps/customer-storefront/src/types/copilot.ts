export interface CopilotMessageDTO {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  trace?: Array<{
    tool: string;
    args: Record<string, any>;
    result: any;
  }>;
  citations?: Array<{
    doc_id: string;
    title: string;
  }>;
  isStreaming?: boolean;
}

export interface CopilotQueryRequestDTO {
  messages: Array<{
    role: string;
    content: string;
  }>;
  stream?: boolean;
}

export interface CopilotQueryResponseDTO {
  answer: string;
  trace: Array<{
    tool: string;
    args: Record<string, any>;
    result: any;
  }>;
  citations: Array<{
    doc_id: string;
    title: string;
  }>;
  suggested_followups: string[];
  using_mock: boolean;
}
