export type TabType =
  | 'landing'
  | 'ai-exam-generator'
  | 'mock-tests'
  | 'adaptive-practice'
  | 'speed-trainer'
  | 'dilr-workbench'
  | 'speed-reader'
  | 'podcast-studio'
  | 'interview-simulator'
  | 'debate-arena'
  | 'doc-scanner'
  | 'graphing-calc'
  | 'retention-matrix'
  | 'essay-evaluator'
  | 'formula-vault'
  | 'study-room'
  | 'mind-map'
  | 'error-notebook'
  | 'rank-predictor'
  | 'current-affairs'
  | 'content-library'
  | 'mentor-bot'
  | 'explainer'
  | 'study-plan'
  | 'flashcards'
  | 'doubts'
  | 'syllabus'
  | 'analytics'
  | 'coding-sandbox'
  | 'peer-battle'
  | 'omr-generator'
  | 'community-reviews'
  | 'virtual-lab'
  | 'mastery-tree'
  | 'college-calculator'
  | 'live-cohort-mock'
  | 'pdf-studio'
  | 'admin-panel';

export type ExamCategory =
  | 'Army & Defence (NDA, CDS, AFCAT, Agniveer)'
  | 'SSC Exams (CGL, CHSL, MTS, CPO, GD)'
  | 'State PSC & Groups (Group 1, 2, 4, BPSC, UPPSC, TS/APPSC)'
  | 'Railways (RRB NTPC, Group D, ALP)'
  | 'Banking & Insurance (IBPS, SBI, RBI, LIC)'
  | 'Police Services (SI & Constable)'
  | 'Teaching & CTET / NET'
  | 'CAT & MBA Entrances'
  | 'GATE (Computer Science / Engg)'
  | 'GRE & GMAT (Global Grad)'
  | 'UPSC Civil Services'
  | 'Banking PO & SSC CGL'
  | 'JEE (Main & Advanced)'
  | 'NEET (Medical)'
  | 'CLAT & Law Entrances'
  | 'IPMAT & BBA Entrances'
  | 'AWS & Cloud Certification'
  | 'Software Engg Coding & System Design'
  | 'USMLE & Medical Boards'
  | 'Custom Course / Exam';

export type ErrorMistakeType =
  | 'Concept Gap'
  | 'Silly Mistake'
  | 'Timing Pressure'
  | 'Examiner Trap'
  | 'Formula Slip'
  | 'Misread Question';

export interface TaggedError {
  id: string;
  testId?: string;
  testTitle?: string;
  examName: string;
  questionId: number;
  questionText: string;
  options: string[];
  userAnswerIndex: number;
  correctOptionIndex: number;
  explanation: string;
  errorTag: ErrorMistakeType;
  topicTag: string;
  userNotes?: string;
  taggedAt: string;
  resolved: boolean;
}

export interface ExamPreset {
  id: string;
  name: ExamCategory;
  tagline: string;
  defaultSubjects: string[];
  sampleTopics: string[];
  markingScheme: string;
  defaultDurationMinutes: number;
  badgeColor: string;
}

export interface Question {
  id: number;
  questionText: string;
  codeSnippetOrContext?: string;
  options: string[];
  correctOptionIndex: number;
  topicTag: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Exam-Standard' | string;
  detailedExplanation: string;
  whyOptionsAreWrong?: string[];
  examTrickOrShortcut?: string;
  formulaUsed?: string;
}

export interface MockTest {
  id: string;
  testTitle: string;
  examName: string;
  subject: string;
  topic: string;
  difficulty: string;
  recommendedTimeMinutes: number;
  passingScorePercent: number;
  instructions: string[];
  questions: Question[];
  createdAt: string;
  isProctored?: boolean;
}

export interface TestAttempt {
  id: string;
  testId: string;
  testTitle: string;
  examName: string;
  subject: string;
  topic: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  correctCount: number;
  wrongCount: number;
  unattemptedCount: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  userAnswers: Record<number, number>; // questionId -> selectedOptionIndex
  markedForReview: number[];
  taggedErrors?: Record<number, ErrorMistakeType>;
  tabSwitchesCount?: number;
  timestamp: string;
  completedAt?: string;
  aiAnalysis?: AIAnalysisReport;
}

export interface SpeedDrillQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  topicTag: string;
  speedShortcut: string;
  explanation: string;
}

export interface SpeedDrill {
  title: string;
  examName: string;
  targetPaceSecondsPerQuestion: number;
  totalTimeLimitSeconds: number;
  questions: SpeedDrillQuestion[];
}

export interface SpeedDrillAttempt {
  id: string;
  title: string;
  examName: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeTakenSeconds: number;
  accuracyPercent: number;
  avgPaceSecondsPerQ: number;
  completedAt: string;
  userAnswers: Record<number, number>;
}

export interface AdaptiveQuestion {
  id: number;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  difficulty: string;
  topicTag: string;
  detailedExplanation: string;
  whyOptionsAreWrong?: string[];
  shortcutTip?: string;
  targetSolvingTimeSeconds?: number;
}

export interface CurrentAffairsDigest {
  date: string;
  headlineDigest: string;
  articles: Array<{
    category: string;
    title: string;
    coreFacts: string[];
    examSignificance: string;
    keyTerms: string[];
  }>;
  editorialInsight: {
    topic: string;
    theIssue: string;
    prosOrArguments?: string[];
    wayForward: string;
  };
  dailyMCQs: Array<{
    id: number;
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    syllabusTag: string;
  }>;
}

export interface RankPredictionResult {
  predictedPercentileMin: number;
  predictedPercentileMax: number;
  predictedAIRRange: string;
  totalNationalCandidates: string;
  scoreCategoryGrade: string;
  institutePredictions: Array<{
    instituteName: string;
    programName: string;
    admissionChance: string;
    historicCutoffPercentile: string;
    strategicTip: string;
  }>;
  percentileBoosterStrategy: {
    marginalGainImpact: string;
    highestROISection: string;
    actionItems: string[];
  };
}

export interface VerifiedPYQItem {
  id: string;
  examName: string;
  year: number;
  sessionOrPaper: string;
  subject: string;
  topic: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  facultyVerifiedExplanation: string;
  shortcutMethod: string;
  difficulty: string;
  trapWarning: string;
}

export interface AlternativeExplanationResult {
  styleName: string;
  alternativeExplanation: string;
  keyVisualOrAnalogy: string;
  examDayRuleOfThumb: string;
  goldenRule: string;
}

export interface AIAnalysisReport {
  overallVerdict: string;
  readinessPercentileEstimate: string;
  strengthAreas: string[];
  criticalWeaknesses: string[];
  timeManagementAnalysis: string;
  negativeMarkingLossAnalysis: string;
  sevenDayRecoveryRoadmap: Array<{
    day: string;
    actionableGoal: string;
    recommendedResourceOrDrill: string;
  }>;
  mindsetAdvice: string;
}

export interface TopicExplanation {
  title: string;
  summary: string;
  importanceForExam: string;
  coreIntuition: {
    theBigPicture: string;
    realWorldAnalogy: string;
    whyItMatters: string;
  };
  keyConceptsAndRules: Array<{
    name: string;
    explanation: string;
    formulaOrStatement: string;
    keyTakeaway: string;
  }>;
  mnemonicsAndMemoryHacks: Array<{
    ruleName: string;
    mnemonic: string;
    howToRemember: string;
  }>;
  solvedExamExamples: Array<{
    problemStatement: string;
    difficulty: string;
    stepByStepSolution: string[];
    finalAnswer: string;
    shortcutOrExamTrick: string;
  }>;
  commonExaminerTraps: Array<{
    trapDescription: string;
    whyStudentsFail: string;
    howToAvoid: string;
  }>;
  quickSelfCheckQuiz: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
  }>;
  suggestedNextTopics: string[];
}

export interface StudyPlan {
  examOverview: {
    name: string;
    difficultyRating: string;
    estimatedTotalStudyHours: number;
    keySuccessPillars: string[];
    highYieldSubjects: Array<{
      subject: string;
      weightagePercent: number;
      priority: string;
      coreFocus: string;
    }>;
  };
  phases: Array<{
    phaseNumber: number;
    phaseName: string;
    durationWeeks: string;
    primaryGoal: string;
    weeklyMilestones: string[];
    recommendedMockFrequency: string;
  }>;
  dailyRoutineTemplate: Array<{
    timeSlot: string;
    activity: string;
    focusType: string;
    productivityTip: string;
  }>;
  weeklyScheduleSummary: Array<{
    day: string;
    primaryFocus: string;
    practiceQuestionsTarget: number;
    revisionSlot: string;
  }>;
  revisionStrategy: {
    spacedRepetitionRule: string;
    mistakeNotebookStrategy: string;
    finalMonthChecklist: string[];
  };
  expertTips: string[];
  createdAt: string;
}

export interface Flashcard {
  id: number;
  category: string;
  frontPrompt: string;
  backAnswer: string;
  keyMnemonicOrHint: string;
  highYieldImportance: string;
  status?: 'unreviewed' | 'hard' | 'good' | 'easy';
}

export interface FlashcardDeck {
  id: string;
  deckTitle: string;
  topic: string;
  subject: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface DoubtSolution {
  directAnswer: string;
  corePrinciple: string;
  stepByStepWorking: Array<{
    stepNumber: number;
    stepTitle: string;
    calculationOrLogic: string;
  }>;
  studentDiagnosis: {
    likelyMisconception: string;
    howToThinkCorrectly: string;
  };
  proExamShortcut: string;
  formulaCheatSheet: string[];
  similarPracticeQuestions: Array<{
    question: string;
    hint: string;
    answer: string;
  }>;
}

export interface SyllabusResearch {
  examTitle: string;
  conductingBody: string;
  examPattern: {
    mode: string;
    totalMarks: number;
    durationMinutes: number;
    markingScheme: string;
    negativeMarking: string;
    sectionsCount?: number;
  };
  sections: Array<{
    sectionName: string;
    approxQuestions: number;
    approxMarks: number;
    difficultyTrend: string;
    highYieldTopics: Array<{
      topicName: string;
      weightagePercent: number;
      frequency: string;
      strategicAdvice: string;
    }>;
  }>;
  recentTrendChanges: string[];
  recommendedBooksAndResources: Array<{
    subject: string;
    bookOrPlatform: string;
    whyRecommended: string;
  }>;
  fatalMistakesToAvoid: string[];
}

export interface EssayCriterionScore {
  criterion: string;
  scoreAwarded: number;
  maxScore: number;
  critique: string;
  strengths: string[];
  areasToImprove: string[];
}

export interface EssayEvaluationResult {
  overallScore: number;
  maxPossibleScore: number;
  gradePercentage: number;
  readinessBand: string;
  summaryVerdict: string;
  criteriaBreakdown: EssayCriterionScore[];
  keyTermsAndEvidenceMissing: string[];
  grammarAndToneReview: {
    vocabularyRating: string;
    flowAndTransitions: string;
    actionableSuggestions: string[];
  };
  modelAnswerRewrite: string;
}

export interface FormulaCard {
  id: string;
  title: string;
  category: 'Quantitative Aptitude' | 'Physics & Mechanics' | 'Chemistry' | 'Data Interpretation' | 'Computer Science' | 'Law & Constitution' | 'Economics & Finance' | string;
  latexOrFormula: string;
  variablesDefinition: string;
  conditionsOfApplicability: string;
  mnemonicOrMemoryTrick?: string;
  frequentlyTestedTrap?: string;
  examTags: string[];
}

export interface MindMapNode {
  id: string;
  title: string;
  categoryTag?: string;
  importance: 'High-Yield' | 'Medium-Yield' | 'Foundational';
  summary: string;
  keyFormulasOrFacts?: string[];
  commonTrapWarning?: string;
  children?: MindMapNode[];
}

export interface MindMapData {
  topic: string;
  examName: string;
  rootNode: MindMapNode;
}

export interface StudyTask {
  id: string;
  text: string;
  completed: boolean;
  pomodorosEstimated: number;
  pomodorosCompleted: number;
}

export type InterviewPersonaType =
  | 'IIM / MBA Director (Stress & Strategic Depth)'
  | 'UPSC Board Chairperson (Ethics & Policy Governance)'
  | 'Big Tech VP & Staff Engineer (System Design & Logic)'
  | 'Medical Ethics & USMLE Residency Board'
  | 'General Academic Dean & Scholarship Committee';

export interface InterviewMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  feedback?: {
    scoreOutOf10: number;
    strengths: string[];
    weaknesses: string[];
    recommendedBetterAnswer: string;
    fallacyAlert?: string;
  };
}

export interface DocumentScanResult {
  title: string;
  executiveSummary: string;
  highYieldTheoremsAndFormulas: string[];
  keyConceptTakeaways: string[];
  generatedQuestions: Array<{
    id: string;
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }>;
  generatedFlashcards: Array<{
    front: string;
    back: string;
  }>;
}

export interface DebateParticipant {
  id: string;
  name: string;
  role: 'Moderator' | 'Skeptic' | 'Economist' | 'Technologist' | 'Candidate';
  avatarColor: string;
  tagline: string;
}

export interface DebateMessage {
  id: string;
  speakerId: string;
  speakerName: string;
  speakerRole: string;
  text: string;
  timestamp: string;
  isUser: boolean;
  userScoreFeedback?: {
    clarityScore: number;
    impactScore: number;
    counterArgumentStrength: string;
    proTip: string;
  };
}

export interface RetentionTopic {
  id: string;
  topicName: string;
  subject: string;
  lastStudiedDate: string; // YYYY-MM-DD
  revisionCycle: number; // 1 to 5
  predictedRetentionPercent: number;
  urgency: 'Critical' | 'Due Soon' | 'Optimal';
}

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  targetExam: ExamCategory;
  targetYear: number;
  avatarUrl?: string;
  joinedDate: string;
  streakDays: number;
  completedTestsCount: number;
  accuracyRate: number;
}

export interface AdminTelemetry {
  totalRegisteredUsers: number;
  activeTestTakersNow: number;
  totalMocksAttempted: number;
  averageAccuracyRate: number;
  flaggedProctorIncidents: number;
  activeQuestionsInBank: number;
}

export interface ProctorIncident {
  id: string;
  candidateName: string;
  candidateEmail: string;
  examTitle: string;
  timestamp: string;
  violationType: 'Multiple Faces' | 'No Face Detected' | 'Tab Switch / Blur' | 'Audio Anomaly';
  severity: 'Low' | 'Medium' | 'High';
  status: 'Pending Review' | 'Cleared' | 'Sanctioned';
}

export interface SystemBroadcast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'alert' | 'update';
  createdDate: string;
  active: boolean;
}

export interface CommunityReview {
  id: string;
  userName: string;
  userAvatar?: string;
  examCategory: ExamCategory | string;
  targetYear: string;
  scoreOrPercentile?: string;
  verifiedStudent: boolean;
  topperBadge?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  tags: string[];
  helpfulCount: number;
  userHelpfulVoted?: boolean;
  createdAt: string;
  featureRatings?: {
    mockAccuracy: number;
    aiMentorQuality: number;
    speedTrainer: number;
    interactiveWorkbench: number;
  };
}

export interface LiveActivityEvent {
  id: string;
  userName: string;
  location?: string;
  action: string;
  examCategory: string;
  timeAgo: string;
  avatarColor: string;
  badge?: string;
}

export type ExamPaperMode =
  | 'Full Mock Test'
  | 'Sectional Drill'
  | 'Chapter Topic Mastery'
  | 'Previous Year Replica (PYQ)'
  | 'Speed & Rapid Fire Booster';

export interface AIExamBlueprint {
  courseCategory: string;
  subExam: string;
  paperMode: ExamPaperMode;
  targetSubject?: string;
  targetTopic?: string;
  difficulty: 'Foundation / Easy' | 'Exam-Standard' | 'Challenging / Tricky' | 'All-India Topper Level';
  numQuestions: number;
  timeLimitMinutes: number;
  positiveMarks: number;
  negativeMarks: number;
  language: 'English' | 'Bilingual (Hindi + English)';
  focusAreas?: string;
  includeStepByStepProofs: boolean;
  includeWhyWrongAnalysis: boolean;
  includeShortcutTricks: boolean;
}

export interface GeneratedExamPaper {
  id: string;
  title: string;
  courseCategory: string;
  subExam: string;
  paperMode: ExamPaperMode;
  difficulty: string;
  sections: Array<{
    name: string;
    questionCount: number;
    positiveMarks: number;
    negativeMarks: number;
  }>;
  totalMarks: number;
  timeLimitMinutes: number;
  instructions: string[];
  questions: Question[];
  generatedAt: string;
  aiModelUsed: string;
  blueprint: AIExamBlueprint;
}

export interface AIExamAttemptSummary {
  paperId: string;
  paperTitle: string;
  courseCategory: string;
  subExam: string;
  attemptedAt: string;
  timeSpentSeconds: number;
  totalQuestions: number;
  attemptedQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  rawScore: number;
  maxScore: number;
  percentage: number;
  accuracyRate: number;
  estimatedAllIndiaPercentile: number;
  estimatedAIR: number;
  userAnswers: Record<number, number>; // questionId -> optionIndex
  questionTimeSeconds: Record<number, number>;
  sectionScores: Record<string, { attempted: number; correct: number; wrong: number; score: number }>;
}



