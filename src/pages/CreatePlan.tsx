import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { generateStudyPlan } from '../services/api';
import { createStudyPlan } from '../services/studyPlan';
import { Subject, DifficultyLevel } from '../types';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadPlanAsExcel } from '../utils/excelExport';

const CreatePlan: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Initialize with one empty subject
    const [subjects, setSubjects] = useState<Subject[]>([{
        name: '',
        difficulty: 'Medium',
        examDate: '',
        dailyHours: 2
    }]);

    // Global exam date and hours are no longer used as primary inputs
    // but we need to pass something to the API/DB if they require it.
    // We'll calculate "overall" values from subjects or keep dummy values for backward compatibility if needed.

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleAddSubject = () => {
        setSubjects([...subjects, {
            name: '',
            difficulty: 'Medium',
            examDate: '',
            dailyHours: 2
        }]);
    };

    const handleRemoveSubject = (index: number) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter((_, i) => i !== index));
        }
    };

    const handleSubjectChange = (index: number, field: keyof Subject, value: string | number) => {
        const updated = [...subjects];
        if (field === 'name') {
            updated[index].name = value as string;
        } else if (field === 'difficulty') {
            updated[index].difficulty = value as DifficultyLevel;
        } else if (field === 'examDate') {
            updated[index].examDate = value as string;
        } else if (field === 'dailyHours') {
            updated[index].dailyHours = value as number;
        }
        setSubjects(updated);
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setGeneratedPlan(null);

        // Validation
        const validSubjects = subjects.filter(s => s.name.trim() !== '');
        if (validSubjects.length === 0) {
            setError('Please add at least one subject');
            return;
        }

        // Validate per-subject fields
        for (const sub of validSubjects) {
            if (!sub.examDate) {
                setError(`Please select an exam date for ${sub.name}`);
                return;
            }
            const examDateObj = new Date(sub.examDate);
            if (examDateObj <= new Date()) {
                setError(`Exam date for ${sub.name} must be in the future`);
                return;
            }
        }

        setLoading(true);

        try {
            // Calculate a "global" exam date (the latest one) for the API interface if needed,
            // but the prompt builder will use the per-subject dates.
            const latestExamDate = validSubjects.reduce((latest: string, sub) => {
                const currentDate = sub.examDate || '';
                if (!currentDate) return latest;
                return (!latest || currentDate > latest) ? currentDate : latest;
            }, '');

            const totalDailyHours = validSubjects.reduce((sum, sub) => sum + (sub.dailyHours || 0), 0);

            const response = await generateStudyPlan({
                subjects: validSubjects,
                examDate: latestExamDate || new Date().toISOString().split('T')[0], // Fallback to today if no date 
                dailyHours: totalDailyHours,
            });

            if (response.success && response.plan) {
                setGeneratedPlan(response.plan);
            } else {
                setError(response.error || 'Failed to generate study plan');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!generatedPlan || !user) return;

        setSaving(true);
        try {
            const validSubjects = subjects.filter(s => s.name.trim() !== '');
            const latestExamDate = validSubjects.reduce((latest: string, sub) => {
                const currentDate = sub.examDate || '';
                if (!currentDate) return latest;
                return (!latest || currentDate > latest) ? currentDate : latest;
            }, '') || new Date().toISOString();

            const totalDailyHours = validSubjects.reduce((sum, sub) => sum + (sub.dailyHours || 0), 0);

            await createStudyPlan(user.uid, {
                subjects: validSubjects,
                examDate: latestExamDate,
                dailyHours: totalDailyHours,
            }, generatedPlan);

            navigate('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save study plan');
        } finally {
            setSaving(false);
        }
    };

    const getDifficultyColor = (difficulty: DifficultyLevel) => {
        switch (difficulty) {
            case 'Hard': return 'border-red-500 bg-red-500/10';
            case 'Medium': return 'border-yellow-500 bg-yellow-500/10';
            case 'Easy': return 'border-green-500 bg-green-500/10';
        }
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Create Study Plan</h1>
                    <p className="text-gray-400">Let AI generate a personalized study schedule for you</p>
                </div>

                {!generatedPlan ? (
                    <form onSubmit={handleGenerate} className="space-y-6">
                        {/* Subjects Section */}
                        <div className="card animate-slide-up">
                            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                                <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span>Subjects Configurations</span>
                            </h2>

                            <div className="space-y-6">
                                {subjects.map((subject, index) => (
                                    <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-medium text-gray-400">Subject {index + 1}</h3>
                                            {subjects.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSubject(index)}
                                                    className="text-gray-500 hover:text-red-400 transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-xs text-gray-400 mb-1">Subject Name</label>
                                                <input
                                                    type="text"
                                                    value={subject.name}
                                                    onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                                                    placeholder="e.g. Mathematics"
                                                    className="input-field"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Difficulty</label>
                                                <div className="flex gap-2">
                                                    {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((diff) => (
                                                        <button
                                                            key={diff}
                                                            type="button"
                                                            onClick={() => handleSubjectChange(index, 'difficulty', diff)}
                                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${subject.difficulty === diff
                                                                ? getDifficultyColor(diff)
                                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                                                }`}
                                                        >
                                                            {diff}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-400 mb-1">Exam Date</label>
                                                <input
                                                    type="date"
                                                    value={subject.examDate || ''}
                                                    onChange={(e) => handleSubjectChange(index, 'examDate', e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="input-field"
                                                />
                                            </div>

                                            <div className="col-span-1 md:col-span-2">
                                                <label className="block text-xs text-gray-400 mb-1">Daily Study Hours for this subject: <span className="text-white font-bold">{subject.dailyHours}h</span></label>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="6"
                                                    value={subject.dailyHours || 1}
                                                    onChange={(e) => handleSubjectChange(index, 'dailyHours', parseInt(e.target.value))}
                                                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={handleAddSubject}
                                className="mt-4 flex items-center space-x-2 text-violet-400 hover:text-violet-300 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span>Add Another Subject</span>
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center space-x-2 py-4 text-lg"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-6 h-6"></div>
                                    <span>Generating with AI...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Generate Study Plan</span>
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    /* Generated Plan Display */
                    <div className="animate-slide-up">
                        <div className="card mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Your AI-Generated Study Plan</span>
                                </h2>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                {/* Using a container that preserves markdown tables better */}
                                <div className="bg-white/5 p-6 rounded-xl overflow-x-auto">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            table: ({ node, ...props }) => (
                                                <table className="w-full text-left border-collapse my-4" {...props} />
                                            ),
                                            thead: ({ node, ...props }) => (
                                                <thead className="bg-white/10 text-violet-300" {...props} />
                                            ),
                                            tbody: ({ node, ...props }) => (
                                                <tbody className="text-gray-300" {...props} />
                                            ),
                                            tr: ({ node, ...props }) => (
                                                <tr className="border-b border-white/10 hover:bg-white/5 transition-colors" {...props} />
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="px-4 py-3 font-semibold text-sm uppercase tracking-wider" {...props} />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td className="px-4 py-3 text-sm whitespace-pre-wrap" {...props} />
                                            ),
                                            p: ({ node, ...props }) => (
                                                <p className="mb-4 leading-relaxed" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
                                            ),
                                            h1: ({ node, ...props }) => (
                                                <h1 className="text-2xl font-bold text-white mb-4 mt-6" {...props} />
                                            ),
                                            h2: ({ node, ...props }) => (
                                                <h2 className="text-xl font-semibold text-white mb-3 mt-5" {...props} />
                                            ),
                                            h3: ({ node, ...props }) => (
                                                <h3 className="text-lg font-medium text-white mb-2 mt-4" {...props} />
                                            ),
                                        }}
                                    >
                                        {generatedPlan}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleSavePlan}
                                disabled={saving}
                                className="btn-primary flex-1 flex items-center justify-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="spinner w-5 h-5"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Save & Go to Dashboard</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => downloadPlanAsExcel(generatedPlan, 'My_Study_Plan')}
                                className="btn-secondary flex items-center justify-center space-x-2 px-6"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Download Excel</span>
                            </button>

                            <button
                                onClick={() => setGeneratedPlan(null)}
                                className="btn-secondary flex items-center justify-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Regenerate</span>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CreatePlan;
