import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LandingHomePage } from './components/LandingHomePage';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModule } from './components/AdminPanelModule';
import { MockTestList } from './components/MockTestList';
import { MockTestGenerator } from './components/MockTestGenerator';
import { MockTestEngine } from './components/MockTestEngine';
import { MockTestReview } from './components/MockTestReview';
import { ConceptExplainer } from './components/ConceptExplainer';
import { StudyPlanManager } from './components/StudyPlanManager';
import { FlashcardsModule } from './components/FlashcardsModule';
import { DoubtSolverModule } from './components/DoubtSolverModule';
import { SyllabusResearchModule } from './components/SyllabusResearchModule';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AdaptivePracticeArena } from './components/AdaptivePracticeArena';
import { SpeedAccuracyTrainer } from './components/SpeedAccuracyTrainer';
import { ErrorTaxonomyNotebook } from './components/ErrorTaxonomyNotebook';
import { RankPredictorModule } from './components/RankPredictorModule';
import { CurrentAffairsDigestModule } from './components/CurrentAffairsDigestModule';
import { ContentLibraryModule } from './components/ContentLibraryModule';
import { CollegeCounsellorBot } from './components/CollegeCounsellorBot';
import { EssayEvaluationModule } from './components/EssayEvaluationModule';
import { FormulaVaultModule } from './components/FormulaVaultModule';
import { StudyRoomModule } from './components/StudyRoomModule';
import { MindMapModule } from './components/MindMapModule';
import { InterviewSimulatorModule } from './components/InterviewSimulatorModule';
import { DocumentScannerModule } from './components/DocumentScannerModule';
import { DebateArenaModule } from './components/DebateArenaModule';
import { GraphingCalculatorModule } from './components/GraphingCalculatorModule';
import { RetentionMatrixModule } from './components/RetentionMatrixModule';
import { DILRWorkbenchModule } from './components/DILRWorkbenchModule';
import { SpeedReaderModule } from './components/SpeedReaderModule';
import { PodcastStudioModule } from './components/PodcastStudioModule';
import { CodingSandboxModule } from './components/CodingSandboxModule';
import { PeerBattleArenaModule } from './components/PeerBattleArenaModule';
import { OMRGeneratorModule } from './components/OMRGeneratorModule';
import { CommunityReviewsModule } from './components/CommunityReviewsModule';
import { VirtualLabModule } from './components/VirtualLabModule';
import { MasteryTreeModule } from './components/MasteryTreeModule';
import { CollegeCalculatorModule } from './components/CollegeCalculatorModule';
import { LiveCohortMockModule } from './components/LiveCohortMockModule';
import { PDFStudioModule } from './components/PDFStudioModule';
import { AIExamGeneratorModule } from './components/AIExamGeneratorModule';
import { Footer } from './components/Footer';
import { ScratchpadModal } from './components/ScratchpadModal';
import { TabType, MockTest, TestAttempt, UserProfile, ExamCategory } from './types';
import { storage } from './lib/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('landing');
  const [activeExam, setActiveExam] = useState<ExamCategory>('CAT & MBA Entrances');
  const [scratchpadOpen, setScratchpadOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('prep_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

  // Test state
  const [tests, setTests] = useState<MockTest[]>(storage.getMockTests());
  const [attempts, setAttempts] = useState<TestAttempt[]>(storage.getTestAttempts());
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [activeRunningTest, setActiveRunningTest] = useState<MockTest | null>(null);
  const [activeReview, setActiveReview] = useState<{
    test: MockTest;
    attempt: TestAttempt;
  } | null>(null);

  // Context passing for flashcards & generator
  const [prefilledTopic, setPrefilledTopic] = useState<string>('');

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('prep_user_profile', JSON.stringify(user));
    if (user.targetExam) {
      setActiveExam(user.targetExam);
    }
    if (user.role === 'admin') {
      setActiveTab('admin-panel');
    } else {
      setActiveTab('mock-tests');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('prep_user_profile');
    setActiveTab('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthInitialMode(mode);
    setAuthModalOpen(true);
  };

  const handleTestGenerated = (newTest: MockTest) => {
    setTests(storage.getMockTests());
    setGeneratorOpen(false);
    setActiveRunningTest(newTest);
  };

  const handleTestCompleted = (attempt: TestAttempt) => {
    setAttempts(storage.getTestAttempts());
    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        completedTestsCount: currentUser.completedTestsCount + 1,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('prep_user_profile', JSON.stringify(updatedUser));
    }
    if (activeRunningTest) {
      setActiveReview({
        test: activeRunningTest,
        attempt,
      });
      setActiveRunningTest(null);
    }
  };

  const handleStartTest = (test: MockTest) => {
    setActiveReview(null);
    setActiveRunningTest(test);
  };

  const handleViewAttemptReview = (test: MockTest, attempt: TestAttempt) => {
    setActiveReview({ test, attempt });
  };

  const handleGenerateTestForTopic = (topic: string) => {
    setPrefilledTopic(topic);
    setActiveTab('mock-tests');
    setGeneratorOpen(true);
  };

  const handleGenerateFlashcardsForTopic = (topic: string) => {
    setPrefilledTopic(topic);
    setActiveTab('flashcards');
  };

  const unresolvedErrorsCount = storage
    .getTaggedErrors()
    .filter((e) => !e.resolved).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Fullscreen Mock Test Exam Mode */}
      {activeRunningTest ? (
        <MockTestEngine
          test={activeRunningTest}
          onFinishTest={handleTestCompleted}
          onExit={() => setActiveRunningTest(null)}
        />
      ) : (
        <>
          {/* Main App Header */}
          <Header
            activeExam={activeExam}
            onSelectExam={(name) => setActiveExam(name as ExamCategory)}
            onOpenScratchpad={() => setScratchpadOpen(true)}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            onLogout={handleLogout}
            onNavigateHome={() => {
              setActiveReview(null);
              setActiveTab('landing');
            }}
            onNavigateAdmin={() => {
              setActiveReview(null);
              setActiveTab('admin-panel');
            }}
          />

          {/* Navigation Bar */}
          <Navigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveReview(null);
              setActiveTab(tab);
            }}
            mockTestsBadgeCount={tests.length}
            unresolvedErrorsCount={unresolvedErrorsCount}
            userRole={currentUser?.role}
          />

          {/* Main Content Arena */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Active Review Mode if viewing a completed test */}
            {activeReview ? (
              <MockTestReview
                test={activeReview.test}
                attempt={activeReview.attempt}
                onRetakeTest={() => {
                  const testToRun = activeReview.test;
                  setActiveReview(null);
                  setActiveRunningTest(testToRun);
                }}
                onBackToList={() => setActiveReview(null)}
              />
            ) : (
              <>
                {/* Landing Home Page View */}
                {activeTab === 'landing' && (
                  <LandingHomePage
                    onStartLearning={(targetTab = 'mock-tests') => {
                      setActiveReview(null);
                      setActiveTab(targetTab);
                    }}
                    onOpenAuth={handleOpenAuth}
                    onSelectExam={(exam) => setActiveExam(exam)}
                    currentExam={activeExam}
                    isLoggedIn={!!currentUser}
                    userName={currentUser?.name}
                  />
                )}

                {/* Admin & Faculty Control View */}
                {activeTab === 'admin-panel' && (
                  <AdminPanelModule
                    currentUser={currentUser || {
                      id: 'demo-admin',
                      name: 'Prof. K. Subramanian',
                      email: 'admin@exam-hub.edu',
                      role: 'admin',
                      targetExam: activeExam,
                      targetYear: 2026,
                      joinedDate: '2026-01-01',
                      streakDays: 20,
                      completedTestsCount: 0,
                      accuracyRate: 98,
                    }}
                    activeExam={activeExam}
                  />
                )}

                {activeTab === 'ai-exam-generator' && (
                  <AIExamGeneratorModule
                    activeExam={activeExam}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'mock-tests' && (
                  <MockTestList
                    activeExam={activeExam}
                    tests={tests}
                    attempts={attempts}
                    onStartTest={handleStartTest}
                    onOpenGenerator={() => setGeneratorOpen(true)}
                    onViewAttemptReview={handleViewAttemptReview}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'adaptive-practice' && (
                  <AdaptivePracticeArena
                    activeExam={activeExam}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'speed-trainer' && (
                  <SpeedAccuracyTrainer activeExam={activeExam} />
                )}

                {activeTab === 'dilr-workbench' && (
                  <DILRWorkbenchModule />
                )}

                {activeTab === 'speed-reader' && (
                  <SpeedReaderModule />
                )}

                {activeTab === 'podcast-studio' && (
                  <PodcastStudioModule />
                )}

                {activeTab === 'interview-simulator' && (
                  <InterviewSimulatorModule activeExam={activeExam} />
                )}

                {activeTab === 'debate-arena' && (
                  <DebateArenaModule activeExam={activeExam} />
                )}

                {activeTab === 'doc-scanner' && (
                  <DocumentScannerModule activeExam={activeExam} />
                )}

                {activeTab === 'graphing-calc' && (
                  <GraphingCalculatorModule activeExam={activeExam} />
                )}

                {activeTab === 'retention-matrix' && (
                  <RetentionMatrixModule activeExam={activeExam} />
                )}

                {activeTab === 'essay-evaluator' && (
                  <EssayEvaluationModule activeExam={activeExam} />
                )}

                {activeTab === 'formula-vault' && (
                  <FormulaVaultModule activeExam={activeExam} />
                )}

                {activeTab === 'study-room' && (
                  <StudyRoomModule activeExam={activeExam} />
                )}

                {activeTab === 'mind-map' && (
                  <MindMapModule activeExam={activeExam} />
                )}

                {activeTab === 'error-notebook' && (
                  <ErrorTaxonomyNotebook
                    activeExam={activeExam}
                    onNavigateToAdaptive={() => setActiveTab('adaptive-practice')}
                  />
                )}

                {activeTab === 'rank-predictor' && (
                  <RankPredictorModule activeExam={activeExam} />
                )}

                {activeTab === 'current-affairs' && (
                  <CurrentAffairsDigestModule activeExam={activeExam} />
                )}

                {activeTab === 'content-library' && (
                  <ContentLibraryModule activeExam={activeExam} />
                )}

                {activeTab === 'mentor-bot' && (
                  <CollegeCounsellorBot activeExam={activeExam} />
                )}

                {activeTab === 'explainer' && (
                  <ConceptExplainer
                    activeExam={activeExam}
                    onGenerateTestForTopic={handleGenerateTestForTopic}
                    onGenerateFlashcardsForTopic={handleGenerateFlashcardsForTopic}
                  />
                )}

                {activeTab === 'study-plan' && (
                  <StudyPlanManager activeExam={activeExam} />
                )}

                {activeTab === 'flashcards' && (
                  <FlashcardsModule
                    activeExam={activeExam}
                    initialTopic={prefilledTopic}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'doubts' && (
                  <DoubtSolverModule
                    activeExam={activeExam}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'syllabus' && (
                  <SyllabusResearchModule activeExam={activeExam} />
                )}

                {activeTab === 'analytics' && (
                  <AnalyticsDashboard
                    attempts={attempts}
                    tests={tests}
                    onReviewAttempt={handleViewAttemptReview}
                    onClearHistory={() => {
                      storage.clearHistory();
                      setAttempts([]);
                    }}
                  />
                )}

                {activeTab === 'coding-sandbox' && (
                  <CodingSandboxModule
                    activeExam={activeExam}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'peer-battle' && (
                  <PeerBattleArenaModule
                    activeExam={activeExam}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'omr-generator' && (
                  <OMRGeneratorModule activeExam={activeExam} />
                )}

                {activeTab === 'community-reviews' && (
                  <CommunityReviewsModule
                    activeExam={activeExam}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'virtual-lab' && (
                  <VirtualLabModule activeExam={activeExam} />
                )}

                {activeTab === 'mastery-tree' && (
                  <MasteryTreeModule
                    activeExam={activeExam}
                    onNavigateTab={(tab) => setActiveTab(tab as TabType)}
                  />
                )}

                {activeTab === 'college-calculator' && (
                  <CollegeCalculatorModule activeExam={activeExam} />
                )}

                {activeTab === 'live-cohort-mock' && (
                  <LiveCohortMockModule
                    activeExam={activeExam}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}

                {activeTab === 'pdf-studio' && (
                  <PDFStudioModule
                    activeExam={activeExam}
                    isLoggedIn={!!currentUser}
                    onOpenAuth={handleOpenAuth}
                  />
                )}
              </>
            )}
          </main>

          {/* Platform Footer */}
          <Footer
            activeExam={activeExam}
            onSelectExam={(exam) => setActiveExam(exam)}
            onNavigateTab={(tab) => {
              setActiveReview(null);
              setActiveTab(tab);
            }}
            onOpenAuth={handleOpenAuth}
          />

          {/* AI Mock Test Generator Modal */}
          {generatorOpen && (
            <MockTestGenerator
              activeExam={activeExam}
              initialTopic={prefilledTopic}
              onClose={() => {
                setGeneratorOpen(false);
                setPrefilledTopic('');
              }}
              onTestGenerated={handleTestGenerated}
            />
          )}

          {/* Scratchpad Modal */}
          {scratchpadOpen && (
            <ScratchpadModal onClose={() => setScratchpadOpen(false)} />
          )}

          {/* Authentication & Registration Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            initialMode={authInitialMode}
            currentExam={activeExam}
          />
        </>
      )}
    </div>
  );
}
