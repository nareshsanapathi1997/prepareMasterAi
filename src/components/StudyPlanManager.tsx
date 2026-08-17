import React, { useState } from 'react';
import {
  CalendarCheck,
  Sparkles,
  Loader2,
  Clock,
  Target,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { generateStudyPlanAPI } from '../lib/api';
import { StudyPlan } from '../types';
import { storage } from '../lib/storage';
import { EXAM_PRESETS } from '../data/presets';

interface StudyPlanManagerProps {
  activeExam: string;
}

export const StudyPlanManager: React.FC<StudyPlanManagerProps> = ({ activeExam }) => {
  const currentPreset = EXAM_PRESETS.find((p) => p.name === activeExam);
  const savedPlans = storage.getStudyPlans();
  const existingPlan = savedPlans.find((p) => p.examOverview.name === activeExam) || savedPlans[0];

  const [plan, setPlan] = useState<StudyPlan | null>(existingPlan || null);
  const [targetDate, setTargetDate] = useState('3 months from now');
  const [dailyHours, setDailyHours] = useState(4);
  const [currentLevel, setCurrentLevel] = useState('Intermediate (Completed 40% syllabus)');
  const [targetScore, setTargetScore] = useState('Top 1% / High Rank');
  const [weakSubjects, setWeakSubjects] = useState(
    currentPreset?.defaultSubjects.slice(0, 2).join(', ') || 'Core calculations & memory recall'
  );
  const [strongSubjects, setStrongSubjects] = useState(
    currentPreset?.defaultSubjects[2] || 'Foundational concepts'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>(storage.getPlanChecks());

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const generated = await generateStudyPlanAPI({
        examName: activeExam,
        targetDate,
        dailyHours,
        currentLevel,
        targetScore,
        weakSubjects,
        strongSubjects,
        notes,
      });

      setPlan(generated);
      storage.saveStudyPlan(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = (key: string) => {
    const updated = !checklist[key];
    setChecklist((prev) => ({ ...prev, [key]: updated }));
    storage.togglePlanCheck(key, updated);
  };

  return (
    <div className="space-y-6">
      {/* Plan Builder Form Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              AI Personalized Study Plan & Timetable Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Calibrate a phase-wise preparation timetable, daily routine slots, high-yield weightages, and mock schedules for {activeExam}.
            </p>
          </div>
        </div>

        <form onSubmit={handleGeneratePlan} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Timeline */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Target Timeline
              </label>
              <select
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="30 Days Crash Sprint">30 Days (Intensive Sprint)</option>
                <option value="60 Days (2 Months)">60 Days (2 Months)</option>
                <option value="3 months from now">90 Days (3 Months Standard)</option>
                <option value="6 Months Comprehensive">6 Months (Deep Foundation)</option>
                <option value="1 Year Long-Term">1 Year (Comprehensive Mastery)</option>
              </select>
            </div>

            {/* Daily Hours */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Daily Available Hours
              </label>
              <div className="flex items-center space-x-1.5">
                {[2, 4, 6, 8, 10].map((h) => (
                  <button
                    type="button"
                    key={h}
                    onClick={() => setDailyHours(h)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                      dailyHours === h
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

            {/* Baseline Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Current Level
              </label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Complete Beginner (Starting from zero)">Beginner (Starting 0%)</option>
                <option value="Intermediate (Covered basic concepts, struggling with speed/mock tests)">Intermediate (Covered 40-60%)</option>
                <option value="Advanced (Focusing on rank optimization and PYQ drills)">Advanced (Revising & Mock Drills)</option>
              </select>
            </div>

            {/* Target Goal */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                Target Ambition
              </label>
              <select
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Top 1% / Single-Digit Rank">Top 1% / Single-Digit Rank</option>
                <option value="99th Percentile Selection">99th Percentile Selection</option>
                <option value="Comfortable Cutoff Clearance">Safe Cutoff Clearance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Weak Subjects / Topics
              </label>
              <input
                type="text"
                value={weakSubjects}
                onChange={(e) => setWeakSubjects(e.target.value)}
                placeholder="e.g. Organic Chemistry mechanisms, Speed Quant puzzles"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                Strong Foundation Areas
              </label>
              <input
                type="text"
                value={strongSubjects}
                onChange={(e) => setStrongSubjects(e.target.value)}
                placeholder="e.g. Modern Physics, English Comprehension"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              id="generate-study-plan-btn"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calibrating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Prep Roadmap</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Plan Display */}
      {plan && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Overview Banner */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                  Prep Strategy Blueprint
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                  {plan.examOverview.name} Roadmap
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Estimated Study Investment: <strong>~{plan.examOverview.estimatedTotalStudyHours} hours</strong> &bull; Difficulty Index: <strong>{plan.examOverview.difficultyRating}</strong>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {plan.examOverview.keySuccessPillars.map((pillar, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    ✨ {pillar}
                  </span>
                ))}
              </div>
            </div>

            {/* High Yield Subject Weightage Matrix */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                High-Yield Subject Priority Matrix
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {plan.examOverview.highYieldSubjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {sub.subject}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                        {sub.weightagePercent}% Weight
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {sub.coreFocus}
                    </p>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sub.priority === 'High' || sub.priority === 'Crucial'
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200'
                          : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 border border-indigo-200'
                      }`}
                    >
                      {sub.priority} Priority
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase-wise Milestone Roadmap */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Strategic Preparation Phases & Action Milestones
            </h3>
            <div className="space-y-4">
              {plan.phases.map((phase) => (
                <div
                  key={phase.phaseNumber}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        P{phase.phaseNumber}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {phase.phaseName}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                      <span>Duration: {phase.durationWeeks}</span>
                      <span>&bull;</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {phase.recommendedMockFrequency}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium mb-3">
                    <strong>Primary Objective:</strong> {phase.primaryGoal}
                  </p>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Phase Action Milestones (Click to tick):
                    </span>
                    {phase.weeklyMilestones.map((m, mIdx) => {
                      const checkKey = `phase-${phase.phaseNumber}-m-${mIdx}`;
                      const isDone = !!checklist[checkKey];

                      return (
                        <button
                          key={mIdx}
                          onClick={() => handleToggleCheck(checkKey)}
                          className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-start space-x-3 transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-400 line-through'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${
                              isDone
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900'
                            }`}
                          >
                            {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span>{m}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Routine Slot Template & Weekly Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Routine */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Optimal Daily Time-Slot Routine ({dailyHours}h/day)
              </h3>
              <div className="space-y-3">
                {plan.dailyRoutineTemplate.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {slot.timeSlot}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {slot.focusType}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {slot.activity}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      💡 {slot.productivityTip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Spaced Repetition & Revision Rule */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Scientific Revision & Retention Tactics
              </h3>

              <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
                  1-3-7-30 Spaced Repetition Rule
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {plan.revisionStrategy.spacedRepetitionRule}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-1">
                  Mistake Notebook (Error Log) Strategy
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {plan.revisionStrategy.mistakeNotebookStrategy}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Final Month T-30 Countdown Checklist
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {plan.revisionStrategy.finalMonthChecklist.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">&check;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
