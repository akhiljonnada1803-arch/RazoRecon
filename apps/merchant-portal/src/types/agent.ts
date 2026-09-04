export interface ToolExecutionDTO {
  tool: string;
  args: Record<string, any>;
  result: any;
}

export interface AgentQueryRequestDTO {
  question: string;
  max_steps?: number;
}

export interface AgentQueryResponseDTO {
  answer: string;
  trace: ToolExecutionDTO[];
  using_mock: boolean;
}
