import React, { useState } from 'react';
import {
  Calculator,
  GraduationCap,
  Percent,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Building2,
  Award,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ExamCategory } from '../types';

interface CollegeCalculatorModuleProps {
  activeExam: string;
}

interface TargetCollege {
  name: string;
  shortCode: string;
  minPercentile: number;
  expectedCompositeCutoff: number;
  weightage: {
    catPercentile: number;
    class10: number;
    class12: number;
    graduation: number;
    workEx: number;
    diversity: number;
  };
  details: string;
}

export const CollegeCalculatorModule: React.FC<CollegeCalculatorModuleProps> = ({ activeExam }) => {
  // Student Academic Profile State
  const [catPercentile, setCatPercentile] = useState<number>(99.2);
  const [class10Marks, setClass10Marks] = useState<number>(94);
  const [class12Marks, setClass12Marks] = useState<number>(91);
  const [gradMarks, setGradMarks] = useState<number>(82);
  const [workExMonths, setWorkExMonths] = useState<number>(24);
  const [category, setCategory] = useState<'General' | 'EWS' | 'NC-OBC' | 'SC' | 'ST' | 'PwD'>('General');
  const [academicDiscipline, setAcademicDiscipline] = useState<'Engineering' | 'Commerce' | 'Humanities/Arts' | 'Science' | 'Medicine/Law'>('Engineering');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender/Other'>('Male');

  // Top Target Colleges & RTI Composite Formula Rules
  const targetColleges: TargetCollege[] = [
    {
      name: 'IIM Ahmedabad (PGP)',
      shortCode: 'IIM-A',
      minPercentile: 99.0,
      expectedCompositeCutoff: 0.62,
      weightage: {
        catPercentile: 65,
        class10: 10,
        class12: 10,
        graduation: 10,
        workEx: 5,
        diversity: 0,
      },
      details: 'High emphasis on academic consistency across 10th/12th/Grad along with CAT score.',
    },
    {
      name: 'IIM Bangalore (PGP)',
      shortCode: 'IIM-B',
      minPercentile: 98.5,
      expectedCompositeCutoff: 0.58,
      weightage: {
        catPercentile: 55,
        class10: 10,
        class12: 10,
        graduation: 10,
        workEx: 10,
        diversity: 5,
      },
      details: 'Highest weightage given to relevant work experience and graduation rigor in India.',
    },
    {
      name: 'IIM Calcutta (PGP)',
      shortCode: 'IIM-C',
      minPercentile: 99.3,
      expectedCompositeCutoff: 0.65,
      weightage: {
        catPercentile: 70,
        class10: 10,
        class12: 10,
        graduation: 0,
        workEx: 6,
        diversity: 4,
      },
      details: 'Quant and pure CAT score focused with zero weightage penalty on graduation stream.',
    },
    {
      name: 'IIM Lucknow (PGP)',
      shortCode: 'IIM-L',
      minPercentile: 98.0,
      expectedCompositeCutoff: 0.54,
      weightage: {
        catPercentile: 60,
        class10: 10,
        class12: 10,
        graduation: 10,
        workEx: 5,
        diversity: 5,
      },
      details: 'Balanced composite score criteria with academic diversity and work experience booster.',
    },
    {
      name: 'FMS Delhi (MBA)',
      shortCode: 'FMS',
      minPercentile: 99.4,
      expectedCompositeCutoff: 0.68,
      weightage: {
        catPercentile: 100, // 50% VARC, 30% QA, 20% DILR
        class10: 0,
        class12: 0,
        graduation: 0,
        workEx: 0,
        diversity: 0,
      },
      details: 'Pure CAT percentile evaluation with extreme emphasis on VARC section weightage.',
    },
  ];

  // Helper function to calculate Composite Score for a specific college
  const computeCompositeScore = (college: TargetCollege) => {
    let score = 0;

    // CAT Component
    const catScaled = (catPercentile / 100) * college.weightage.catPercentile;
    score += catScaled;

    // 10th Component (Rated based on slabs)
    const rating10 = class10Marks >= 90 ? 1.0 : class10Marks >= 80 ? 0.8 : class10Marks >= 70 ? 0.6 : 0.4;
    score += rating10 * college.weightage.class10;

    // 12th Component
    const rating12 = class12Marks >= 90 ? 1.0 : class12Marks >= 80 ? 0.8 : class12Marks >= 70 ? 0.6 : 0.4;
    score += rating12 * college.weightage.class12;

    // Graduation Component
    const ratingGrad = gradMarks >= 85 ? 1.0 : gradMarks >= 75 ? 0.8 : gradMarks >= 65 ? 0.6 : 0.4;
    score += ratingGrad * college.weightage.graduation;

    // Work Experience Component (Optimal between 24-36 months)
    let workExRating = 0;
    if (workExMonths >= 24 && workExMonths <= 36) {
      workExRating = 1.0;
    } else if (workExMonths > 36) {
      workExRating = Math.max(0.4, 1.0 - (workExMonths - 36) * 0.05);
    } else if (workExMonths > 12) {
      workExRating = (workExMonths - 12) / 12;
    }
    score += workExRating * college.weightage.workEx;

    // Diversity Points
    let diversityScore = 0;
    if (academicDiscipline !== 'Engineering') diversityScore += 0.6;
    if (gender !== 'Male') diversityScore += 0.4;
    score += diversityScore * college.weightage.diversity;

    const normalizedCS = score / 100;
    return normalizedCS;
  };

  return (
    <div id="college-calculator-module" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              IIM & Top B-School RTI Algorithm Simulator
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Target College Composite Score & Call Predictor
            </h1>
            <p className="text-sm text-teal-100 max-w-2xl">
              Calculate your precise Composite Score (CS) across IIM Ahmedabad, Bangalore, Calcutta, Lucknow, and FMS Delhi using official RTI selection criteria and academic profile weightages.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Form (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-teal-600" /> Academic & Diversity Profile
          </h2>

          {/* CAT Percentile */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Expected / Target CAT %ile:</span>
              <span className="font-extrabold text-teal-600 dark:text-teal-400">{catPercentile}%ile</span>
            </div>
            <input
              type="range"
              min="85"
              max="100"
              step="0.1"
              value={catPercentile}
              onChange={(e) => setCatPercentile(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          {/* Academic Slabs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Class 10th %</label>
              <input
                type="number"
                min="50"
                max="100"
                value={class10Marks}
                onChange={(e) => setClass10Marks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Class 12th %</label>
              <input
                type="number"
                min="50"
                max="100"
                value={class12Marks}
                onChange={(e) => setClass12Marks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Graduation %</label>
              <input
                type="number"
                min="50"
                max="100"
                value={gradMarks}
                onChange={(e) => setGradMarks(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700 dark:text-slate-300 font-semibold">Work Experience (Months):</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{workExMonths} months</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={workExMonths}
              onChange={(e) => setWorkExMonths(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Category / Reservation */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="General">General (Open Merit)</option>
              <option value="EWS">Economically Weaker Section (EWS)</option>
              <option value="NC-OBC">Non-Creamy OBC (NC-OBC)</option>
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="PwD">Person with Disability (PwD)</option>
            </select>
          </div>

          {/* Academic Diversity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Undergrad Discipline</label>
            <select
              value={academicDiscipline}
              onChange={(e) => setAcademicDiscipline(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="Engineering">Engineering / B.Tech / B.E.</option>
              <option value="Commerce">Commerce / B.Com / BBA / CA</option>
              <option value="Humanities/Arts">Humanities / Arts / Economics</option>
              <option value="Science">Pure Science / B.Sc / Maths</option>
              <option value="Medicine/Law">Medicine / MBBS / Law (LLB)</option>
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Gender Diversity</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {['Male', 'Female', 'Transgender/Other'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g as any)}
                  className={`py-2 rounded-xl border transition-colors ${
                    gender === g
                      ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prediction Results & RTI Cut-offs (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600" /> College Shortlist Odds & RTI Cutoffs
            </h2>
            <span className="text-xs text-slate-500">Based on Latest RTI Slabs</span>
          </div>

          <div className="space-y-4">
            {targetColleges.map((college) => {
              const cs = computeCompositeScore(college);
              const isEligible = catPercentile >= college.minPercentile;
              const csMargin = cs - college.expectedCompositeCutoff;
              const callProbability =
                csMargin >= 0.05
                  ? 'Very High (Safe Zone)'
                  : csMargin >= 0
                  ? 'High (Probable Call)'
                  : csMargin >= -0.04
                  ? 'Borderline / Competitive'
                  : 'Low Probability';

              const probColor =
                csMargin >= 0.05
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
                  : csMargin >= 0
                  ? 'text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200'
                  : csMargin >= -0.04
                  ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
                  : 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200';

              return (
                <div
                  key={college.shortCode}
                  className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {college.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Min %ile: {college.minPercentile}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {college.details}
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-xl border shrink-0 ${probColor}`}>
                      {callProbability}
                    </span>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Your Composite Score</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {(cs * 100).toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Expected Cutoff</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                        {(college.expectedCompositeCutoff * 100).toFixed(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Score Delta</span>
                      <span
                        className={`font-bold text-sm ${
                          csMargin >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {csMargin >= 0 ? `+${(csMargin * 100).toFixed(2)}` : `${(csMargin * 100).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
