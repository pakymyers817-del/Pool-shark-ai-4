export interface Coordinates {
  x: number;
  y: number;
}

export interface ShotAnalysis {
  recommendedShot: string;
  reasoning: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  cueBallPosition?: Coordinates;
  targetBallPosition?: Coordinates;
  targetPocketPosition?: Coordinates;
  confidenceScore: number;
}

export type PlayerTarget = 'solids' | 'stripes';

export interface AppState {
  file: File | null;
  imagePreview: string | null;
  isAnalyzing: boolean;
  result: ShotAnalysis | null;
  error: string | null;
  showFeedback: boolean;
  playerTarget: PlayerTarget | null;
}
