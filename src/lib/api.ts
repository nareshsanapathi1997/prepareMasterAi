import {
  MockTest,
  TopicExplanation,
  StudyPlan,
  FlashcardDeck,
  DoubtSolution,
  SyllabusResearch,
  AIAnalysisReport,
  EssayEvaluationResult,
  MindMapData,
  DocumentScanResult,
  InterviewPersonaType,
  GeneratedExamPaper,
  AIExamBlueprint,
} from '../types';

export async function generateStudyPlanAPI(params: {
  examName: string;
  targetDate: string;
  dailyHours: number;
  currentLevel: string;
  targetScore: string;
  weakSubjects?: string;
  strongSubjects?: string;
  notes?: string;
}): Promise<StudyPlan> {
  const res = await fetch('/api/ai/study-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate study plan: ${res.statusText}`);
  }

  const json = await res.json();
  return {
    ...json.data,
    createdAt: new Date().toISOString(),
  };
}

export async function explainTopicAPI(params: {
  examName: string;
  subject?: string;
  topic: string;
  subtopic?: string;
  depthLevel?: string;
  learningStyle?: string;
}): Promise<TopicExplanation> {
  const res = await fetch('/api/ai/explain-topic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to explain topic: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function generateMockTestAPI(params: {
  examName: string;
  subject?: string;
  topic?: string;
  numQuestions?: number;
  difficulty?: string;
  questionType?: string;
  customInstructions?: string;
}): Promise<MockTest> {
  const res = await fetch('/api/ai/generate-mock-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate mock test: ${res.statusText}`);
  }

  const json = await res.json();
  return {
    ...json.data,
    id: `test-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

export async function generateCustomExamPaperAPI(blueprint: AIExamBlueprint): Promise<GeneratedExamPaper> {
  const res = await fetch('/api/ai/generate-custom-exam-paper', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blueprint }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate custom exam paper: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function solveDoubtAPI(params: {
  examName: string;
  questionOrDoubt: string;
  topicContext?: string;
  studentAttempt?: string;
}): Promise<DoubtSolution> {
  const res = await fetch('/api/ai/solve-doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to solve doubt: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function generateFlashcardsAPI(params: {
  examName: string;
  subject?: string;
  topic: string;
  cardCount?: number;
}): Promise<FlashcardDeck> {
  const res = await fetch('/api/ai/flashcards', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate flashcards: ${res.statusText}`);
  }

  const json = await res.json();
  return {
    ...json.data,
    id: `deck-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}

export async function researchSyllabusAPI(params: {
  examName: string;
  targetStreamOrTier?: string;
}): Promise<SyllabusResearch> {
  const res = await fetch('/api/ai/syllabus-research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to research syllabus: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function analyzeTestResultsAPI(params: {
  testTitle: string;
  examName: string;
  totalQuestions: number;
  score: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  timeSpentSeconds: number;
  topicBreakdown: any[];
}): Promise<AIAnalysisReport> {
  const res = await fetch('/api/ai/analyze-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to analyze test results: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function explainDifferentlyAPI(params: {
  questionText: string;
  options: string[];
  correctAnswer: string;
  originalExplanation: string;
  style: 'analogy' | 'first-principles' | 'speed-trick' | 'eli5' | 'visual-steps';
}): Promise<{
  styleName: string;
  alternativeExplanation: string;
  keyVisualOrAnalogy: string;
  examDayRuleOfThumb: string;
  goldenRule: string;
}> {
  const res = await fetch('/api/ai/explain-differently', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate explanation: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function questionFollowupAPI(params: {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userMessage: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
}): Promise<string> {
  const res = await fetch('/api/ai/question-followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to answer follow-up: ${res.statusText}`);
  }

  const json = await res.json();
  return json.text;
}

export async function generateSpeedDrillAPI(params: {
  examName: string;
  subject?: string;
  topic?: string;
  drillType?: string;
}): Promise<{
  title: string;
  examName: string;
  targetPaceSecondsPerQuestion: number;
  totalTimeLimitSeconds: number;
  questions: Array<{
    id: number;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    topicTag: string;
    speedShortcut: string;
    explanation: string;
  }>;
}> {
  const res = await fetch('/api/ai/speed-trainer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate speed drill: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function generateAdaptiveQuestionAPI(params: {
  examName: string;
  subject?: string;
  topic?: string;
  currentLevel?: string;
  recentPerformance?: any;
  targetDifficulty?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/adaptive-next-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to fetch adaptive question: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchCurrentAffairsAPI(params: {
  examVertical: string;
  date?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/current-affairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to load current affairs: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function predictRankAPI(params: {
  examName: string;
  rawScore: number;
  maxScore: number;
  accuracyPercent: number;
  timeTakenMinutes: number;
  category?: string;
  historicalAttemptsCount?: number;
}): Promise<any> {
  const res = await fetch('/api/ai/rank-predictor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to predict rank: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function mentorCounsellorAPI(params: {
  examName: string;
  studentProfile?: string;
  userQuery: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; text: string }>;
}): Promise<string> {
  const res = await fetch('/api/ai/mentor-counsellor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to consult mentor: ${res.statusText}`);
  }

  const json = await res.json();
  return json.text;
}

export async function solveMultimodalDoubtAPI(params: {
  examName: string;
  questionText?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<any> {
  const res = await fetch('/api/ai/ocr-doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to solve doubt image: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function evaluateEssayAPI(params: {
  examName: string;
  essayPrompt: string;
  studentAnswer: string;
  wordLimit?: string;
  markingStandard?: string;
}): Promise<EssayEvaluationResult> {
  const res = await fetch('/api/ai/evaluate-essay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to evaluate essay: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchMindMapAPI(params: {
  topic: string;
  examName: string;
}): Promise<MindMapData> {
  const res = await fetch('/api/ai/mindmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to generate mind map: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function conductInterviewTurnAPI(params: {
  examName: string;
  persona: InterviewPersonaType;
  conversationHistory: Array<{ sender: string; text: string }>;
  candidateResponse: string;
  turnCount: number;
}): Promise<{
  nextInterviewerQuestion: string;
  isInterviewComplete: boolean;
  feedback: {
    scoreOutOf10: number;
    strengths: string[];
    weaknesses: string[];
    recommendedBetterAnswer: string;
    fallacyAlert?: string;
  };
}> {
  const res = await fetch('/api/ai/interview-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to process interview turn: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function scanDocumentAPI(params: {
  examName: string;
  documentTitle: string;
  documentText: string;
}): Promise<DocumentScanResult> {
  const res = await fetch('/api/ai/document-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to scan document: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function conductDebateTurnAPI(params: {
  topic: string;
  examName: string;
  conversationHistory: Array<{ speakerName: string; text: string }>;
  userSpeech: string;
}): Promise<{
  userFeedback: {
    clarityScore: number;
    impactScore: number;
    counterArgumentStrength: string;
    proTip: string;
  };
  nextTurns: Array<{
    speakerId: string;
    speakerName: string;
    speakerRole: string;
    text: string;
  }>;
}> {
  const res = await fetch('/api/ai/debate-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to process debate turn: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function analyzeAlgorithmCodeAPI(params: {
  problemTitle: string;
  language: string;
  code: string;
}): Promise<{
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
  gateRelevance: string;
}> {
  const res = await fetch('/api/ai/analyze-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (errData.data) return errData.data;
    throw new Error(errData.error || `Failed to analyze code: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}


