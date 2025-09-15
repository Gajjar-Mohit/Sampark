export interface IMPSState {
  transactionId: string;
  correlationId?: string;
  currentStep: string;
  previousStep: string;
  stepSequence: number;
  data: any;
  processingHistory?: ProcessingHistorry[];
  processor: string;
}
export interface ProcessingHistorry {
  step: string;
  timestamp: string;
  processor: string;
}

