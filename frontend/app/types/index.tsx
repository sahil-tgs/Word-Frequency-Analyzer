export interface WordFrequency {
    word: string;
    frequency: number;
  }
  
  export interface AnalyzeResponse {
    success: boolean;
    data: WordFrequency[];
    error?: string;
  }