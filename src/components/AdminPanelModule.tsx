import React, { useState } from 'react';
import {
  Shield,
  Users,
  Database,
  AlertTriangle,
  Radio,
  Plus,
  Trash2,
  CheckCircle,
  FileCheck,
  Search,
  Eye,
  Send,
  Sparkles,
  BarChart3,
  Lock,
  Layers,
  Settings,
  RefreshCw,
} from 'lucide-react';
import {
  ExamCategory,
  MockTest,
  UserProfile,
  AdminTelemetry,
  ProctorIncident,
  SystemBroadcast,
} from '../types';

interface AdminPanelModuleProps {
  currentUser: UserProfile;
  activeExam: ExamCategory;
}

const INITIAL_TELEMETRY: AdminTelemetry = {
  totalRegisteredUsers: 45820,
  activeTestTakersNow: 1420,
  totalMocksAttempted: 198450,
  averageAccuracyRate: 74.8,
  flaggedProctorIncidents: 12,
  activeQuestionsInBank: 124800,
};

const SAMPLE_INCIDENTS: ProctorIncident[] = [
  {
    id: 'inc-101',
    candidateName: 'Rahul Verma',
    candidateEmail: 'rahul.v@example.com',
    examTitle: 'CAT All-India Proctored Mock #4',
    timestamp: '10 mins ago',
    violationType: 'Tab Switch / Blur',
    severity: 'Medium',
    status: 'Pending Review',
  },
  {
    id: 'inc-102',
    candidateName: 'Deepa Krishnan',
    candidateEmail: 'deepa.k@example.com',
    examTitle: 'GATE CS Full-Length National Simulation',
    timestamp: '25 mins ago',
    violationType: 'Multiple Faces',
    severity: 'High',
    status: 'Pending Review',
  },
  {
    id: 'inc-103',
    candidateName: 'Tanmay Bhattacharya',
    candidateEmail: 'tanmay.b@example.com',
    examTitle: 'UPSC Prelims GS-1 Full-Length Sprint',
    timestamp: '1 hour ago',
    violationType: 'Audio Anomaly',
    severity: 'Low',
    status: 'Cleared',
  },
];

export const AdminPanelModule: React.FC<AdminPanelModuleProps> = ({
  currentUser,
  activeExam,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'proctor-audit' | 'test-builder' | 'broadcasts'>('overview');
  const [telemetry, setTelemetry] = useState<AdminTelemetry>(INITIAL_TELEMETRY);
  const [incidents, setIncidents] = useState<ProctorIncident[]>(SAMPLE_INCIDENTS);
  const [broadcasts, setBroadcasts] = useState<SystemBroadcast[]>([
    {
      id: 'bc-1',
      title: 'Scheduled Maintenance',
      message: 'Platform database indexing scheduled for Sunday 02:00 AM UTC. Mock tests will remain uninterrupted.',
      type: 'info',
      createdDate: '2026-08-16',
      active: true,
    },
    {
      id: 'bc-2',
      title: 'New CAT 2026 DILR Matrix Sets Released',
      message: '5 new 4-way Venn and Knights & Knaves problem sets added with AI step deduction guides.',
      type: 'update',
      createdDate: '2026-08-15',
      active: true,
    },
  ]);

  // Test Builder Form State
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestExam, setNewTestExam] = useState<ExamCategory>(activeExam);
  const [newTestDuration, setNewTestDuration] = useState(120);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [createdQuestions, setCreatedQuestions] = useState<any[]>([]);
  const [testSaveSuccess, setTestSaveSuccess] = useState(false);

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'alert' | 'update'>('info');

  const handleResolveIncident = (id: string, newStatus: 'Cleared' | 'Sanctioned') => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: newStatus } : inc))
    );
  };

  const handleAddQuestionToBuilder = () => {
    if (!newQuestionText.trim() || newOptions.some((o) => !o.trim())) return;

    const q = {
      id: Date.now(),
      question: newQuestionText,
      options: [...newOptions],
      correctAnswer: correctIdx,
      explanation: newExplanation || 'Direct deduction according to official examination syllabus standards.',
    };

    setCreatedQuestions((prev) => [...prev, q]);
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');
  };

  const handlePublishTest = () => {
    if (!newTestTitle.trim() || createdQuestions.length === 0) return;
    setTestSaveSuccess(true);
    setTelemetry((prev) => ({
      ...prev,
      activeQuestionsInBank: prev.activeQuestionsInBank + createdQuestions.length,
    }));
    setTimeout(() => {
      setNewTestTitle('');
      setCreatedQuestions([]);
      setTestSaveSuccess(false);
    }, 2000);
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    const bc: SystemBroadcast = {
      id: `bc-${Date.now()}`,
      title: broadcastTitle,
      message: broadcastMsg,
      type: broadcastType,
      createdDate: new Date().toISOString().split('T')[0],
      active: true,
    };

    setBroadcasts((prev) => [bc, ...prev]);
    setBroadcastTitle('');
    setBroadcastMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold">Faculty & Platform Administration Control</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Authorized: {currentUser.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cohort telemetrics, automated proctoring violation audits, and centralized test paper provisioning.
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveAdminTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'overview'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('proctor-audit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeAdminTab === 'proctor-audit'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Proctor Audit</span>
            {incidents.filter((i) => i.status === 'Pending Review').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('test-builder')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'test-builder'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Test & Question Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveAdminTab('broadcasts')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeAdminTab === 'broadcasts'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Broadcasts
          </button>
        </div>
      </div>

      {/* Overview & Live Telemetrics */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Enrolled Aspirants</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {telemetry.totalRegisteredUsers.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                  <span>+12.4% this month</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Test Takers (Live)</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {telemetry.activeTestTakersNow.toLocaleString()}
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-1 mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-time connected slots</span>
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Question Repository</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {telemetry.activeQuestionsInBank.toLocaleString()}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">Across 13 Competitive Tracks</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions & Syllabus Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-rose-500" />
                <span>Track Question Bank Distribution</span>
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'CAT & MBA (DILR, VARC, Quant)', count: 28400, percent: 85 },
                  { name: 'UPSC Civil Services (GS-1 to GS-4)', count: 34100, percent: 92 },
                  { name: 'GATE Computer Science & Engg', count: 24500, percent: 78 },
                  { name: 'JEE & NEET Science Vault', count: 22800, percent: 74 },
                  { name: 'GRE / GMAT Verbal & Quant', count: 15000, percent: 68 },
                ].map((track) => (
                  <div key={track.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{track.name}</span>
                      <span className="text-slate-500">{track.count.toLocaleString()} items</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${track.percent}%` }}
                        className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-rose-500" />
                <span>Administrative System Settings</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">AI Anti-Cheat Sensitivity</span>
                    <span className="text-slate-500 text-[11px]">Strict optical gaze & multi-tab detection</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                    High (Level 3)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Automated Percentile Normalization</span>
                    <span className="text-slate-500 text-[11px]">Equipercentile method across exam slots</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                    Active
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">Speech Synthesis Dual-Voice Server</span>
                    <span className="text-slate-500 text-[11px]">Host & SME neural voice synthesizer</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proctor Audit & Incident Center */}
      {activeAdminTab === 'proctor-audit' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Proctoring Violation Audit Log
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Examine flagged webcam feeds, tab swaps, and sound thresholds recorded during mock test sessions.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                {incidents.filter((i) => i.status === 'Pending Review').length} Pending
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {incident.candidateName}
                    </span>
                    <span className="text-[11px] text-slate-500">({incident.candidateEmail})</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        incident.severity === 'High'
                          ? 'bg-rose-100 text-rose-700'
                          : incident.severity === 'Medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {incident.severity} Severity
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-semibold">{incident.violationType}</span> flagged in{' '}
                    <span className="italic">{incident.examTitle}</span> • {incident.timestamp}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                      incident.status === 'Cleared'
                        ? 'bg-emerald-100 text-emerald-700'
                        : incident.status === 'Sanctioned'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {incident.status}
                  </span>

                  {incident.status === 'Pending Review' && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleResolveIncident(incident.id, 'Cleared')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResolveIncident(incident.id, 'Sanctioned')}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                      >
                        Sanction
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test & Question Builder */}
      {activeAdminTab === 'test-builder' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Author Custom Mock Test & Question Papers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Publish structured exam sets with sectional time limits, answer keys, and step-by-step rationales.
            </p>
          </div>

          {testSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Mock Test Paper successfully compiled and published to the live test series vault!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Test Title
              </label>
              <input
                type="text"
                value={newTestTitle}
                onChange={(e) => setNewTestTitle(e.target.value)}
                placeholder="e.g. National Scholarship All-India Mock #5"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Category
              </label>
              <select
                value={newTestExam}
                onChange={(e) => setNewTestExam(e.target.value as ExamCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="CAT & MBA Entrances">CAT & MBA Entrances</option>
                <option value="UPSC Civil Services">UPSC Civil Services</option>
                <option value="GATE (Computer Science / Engg)">GATE CS / Engg</option>
                <option value="GRE & GMAT (Global Grad)">GRE / GMAT</option>
                <option value="JEE (Main & Advanced)">JEE Main & Adv</option>
                <option value="NEET (Medical)">NEET Medical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                value={newTestDuration}
                onChange={(e) => setNewTestDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add Question Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Add Question Item
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Problem Statement / Case Prompt
              </label>
              <textarea
                rows={2}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Type the conceptual or numerical question..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {newOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct-opt"
                    checked={correctIdx === idx}
                    onChange={() => setCorrectIdx(idx)}
                    className="accent-indigo-600 cursor-pointer"
                    title="Mark as correct answer"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[idx] = e.target.value;
                      setNewOptions(updated);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Solution Rationale / Explanation
              </label>
              <input
                type="text"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Explain the step-by-step theorem or calculation..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={handleAddQuestionToBuilder}
              disabled={!newQuestionText.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Append Question to Paper</span>
            </button>
          </div>

          {/* Staged Questions Count & Final Publish */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {createdQuestions.length} Questions Staged in Current Draft
            </span>
            <button
              type="button"
              onClick={handlePublishTest}
              disabled={!newTestTitle.trim() || createdQuestions.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Publish Test to Live Hub</span>
            </button>
          </div>
        </div>
      )}

      {/* Broadcasts Manager */}
      {activeAdminTab === 'broadcasts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create System Announcement
            </h3>
            <form onSubmit={handleCreateBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Server Maintenance or Exam Alert"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Type
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="info">Informational Note</option>
                  <option value="update">New Feature / Syllabus Update</option>
                  <option value="alert">Critical Exam / Urgent Alert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="Type broadcast message..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast to All Aspirants</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Active Platform Broadcasts ({broadcasts.length})
            </h3>
            <div className="space-y-3">
              {broadcasts.map((bc) => (
                <div
                  key={bc.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {bc.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{bc.createdDate}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{bc.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
