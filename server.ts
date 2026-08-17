import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Study Plan Generator Endpoint
app.post('/api/ai/study-plan', async (req, res) => {
  try {
    const {
      examName,
      targetDate,
      dailyHours,
      currentLevel,
      targetScore,
      weakSubjects,
      strongSubjects,
      notes,
    } = req.body;

    if (!examName) {
      return res.status(400).json({ error: 'Exam or course name is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `You are a world-class academic mentor and competitive exam strategist.
Create an exhaustive, high-yield, structured preparation plan for a student preparing for:
Exam / Course: "${examName}"
Target Date: "${targetDate || '3 months from now'}"
Daily Available Time: "${dailyHours || '4'} hours/day"
Current Preparation Level: "${currentLevel || 'Intermediate'}"
Target Score / Goal: "${targetScore || 'Top 1% / High Rank'}"
Weak Subject Areas: "${weakSubjects || 'Needs improvement across key topics'}"
Strong Subject Areas: "${strongSubjects || 'Foundations'}"
Special Notes: "${notes || 'None'}"

Generate a detailed, actionable JSON response following the exact schema provided.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert exam coach. Provide realistic, scientifically backed revision strategies, high-yield topic weightages, spaced repetition schedules, and practical daily routines in clean structured JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examOverview: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                difficultyRating: { type: Type.STRING },
                estimatedTotalStudyHours: { type: Type.NUMBER },
                keySuccessPillars: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                highYieldSubjects: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      subject: { type: Type.STRING },
                      weightagePercent: { type: Type.NUMBER },
                      priority: { type: Type.STRING },
                      coreFocus: { type: Type.STRING },
                    },
                    required: ['subject', 'weightagePercent', 'priority', 'coreFocus'],
                  },
                },
              },
              required: [
                'name',
                'difficultyRating',
                'estimatedTotalStudyHours',
                'keySuccessPillars',
                'highYieldSubjects',
              ],
            },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.NUMBER },
                  phaseName: { type: Type.STRING },
                  durationWeeks: { type: Type.STRING },
                  primaryGoal: { type: Type.STRING },
                  weeklyMilestones: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  recommendedMockFrequency: { type: Type.STRING },
                },
                required: [
                  'phaseNumber',
                  'phaseName',
                  'durationWeeks',
                  'primaryGoal',
                  'weeklyMilestones',
                  'recommendedMockFrequency',
                ],
              },
            },
            dailyRoutineTemplate: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  timeSlot: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  focusType: { type: Type.STRING },
                  productivityTip: { type: Type.STRING },
                },
                required: ['timeSlot', 'activity', 'focusType', 'productivityTip'],
              },
            },
            weeklyScheduleSummary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  primaryFocus: { type: Type.STRING },
                  practiceQuestionsTarget: { type: Type.NUMBER },
                  revisionSlot: { type: Type.STRING },
                },
                required: ['day', 'primaryFocus', 'practiceQuestionsTarget', 'revisionSlot'],
              },
            },
            revisionStrategy: {
              type: Type.OBJECT,
              properties: {
                spacedRepetitionRule: { type: Type.STRING },
                mistakeNotebookStrategy: { type: Type.STRING },
                finalMonthChecklist: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'spacedRepetitionRule',
                'mistakeNotebookStrategy',
                'finalMonthChecklist',
              ],
            },
            expertTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'examOverview',
            'phases',
            'dailyRoutineTemplate',
            'weeklyScheduleSummary',
            'revisionStrategy',
            'expertTips',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/study-plan:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate AI study plan',
    });
  }
});

// 2. AI Topic Deep Explanation Endpoint
app.post('/api/ai/explain-topic', async (req, res) => {
  try {
    const {
      examName,
      subject,
      topic,
      subtopic,
      depthLevel, // 'Beginner' | 'Standard' | 'Advanced' | 'Exam Shortcuts'
      learningStyle,
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Provide an exceptional, comprehensive, pedagogy-first breakdown for the topic:
Topic: "${topic}"
Subtopic / Focus: "${subtopic || 'Comprehensive overview'}"
Exam / Course Context: "${examName || 'General Competitive Exams'}"
Subject: "${subject || 'General'}"
Depth Level: "${depthLevel || 'Standard'}"
Learning Style: "${learningStyle || 'Conceptual & Practical'}"

Include crystal clear analogies, formulas/theorems, mnemonics, step-by-step solved typical exam problems with trick shortcuts, common pitfalls/traps examiners set, and a 3-question self-check quiz with answers.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a master educator and competitive exam subject matter expert. Make hard concepts delightfully intuitive while providing the highest exam utility.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            importanceForExam: { type: Type.STRING },
            coreIntuition: {
              type: Type.OBJECT,
              properties: {
                theBigPicture: { type: Type.STRING },
                realWorldAnalogy: { type: Type.STRING },
                whyItMatters: { type: Type.STRING },
              },
              required: ['theBigPicture', 'realWorldAnalogy', 'whyItMatters'],
            },
            keyConceptsAndRules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  formulaOrStatement: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING },
                },
                required: ['name', 'explanation', 'formulaOrStatement', 'keyTakeaway'],
              },
            },
            mnemonicsAndMemoryHacks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ruleName: { type: Type.STRING },
                  mnemonic: { type: Type.STRING },
                  howToRemember: { type: Type.STRING },
                },
                required: ['ruleName', 'mnemonic', 'howToRemember'],
              },
            },
            solvedExamExamples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problemStatement: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  stepByStepSolution: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  finalAnswer: { type: Type.STRING },
                  shortcutOrExamTrick: { type: Type.STRING },
                },
                required: [
                  'problemStatement',
                  'difficulty',
                  'stepByStepSolution',
                  'finalAnswer',
                  'shortcutOrExamTrick',
                ],
              },
            },
            commonExaminerTraps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trapDescription: { type: Type.STRING },
                  whyStudentsFail: { type: Type.STRING },
                  howToAvoid: { type: Type.STRING },
                },
                required: ['trapDescription', 'whyStudentsFail', 'howToAvoid'],
              },
            },
            quickSelfCheckQuiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctOptionIndex', 'explanation'],
              },
            },
            suggestedNextTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'title',
            'summary',
            'importanceForExam',
            'coreIntuition',
            'keyConceptsAndRules',
            'mnemonicsAndMemoryHacks',
            'solvedExamExamples',
            'commonExaminerTraps',
            'quickSelfCheckQuiz',
            'suggestedNextTopics',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/explain-topic:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate topic explanation',
    });
  }
});

// 3. AI Mock Test Generator Endpoint
app.post('/api/ai/generate-mock-test', async (req, res) => {
  try {
    const {
      examName,
      subject,
      topic,
      numQuestions = 10,
      difficulty = 'Exam-Standard', // 'Easy' | 'Medium' | 'Hard' | 'Exam-Standard'
      questionType = 'MCQ Single Correct',
      customInstructions,
    } = req.body;

    const count = Math.min(Math.max(Number(numQuestions) || 10, 3), 25);

    const ai = getGeminiClient();
    const prompt = `Generate a realistic, high-quality, exam-grade mock test for:
Target Exam: "${examName || 'Competitive Examination'}"
Subject / Domain: "${subject || 'General Studies / Core Subject'}"
Topic: "${topic || 'Full Syllabus / Comprehensive'}"
Difficulty Level: "${difficulty}"
Question Format: "${questionType}"
Total Questions to generate: ${count}
Additional Guidelines: "${customInstructions || 'Follow exact standard exam question styling and rigor'}"

Requirements:
- Each question must be rigorous and test real conceptual understanding, application, or problem-solving.
- Include 4 plausible, unambiguous options (A, B, C, D) with exactly one clearly correct option.
- Include an in-depth pedagogical explanation explaining why the correct answer is right AND why each distractor is wrong.
- Provide practical shortcut techniques / elimination strategies where applicable.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an elite competitive exam paper setter. Formulate questions with high discriminant power, realistic distractor options, and crystal-clear step-by-step justifications.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            testTitle: { type: Type.STRING },
            examName: { type: Type.STRING },
            subject: { type: Type.STRING },
            topic: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            recommendedTimeMinutes: { type: Type.NUMBER },
            passingScorePercent: { type: Type.NUMBER },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  codeSnippetOrContext: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: {
                    type: Type.NUMBER,
                    description: 'Zero-based index of correct option (0 for A, 1 for B, 2 for C, 3 for D)',
                  },
                  topicTag: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  detailedExplanation: { type: Type.STRING },
                  whyOptionsAreWrong: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  examTrickOrShortcut: { type: Type.STRING },
                  formulaUsed: { type: Type.STRING },
                },
                required: [
                  'id',
                  'questionText',
                  'options',
                  'correctOptionIndex',
                  'topicTag',
                  'difficulty',
                  'detailedExplanation',
                ],
              },
            },
          },
          required: [
            'testTitle',
            'examName',
            'subject',
            'topic',
            'difficulty',
            'recommendedTimeMinutes',
            'passingScorePercent',
            'instructions',
            'questions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-mock-test:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate mock test',
    });
  }
});

// 3.5 Dedicated Automated AI Exam Paper Generator by Course & Blueprint
app.post('/api/ai/generate-custom-exam-paper', async (req, res) => {
  try {
    const { blueprint } = req.body;
    if (!blueprint || !blueprint.courseCategory) {
      return res.status(400).json({ error: 'Blueprint with courseCategory is required.' });
    }

    const {
      courseCategory,
      subExam = 'Standard Examination',
      paperMode = 'Full Mock Test',
      targetSubject,
      targetTopic,
      difficulty = 'Exam-Standard',
      numQuestions = 10,
      timeLimitMinutes = 30,
      positiveMarks = 2,
      negativeMarks = 0.5,
      language = 'English',
      focusAreas = '',
      includeStepByStepProofs = true,
      includeWhyWrongAnalysis = true,
      includeShortcutTricks = true,
    } = blueprint;

    const count = Math.min(Math.max(Number(numQuestions) || 10, 3), 30);
    const ai = getGeminiClient();

    const prompt = `You are the Chief Examiner and Paper Setter for national competitive examinations.
Generate a complete, official-pattern exam paper for:
- Course Track: "${courseCategory}"
- Specific Exam / Tier: "${subExam}"
- Exam Mode: "${paperMode}"
- Target Subject: "${targetSubject || 'Multi-Subject / Comprehensive Syllabus'}"
- Specific Focus Topic: "${targetTopic || 'All High-Yield Units'}"
- Difficulty Calibration: "${difficulty}"
- Number of Questions to Generate: ${count}
- Time Limit: ${timeLimitMinutes} minutes
- Marking Scheme: +${positiveMarks} for correct, -${negativeMarks} for incorrect
- Language: "${language}"
- Specific Student Focus / Guidelines: "${focusAreas || 'Follow authentic latest exam pattern & syllabus'}"

Requirements:
1. Ensure the questions precisely reflect the actual syllabus, tone, and standard of ${subExam} (${courseCategory}).
2. For Army/Defence (NDA/CDS/Agniveer): Focus on high-frequency math, military science, modern Indian defence tech, and physics/English.
3. For SSC (CGL/CHSL/MTS/CPO): Focus on Reasoning, Quantitative shortcuts, Grammar/Cloze, and Indian Polity/History.
4. For State PSC & Groups (APPSC/TSPSC/UPPSC/BPSC): Include state-relevant governance, polity, economy, and general mental ability.
5. For Railways (RRB NTPC/Group D): Include Speed Time Distance, Science applications, SI/CI, and Static GK.
6. For Banking (IBPS/SBI): Focus on Puzzles, DI sets, Syllogisms, and Financial terms.
7. Provide exact zero-based index for correctOptionIndex (0 = A, 1 = B, 2 = C, 3 = D).
8. ${includeStepByStepProofs ? 'Include crystal clear step-by-step solutions with mathematical working or constitutional/historical citations.' : ''}
9. ${includeWhyWrongAnalysis ? 'Explain why each of the 3 distractors is incorrect.' : ''}
10. ${includeShortcutTricks ? 'Include examiner shortcut tricks and elimination hacks.' : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an authoritative national exam paper setting council. Formulate authentic, unambiguous, discriminant questions with exact pedagogical solutions in structured JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            courseCategory: { type: Type.STRING },
            subExam: { type: Type.STRING },
            paperMode: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            totalMarks: { type: Type.NUMBER },
            timeLimitMinutes: { type: Type.NUMBER },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  questionCount: { type: Type.NUMBER },
                  positiveMarks: { type: Type.NUMBER },
                  negativeMarks: { type: Type.NUMBER },
                },
                required: ['name', 'questionCount', 'positiveMarks', 'negativeMarks'],
              },
            },
            instructions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  codeSnippetOrContext: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.NUMBER },
                  topicTag: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  detailedExplanation: { type: Type.STRING },
                  whyOptionsAreWrong: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  examTrickOrShortcut: { type: Type.STRING },
                  formulaUsed: { type: Type.STRING },
                },
                required: [
                  'id',
                  'questionText',
                  'options',
                  'correctOptionIndex',
                  'topicTag',
                  'difficulty',
                  'detailedExplanation',
                ],
              },
            },
          },
          required: [
            'title',
            'courseCategory',
            'subExam',
            'paperMode',
            'difficulty',
            'totalMarks',
            'timeLimitMinutes',
            'sections',
            'instructions',
            'questions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const paperId = `paper-${Date.now()}`;
    const fullPaper = {
      ...parsed,
      id: paperId,
      generatedAt: new Date().toISOString(),
      aiModelUsed: 'Gemini 3.7 Flash',
      blueprint,
    };

    res.json({ success: true, data: fullPaper });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-custom-exam-paper:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate custom AI exam paper',
    });
  }
});

// 4. AI Doubt Solver & Interactive Tutor Endpoint
app.post('/api/ai/solve-doubt', async (req, res) => {
  try {
    const { examName, questionOrDoubt, topicContext, studentAttempt } = req.body;

    if (!questionOrDoubt) {
      return res.status(400).json({ error: 'Question or doubt is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `The student is preparing for "${examName || 'Competitive Exam'}" and has the following question/doubt:
Problem / Doubt: "${questionOrDoubt}"
Topic Context: "${topicContext || 'General'}"
Student's Attempt / Thought Process: "${studentAttempt || 'Student was unsure where to start'}"

Provide a structured, step-by-step master solution, diagnosing any underlying misconceptions, giving the fastest exam technique, and providing 2 similar practice drill questions.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an empathetic, world-class private tutor. Break down complex steps clearly and encourage the student while reinforcing core concepts.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            directAnswer: { type: Type.STRING },
            corePrinciple: { type: Type.STRING },
            stepByStepWorking: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  stepTitle: { type: Type.STRING },
                  calculationOrLogic: { type: Type.STRING },
                },
                required: ['stepNumber', 'stepTitle', 'calculationOrLogic'],
              },
            },
            studentDiagnosis: {
              type: Type.OBJECT,
              properties: {
                likelyMisconception: { type: Type.STRING },
                howToThinkCorrectly: { type: Type.STRING },
              },
              required: ['likelyMisconception', 'howToThinkCorrectly'],
            },
            proExamShortcut: { type: Type.STRING },
            formulaCheatSheet: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            similarPracticeQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'hint', 'answer'],
              },
            },
          },
          required: [
            'directAnswer',
            'corePrinciple',
            'stepByStepWorking',
            'studentDiagnosis',
            'proExamShortcut',
            'formulaCheatSheet',
            'similarPracticeQuestions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/solve-doubt:', error);
    res.status(500).json({
      error: error.message || 'Failed to solve doubt',
    });
  }
});

// 5. AI Flashcards Generator Endpoint
app.post('/api/ai/flashcards', async (req, res) => {
  try {
    const { examName, subject, topic, cardCount = 8 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const count = Math.min(Math.max(Number(cardCount) || 8, 4), 20);

    const ai = getGeminiClient();
    const prompt = `Create ${count} high-yield, active-recall revision flashcards for:
Exam: "${examName || 'Competitive Exam'}"
Subject: "${subject || 'General'}"
Topic: "${topic}"

Focus on core definitions, formulas, exceptions, high-frequency facts, and quick calculation tricks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert in spaced repetition and active recall for students preparing for competitive exams.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: { type: Type.STRING },
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  category: { type: Type.STRING }, // 'Formula' | 'Concept' | 'Exception' | 'Trick'
                  frontPrompt: { type: Type.STRING },
                  backAnswer: { type: Type.STRING },
                  keyMnemonicOrHint: { type: Type.STRING },
                  highYieldImportance: { type: Type.STRING }, // 'High' | 'Very High' | 'Crucial'
                },
                required: [
                  'id',
                  'category',
                  'frontPrompt',
                  'backAnswer',
                  'keyMnemonicOrHint',
                  'highYieldImportance',
                ],
              },
            },
          },
          required: ['deckTitle', 'topic', 'cards'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/flashcards:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate flashcards',
    });
  }
});

// 6. AI Syllabus Research & Exam Pattern Explorer Endpoint
app.post('/api/ai/syllabus-research', async (req, res) => {
  try {
    const { examName, targetStreamOrTier } = req.body;

    if (!examName) {
      return res.status(400).json({ error: 'Exam name is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Conduct an in-depth research breakdown of the syllabus, exam pattern, marking scheme, topic weightages, and previous year trends for:
Exam / Course: "${examName}"
Stream / Tier: "${targetStreamOrTier || 'Standard General'}"

Provide a structured, accurate, comprehensive analysis with recommended books/resources, high-yield topics vs low-yield traps, and strategic roadmap.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a leading educational researcher and competitive examination analyst.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            examTitle: { type: Type.STRING },
            conductingBody: { type: Type.STRING },
            examPattern: {
              type: Type.OBJECT,
              properties: {
                mode: { type: Type.STRING },
                totalMarks: { type: Type.NUMBER },
                durationMinutes: { type: Type.NUMBER },
                markingScheme: { type: Type.STRING },
                negativeMarking: { type: Type.STRING },
                sectionsCount: { type: Type.NUMBER },
              },
              required: [
                'mode',
                'totalMarks',
                'durationMinutes',
                'markingScheme',
                'negativeMarking',
              ],
            },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sectionName: { type: Type.STRING },
                  approxQuestions: { type: Type.NUMBER },
                  approxMarks: { type: Type.NUMBER },
                  difficultyTrend: { type: Type.STRING },
                  highYieldTopics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topicName: { type: Type.STRING },
                        weightagePercent: { type: Type.NUMBER },
                        frequency: { type: Type.STRING },
                        strategicAdvice: { type: Type.STRING },
                      },
                      required: ['topicName', 'weightagePercent', 'frequency', 'strategicAdvice'],
                    },
                  },
                },
                required: ['sectionName', 'approxQuestions', 'approxMarks', 'highYieldTopics'],
              },
            },
            recentTrendChanges: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedBooksAndResources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  bookOrPlatform: { type: Type.STRING },
                  whyRecommended: { type: Type.STRING },
                },
                required: ['subject', 'bookOrPlatform', 'whyRecommended'],
              },
            },
            fatalMistakesToAvoid: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'examTitle',
            'conductingBody',
            'examPattern',
            'sections',
            'recentTrendChanges',
            'recommendedBooksAndResources',
            'fatalMistakesToAvoid',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/syllabus-research:', error);
    res.status(500).json({
      error: error.message || 'Failed to research syllabus',
    });
  }
});

// 7. AI Performance Diagnostic & Recovery Roadmap
app.post('/api/ai/analyze-results', async (req, res) => {
  try {
    const { testTitle, examName, totalQuestions, score, correctCount, wrongCount, unattemptedCount, timeSpentSeconds, topicBreakdown } = req.body;

    const ai = getGeminiClient();
    const prompt = `Analyze a student's mock test performance:
Test: "${testTitle || 'Mock Exam'}"
Target Exam: "${examName || 'Competitive Exam'}"
Total Questions: ${totalQuestions}
Correct: ${correctCount}, Wrong: ${wrongCount}, Unattempted: ${unattemptedCount}
Final Score: ${score}
Time Spent: ${timeSpentSeconds} seconds
Topic Performance Breakdown: ${JSON.stringify(topicBreakdown || [])}

Provide an actionable diagnostic report with speed vs accuracy assessment, weakness isolation, predicted readiness percentile, and a 7-day targeted recovery drill plan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a high-performance cognitive coach for competitive test-takers.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallVerdict: { type: Type.STRING },
            readinessPercentileEstimate: { type: Type.STRING },
            strengthAreas: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            criticalWeaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            timeManagementAnalysis: { type: Type.STRING },
            negativeMarkingLossAnalysis: { type: Type.STRING },
            sevenDayRecoveryRoadmap: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  actionableGoal: { type: Type.STRING },
                  recommendedResourceOrDrill: { type: Type.STRING },
                },
                required: ['day', 'actionableGoal', 'recommendedResourceOrDrill'],
              },
            },
            mindsetAdvice: { type: Type.STRING },
          },
          required: [
            'overallVerdict',
            'readinessPercentileEstimate',
            'strengthAreas',
            'criticalWeaknesses',
            'timeManagementAnalysis',
            'negativeMarkingLossAnalysis',
            'sevenDayRecoveryRoadmap',
            'mindsetAdvice',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-results:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze test results',
    });
  }
});

// 8. AI Explanation-on-Demand: Explain Differently
app.post('/api/ai/explain-differently', async (req, res) => {
  try {
    const { questionText, options, correctAnswer, originalExplanation, style } = req.body;
    const ai = getGeminiClient();

    const styleInstructions: Record<string, string> = {
      'analogy': 'Explain strictly through an engaging, memorable real-world analogy or visual metaphor that makes the logic instantly intuitive.',
      'first-principles': 'Deconstruct from mathematical/fundamental first principles with rigorous step-by-step proofs and no skipped algebra.',
      'speed-trick': 'Explain purely as a 30-second speed-solver: showcase unit-digit checks, boundary conditions, option elimination, and examiner trap avoidance.',
      'eli5': 'Explain as if to a 10-year old: ultra-simple language, zero unnecessary jargon, crystal clear cause-and-effect.',
      'visual-steps': 'Provide a crystal clear ASCII/bulleted visual flow diagram illustrating how each variable interacts step by step.'
    };

    const chosenInstruction = styleInstructions[style] || styleInstructions['analogy'];

    const prompt = `You are a master educator. A student struggled with this question and needs a fresh, alternative perspective.
Question: "${questionText}"
Options: ${JSON.stringify(options || [])}
Correct Answer: "${correctAnswer}"
Original Explanation: "${originalExplanation || 'Standard textbook solution'}"

Requested Explanation Style: "${style}"
Style Guidelines: ${chosenInstruction}

Generate a concise, brilliant alternative explanation following the JSON schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an award-winning competitive exam educator who can explain any tricky concept from multiple cognitive angles.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: { type: Type.STRING },
            alternativeExplanation: { type: Type.STRING },
            keyVisualOrAnalogy: { type: Type.STRING },
            examDayRuleOfThumb: { type: Type.STRING },
            goldenRule: { type: Type.STRING },
          },
          required: ['styleName', 'alternativeExplanation', 'keyVisualOrAnalogy', 'examDayRuleOfThumb', 'goldenRule'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/explain-differently:', error);
    res.status(500).json({ error: error.message || 'Failed to generate alternative explanation' });
  }
});

// 9. AI Question Follow-Up Chat
app.post('/api/ai/question-followup', async (req, res) => {
  try {
    const { questionText, options, correctAnswer, explanation, userMessage, chatHistory } = req.body;
    const ai = getGeminiClient();

    const historyFormatted = (chatHistory || [])
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n');

    const prompt = `Context:
Question: "${questionText}"
Options: ${JSON.stringify(options || [])}
Correct Answer: "${correctAnswer}"
Detailed Solution: "${explanation}"

Prior Conversation:
${historyFormatted || 'None'}

Student's Follow-up Query: "${userMessage}"

Respond as an expert tutor. Directly answer the student's exact doubt, clarify why their specific alternative thought might be tempting but flawed (if applicable), and reinforce with an instant mini-rule.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm, precise, pedagogical exam tutor. Keep answers crisp, highly targeted, and supportive.',
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/question-followup:', error);
    res.status(500).json({ error: error.message || 'Failed to answer follow-up query' });
  }
});

// 10. Speed & Accuracy Trainer Micro-Drills (5-min 10-Q Rapid Sprint)
app.post('/api/ai/speed-trainer', async (req, res) => {
  try {
    const { examName, subject, topic, drillType } = req.body;
    const ai = getGeminiClient();

    const prompt = `Create a high-energy, 10-question rapid pacing sprint for competitive exam speed training.
Target Exam: "${examName || 'Competitive Exam'}"
Subject: "${subject || 'Quantitative / Aptitude / Logic'}"
Topic: "${topic || 'High-Yield Speed Drills'}"
Drill Type: "${drillType || 'Speed & Accuracy Sprint (30s/question)'}"

Requirements:
- Exactly 10 questions designed to test rapid pattern recognition, mental calculation shortcuts, elimination heuristics, and conceptual reflex.
- Clear, unambiguous questions with 4 options.
- Zero-based index of correct option.
- Include a "15-second shortcut trick" for each question so students learn how to solve it in under 30 seconds.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an Olympic-grade speed math and reasoning trainer for competitive exams.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            examName: { type: Type.STRING },
            targetPaceSecondsPerQuestion: { type: Type.NUMBER },
            totalTimeLimitSeconds: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  questionText: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.NUMBER },
                  topicTag: { type: Type.STRING },
                  speedShortcut: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                },
                required: ['id', 'questionText', 'options', 'correctOptionIndex', 'topicTag', 'speedShortcut', 'explanation'],
              },
            },
          },
          required: ['title', 'examName', 'targetPaceSecondsPerQuestion', 'totalTimeLimitSeconds', 'questions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/speed-trainer:', error);
    res.status(500).json({ error: error.message || 'Failed to generate speed trainer drill' });
  }
});

// 11. Adaptive Engine: Generate Real-Time Next Question
app.post('/api/ai/adaptive-next-question', async (req, res) => {
  try {
    const { examName, subject, topic, currentLevel, recentPerformance, targetDifficulty } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are the core adaptive engine for a premier competitive exam prep platform.
Target Exam: "${examName || 'CAT / JEE / GATE / UPSC'}"
Subject: "${subject || 'General'}"
Topic: "${topic || 'General Practice'}"
Current Student Ability Level: "${currentLevel || 'Intermediate'}"
Target Difficulty for Next Question: "${targetDifficulty || 'Medium'}"
Recent Answer History: ${JSON.stringify(recentPerformance || {})}

Generate ONE single adaptive question calibrated precisely to this difficulty.
If the student is on a correct streak, raise the cognitive demand (application/multi-step reasoning). If the student recently failed, provide a foundational question that tests the root concept with clear diagnostic feedback.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an adaptive testing algorithm (similar to CAT/GMAT computer-adaptive testing). Deliver high-discriminant single questions with rich metadata.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            questionText: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correctOptionIndex: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
            topicTag: { type: Type.STRING },
            detailedExplanation: { type: Type.STRING },
            whyOptionsAreWrong: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            shortcutTip: { type: Type.STRING },
            targetSolvingTimeSeconds: { type: Type.NUMBER },
          },
          required: ['id', 'questionText', 'options', 'correctOptionIndex', 'difficulty', 'topicTag', 'detailedExplanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/adaptive-next-question:', error);
    res.status(500).json({ error: error.message || 'Failed to generate adaptive question' });
  }
});

// 12. Daily Current Affairs & Editorial Digest (UPSC, Banking, SSC, CLAT)
app.post('/api/ai/current-affairs', async (req, res) => {
  try {
    const { examVertical, date } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate a high-yield, exam-focused Daily Current Affairs & Editorial Digest for competitive exam aspirants.
Vertical: "${examVertical || 'UPSC & Government Exams'}"
Date: "${date || new Date().toISOString().split('T')[0]}"

Include:
1. Top 4 high-yield national/international events categorized by GS syllabus (Economy, Polity, S&T, Environment, IR).
2. Deep Editorial Analysis with Prelims/Mains takeaway.
3. 5 Exam-Grade MCQs with answers and detailed explanations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a senior current affairs analyst and editor for top national civil services & banking academies.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            headlineDigest: { type: Type.STRING },
            articles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  coreFacts: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  examSignificance: { type: Type.STRING },
                  keyTerms: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['category', 'title', 'coreFacts', 'examSignificance', 'keyTerms'],
              },
            },
            editorialInsight: {
              type: Type.OBJECT,
              properties: {
                topic: { type: Type.STRING },
                theIssue: { type: Type.STRING },
                prosOrArguments: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                wayForward: { type: Type.STRING },
              },
              required: ['topic', 'theIssue', 'wayForward'],
            },
            dailyMCQs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctOptionIndex: { type: Type.NUMBER },
                  explanation: { type: Type.STRING },
                  syllabusTag: { type: Type.STRING },
                },
                required: ['id', 'question', 'options', 'correctOptionIndex', 'explanation', 'syllabusTag'],
              },
            },
          },
          required: ['date', 'headlineDigest', 'articles', 'editorialInsight', 'dailyMCQs'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/current-affairs:', error);
    res.status(500).json({ error: error.message || 'Failed to generate current affairs digest' });
  }
});

// 13. Peer Leaderboard & AIR Rank Predictor
app.post('/api/ai/rank-predictor', async (req, res) => {
  try {
    const { examName, rawScore, maxScore, accuracyPercent, timeTakenMinutes, category, historicalAttemptsCount } = req.body;
    const ai = getGeminiClient();

    const prompt = `Act as an expert competitive exam psychometrician and statistical rank predictor calibrated on national historical student cohorts (e.g. T.I.M.E., Testbook, Embibe, CL dataset trends).
Exam: "${examName || 'CAT 2026'}"
Raw Score: ${rawScore} / ${maxScore}
Accuracy: ${accuracyPercent}%
Time Taken: ${timeTakenMinutes} minutes
Reservation / Category: "${category || 'General'}"
Historical Mock Attempts Logged: ${historicalAttemptsCount || 5}

Calculate:
1. Estimated Percentile range (e.g., 98.4 - 99.1 %ile).
2. Predicted All India Rank (AIR) range out of total national applicants.
3. College / Target Institute Shortlist probability: Top tier (Safe / Target / Dream calls).
4. Sectional threshold gaps needed to leap into the next percentile bracket (+5 marks impact).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a master statistical analyst for competitive entrance exams.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedPercentileMin: { type: Type.NUMBER },
            predictedPercentileMax: { type: Type.NUMBER },
            predictedAIRRange: { type: Type.STRING },
            totalNationalCandidates: { type: Type.STRING },
            scoreCategoryGrade: { type: Type.STRING },
            institutePredictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  instituteName: { type: Type.STRING },
                  programName: { type: Type.STRING },
                  admissionChance: { type: Type.STRING }, // 'High / Safe' | 'Target / Competitive' | 'Dream / Stretch'
                  historicCutoffPercentile: { type: Type.STRING },
                  strategicTip: { type: Type.STRING },
                },
                required: ['instituteName', 'programName', 'admissionChance', 'historicCutoffPercentile', 'strategicTip'],
              },
            },
            percentileBoosterStrategy: {
              type: Type.OBJECT,
              properties: {
                marginalGainImpact: { type: Type.STRING },
                highestROISection: { type: Type.STRING },
                actionItems: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['marginalGainImpact', 'highestROISection', 'actionItems'],
            },
          },
          required: ['predictedPercentileMin', 'predictedPercentileMax', 'predictedAIRRange', 'totalNationalCandidates', 'scoreCategoryGrade', 'institutePredictions', 'percentileBoosterStrategy'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/rank-predictor:', error);
    res.status(500).json({ error: error.message || 'Failed to predict rank' });
  }
});

// 14. AI College & Course Mentor / Counsellor
app.post('/api/ai/mentor-counsellor', async (req, res) => {
  try {
    const { examName, studentProfile, userQuery, conversationHistory } = req.body;
    const ai = getGeminiClient();

    const historyFormatted = (conversationHistory || [])
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'Counsellor'}: ${m.text}`)
      .join('\n');

    const prompt = `You are a premier senior admissions counsellor and career strategist (representing elite coaching guidance like T.I.M.E. counselling services).
Exam: "${examName || 'MBA / Tech / Civil Services'}"
Student Profile & Scores: "${studentProfile || 'Undergraduate student preparing for competitive exam'}"

Conversation History:
${historyFormatted || 'None'}

Student's Query: "${userQuery}"

Provide warm, high-integrity, actionable advisory on college selection, ROI comparison, profile evaluation, interview/WAT/GD prep, and backup plans.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authoritative, warm, and highly experienced higher education counsellor.',
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/mentor-counsellor:', error);
    res.status(500).json({ error: error.message || 'Failed to consult counsellor' });
  }
});

// 15. AI Multimodal OCR Question Doubt Solver (Image or Text)
app.post('/api/ai/ocr-doubt', async (req, res) => {
  try {
    const { examName, questionText, imageBase64, mimeType } = req.body;
    const ai = getGeminiClient();

    const contents: any[] = [];
    if (imageBase64) {
      contents.push({
        inlineData: {
          data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    contents.push({
      text: `Solve this competitive exam problem with utmost mathematical/logical precision:
Exam: "${examName || 'Competitive Exam'}"
Attached text/transcription: "${questionText || 'See image'}"

Provide:
1. Transcribed question statement.
2. Direct final answer.
3. Core concept/theorem applied.
4. Complete step-by-step working.
5. Common traps students fall into.
6. 15-second shortcut method.`,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        systemInstruction: 'You are a master STEM/Aptitude tutor capable of parsing handwritten or printed exam diagrams, formulas, and questions.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcribedQuestion: { type: Type.STRING },
            directAnswer: { type: Type.STRING },
            corePrinciple: { type: Type.STRING },
            stepByStepWorking: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.NUMBER },
                  stepTitle: { type: Type.STRING },
                  calculationOrLogic: { type: Type.STRING },
                },
                required: ['stepNumber', 'stepTitle', 'calculationOrLogic'],
              },
            },
            studentDiagnosis: {
              type: Type.OBJECT,
              properties: {
                likelyMisconception: { type: Type.STRING },
                howToThinkCorrectly: { type: Type.STRING },
              },
              required: ['likelyMisconception', 'howToThinkCorrectly'],
            },
            proExamShortcut: { type: Type.STRING },
            formulaCheatSheet: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            similarPracticeQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  hint: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'hint', 'answer'],
              },
            },
          },
          required: [
            'transcribedQuestion',
            'directAnswer',
            'corePrinciple',
            'stepByStepWorking',
            'studentDiagnosis',
            'proExamShortcut',
            'formulaCheatSheet',
            'similarPracticeQuestions',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/ocr-doubt:', error);
    res.status(500).json({ error: error.message || 'Failed to solve uploaded doubt' });
  }
});

// 16. AI Essay & Descriptive Answer Evaluation Studio
app.post('/api/ai/evaluate-essay', async (req, res) => {
  try {
    const { examName, essayPrompt, studentAnswer, wordLimit, markingStandard } = req.body;

    if (!essayPrompt || !studentAnswer) {
      return res.status(400).json({ error: 'Essay prompt and student answer text are required.' });
    }

    const ai = getGeminiClient();
    const prompt = `You are a senior examiner and master essay evaluator for competitive examinations (${examName || 'Academic & Competitive Exams'}).
Evaluate this student's descriptive essay/answer strictly against official evaluation rubrics (such as UPSC Mains, GRE AWA, IELTS Task 2, CAT WAT, or Law Essay standards).

Exam Context: "${examName}"
Marking Standard/Scale: "${markingStandard || 'Standard 15-Mark UPSC / 6.0 GRE / 100-Point Scale'}"
Word Limit: "${wordLimit || '250-500 words'}"
Prompt Question:
"""${essayPrompt}"""

Student Answer:
"""${studentAnswer}"""

Provide an exhaustive, constructive, unbiased grading assessment:
1. Overall Score out of 100 or exam-appropriate max score with percentile band.
2. Criterion breakdown: (Thesis & Relevance, Analytical Depth & Arguments, Evidence/Facts/Case Studies/Data, Structure & Flow, Language & Tone).
3. Missing essential keywords, government committees, historical/statistical evidence, or counter-arguments.
4. Line-by-line constructive feedback.
5. An AI Exemplar Model Answer Rewrite demonstrating how a top 1% topper would structure and write this exact answer.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an authoritative, rigorous academic examiner providing detailed rubric-based grading and actionable feedback in clean JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            maxPossibleScore: { type: Type.NUMBER },
            gradePercentage: { type: Type.NUMBER },
            readinessBand: { type: Type.STRING },
            summaryVerdict: { type: Type.STRING },
            criteriaBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  scoreAwarded: { type: Type.NUMBER },
                  maxScore: { type: Type.NUMBER },
                  critique: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['criterion', 'scoreAwarded', 'maxScore', 'critique', 'strengths', 'areasToImprove'],
              },
            },
            keyTermsAndEvidenceMissing: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            grammarAndToneReview: {
              type: Type.OBJECT,
              properties: {
                vocabularyRating: { type: Type.STRING },
                flowAndTransitions: { type: Type.STRING },
                actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['vocabularyRating', 'flowAndTransitions', 'actionableSuggestions'],
            },
            modelAnswerRewrite: { type: Type.STRING },
          },
          required: [
            'overallScore',
            'maxPossibleScore',
            'gradePercentage',
            'readinessBand',
            'summaryVerdict',
            'criteriaBreakdown',
            'keyTermsAndEvidenceMissing',
            'grammarAndToneReview',
            'modelAnswerRewrite',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/evaluate-essay:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate essay' });
  }
});

// 17. AI Mind Map & Concept Hierarchy Generator
app.post('/api/ai/mindmap', async (req, res) => {
  try {
    const { topic, examName } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const ai = getGeminiClient();
    const prompt = `Generate a hierarchical knowledge tree / mind map for the topic: "${topic}" tailored for the exam: "${examName || 'Competitive Exam'}".
Break it down logically from root topic into 3-5 major branches, each branching into 2-4 granular leaf sub-concepts with importance ratings, key formulas/definitions, and examiner trap warnings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an educational curriculum architect structuring knowledge trees in JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            examName: { type: Type.STRING },
            rootNode: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                importance: { type: Type.STRING },
                summary: { type: Type.STRING },
                keyFormulasOrFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                commonTrapWarning: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      categoryTag: { type: Type.STRING },
                      importance: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      keyFormulasOrFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                      commonTrapWarning: { type: Type.STRING },
                      children: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            id: { type: Type.STRING },
                            title: { type: Type.STRING },
                            importance: { type: Type.STRING },
                            summary: { type: Type.STRING },
                            keyFormulasOrFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
                            commonTrapWarning: { type: Type.STRING },
                          },
                          required: ['id', 'title', 'importance', 'summary'],
                        },
                      },
                    },
                    required: ['id', 'title', 'importance', 'summary'],
                  },
                },
              },
              required: ['id', 'title', 'importance', 'summary'],
            },
          },
          required: ['topic', 'examName', 'rootNode'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/mindmap:', error);
    res.status(500).json({ error: error.message || 'Failed to generate mind map' });
  }
});

// 12. AI Live Interview & Viva Simulator Endpoint
app.post('/api/ai/interview-turn', async (req, res) => {
  try {
    const {
      examName,
      persona,
      conversationHistory,
      candidateResponse,
      turnCount = 1,
    } = req.body;

    const ai = getGeminiClient();

    const prompt = `You are a real-world elite interviewer conducting a high-stakes interview/viva for "${examName}".
Your persona is: "${persona || 'IIM / MBA Director (Stress & Strategic Depth)'}".

Conversation history so far:
${JSON.stringify(conversationHistory || [], null, 2)}

The candidate just replied:
"${candidateResponse || 'Hello, I am ready for the interview.'}"

Turn number: ${turnCount}.

TASK:
1. Provide constructive, precise feedback on the candidate's last answer (Score 1-10, strengths, weaknesses/knowledge gaps, an exemplary 99th-percentile better answer, and any logical fallacy alert if applicable).
2. Generate your NEXT probing question. Stay in character! If the candidate was vague, probe deeper or challenge their premise. If they did well, escalate complexity with a scenario-based or ethics question.
3. If turnCount >= 5 or if candidate asks to wrap up, mark isInterviewComplete = true and provide final summary remarks.

Return ONLY valid JSON matching this schema:
{
  "nextInterviewerQuestion": "string",
  "isInterviewComplete": false,
  "feedback": {
    "scoreOutOf10": 8,
    "strengths": ["Clear articulation", "Used statistical reference"],
    "weaknesses": ["Missed counter-perspective", "Could structure using STAR framework"],
    "recommendedBetterAnswer": "A succinct 99th percentile response...",
    "fallacyAlert": "None or specific fallacy detected"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nextInterviewerQuestion: { type: Type.STRING },
            isInterviewComplete: { type: Type.BOOLEAN },
            feedback: {
              type: Type.OBJECT,
              properties: {
                scoreOutOf10: { type: Type.NUMBER },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendedBetterAnswer: { type: Type.STRING },
                fallacyAlert: { type: Type.STRING },
              },
              required: ['scoreOutOf10', 'strengths', 'weaknesses', 'recommendedBetterAnswer'],
            },
          },
          required: ['nextInterviewerQuestion', 'isInterviewComplete', 'feedback'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/interview-turn:', error);
    res.status(500).json({ error: error.message || 'Failed to process interview turn' });
  }
});

// 13. AI Document / Notes / Textbook Scanner & Quiz Synthesizer Endpoint
app.post('/api/ai/document-scan', async (req, res) => {
  try {
    const { examName, documentTitle, documentText } = req.body;

    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({ error: 'Document text cannot be empty.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class cognitive study material researcher for the exam "${examName || 'Competitive Exam'}".
Analyze the following study notes / textbook chapter / research excerpt:

Title: "${documentTitle || 'Study Document'}"
Content:
"""
${documentText.slice(0, 15000)}
"""

Perform deep structural extraction and synthesis:
1. Executive Summary: A crisp 3-4 sentence distillation of core ideas.
2. High-Yield Theorems, Formulas & Laws extracted from the text (with LaTeX / expressions).
3. 5-7 Key Concept Takeaways / Bullet points.
4. 4 Pro-level Multiple Choice Questions (Easy, Medium, Hard) strictly derived from this material with detailed rationales and distractors.
5. 4 High-impact Flashcards (Front/Back) for active recall spaced repetition.

Return ONLY valid JSON matching this schema:
{
  "title": "Clean document title",
  "executiveSummary": "Concise summary...",
  "highYieldTheoremsAndFormulas": ["Formula 1", "Theorem 2"],
  "keyConceptTakeaways": ["Key takeaway 1", "Key takeaway 2"],
  "generatedQuestions": [
    {
      "id": "q1",
      "questionText": "Question text...",
      "options": ["A", "B", "C", "D"],
      "correctOptionIndex": 0,
      "explanation": "Detailed explanation...",
      "difficulty": "Medium"
    }
  ],
  "generatedFlashcards": [
    {
      "front": "Concept or prompt question",
      "back": "Exact answer and high-yield takeaway"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            highYieldTheoremsAndFormulas: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyConceptTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            generatedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctOptionIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                },
                required: ['id', 'questionText', 'options', 'correctOptionIndex', 'explanation', 'difficulty'],
              },
            },
            generatedFlashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING },
                },
                required: ['front', 'back'],
              },
            },
          },
          required: [
            'title',
            'executiveSummary',
            'highYieldTheoremsAndFormulas',
            'keyConceptTakeaways',
            'generatedQuestions',
            'generatedFlashcards',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/document-scan:', error);
    res.status(500).json({ error: error.message || 'Failed to scan and synthesize document' });
  }
});

// 14. AI Multi-Agent Group Discussion & Debate Simulator Endpoint
app.post('/api/ai/debate-turn', async (req, res) => {
  try {
    const { topic, examName, conversationHistory, userSpeech } = req.body;

    const ai = getGeminiClient();

    const prompt = `You are the AI engine powering an elite Group Discussion (GD) and Debate Simulator for "${examName || 'Competitive Admissions'}".
The GD Topic is: "${topic || 'Artificial Intelligence: Regulation vs Innovation'}".

Panel Participants:
1. "Dr. Sarah Chen (Moderator)" - Keeps time, ensures decorum, nudges discussion towards synthesis.
2. "Vikram Malhotra (The Skeptic / Contrarian)" - Challenges assumptions, spots edge cases, emphasizes risks.
3. "Elena Rostova (The Data-Driven Economist)" - Cites market stats, fiscal implications, incentives.
4. "Aarav Patel (The Technologist & Ethicist)" - Focuses on technical feasibility, societal fairness, and long-term vision.

Conversation History so far:
${JSON.stringify(conversationHistory || [], null, 2)}

The candidate (User) just spoke:
"${userSpeech || 'I believe we need balanced regulation that fosters innovation while protecting consumer rights.'}"

TASK:
1. Provide concise coaching feedback on the user's speech (Clarity Score 1-10, Impact Score 1-10, Counter Argument Strength, and 1 actionable Pro Tip to score 99th-percentile in GD).
2. Generate 1 or 2 responses from the AI panel participants that react DIRECTLY to what the user just argued. They should either agree and add a data point, or respectfully challenge the user's argument with a counter-example.

Return ONLY valid JSON matching this schema:
{
  "userFeedback": {
    "clarityScore": 8,
    "impactScore": 7,
    "counterArgumentStrength": "Strong analytical foundation but lacked quantitative figures.",
    "proTip": "Quote the EU AI Act risk tiers to anchor your argument with concrete policy."
  },
  "nextTurns": [
    {
      "speakerId": "vikram",
      "speakerName": "Vikram Malhotra",
      "speakerRole": "The Skeptic",
      "text": "While that sounds noble in theory, how do you prevent compliance burdens from suffocating early-stage bootstrapped startups?"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            userFeedback: {
              type: Type.OBJECT,
              properties: {
                clarityScore: { type: Type.NUMBER },
                impactScore: { type: Type.NUMBER },
                counterArgumentStrength: { type: Type.STRING },
                proTip: { type: Type.STRING },
              },
              required: ['clarityScore', 'impactScore', 'counterArgumentStrength', 'proTip'],
            },
            nextTurns: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speakerId: { type: Type.STRING },
                  speakerName: { type: Type.STRING },
                  speakerRole: { type: Type.STRING },
                  text: { type: Type.STRING },
                },
                required: ['speakerId', 'speakerName', 'speakerRole', 'text'],
              },
            },
          },
          required: ['userFeedback', 'nextTurns'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/debate-turn:', error);
    res.status(500).json({ error: error.message || 'Failed to process debate turn' });
  }
});

// Algorithmic Code Big-O & Complexity Analysis Endpoint
app.post('/api/ai/analyze-code', async (req, res) => {
  try {
    const { problemTitle, language, code } = req.body;
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this ${language} algorithm for the problem "${problemTitle}":
\`\`\`${language}
${code}
\`\`\`
Provide a formal Big-O asymptotic analysis and examination relevance.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            timeComplexity: { type: Type.STRING },
            spaceComplexity: { type: Type.STRING },
            explanation: { type: Type.STRING },
            gateRelevance: { type: Type.STRING },
          },
          required: ['timeComplexity', 'spaceComplexity', 'explanation', 'gateRelevance'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error in /api/ai/analyze-code:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze algorithm',
      data: {
        timeComplexity: 'O(N * W)',
        spaceComplexity: 'O(N * W)',
        explanation: 'Dynamic programming state table iterating across items and capacity.',
        gateRelevance: 'Classic recurrence problem frequently tested in GATE CS algorithms.',
      },
    });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Exam & Course Prep server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
