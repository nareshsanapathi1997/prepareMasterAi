import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  CheckCircle,
  ArrowRight,
  UserCheck,
  Building,
} from 'lucide-react';
import { ExamCategory, UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'signup';
  currentExam: ExamCategory;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  currentExam,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [targetExam, setTargetExam] = useState<ExamCategory>(currentExam);
  const [targetYear, setTargetYear] = useState(2026);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    if (role === 'admin' && adminPasscode !== 'admin123' && adminPasscode !== 'faculty123') {
      setErrorMsg('Invalid Administrator Passcode. Use "admin123" for Admin Demo privileges.');
      return;
    }

    const effectiveName = name.trim() || (email.split('@')[0] ? email.split('@')[0] : 'Scholar Aspirant');

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: effectiveName,
      email,
      role,
      targetExam,
      targetYear,
      joinedDate: new Date().toISOString().split('T')[0],
      streakDays: 4,
      completedTestsCount: 3,
      accuracyRate: 78.5,
    };

    onLoginSuccess(newUser);
    onClose();
  };

  const handleQuickGuestLogin = (demoRole: UserRole) => {
    const demoUser: UserProfile = {
      id: `usr-demo-${demoRole}`,
      name: demoRole === 'admin' ? 'Prof. K. Subramanian (Admin)' : demoRole === 'faculty' ? 'Dr. Priya Sharma (Mentor)' : 'Aarav Mehta (Aspirant)',
      email: demoRole === 'admin' ? 'admin@exam-hub.edu' : `${demoRole}@exam-hub.edu`,
      role: demoRole,
      targetExam: currentExam,
      targetYear: 2026,
      joinedDate: '2026-01-15',
      streakDays: 14,
      completedTestsCount: 12,
      accuracyRate: 84.2,
    };
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {mode === 'login' ? 'Sign In to Your Workspace' : 'Create Your Aspirant Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Competitive Exam Preparation & Faculty Portal
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-200 dark:bg-slate-800 p-1 mt-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg('');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Mehta"
                    className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Select Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'student'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student Aspirant</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('faculty')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'faculty'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span>Faculty / SME</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    role === 'admin'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              </div>
            </div>

            {/* Admin Passcode requirement if Admin Role */}
            {role === 'admin' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl space-y-1.5">
                <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                  Administrator Passcode <span className="text-[10px] font-normal text-amber-700 dark:text-amber-400">(Use "admin123")</span>
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="admin123"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Target Exam Details for Student */}
            {role === 'student' && mode === 'signup' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Primary Exam
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value as ExamCategory)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="CAT & MBA Entrances">CAT & MBA Entrances</option>
                    <option value="UPSC Civil Services">UPSC Civil Services</option>
                    <option value="GATE (Computer Science / Engg)">GATE CS / Engg</option>
                    <option value="GRE & GMAT (Global Grad)">GRE / GMAT</option>
                    <option value="JEE (Main & Advanced)">JEE Main & Adv</option>
                    <option value="NEET (Medical)">NEET Medical</option>
                    <option value="Banking PO & SSC CGL">Banking PO & SSC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Target Year
                  </label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                    <option value={2028}>2028</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20 cursor-pointer mt-2"
            >
              <span>{mode === 'login' ? 'Sign In to Workspace' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Demo Sandbox Access */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              Or 1-Click Instant Demo Profiles
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickGuestLogin('student')}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Demo Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickGuestLogin('admin')}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
