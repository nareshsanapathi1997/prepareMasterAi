import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Flame,
  Clock,
  BookOpen,
  ChevronDown,
  Plus,
  PenTool,
  Calendar,
  User,
  Shield,
  LogOut,
  LogIn,
  Home,
} from 'lucide-react';
import { EXAM_PRESETS } from '../data/presets';
import { storage } from '../lib/storage';
import { UserProfile, TabType } from '../types';

interface HeaderProps {
  activeExam: string;
  onSelectExam: (examName: string) => void;
  onOpenScratchpad: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeExam,
  onSelectExam,
  onOpenScratchpad,
  currentUser,
  onOpenAuth,
  onLogout,
  onNavigateHome,
  onNavigateAdmin,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [customExamModal, setCustomExamModal] = useState(false);
  const [customExamInput, setCustomExamInput] = useState('');

  const stats = storage.getStudyStats();
  const currentPreset = EXAM_PRESETS.find((p) => p.name === activeExam);

  const handleCreateCustomExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (customExamInput.trim()) {
      onSelectExam(customExamInput.trim());
      setCustomExamInput('');
      setCustomExamModal(false);
      setDropdownOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onNavigateHome}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                  PrepMaster <span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Exam Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Adaptive Mocks, DILR Matrix, Proctoring & AI Mentors
              </p>
            </div>
          </div>

          {/* Right Controls: Home link, Exam Switcher, Streak, Scratchpad & Auth User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Plan / Access Badge */}
            {currentUser ? (
              <div className="hidden lg:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>Unlimited Pass</span>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('signup')}
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Guest Demo Mode Active - Click to Register for Free Full Unlimited Access"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>Demo Mode</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold underline ml-0.5">Unlock All</span>
              </button>
            )}

            {/* Quick Home Page Button */}
            <button
              onClick={onNavigateHome}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors flex items-center space-x-1.5"
              title="Return to Public Home / Course Tracks"
            >
              <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden md:inline">Home</span>
            </button>

            {/* Active Exam Selector Dropdown */}
            <div className="relative">
              <button
                id="exam-selector-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors"
                title="Change Exam or Target Course"
              >
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="max-w-[110px] sm:max-w-[160px] truncate font-semibold">
                  {activeExam}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Select Exam or Course
                      </p>
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {EXAM_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            onSelectExam(preset.name);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm flex flex-col hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors ${
                            activeExam === preset.name
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-semibold text-indigo-700 dark:text-indigo-300 border-l-2 border-indigo-600'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="font-medium">{preset.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {preset.tagline}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                      <button
                        onClick={() => {
                          setCustomExamModal(true);
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 border border-indigo-200 dark:border-indigo-900 rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Custom Exam / Course</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Daily Streak Counter */}
            <div
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold"
              title={`${currentUser?.streakDays || stats.streak} day study streak! Keep the momentum going.`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span>{currentUser?.streakDays || stats.streak}d</span>
            </div>

            {/* Quick Scratchpad button */}
            <button
              id="header-scratchpad-btn"
              onClick={onOpenScratchpad}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
              title="Open Scratchpad & Formula Notes"
            >
              <PenTool className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span className="hidden lg:inline">Scratchpad</span>
            </button>

            {/* Authentication / User Profile Switcher */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    currentUser.role === 'admin'
                      ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                      : currentUser.role === 'faculty'
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                      : 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold block text-slate-900 dark:text-white truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">{currentUser.email}</span>
                        <span className="mt-1 inline-block px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          Role: {currentUser.role}
                        </span>
                      </div>

                      {currentUser.role === 'admin' && (
                        <button
                          onClick={() => {
                            onNavigateAdmin();
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>Open Admin Control</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onLogout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Exam Modal */}
      {customExamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Add Custom Exam / University Course
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter any competitive exam, university syllabus (e.g. "Data Structures CS301", "Bar Exam", "CFA Level 1"), or certification. The AI engine will dynamically adapt all mock tests, study plans, and topic explanations for it!
            </p>
            <form onSubmit={handleCreateCustomExam}>
              <input
                type="text"
                value={customExamInput}
                onChange={(e) => setCustomExamInput(e.target.value)}
                placeholder="e.g. Chartered Accountant (CA Final) / SAT Math / CFA"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setCustomExamModal(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customExamInput.trim()}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm"
                >
                  Set as Active Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
