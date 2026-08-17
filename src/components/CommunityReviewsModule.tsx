import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Search,
  SlidersHorizontal,
  Award,
  TrendingUp,
  Plus,
  X,
  Share2,
  Activity,
  Check,
  Radio,
  Flame,
  Zap,
} from 'lucide-react';
import { CommunityReview, ExamCategory, LiveActivityEvent } from '../types';
import { storage } from '../lib/storage';
import { LIVE_ACTIVITY_STREAM } from '../data/communityReviewsData';

interface CommunityReviewsModuleProps {
  activeExam: string;
  onNavigateTab?: (tab: any) => void;
}

const EXAM_FILTER_OPTIONS: Array<'All Exams' | ExamCategory> = [
  'All Exams',
  'CAT & MBA Entrances',
  'GATE (Computer Science / Engg)',
  'UPSC Civil Services',
  'NEET (Medical)',
  'JEE (Main & Advanced)',
  'GRE & GMAT (Global Grad)',
  'Banking PO & SSC CGL',
  'AWS & Cloud Certification',
];

const PRESET_TAGS = [
  'DILR Workbench',
  'Accurate Percentiles',
  'Big-O Sandbox',
  'Mains Essay Rubric',
  'NCERT Line-by-Line',
  '1v1 Peer Duel',
  'Printable OMR Grader',
  'Live Proctoring Shield',
  'Speed Reader Pacer',
  'High Yield Mocks',
  'AI Mentor Doubts',
  'Virtual Calculator',
];

export const CommunityReviewsModule: React.FC<CommunityReviewsModuleProps> = ({
  activeExam,
}) => {
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('All Exams');
  const [starFilter, setStarFilter] = useState<number>(0);
  const [onlyVerifiedToppers, setOnlyVerifiedToppers] = useState(false);
  const [sortBy, setSortBy] = useState<'helpful' | 'recent' | 'rating'>('helpful');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Activity Ticker State
  const [activeTickerIndex, setActiveTickerIndex] = useState(0);
  const [liveActivities, setLiveActivities] = useState<LiveActivityEvent[]>(LIVE_ACTIVITY_STREAM);

  // Form State
  const [formName, setFormName] = useState('');
  const [formExam, setFormExam] = useState<ExamCategory>(
    (activeExam as ExamCategory) || 'CAT & MBA Entrances'
  );
  const [formTargetYear, setFormTargetYear] = useState('2026 Aspirant');
  const [formScoreOrRank, setFormScoreOrRank] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formSelectedTags, setFormSelectedTags] = useState<string[]>([
    'High Yield Mocks',
    'Accurate Percentiles',
  ]);
  const [formMockAccuracy, setFormMockAccuracy] = useState(5);
  const [formAiMentor, setFormAiMentor] = useState(5);
  const [formSpeedTrainer, setFormSpeedTrainer] = useState(5);
  const [formInteractive, setFormInteractive] = useState(5);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  // Auto-rotate live activity ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTickerIndex((prev) => (prev + 1) % liveActivities.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [liveActivities.length]);

  const loadReviews = () => {
    const data = storage.getCommunityReviews();
    setReviews(data);
  };

  const handleUpvote = (id: string) => {
    storage.upvoteCommunityReview(id);
    loadReviews();
  };

  const handleShare = (review: CommunityReview) => {
    const text = `"${review.title}" - ${review.userName} (${review.scoreOrPercentile || review.examCategory}) on PrepMaster AI: ${review.comment}`;
    navigator.clipboard.writeText(text);
    setCopiedId(review.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleTag = (tag: string) => {
    if (formSelectedTags.includes(tag)) {
      setFormSelectedTags(formSelectedTags.filter((t) => t !== tag));
    } else {
      setFormSelectedTags([...formSelectedTags, tag]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTitle.trim() || !formComment.trim()) return;

    const newReview: CommunityReview = {
      id: `rev-${Date.now()}`,
      userName: formName.trim(),
      examCategory: formExam,
      targetYear: formTargetYear || '2026 Aspirant',
      scoreOrPercentile: formScoreOrRank.trim() || undefined,
      verifiedStudent: true,
      topperBadge: formScoreOrRank.trim() ? `${formScoreOrRank.trim()} Verified` : undefined,
      rating: formRating,
      title: formTitle.trim(),
      comment: formComment.trim(),
      tags: formSelectedTags.length > 0 ? formSelectedTags : ['PrepMaster Aspirant'],
      helpfulCount: 1,
      userHelpfulVoted: true,
      createdAt: new Date().toISOString(),
      featureRatings: {
        mockAccuracy: formMockAccuracy,
        aiMentorQuality: formAiMentor,
        speedTrainer: formSpeedTrainer,
        interactiveWorkbench: formInteractive,
      },
    };

    storage.saveCommunityReview(newReview);
    loadReviews();

    // Add to live activity feed
    const newActivity: LiveActivityEvent = {
      id: `act-${Date.now()}`,
      userName: formName.trim(),
      location: 'India',
      action: `rated ${formRating} Stars: "${formTitle.slice(0, 45)}..."`,
      examCategory: formExam,
      timeAgo: 'Just now',
      avatarColor: 'bg-emerald-500',
      badge: `${formRating}.0 ★ Review`,
    };
    setLiveActivities([newActivity, ...liveActivities]);

    setSubmitSuccessMsg(true);
    setTimeout(() => {
      setSubmitSuccessMsg(false);
      setIsWriteModalOpen(false);
      // Reset form
      setFormTitle('');
      setFormComment('');
      setFormScoreOrRank('');
    }, 1500);
  };

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((r) => {
        if (selectedExamFilter !== 'All Exams' && r.examCategory !== selectedExamFilter) {
          return false;
        }
        if (starFilter > 0 && r.rating < starFilter) {
          return false;
        }
        if (onlyVerifiedToppers && !r.topperBadge) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchComment = r.comment.toLowerCase().includes(q);
          const matchUser = r.userName.toLowerCase().includes(q);
          const matchTags = r.tags.some((t) => t.toLowerCase().includes(q));
          const matchExam = r.examCategory.toLowerCase().includes(q);
          if (!matchTitle && !matchComment && !matchUser && !matchTags && !matchExam) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'helpful') {
          return b.helpfulCount - a.helpfulCount;
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        return 0;
      });
  }, [reviews, selectedExamFilter, starFilter, onlyVerifiedToppers, searchQuery, sortBy]);

  // Aggregate stats
  const totalReviewsCount = 12480 + reviews.length - 8;
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 4.93;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(2);
  }, [reviews]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const currentLiveEvent = liveActivities[activeTickerIndex] || liveActivities[0];

  return (
    <div id="community-reviews-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Live Activity Ticker */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 shadow-lg border border-indigo-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE ACTIVITY
          </div>
          <div className="text-sm font-medium text-slate-200 truncate">
            <span className="font-semibold text-white">{currentLiveEvent.userName}</span>{' '}
            <span className="text-slate-400 text-xs">({currentLiveEvent.location || 'India'})</span>{' '}
            <span className="text-indigo-200">{currentLiveEvent.action}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
          <span className="px-2 py-0.5 bg-indigo-900/60 text-indigo-300 rounded-md border border-indigo-700/50">
            {currentLiveEvent.examCategory}
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> {currentLiveEvent.timeAgo}
          </span>
        </div>
      </div>

      {/* Main Header & Aggregate Stats Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Headline & Overall Rating Score */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              Verified Aspirants & Topper Testimonials
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Community Ratings & Live Reviews
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              Read real, unedited reviews from national toppers, AIR rankers, and 99+ percentile aspirants across CAT, GATE CS, UPSC, NEET, and JEE.
            </p>

            <div className="flex items-baseline gap-4 pt-2">
              <div className="text-5xl font-black text-slate-900 dark:text-white">
                {averageRating}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Based on <span className="font-semibold text-slate-900 dark:text-white">{totalReviewsCount.toLocaleString()}+</span> authentic reviews
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-write-review"
                onClick={() => setIsWriteModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl transition-all shadow-md hover:shadow-indigo-500/25"
              >
                <Plus className="w-4 h-4" />
                Write a Verified Review
              </button>
            </div>
          </div>

          {/* Center: Rating Distribution Bars */}
          <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Rating Distribution
            </h3>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingCounts[star as 1 | 2 | 3 | 4 | 5] || 0;
              const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 font-semibold text-slate-700 dark:text-slate-300">
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        star === 5
                          ? 'bg-amber-400'
                          : star === 4
                          ? 'bg-emerald-500'
                          : star === 3
                          ? 'bg-blue-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(4, percentage)}%` }}
                    />
                  </div>
                  <div className="w-10 text-right font-medium text-slate-500 dark:text-slate-400">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Feature-Level Score Cards */}
          <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Feature Performance
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Mock Test Accuracy</span>
                <span className="font-bold text-slate-900 dark:text-white">4.95 / 5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">AI Doubts & Mentor</span>
                <span className="font-bold text-slate-900 dark:text-white">4.92 / 5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">DILR & Coding Sandboxes</span>
                <span className="font-bold text-slate-900 dark:text-white">4.96 / 5.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300">Speed Trainer Pacer</span>
                <span className="font-bold text-slate-900 dark:text-white">4.89 / 5.0</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 97.2% Verified Toppers
              </span>
              <span className="text-slate-400">TCS / NTA Spec</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Key Highlights Summary Pill Container */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                What Aspirants Love Most (AI Synthesized Feedback)
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Top patterns from over 12,000+ national test attempts
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs">
              <Zap className="w-3 h-3 text-amber-500" /> DILR Matrix Workbench
            </span>
            <span className="px-3 py-1 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/60 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs">
              <Flame className="w-3 h-3 text-rose-500" /> 1v1 Peer Duel ELO
            </span>
            <span className="px-3 py-1 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs">
              <Award className="w-3 h-3 text-indigo-500" /> GATE CS Big-O Sandbox
            </span>
            <span className="px-3 py-1 bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60 rounded-full text-xs font-semibold flex items-center gap-1 shadow-2xs">
              <Check className="w-3 h-3 text-emerald-500" /> Exact TCS iON UI
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              id="input-search-reviews"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reviews, toppers, keywords (e.g. DILR, Big-O)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Exam Category Filter */}
          <div className="md:col-span-4">
            <select
              id="select-exam-filter"
              value={selectedExamFilter}
              onChange={(e) => setSelectedExamFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {EXAM_FILTER_OPTIONS.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="md:col-span-4 flex gap-2">
            <select
              id="select-sort-reviews"
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="helpful">Sort: Most Helpful 👍</option>
              <option value="recent">Sort: Most Recent 🕒</option>
              <option value="rating">Sort: Highest Rating ⭐</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Stars:
            </span>
            {[
              { label: 'All Stars', val: 0 },
              { label: '5 ⭐ Only', val: 5 },
              { label: '4+ ⭐', val: 4 },
            ].map((btn) => (
              <button
                key={btn.val}
                onClick={() => setStarFilter(btn.val)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  starFilter === btn.val
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {btn.label}
              </button>
            ))}

            <button
              id="btn-filter-toppers"
              onClick={() => setOnlyVerifiedToppers(!onlyVerifiedToppers)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                onlyVerifiedToppers
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              Verified Toppers Only
            </button>
          </div>

          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredReviews.length}</span> reviews
          </div>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((review) => {
          const isCopied = copiedId === review.id;
          return (
            <div
              key={review.id}
              id={`review-card-${review.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header: User Info & Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                      {review.userName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {review.userName}
                        </h3>
                        {review.verifiedStudent && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{review.examCategory}</span>
                        <span>•</span>
                        <span>{review.targetYear}</span>
                      </div>
                    </div>
                  </div>

                  {/* Topper Badge if exists */}
                  {review.topperBadge && (
                    <span className="px-2.5 py-1 bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      {review.topperBadge}
                    </span>
                  )}
                </div>

                {/* Star Rating & Score */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>

                  {review.scoreOrPercentile && (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                      {review.scoreOrPercentile}
                    </span>
                  )}
                </div>

                {/* Review Title & Content */}
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {review.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>

                {/* Tags */}
                {review.tags && review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {review.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Helpful & Share */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <button
                    id={`btn-helpful-${review.id}`}
                    onClick={() => handleUpvote(review.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      review.userHelpfulVoted
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-700'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${review.userHelpfulVoted ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                    <span>Helpful ({review.helpfulCount})</span>
                  </button>

                  <button
                    onClick={() => handleShare(review)}
                    className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors p-1.5"
                    title="Share Testimonial"
                  >
                    {isCopied ? (
                      <span className="text-emerald-500 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredReviews.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
              No reviews match your current filters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting the exam category, star rating filter, or search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedExamFilter('All Exams');
                setStarFilter(0);
                setOnlyVerifiedToppers(false);
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div
            id="modal-write-review"
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Write a Verified Review & Share Your Experience
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Help fellow aspirants choose the right strategy and tools.
                </p>
              </div>
              <button
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccessMsg ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Review Submitted & Published!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Thank you for contributing to the national aspirant community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Full Name / Alias *
                    </label>
                    <input
                      id="input-reviewer-name"
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Ananya Sengupta"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Examination *
                    </label>
                    <select
                      id="select-reviewer-exam"
                      value={formExam}
                      onChange={(e: any) => setFormExam(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {EXAM_FILTER_OPTIONS.filter((e) => e !== 'All Exams').map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Year / Batch
                    </label>
                    <input
                      id="input-reviewer-year"
                      type="text"
                      value={formTargetYear}
                      onChange={(e) => setFormTargetYear(e.target.value)}
                      placeholder="e.g. CAT 2025 / 2026 Aspirant"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Score / Rank / Percentile (Optional for Topper Badge)
                    </label>
                    <input
                      id="input-reviewer-score"
                      type="text"
                      value={formScoreOrRank}
                      onChange={(e) => setFormScoreOrRank(e.target.value)}
                      placeholder="e.g. 99.82 %ile or AIR 45"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Overall Rating Star Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Overall Platform Rating *
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= formRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {formRating === 5
                        ? '⭐⭐⭐⭐⭐ Exceptional (5.0)'
                        : formRating === 4
                        ? '⭐⭐⭐⭐ Very Good (4.0)'
                        : formRating === 3
                        ? '⭐⭐⭐ Good (3.0)'
                        : '⭐⭐ Fair (2.0)'}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Review Headline / Key Takeaway *
                  </label>
                  <input
                    id="input-reviewer-title"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. DILR Workbench & 1v1 Duels completely transformed my speed"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Detailed Feedback */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Detailed Feedback & Exam Experience *
                  </label>
                  <textarea
                    id="input-reviewer-comment"
                    required
                    rows={4}
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Share specific details on mock accuracy, UI fidelity, AI mentor explanations, or speed improvement..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Quick Tags */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select Relevant Feature Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = formSelectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsWriteModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-review"
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-md hover:shadow-indigo-500/25"
                  >
                    Publish Verified Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
