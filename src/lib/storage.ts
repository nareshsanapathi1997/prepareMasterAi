import {
  MockTest,
  TestAttempt,
  StudyPlan,
  FlashcardDeck,
  TopicExplanation,
  DoubtSolution,
  SyllabusResearch,
  TaggedError,
  SpeedDrillAttempt,
  CurrentAffairsDigest,
  RankPredictionResult,
  CommunityReview,
  GeneratedExamPaper,
  AIExamAttemptSummary,
} from '../types';
import { SAMPLE_MOCK_TEST, SAMPLE_FLASHCARDS } from '../data/presets';
import { INITIAL_COMMUNITY_REVIEWS } from '../data/communityReviewsData';

const STORAGE_KEYS = {
  ACTIVE_EXAM: 'exam_prep_active_exam',
  SAVED_TESTS: 'exam_prep_saved_tests',
  TEST_ATTEMPTS: 'exam_prep_test_attempts',
  STUDY_PLANS: 'exam_prep_study_plans',
  ACTIVE_PLAN_CHECKS: 'exam_prep_plan_checks',
  SAVED_EXPLANATIONS: 'exam_prep_explanations',
  FLASHCARD_DECKS: 'exam_prep_flashcard_decks',
  SAVED_DOUBTS: 'exam_prep_doubts',
  SAVED_SYLLABUS: 'exam_prep_syllabus',
  STUDY_STREAK: 'exam_prep_study_streak',
  TAGGED_ERRORS: 'exam_prep_tagged_errors',
  SPEED_DRILL_ATTEMPTS: 'exam_prep_speed_drill_attempts',
  CURRENT_AFFAIRS: 'exam_prep_current_affairs',
  RANK_PREDICTIONS: 'exam_prep_rank_predictions',
  COMMUNITY_REVIEWS: 'exam_prep_community_reviews',
  GENERATED_PAPERS: 'exam_prep_generated_papers',
  AI_EXAM_ATTEMPTS: 'exam_prep_ai_exam_attempts',
};

export const storage = {
  getActiveExam(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_EXAM) || 'UPSC Civil Services';
  },

  setActiveExam(examName: string) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EXAM, examName);
  },

  getSavedTests(): MockTest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_TESTS);
      if (!data) return [SAMPLE_MOCK_TEST];
      const parsed = JSON.parse(data);
      return parsed.length > 0 ? parsed : [SAMPLE_MOCK_TEST];
    } catch {
      return [SAMPLE_MOCK_TEST];
    }
  },

  getMockTests(): MockTest[] {
    return storage.getSavedTests();
  },

  saveTest(test: MockTest) {
    const tests = storage.getSavedTests().filter((t) => t.id !== test.id);
    tests.unshift(test);
    localStorage.setItem(STORAGE_KEYS.SAVED_TESTS, JSON.stringify(tests.slice(0, 30)));
  },

  getTestAttempts(): TestAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEST_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.TEST_ATTEMPTS);
  },

  saveTestAttempt(attempt: TestAttempt) {
    const attempts = storage.getTestAttempts();
    attempts.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, JSON.stringify(attempts.slice(0, 50)));
    storage.recordStudyActivity();
  },

  getStudyPlans(): StudyPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_PLANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudyPlan(plan: StudyPlan) {
    const plans = storage.getStudyPlans().filter((p) => p.examOverview.name !== plan.examOverview.name);
    plans.unshift(plan);
    localStorage.setItem(STORAGE_KEYS.STUDY_PLANS, JSON.stringify(plans.slice(0, 10)));
    storage.recordStudyActivity();
  },

  getPlanChecks(): Record<string, boolean> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_CHECKS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  togglePlanCheck(key: string, checked: boolean) {
    const checks = storage.getPlanChecks();
    checks[key] = checked;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_CHECKS, JSON.stringify(checks));
  },

  getFlashcardDecks(): FlashcardDeck[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FLASHCARD_DECKS);
      if (!data) return [SAMPLE_FLASHCARDS];
      const parsed = JSON.parse(data);
      return parsed.length > 0 ? parsed : [SAMPLE_FLASHCARDS];
    } catch {
      return [SAMPLE_FLASHCARDS];
    }
  },

  saveFlashcardDeck(deck: FlashcardDeck) {
    const decks = storage.getFlashcardDecks().filter((d) => d.id !== deck.id);
    decks.unshift(deck);
    localStorage.setItem(STORAGE_KEYS.FLASHCARD_DECKS, JSON.stringify(decks.slice(0, 20)));
    storage.recordStudyActivity();
  },

  getSavedExplanations(): Array<{ topic: string; examName: string; data: TopicExplanation; date: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_EXPLANATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveExplanation(item: { topic: string; examName: string; data: TopicExplanation }) {
    const list = storage.getSavedExplanations().filter((e) => e.topic !== item.topic);
    list.unshift({ ...item, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.SAVED_EXPLANATIONS, JSON.stringify(list.slice(0, 25)));
    storage.recordStudyActivity();
  },

  getSavedDoubts(): Array<{ question: string; examName: string; solution: DoubtSolution; date: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_DOUBTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveDoubt(item: { question: string; examName: string; solution: DoubtSolution }) {
    const list = storage.getSavedDoubts().filter((d) => d.question !== item.question);
    list.unshift({ ...item, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.SAVED_DOUBTS, JSON.stringify(list.slice(0, 25)));
    storage.recordStudyActivity();
  },

  getSavedSyllabus(): Record<string, SyllabusResearch> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_SYLLABUS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveSyllabus(examName: string, research: SyllabusResearch) {
    const map = storage.getSavedSyllabus();
    map[examName] = research;
    localStorage.setItem(STORAGE_KEYS.SAVED_SYLLABUS, JSON.stringify(map));
  },

  getStudyStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_STREAK);
      const stats = data ? JSON.parse(data) : { streak: 1, lastDate: new Date().toDateString(), totalSessions: 1 };
      return stats;
    } catch {
      return { streak: 1, lastDate: new Date().toDateString(), totalSessions: 1 };
    }
  },

  getStreak(): number {
    return storage.getStudyStats().streak || 1;
  },

  getTaggedErrors(): TaggedError[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TAGGED_ERRORS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveTaggedError(error: TaggedError) {
    const list = storage.getTaggedErrors().filter((e) => e.id !== error.id);
    list.unshift(error);
    localStorage.setItem(STORAGE_KEYS.TAGGED_ERRORS, JSON.stringify(list.slice(0, 100)));
    storage.recordStudyActivity();
  },

  resolveTaggedError(errorId: string, resolved: boolean = true) {
    const list = storage.getTaggedErrors().map((e) => (e.id === errorId ? { ...e, resolved } : e));
    localStorage.setItem(STORAGE_KEYS.TAGGED_ERRORS, JSON.stringify(list));
  },

  deleteTaggedError(errorId: string) {
    const list = storage.getTaggedErrors().filter((e) => e.id !== errorId);
    localStorage.setItem(STORAGE_KEYS.TAGGED_ERRORS, JSON.stringify(list));
  },

  getSpeedDrillAttempts(): SpeedDrillAttempt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SPEED_DRILL_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSpeedDrillAttempt(attempt: SpeedDrillAttempt) {
    const list = storage.getSpeedDrillAttempts();
    list.unshift(attempt);
    localStorage.setItem(STORAGE_KEYS.SPEED_DRILL_ATTEMPTS, JSON.stringify(list.slice(0, 30)));
    storage.recordStudyActivity();
  },

  getSavedCurrentAffairs(): Record<string, CurrentAffairsDigest> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_AFFAIRS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveCurrentAffairs(key: string, digest: CurrentAffairsDigest) {
    const map = storage.getSavedCurrentAffairs();
    map[key] = digest;
    localStorage.setItem(STORAGE_KEYS.CURRENT_AFFAIRS, JSON.stringify(map));
  },

  getSavedRankPredictions(): Array<{ examName: string; result: RankPredictionResult; date: string }> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RANK_PREDICTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveRankPrediction(item: { examName: string; result: RankPredictionResult }) {
    const list = storage.getSavedRankPredictions();
    list.unshift({ ...item, date: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.RANK_PREDICTIONS, JSON.stringify(list.slice(0, 20)));
    storage.recordStudyActivity();
  },

  getCommunityReviews(): CommunityReview[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMUNITY_REVIEWS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COMMUNITY_REVIEWS, JSON.stringify(INITIAL_COMMUNITY_REVIEWS));
        return INITIAL_COMMUNITY_REVIEWS;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_COMMUNITY_REVIEWS;
    } catch {
      return INITIAL_COMMUNITY_REVIEWS;
    }
  },

  saveCommunityReview(review: CommunityReview) {
    try {
      const list = storage.getCommunityReviews();
      const filtered = list.filter((r) => r.id !== review.id);
      filtered.unshift(review);
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_REVIEWS, JSON.stringify(filtered.slice(0, 100)));
      storage.recordStudyActivity();
    } catch (e) {
      console.error('Failed to save review', e);
    }
  },

  upvoteCommunityReview(reviewId: string): boolean {
    try {
      const list = storage.getCommunityReviews();
      const target = list.find((r) => r.id === reviewId);
      if (!target) return false;

      if (target.userHelpfulVoted) {
        target.helpfulCount = Math.max(0, target.helpfulCount - 1);
        target.userHelpfulVoted = false;
      } else {
        target.helpfulCount += 1;
        target.userHelpfulVoted = true;
      }
      localStorage.setItem(STORAGE_KEYS.COMMUNITY_REVIEWS, JSON.stringify(list));
      return !!target.userHelpfulVoted;
    } catch {
      return false;
    }
  },

  recordStudyActivity() {
    try {
      const today = new Date().toDateString();
      const current = storage.getStudyStats();
      if (current.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = current.lastDate === yesterday ? current.streak + 1 : 1;
        localStorage.setItem(
          STORAGE_KEYS.STUDY_STREAK,
          JSON.stringify({ streak: newStreak, lastDate: today, totalSessions: current.totalSessions + 1 })
        );
      } else {
        localStorage.setItem(
          STORAGE_KEYS.STUDY_STREAK,
          JSON.stringify({ ...current, totalSessions: current.totalSessions + 1 })
        );
      }
    } catch {
      // ignore
    }
  },

  getGeneratedPapers(): GeneratedExamPaper[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERATED_PAPERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveGeneratedPaper(paper: GeneratedExamPaper) {
    try {
      const current = storage.getGeneratedPapers().filter((p) => p.id !== paper.id);
      current.unshift(paper);
      localStorage.setItem(STORAGE_KEYS.GENERATED_PAPERS, JSON.stringify(current.slice(0, 30)));
    } catch {
      // ignore
    }
  },

  deleteGeneratedPaper(paperId: string) {
    try {
      const current = storage.getGeneratedPapers().filter((p) => p.id !== paperId);
      localStorage.setItem(STORAGE_KEYS.GENERATED_PAPERS, JSON.stringify(current));
    } catch {
      // ignore
    }
  },

  getAIExamAttempts(): AIExamAttemptSummary[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AI_EXAM_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAIExamAttempt(attempt: AIExamAttemptSummary) {
    try {
      const current = storage.getAIExamAttempts();
      current.unshift(attempt);
      localStorage.setItem(STORAGE_KEYS.AI_EXAM_ATTEMPTS, JSON.stringify(current.slice(0, 50)));
      storage.recordStudyActivity();
    } catch {
      // ignore
    }
  },
};
