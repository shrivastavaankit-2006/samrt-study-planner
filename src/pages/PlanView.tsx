import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPlanById } from '../services/studyPlan';
import { StudyPlan } from '../types';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadPlanAsExcel } from '../utils/excelExport';

const PlanView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [plan, setPlan] = useState<StudyPlan | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlan = async () => {
            if (!id) {
                navigate('/dashboard');
                return;
            }

            try {
                const fetchedPlan = await getPlanById(id);
                if (fetchedPlan) {
                    setPlan(fetchedPlan);
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching plan:', error);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchPlan();
    }, [id, navigate]);

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(d);
    };

    const getDaysUntilExam = (examDate: string) => {
        const today = new Date();
        const exam = new Date(examDate);
        const diffTime = exam.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <div className="flex items-center justify-center py-20">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!plan) {
        return null;
    }

    const daysLeft = getDaysUntilExam(plan.examDate);

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Back Button */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Back to Dashboard</span>
                </Link>

                {/* Header */}
                <div className="card mb-6 animate-fade-in">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">Study Plan Details</h1>
                            <p className="text-gray-400">Created {formatDate(plan.createdAt)}</p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => downloadPlanAsExcel(plan.aiPlan, `StudyPlan_${formatDate(plan.createdAt).replace(/ /g, '_')}`)}
                                className="btn-secondary flex items-center space-x-2 px-4 py-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>Export Excel</span>
                            </button>

                            <div className={`text-center px-6 py-2 rounded-xl flex flex-col justify-center ${daysLeft < 7 ? 'bg-red-500/20' : daysLeft < 14 ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                }`}>
                                <p className={`text-2xl font-bold ${daysLeft < 7 ? 'text-red-400' : daysLeft < 14 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                    {daysLeft > 0 ? daysLeft : 0}
                                </p>
                                <p className="text-xs text-gray-400">days left</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Exam Date</p>
                                <p className="text-white font-semibold">{formatDate(plan.examDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Daily Hours</p>
                                <p className="text-white font-semibold">{plan.dailyHours} hours/day</p>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Subjects</p>
                                <p className="text-white font-semibold">{plan.subjects.length} subjects</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subjects */}
                <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-lg font-semibold text-white mb-4">Subjects & Difficulty</h2>
                    <div className="flex flex-wrap gap-2">
                        {plan.subjects.map((subject, index) => (
                            <span
                                key={index}
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${subject.difficulty === 'Hard'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : subject.difficulty === 'Medium'
                                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                        : 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    }`}
                            >
                                {subject.name} ({subject.difficulty})
                            </span>
                        ))}
                    </div>
                </div>

                {/* Study Plan */}
                <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span>Your Study Schedule</span>
                    </h2>
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
                            {plan.aiPlan}
                        </ReactMarkdown>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlanView;
