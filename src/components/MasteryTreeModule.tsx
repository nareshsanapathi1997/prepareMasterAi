import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  CheckCircle,
  Lock,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  TrendingUp,
  ShieldAlert,
  Star,
  BookOpen,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface MasteryTreeModuleProps {
  activeExam: string;
  onNavigateTab?: (tab: string) => void;
}

interface SkillNode {
  id: string;
  title: string;
  category: string;
  level: number;
  maxLevel: number;
  xpValue: number;
  status: 'locked' | 'unlocked' | 'mastered';
  prerequisites: string[];
  description: string;
  practiceTab: string;
}

interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
  type: 'practice' | 'accuracy' | 'speed' | 'duel';
}

export const MasteryTreeModule: React.FC<MasteryTreeModuleProps> = ({ activeExam, onNavigateTab }) => {
  const [userXP, setUserXP] = useState<number>(3450);
  const [userLevel, setUserLevel] = useState<number>(7);
  const [streakDays, setStreakDays] = useState<number>(14);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  // Skill Tree Nodes
  const [nodes, setNodes] = useState<SkillNode[]>([
    {
      id: 'node-arithmetic',
      title: 'Foundational Arithmetic & Percentages',
      category: 'Quantitative Aptitude',
      level: 3,
      maxLevel: 3,
      xpValue: 400,
      status: 'mastered',
      prerequisites: [],
      description: 'Ratios, speed math, percentage reciprocals, and profit-loss chains.',
      practiceTab: 'adaptive-practice',
    },
    {
      id: 'node-algebra',
      title: 'Quadratic Equations & Polynomials',
      category: 'Quantitative Aptitude',
      level: 2,
      maxLevel: 3,
      xpValue: 600,
      status: 'unlocked',
      prerequisites: ['node-arithmetic'],
      description: 'Roots of quadratics, discriminants, Descartes rule of signs, and maxima/minima.',
      practiceTab: 'adaptive-practice',
    },
    {
      id: 'node-calculus',
      title: 'Calculus & Curve Optimizations',
      category: 'Advanced Math',
      level: 1,
      maxLevel: 3,
      xpValue: 900,
      status: 'unlocked',
      prerequisites: ['node-algebra'],
      description: 'Definite integrals, Leibnitz rule, tangent gradients, and Taylor expansions.',
      practiceTab: 'graphing-calc',
    },
    {
      id: 'node-dilr-matrix',
      title: 'Multi-Dimensional Grid Deductions',
      category: 'Logical Reasoning',
      level: 3,
      maxLevel: 3,
      xpValue: 750,
      status: 'mastered',
      prerequisites: [],
      description: 'Matrix arrangement grids, clue truth tables, and elimination chains.',
      practiceTab: 'dilr-workbench',
    },
    {
      id: 'node-graphs-networks',
      title: 'Network Routing & Shortest Path DAGs',
      category: 'Logical Reasoning',
      level: 0,
      maxLevel: 3,
      xpValue: 1200,
      status: 'locked',
      prerequisites: ['node-dilr-matrix'],
      description: "Dijkstra routing, topological DAG ordering, and max-flow min-cut puzzles.",
      practiceTab: 'coding-sandbox',
    },
    {
      id: 'node-varc-rc',
      title: 'Dense Reading Comprehension & Inference',
      category: 'Verbal & Language',
      level: 2,
      maxLevel: 3,
      xpValue: 500,
      status: 'unlocked',
      prerequisites: [],
      description: 'Bionic eye fixation, tone deduction, and flawed argument identification.',
      practiceTab: 'speed-reader',
    },
    {
      id: 'node-peer-duels',
      title: 'Real-Time Speed Duel Arena Mastery',
      category: 'Competitive Reflexes',
      level: 1,
      maxLevel: 3,
      xpValue: 800,
      status: 'unlocked',
      prerequisites: ['node-arithmetic', 'node-varc-rc'],
      description: 'Defeat peer challengers under 30s timers with 90%+ ELO retention.',
      practiceTab: 'peer-battle',
    },
  ]);

  // Daily Quests
  const [quests, setQuests] = useState<DailyQuest[]>([
    {
      id: 'quest-1',
      title: 'Speed Sprinter',
      description: 'Solve 15 mental math drill questions in Speed Trainer',
      xpReward: 150,
      progress: 12,
      target: 15,
      completed: false,
      type: 'speed',
    },
    {
      id: 'quest-2',
      title: 'Matrix Maestro',
      description: 'Fill 1 complete DILR deduction matrix workbench without clue violation',
      xpReward: 250,
      progress: 1,
      target: 1,
      completed: true,
      type: 'practice',
    },
    {
      id: 'quest-3',
      title: 'Peer Arena Gladiator',
      description: 'Win 1 Real-time 1v1 Peer Battle Arena duel',
      xpReward: 300,
      progress: 0,
      target: 1,
      completed: false,
      type: 'duel',
    },
  ]);

  const handleClaimQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.completed) {
          setUserXP((xp) => xp + q.xpReward);
          return { ...q, xpReward: 0 };
        }
        return q;
      })
    );
  };

  const handleLevelUpNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((node) => {
        if (node.id === nodeId && node.status !== 'locked' && node.level < node.maxLevel) {
          const nextLevel = node.level + 1;
          setUserXP((xp) => xp + node.xpValue);
          return {
            ...node,
            level: nextLevel,
            status: nextLevel === node.maxLevel ? 'mastered' : 'unlocked',
          };
        }
        return node;
      })
    );
  };

  return (
    <div id="mastery-tree-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* RPG Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-purple-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              RPG Syllabus Progression Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Syllabus Mastery Tree & Daily XP Quests
            </h1>
            <p className="text-sm text-purple-100 max-w-xl">
              Turn arduous syllabus preparation into an addictive progression RPG. Unlock nodes, climb difficulty branches, and earn XP multipliers.
            </p>
          </div>

          {/* Player Stats HUD */}
          <div className="flex flex-wrap items-center gap-3 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">Current Level</span>
              <span className="text-2xl font-black text-amber-300">Lvl {userLevel}</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">Total XP</span>
              <span className="text-2xl font-black text-emerald-300">{userXP}</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-purple-200 uppercase font-bold block">Daily Streak</span>
              <span className="text-2xl font-black text-pink-300 flex items-center gap-1 justify-center">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" /> {streakDays}d
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Skill Tree Graph */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" /> Syllabus Skill Graph
              </h2>
              <p className="text-xs text-slate-500">
                Click any node to inspect prerequisite trees, launch specialized practice, or rank up.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {nodes.filter((n) => n.status === 'mastered').length} / {nodes.length} Mastered
            </span>
          </div>

          {/* Node Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isMastered = node.status === 'mastered';
              const isLocked = node.status === 'locked';

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                      : isMastered
                      ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-400'
                      : isLocked
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 opacity-70'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {node.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {node.title}
                      </h4>
                    </div>

                    {isMastered ? (
                      <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : isLocked ? (
                      <div className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-lg">
                        <Lock className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg font-bold text-xs">
                        Lvl {node.level}/{node.maxLevel}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {node.description}
                  </p>

                  {/* Level Progress Bar */}
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Mastery Progress</span>
                      <span>{Math.round((node.level / node.maxLevel) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isMastered ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${(node.level / node.maxLevel) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Selected Node Drawer */}
          {selectedNode && (
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-500 uppercase">{selectedNode.category}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedNode.title}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                  +{selectedNode.xpValue} XP per level
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                {selectedNode.description}
              </p>

              <div className="flex items-center gap-3 pt-2">
                {selectedNode.status !== 'locked' && selectedNode.level < selectedNode.maxLevel && (
                  <button
                    onClick={() => handleLevelUpNode(selectedNode.id)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <Zap className="w-4 h-4" /> Level Up Node (+{selectedNode.xpValue} XP)
                  </button>
                )}

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab(selectedNode.practiceTab)}
                    className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Launch Focused Practice
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Daily Quests & Streaks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Daily XP Quests Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Daily XP Quests
              </h3>
              <span className="text-[11px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                Resets in 6h 24m
              </span>
            </div>

            <div className="space-y-3">
              {quests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                        {quest.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {quest.description}
                      </p>
                    </div>
                    <span className="text-xs font-black text-amber-500 shrink-0">
                      +{quest.xpReward} XP
                    </span>
                  </div>

                  {/* Quest Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Progress</span>
                      <span>
                        {quest.progress} / {quest.target}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full transition-all"
                        style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {quest.completed && quest.xpReward > 0 && (
                    <button
                      onClick={() => handleClaimQuest(quest.id)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Claim {quest.xpReward} XP
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Achievement Badges Showcase */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Earned Badges
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'DILR Titan', desc: 'Flawless matrix solved', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
                { title: '14-Day Streak', desc: 'Unbroken dedication', color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
                { title: 'Speed Demon', desc: '30s drill master', color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/40' },
                { title: 'Duel Master', desc: 'ELO Rank 1420+', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
              ].map((badge) => (
                <div key={badge.title} className={`p-3 rounded-xl border border-slate-100 dark:border-slate-800 ${badge.color}`}>
                  <span className="text-xs font-extrabold block">{badge.title}</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
