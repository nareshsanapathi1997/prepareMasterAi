import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Flame,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Award,
  Sparkles,
  Download,
  Share2,
  CalendarCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { RetentionTopic } from '../types';

interface Props {
  activeExam: string;
}

const INITIAL_TOPICS: Record<string, RetentionTopic[]> = {
  'CAT & MBA Entrances': [
    {
      id: 'cat-1',
      topicName: 'Time Speed Distance (Circular Tracks & Escalators)',
      subject: 'Quantitative Aptitude',
      lastStudiedDate: '2026-08-01',
      revisionCycle: 2,
      predictedRetentionPercent: 42,
      urgency: 'Critical',
    },
    {
      id: 'cat-2',
      topicName: 'Permutations & Combinations (Derangements)',
      subject: 'Quantitative Aptitude',
      lastStudiedDate: '2026-08-10',
      revisionCycle: 3,
      predictedRetentionPercent: 68,
      urgency: 'Due Soon',
    },
    {
      id: 'cat-3',
      topicName: 'Games & Tournaments (Round Robin Seeding)',
      subject: 'DILR',
      lastStudiedDate: '2026-08-15',
      revisionCycle: 4,
      predictedRetentionPercent: 89,
      urgency: 'Optimal',
    },
    {
      id: 'cat-4',
      topicName: 'Philosophical RC Inferences & Tone Extraction',
      subject: 'VARC',
      lastStudiedDate: '2026-08-04',
      revisionCycle: 1,
      predictedRetentionPercent: 38,
      urgency: 'Critical',
    },
  ],
  'GATE (Computer Science / Engg)': [
    {
      id: 'gate-1',
      topicName: 'Multi-Level Paging & Inverted Page Tables',
      subject: 'Operating Systems',
      lastStudiedDate: '2026-07-28',
      revisionCycle: 2,
      predictedRetentionPercent: 35,
      urgency: 'Critical',
    },
    {
      id: 'gate-2',
      topicName: 'Turing Machines & Decidability Rice Theorem',
      subject: 'Theory of Computation',
      lastStudiedDate: '2026-08-08',
      revisionCycle: 3,
      predictedRetentionPercent: 72,
      urgency: 'Due Soon',
    },
    {
      id: 'gate-3',
      topicName: 'B+ Tree Indexing & Transaction Serializability',
      subject: 'DBMS',
      lastStudiedDate: '2026-08-14',
      revisionCycle: 4,
      predictedRetentionPercent: 91,
      urgency: 'Optimal',
    },
  ],
  'UPSC Civil Services': [
    {
      id: 'upsc-1',
      topicName: 'Monetary Policy Committee & Urjit Patel Norms',
      subject: 'Indian Economy (GS-III)',
      lastStudiedDate: '2026-07-25',
      revisionCycle: 1,
      predictedRetentionPercent: 30,
      urgency: 'Critical',
    },
    {
      id: 'upsc-2',
      topicName: 'Article 356 President Rule & Bommai Judgment',
      subject: 'Indian Polity (GS-II)',
      lastStudiedDate: '2026-08-11',
      revisionCycle: 3,
      predictedRetentionPercent: 74,
      urgency: 'Due Soon',
    },
    {
      id: 'upsc-3',
      topicName: 'Plate Tectonics & Pacific Ring of Fire',
      subject: 'Physical Geography (GS-I)',
      lastStudiedDate: '2026-08-16',
      revisionCycle: 5,
      predictedRetentionPercent: 94,
      urgency: 'Optimal',
    },
  ],
};

export const RetentionMatrixModule: React.FC<Props> = ({ activeExam }) => {
  const [topics, setTopics] = useState<RetentionTopic[]>(
    INITIAL_TOPICS[activeExam] || INITIAL_TOPICS['CAT & MBA Entrances']
  );

  const [urgencyFilter, setUrgencyFilter] = useState<'All' | 'Critical' | 'Due Soon' | 'Optimal'>('All');
  const [selectedDay, setSelectedDay] = useState<{ date: string; hours: number; count: number } | null>(null);

  // Generate 52 weeks (364 days) sample activity matrix
  const generateYearMatrix = () => {
    const matrix = [];
    const today = new Date();
    for (let i = 180; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const seed = (d.getDate() * 3 + d.getMonth() * 7 + i) % 10;
      let level = 0;
      let hours = 0;
      let count = 0;

      if (seed > 2) {
        level = (seed % 4) + 1;
        hours = level * 1.5 + (seed % 2);
        count = level * 12 + seed;
      }

      matrix.push({
        date: d.toISOString().split('T')[0],
        level,
        hours,
        count,
      });
    }
    return matrix;
  };

  const [activityDays] = useState(generateYearMatrix());

  const handleTriggerRevision = (id: string) => {
    setTopics((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              predictedRetentionPercent: 98,
              urgency: 'Optimal',
              revisionCycle: t.revisionCycle + 1,
              lastStudiedDate: new Date().toISOString().split('T')[0],
            }
          : t
      )
    );
  };

  const filteredTopics = topics.filter((t) => {
    if (urgencyFilter === 'All') return true;
    return t.urgency === urgencyFilter;
  });

  const averageRetention = Math.round(
    topics.reduce((acc, t) => acc + t.predictedRetentionPercent, 0) / (topics.length || 1)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 rounded-3xl shadow-xl border border-teal-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-teal-200 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-teal-300" />
              <span>Ebbinghaus Predictive Retention Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Memory Decay Tracker & 365-Day Study Matrix
            </h1>
            <p className="text-teal-200 text-sm mt-1 max-w-2xl">
              Anticipate forgetting curves with spaced repetition schedules, track daily consistency streaks, and optimize recall before exam day for {activeExam}.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[100px]">
              <span className="text-[10px] text-teal-200 block uppercase font-bold">Avg Retention</span>
              <span className="text-xl font-black font-mono text-white">{averageRetention}%</span>
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[100px]">
              <span className="text-[10px] text-teal-200 block uppercase font-bold">Study Streak</span>
              <span className="text-xl font-black font-mono text-amber-300 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                14d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 365-Day Study Activity Matrix (GitHub Style) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-4 h-4 text-teal-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Study Consistency & Deep Work Matrix (Past 6 Months)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {activityDays.reduce((a, b) => a + b.hours, 0).toFixed(0)} Total Hours Logged
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[700px]">
            {activityDays.map((day, idx) => {
              let bg = 'bg-slate-100 dark:bg-slate-800';
              if (day.level === 1) bg = 'bg-teal-200 dark:bg-teal-950/60';
              if (day.level === 2) bg = 'bg-teal-400 dark:bg-teal-800';
              if (day.level === 3) bg = 'bg-teal-500 dark:bg-teal-600';
              if (day.level === 4) bg = 'bg-teal-700 dark:bg-teal-400';

              return (
                <button
                  key={idx}
                  type="button"
                  title={`${day.date}: ${day.hours}h (${day.count} Qs)`}
                  onClick={() => setSelectedDay(day)}
                  className={`w-3.5 h-3.5 rounded-[3px] transition hover:scale-125 hover:ring-2 hover:ring-teal-500 ${bg}`}
                />
              );
            })}
          </div>
        </div>

        {/* Selected Date Detail */}
        {selectedDay && (
          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/20 border border-teal-200/50 dark:border-teal-900/40 rounded-xl text-xs flex items-center justify-between">
            <span className="font-bold text-teal-950 dark:text-teal-200">
              📅 {selectedDay.date}: {selectedDay.hours} hours logged • {selectedDay.count} questions solved
            </span>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">
              Efficiency Score: {Math.round(selectedDay.count / (selectedDay.hours || 1))} Qs/hr
            </span>
          </div>
        )}
      </div>

      {/* Forgetting Curve & Topic Urgency Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-teal-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Syllabus Memory Decay Audit & Spaced Cycles
            </h3>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center space-x-1.5">
            {(['All', 'Critical', 'Due Soon', 'Optimal'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setUrgencyFilter(filter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  urgencyFilter === filter
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Topics Table */}
        <div className="space-y-3">
          {filteredTopics.map((topic) => {
            const isCritical = topic.urgency === 'Critical';
            const isDueSoon = topic.urgency === 'Due Soon';

            return (
              <div
                key={topic.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {topic.topicName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {topic.subject}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Last Revised: {topic.lastStudiedDate} • Spaced Repetition Cycle #{topic.revisionCycle}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Retention Gauge */}
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-black ${
                        isCritical
                          ? 'text-rose-600'
                          : isDueSoon
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    >
                      {topic.predictedRetentionPercent}% Memory
                    </span>
                    <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${
                          isCritical
                            ? 'bg-rose-500'
                            : isDueSoon
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${topic.predictedRetentionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    type="button"
                    onClick={() => handleTriggerRevision(topic.id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm transition shrink-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sprint Revision</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
