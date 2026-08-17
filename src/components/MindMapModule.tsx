import React, { useState, useEffect } from 'react';
import {
  Network,
  Sparkles,
  Search,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Layers,
  RefreshCw,
  FolderTree,
  ExternalLink,
} from 'lucide-react';
import { fetchMindMapAPI } from '../lib/api';
import { MindMapData, MindMapNode } from '../types';

interface Props {
  activeExam: string;
}

const PRESET_TOPICS_BY_EXAM: Record<string, string[]> = {
  'CAT & MBA Entrances': [
    'Time Speed & Distance (Relative Speed & Races)',
    'Permutations, Combinations & Probability',
    'Critical Reasoning: Assumptions & Flaws',
    'Data Interpretation: Optimization & Maxima/Minima',
  ],
  'GATE (Computer Science / Engg)': [
    'Virtual Memory, Paging & TLB',
    'Dynamic Programming & Graph Algorithms',
    'Relational Algebra & Normal Forms (BCNF/3NF)',
    'TCP/IP Flow Control & Congestion Management',
  ],
  'UPSC Civil Services': [
    'Preamble & Fundamental Rights (Art 12-35)',
    'Monetary Policy Framework & RBI Tools',
    'Plate Tectonics & Indian Monsoon Mechanism',
    'Renewable Energy Transition & Grid Storage',
  ],
  'JEE (Main & Advanced)': [
    'Rotational Dynamics & Moment of Inertia',
    'Thermodynamics & Carnot Reversible Cycle',
    'Electrostatics & Gauss Law Applications',
    'Chemical Equilibrium & Le Chatelier Principle',
  ],
};

const DEFAULT_TOPICS = [
  'Artificial Intelligence & Deep Neural Networks',
  'Macroeconomics & Central Bank Interest Rates',
  'Cellular Respiration & ATP Synthesis',
];

export const MindMapModule: React.FC<Props> = ({ activeExam }) => {
  const suggestedTopics = PRESET_TOPICS_BY_EXAM[activeExam] || DEFAULT_TOPICS;

  const [inputTopic, setInputTopic] = useState<string>(suggestedTopics[0] || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    handleGenerate(suggestedTopics[0]);
  }, [activeExam]);

  const handleGenerate = async (topicToFetch?: string) => {
    const topic = topicToFetch || inputTopic;
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setCollapsedNodes(new Set());

    try {
      const data = await fetchMindMapAPI({
        topic: topic.trim(),
        examName: activeExam,
      });
      setMindMapData(data);
      if (data.rootNode) {
        setSelectedNode(data.rootNode);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate mind map.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(collapsedNodes);
    if (next.has(nodeId)) next.delete(nodeId);
    else next.add(nodeId);
    setCollapsedNodes(next);
  };

  const renderNode = (node: MindMapNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes.has(node.id);
    const isSelected = selectedNode?.id === node.id;

    const importanceColor =
      node.importance === 'High-Yield'
        ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-300 dark:border-rose-800'
        : node.importance === 'Medium-Yield'
        ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-300 dark:border-amber-800'
        : 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-300 dark:border-blue-800';

    return (
      <div key={node.id} className="relative">
        <div
          onClick={() => setSelectedNode(node)}
          className={`flex items-center space-x-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
            isSelected
              ? 'bg-violet-50 dark:bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/20 shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => toggleCollapse(node.id, e)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                {node.title}
              </span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${importanceColor}`}>
                {node.importance}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {node.summary}
            </p>
          </div>
        </div>

        {/* Children Sub-Tree */}
        {hasChildren && !isCollapsed && (
          <div className="pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-4 mt-2 space-y-2">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-fuchsia-900 to-purple-950 text-white p-6 rounded-3xl shadow-xl border border-fuchsia-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-fuchsia-200 mb-2">
              <Network className="w-3.5 h-3.5" />
              <span>Hierarchical Concept Deconstructor</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Concept Mind Map & Tree
            </h1>
            <p className="text-fuchsia-200 text-sm mt-1 max-w-2xl">
              Visually deconstruct complex syllabus topics into high-yield branches, core theorems, and examiner traps for {activeExam}.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1.5 bg-fuchsia-800/80 border border-fuchsia-600 rounded-xl text-xs font-bold text-fuchsia-200">
              Exam: {activeExam}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Topic Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputTopic}
              onChange={(e) => setInputTopic(e.target.value)}
              placeholder="Enter any syllabus concept (e.g. Indian Constitution Fundamental Rights, Thermodynamics)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={loading || !inputTopic.trim()}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Deconstructing Topic...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Build Mind Map</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Quick Topics */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Suggested:</span>
          {suggestedTopics.map((top, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputTopic(top);
                handleGenerate(top);
              }}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 text-xs rounded-lg whitespace-nowrap transition border border-transparent hover:border-purple-300 dark:hover:border-purple-800"
            >
              {top}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Main Mind Map Viewer: Left Hierarchy Tree + Right Deep-Dive Card */}
      {mindMapData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Tree Nodes (Col 1-7) */}
          <div className="lg:col-span-7 space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <FolderTree className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Concept Branch Hierarchy
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any node to deep dive
              </span>
            </div>

            <div className="space-y-3">
              {renderNode(mindMapData.rootNode)}
            </div>
          </div>

          {/* Right Column: Node Deep Dive Detail Card (Col 8-12) */}
          <div className="lg:col-span-5 space-y-4">
            {selectedNode ? (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        selectedNode.importance === 'High-Yield'
                          ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-300'
                          : selectedNode.importance === 'Medium-Yield'
                          ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 border-amber-300'
                          : 'bg-blue-50 dark:bg-blue-950 text-blue-600 border-blue-300'
                      }`}
                    >
                      {selectedNode.importance} Topic
                    </span>
                    {selectedNode.categoryTag && (
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedNode.categoryTag}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {selectedNode.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {selectedNode.summary}
                  </p>
                </div>

                {/* Key Formulas / High Yield Facts */}
                {selectedNode.keyFormulasOrFacts && selectedNode.keyFormulasOrFacts.length > 0 && (
                  <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200/50 dark:border-purple-900/50 space-y-2">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-900 dark:text-purple-300">
                      <Lightbulb className="w-4 h-4 text-purple-500" />
                      <span>Key Facts & High-Yield Formulas</span>
                    </div>
                    <ul className="space-y-1.5">
                      {selectedNode.keyFormulasOrFacts.map((fact, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-purple-950 dark:text-purple-200 flex items-start space-x-2"
                        >
                          <span className="text-purple-500 font-bold">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Examiner Trap Warning */}
                {selectedNode.commonTrapWarning && (
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200/50 dark:border-rose-900/50 space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-900 dark:text-rose-300">
                      <AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Common Examiner Trap</span>
                    </div>
                    <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                      {selectedNode.commonTrapWarning}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
                Select a node from the tree on the left to see formulas and examiner traps.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
