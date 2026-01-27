
export type AppTheme = 'light' | 'dark';

export enum DashboardTab {
  TextToImage = 'text-to-image',
  StyleTransform = 'style-transform',
  ImageFusion = 'image-fusion',
  FitCheck = 'fit-check'
}

export interface FitCheckResult {
  score: number;
  colorFeedback: string;
  sizeFeedback: string;
  occasion: string;
  suggestions: string;
}

// Added GenerationLog interface to represent the activity records stored in the database
export interface GenerationLog {
  id: string;
  userId: string;
  featureType: string;
  prompt: string;
  uploadedImageMeta?: {
    name?: string;
    type?: string;
    size?: number;
  }[];
  generatedImageInfo?: {
    resolution: string;
    [key: string]: any;
  };
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  } | any;
}
