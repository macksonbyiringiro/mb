export enum AppScreen {
  Home = 'home',
  Form = 'form',
  Preview = 'preview',
  Introduction = 'introduction',
  Interview = 'interview',
  Results = 'results',
}

export enum Language {
  EN = 'en-US',
  RW = 'rw-RW',
}

export enum InterviewPurpose {
  JobInterview = 'Job Interview',
  DailyAssessment = 'Daily Employee Assessment',
  TrainingEvaluation = 'Training Evaluation',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export enum TextSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

export interface Settings {
  volume: number;
  theme: Theme;
  textSize: TextSize;
}

export interface UserInfo {
  fullName: string;
  companyName: string;
  position: string;
  companyWebsite: string;
  purpose: InterviewPurpose;
  language: Language;
}

export interface InterviewQuestion {
  id: number;
  question: string;
}

export interface InterviewAnswer {
  questionId: number;
  question: string;
  answer: string;
  markedForReview?: boolean;
}

export interface EvaluationResult {
  overallScore: number;
  decision: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

// Speech Recognition API Types for browser compatibility
// These interfaces are based on the Web Speech API specification.

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: (event: Event) => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}