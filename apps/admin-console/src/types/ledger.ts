export interface PnLSummaryDTO {
  revenue: number;
  cogs: number;
  gross_profit: number;
  operating_expense: number;
  operating_income: number;
}

export interface IncomeStatementSectionDTO {
  section: string;
  amount: number;
}

export interface IncomeStatementResponseDTO {
  summary: PnLSummaryDTO;
  sections: IncomeStatementSectionDTO[];
  revenue_by_channel: Record<string, number>;
  available_months: string[];
}
