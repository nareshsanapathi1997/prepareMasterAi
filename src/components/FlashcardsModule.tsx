import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Loader2,
  Volume2,
  RotateCw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Zap,
  Plus,
  Download,
  Upload,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { generateFlashcardsAPI } from '../lib/api';
import { FlashcardDeck, Flashcard } from '../types';
import { storage } from '../lib/storage';
import { EXAM_PRESETS } from '../data/presets';
import confetti from 'canvas-confetti';

interface FlashcardsModuleProps {
  activeExam: string;
  initialTopic?: string;
  isLoggedIn?: boolean;
  onOpenAuth?: (mode?: 'login' | 'signup') => void;
}

export const FlashcardsModule: React.FC<FlashcardsModuleProps> = ({
  activeExam,
  initialTopic,
  isLoggedIn = false,
  onOpenAuth,
}) => {
  const currentPreset = EXAM_PRESETS.find((p) => p.name === activeExam);
  const decks = storage.getFlashcardDecks();
  const activeDeck = decks[0];

  const [currentDeck, setCurrentDeck] = useState<FlashcardDeck>(activeDeck);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newTopic, setNewTopic] = useState(initialTopic || currentPreset?.sampleTopics[0] || '');
  const [cardCount, setCardCount] = useState(8);
  const [loading, setLoading] = useState(false);

  // Custom Card Creation Modal State
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [customMnemonic, setCustomMnemonic] = useState('');
  const [customCategory, setCustomCategory] = useState('High-Yield Formula');

  const card = currentDeck.cards[currentCardIndex] || currentDeck.cards[0];

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    setLoading(true);
    try {
      const generated = await generateFlashcardsAPI({
        examName: activeExam,
        subject: currentPreset?.defaultSubjects[0] || 'Core Domain',
        topic: newTopic,
        cardCount,
      });

      setCurrentDeck(generated);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      storage.saveFlashcardDeck(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleRateCard = (rating: 'hard' | 'good' | 'easy' | 'again') => {
    const updatedCards = [...currentDeck.cards];
    updatedCards[currentCardIndex] = {
      ...updatedCards[currentCardIndex],
      status: rating === 'again' ? 'hard' : rating,
    };

    const updatedDeck = { ...currentDeck, cards: updatedCards };
    setCurrentDeck(updatedDeck);
    storage.saveFlashcardDeck(updatedDeck);

    if (currentCardIndex < currentDeck.cards.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch {
        // ignore
      }
    }
  };

  const handleShuffle = () => {
    const shuffled = [...currentDeck.cards].sort(() => Math.random() - 0.5);
    setCurrentDeck({ ...currentDeck, cards: shuffled });
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleExportDeck = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentDeck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${currentDeck.deckTitle.replace(/\s+/g, '_')}_flashcards.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDeck = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed.cards && Array.isArray(parsed.cards)) {
            setCurrentDeck(parsed);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            storage.saveFlashcardDeck(parsed);
          }
        } catch (err) {
          alert('Invalid flashcard deck JSON format');
        }
      };
    }
  };

  const handleAddCustomCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || !customAnswer.trim()) return;

    const newCard: Flashcard = {
      id: Date.now(),
      frontPrompt: customPrompt.trim(),
      backAnswer: customAnswer.trim(),
      keyMnemonicOrHint: customMnemonic.trim() || undefined,
      category: customCategory,
      highYieldImportance: 'High',
      status: 'unreviewed',
    };

    const updatedDeck: FlashcardDeck = {
      ...currentDeck,
      cards: [newCard, ...currentDeck.cards],
    };

    setCurrentDeck(updatedDeck);
    storage.saveFlashcardDeck(updatedDeck);
    setShowAddCardModal(false);
    setCustomPrompt('');
    setCustomAnswer('');
    setCustomMnemonic('');
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="space-y-6">
      {/* Guest Demo Notice vs Unlimited Status */}
      {!isLoggedIn ? (
        <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-emerald-500/10 border border-purple-300/60 dark:border-purple-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Demo Flashcards Deck Active
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Drill starter flashcards. Register or sign in to generate <strong>Unlimited AI Flashcard Decks & SuperMemo SM-2 Recall Schedules</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAuth?.('signup')}
            className="shrink-0 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Unlock Unlimited Decks
          </button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          <span>💎 Unlimited AI Flashcard Generation & SuperMemo Memory Intervals Active</span>
          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">UNLIMITED</span>
        </div>
      )}

      {/* Top Deck Generator Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Active Recall Flashcards (Spaced Repetition Engine)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Drill formulas, articles, and high-yield concepts using the SuperMemo SM-2 memory interval schedule.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form onSubmit={handleGenerateDeck} className="flex items-center gap-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Constitutional Articles / Thermodynamics"
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 w-52"
                required
              />
              <button
                type="submit"
                disabled={loading || !newTopic.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>New AI Deck</span>
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowAddCardModal(true)}
              className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1"
              title="Add Custom Flashcard"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add Card</span>
            </button>

            <button
              type="button"
              onClick={handleExportDeck}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
              title="Export Deck as JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <label
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
              title="Import Deck JSON"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportDeck} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Main Flashcard Stage */}
      {card && (
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress & Deck Title */}
          <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span className="truncate max-w-[280px] font-bold text-slate-900 dark:text-white">
              {currentDeck.deckTitle}
            </span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShuffle}
                className="flex items-center space-x-1 text-slate-500 hover:text-indigo-600 transition-colors"
                title="Shuffle Deck"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold">
                Card {currentCardIndex + 1} / {currentDeck.cards.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{
                width: `${((currentCardIndex + 1) / currentDeck.cards.length) * 100}%`,
              }}
            />
          </div>

          {/* Interactive Flip Card (Click to Flip) */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[300px] sm:min-h-[340px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between relative group select-none"
          >
            {/* Top Card Badge & Audio */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                {card.category} &bull; {card.highYieldImportance} Yield
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSpeak(isFlipped ? card.backAnswer : card.frontPrompt);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Read card aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Card Content (Front vs Back) */}
            <div className="my-6 text-center">
              {!isFlipped ? (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Prompt / Question
                  </span>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
                    {card.frontPrompt}
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-2">
                    Core Concept & Answer
                  </span>
                  <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 leading-relaxed whitespace-pre-line mb-4">
                    {card.backAnswer}
                  </p>
                  {card.keyMnemonicOrHint && (
                    <div className="inline-block p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs font-medium text-left">
                      💡 <strong>Mnemonic Hint:</strong> {card.keyMnemonicOrHint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div className="flex items-center justify-center text-xs text-slate-400 font-medium space-x-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Click card to flip ({isFlipped ? 'Show Front' : 'Reveal Answer'})</span>
            </div>
          </div>

          {/* SuperMemo SM-2 Interval Confidence Rating Bar */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            <button
              onClick={() => handleRateCard('again')}
              className="py-2.5 px-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-center transition-all"
            >
              <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">Again</span>
              <span className="text-[10px] text-slate-500">&lt; 1 min</span>
            </button>
            <button
              onClick={() => handleRateCard('hard')}
              className="py-2.5 px-2 rounded-2xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-center transition-all"
            >
              <span className="block text-xs font-bold">Hard</span>
              <span className="text-[10px] text-rose-600 dark:text-rose-400">1 day</span>
            </button>
            <button
              onClick={() => handleRateCard('good')}
              className="py-2.5 px-2 rounded-2xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 text-center transition-all"
            >
              <span className="block text-xs font-bold">Good</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400">3 days</span>
            </button>
            <button
              onClick={() => handleRateCard('easy')}
              className="py-2.5 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 text-center transition-all"
            >
              <span className="block text-xs font-bold">Easy</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">7 days</span>
            </button>
          </div>

          {/* Navigation Prev/Next */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                if (currentCardIndex > 0) {
                  setIsFlipped(false);
                  setCurrentCardIndex(currentCardIndex - 1);
                }
              }}
              disabled={currentCardIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={() => {
                if (currentCardIndex < currentDeck.cards.length - 1) {
                  setIsFlipped(false);
                  setCurrentCardIndex(currentCardIndex + 1);
                }
              }}
              disabled={currentCardIndex === currentDeck.cards.length - 1}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Flashcard */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-500" />
                <span>Create Custom Flashcard</span>
              </h3>
              <button
                onClick={() => setShowAddCardModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomCardSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Card Category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Front Prompt / Question
                </label>
                <textarea
                  rows={2}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. State the Carnot Efficiency Formula for Heat Engines"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Back Answer / Mathematical Formula
                </label>
                <textarea
                  rows={3}
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="e.g. η = 1 - (Tc / Th) = (Th - Tc) / Th where temperatures are in Kelvin."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Key Mnemonic / Hint (Optional)
                </label>
                <input
                  type="text"
                  value={customMnemonic}
                  onChange={(e) => setCustomMnemonic(e.target.value)}
                  placeholder="e.g. Cold is on top (numerator), Hot is below."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCardModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  Save Card to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
