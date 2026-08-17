import React, { useState } from 'react';
import {
  Binary,
  Search,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  Lightbulb,
  Plus,
  Tag,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PRESET_FORMULAS } from '../data/presets';
import { FormulaCard } from '../types';

interface Props {
  activeExam: string;
}

const CATEGORIES = [
  'All Categories',
  'Quantitative Aptitude',
  'Physics & Mechanics',
  'Chemistry',
  'Computer Science',
  'Law & Constitution',
  'Economics & Finance',
];

export const FormulaVaultModule: React.FC<Props> = ({ activeExam }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [formulas, setFormulas] = useState<FormulaCard[]>(PRESET_FORMULAS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // New Custom Formula Form Modal/Toggle
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Quantitative Aptitude');
  const [newFormula, setNewFormula] = useState<string>('');
  const [newVariables, setNewVariables] = useState<string>('');
  const [newMnemonic, setNewMnemonic] = useState<string>('');
  const [newTrap, setNewTrap] = useState<string>('');

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSave = (id: string) => {
    const next = new Set(savedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedIds(next);
  };

  const handleAddFormula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFormula.trim()) return;

    const customCard: FormulaCard = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      latexOrFormula: newFormula.trim(),
      variablesDefinition: newVariables.trim() || 'Custom variables definition.',
      conditionsOfApplicability: 'User defined high-yield shortcut.',
      mnemonicOrMemoryTrick: newMnemonic.trim() || undefined,
      frequentlyTestedTrap: newTrap.trim() || undefined,
      examTags: [activeExam],
    };

    setFormulas([customCard, ...formulas]);
    setShowAddForm(false);
    setNewTitle('');
    setNewFormula('');
    setNewVariables('');
    setNewMnemonic('');
    setNewTrap('');
  };

  const filteredFormulas = formulas.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Categories' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.latexOrFormula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.variablesDefinition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.mnemonicOrMemoryTrick &&
        item.mnemonicOrMemoryTrick.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-emerald-200 mb-2">
              <Binary className="w-3.5 h-3.5" />
              <span>High-Yield Cheat Sheets & Mnemonics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Formula & Shortcut Vault
            </h1>
            <p className="text-emerald-200 text-sm mt-1 max-w-2xl">
              Master formulas, memory mnemonics, applicability conditions, and common examiner traps curated for {activeExam}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : 'Add Custom Formula'}</span>
          </button>
        </div>
      </div>

      {/* Add Custom Formula Modal / Dropdown */}
      {showAddForm && (
        <form
          onSubmit={handleAddFormula}
          className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-300 dark:border-emerald-800 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Add Custom Formula / Mnemonic Card</span>
            </h2>
            <span className="text-xs text-slate-400">Tagged to: {activeExam}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Formula Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Wilson's Theorem for Prime Numbers"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Formula Equation / Mathematical Expression
            </label>
            <input
              type="text"
              required
              value={newFormula}
              onChange={(e) => setNewFormula(e.target.value)}
              placeholder="e.g. (p-1)! ≡ -1 (mod p) if and only if p is prime"
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Variables Definition
              </label>
              <input
                type="text"
                value={newVariables}
                onChange={(e) => setNewVariables(e.target.value)}
                placeholder="p = prime number"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mnemonic Memory Trick
              </label>
              <input
                type="text"
                value={newMnemonic}
                onChange={(e) => setNewMnemonic(e.target.value)}
                placeholder="Optional memory rhyme"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Examiner Trap Warning
              </label>
              <input
                type="text"
                value={newTrap}
                onChange={(e) => setNewTrap(e.target.value)}
                placeholder="Where students slip"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              Save to Formula Vault
            </button>
          </div>
        </form>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas, variables, mnemonics, or concepts..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFormulas.map((card) => {
          const isSaved = savedIds.has(card.id);
          const isCopied = copiedId === card.id;

          return (
            <div
              key={card.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-[10px] font-bold">
                      {card.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1.5">
                      {card.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(card.id, card.latexOrFormula)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                      title="Copy formula"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSave(card.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg"
                      title={isSaved ? 'Bookmarked' : 'Bookmark formula'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Equation Display Box */}
                <div className="p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm rounded-xl border border-slate-800 shadow-inner overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {card.latexOrFormula}
                </div>

                {/* Variables & Applicability */}
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Variables: </strong>
                    <span>{card.variablesDefinition}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Condition: </strong>
                    <span>{card.conditionsOfApplicability}</span>
                  </div>
                </div>

                {/* Mnemonic Aid */}
                {card.mnemonicOrMemoryTrick && (
                  <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                    <div>
                      <strong className="font-bold">Mnemonic Memory Trick: </strong>
                      <span>{card.mnemonicOrMemoryTrick}</span>
                    </div>
                  </div>
                )}

                {/* Trap Warning */}
                {card.frequentlyTestedTrap && (
                  <div className="mt-2.5 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500 mt-0.5" />
                    <div>
                      <strong className="font-bold">Examiner Trap: </strong>
                      <span>{card.frequentlyTestedTrap}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Exam Tags */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex flex-wrap gap-1">
                  {card.examTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
