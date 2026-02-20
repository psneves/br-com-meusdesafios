export interface TrackableLog {
  id: string;
  userId: string;
  userTrackableId: string;
  occurredAt: Date;
  valueNum?: number;
  valueText?: string;
  meta?: LogMeta;
  createdAt: Date;
}

export interface LogMeta {
  source?: "manual" | "import";
  notes?: string;
  // Sleep-specific
  bedtime?: string; // HH:mm format
  durationMin?: number;
  // Diet-specific
  items?: string[];
  checklistMet?: boolean;
  // Activity-specific
  unit?: "km" | "mi" | "min" | "ml" | "L";
  // Physical Exercise modality
  exerciseModality?: "GYM" | "RUN" | "CYCLING" | "SWIM";
}

export interface CreateLogInput {
  userTrackableId: string;
  occurredAt?: Date;
  valueNum?: number;
  valueText?: string;
  meta?: LogMeta;
}
