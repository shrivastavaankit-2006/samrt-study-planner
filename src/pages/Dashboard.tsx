import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserPlans, deletePlan } from '../services/studyPlan';
import { StudyPlan } from '../types';
import Navbar from '../components/Navbar';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            if (user) {
                try {
                    const userPlans = await getUserPlans(user.uid);
                    setPlans(userPlans);
                } catch (error) {
                    console.error('Error fetching plans:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchPlans();
    }, [user]);

    const handleDelete = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this study plan?')) return;

        setDeletingId(planId);
        try {
            await deletePlan(planId);
            setPlans(plans.filter(p => p.id !== planId));
        } catch (error) {
            console.error('Error deleting plan:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    };

    const getDaysUntilExam = (examDate: string) => {
        const today = new Date();
        const exam = new Date(examDate);
        const diffTime = exam.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="min-h-screen">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span>! 👋
                    </h1>
                    <p className="text-gray-400">Ready to ace your exams? Let's plan your study sessions.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Total Plans</p>
                                <p className="text-2xl font-bold text-white">{plans.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Subjects Covered</p>
                                <p className="text-2xl font-bold text-white">
                                    {plans.reduce((acc, p) => acc + p.subjects.length, 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <Link to="/create-plan" className="flex items-center space-x-4 group">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm">Create New</p>
                                <p className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">Study Plan →</p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Study Plans List */}
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Your Study Plans</h2>
                        <Link to="/create-plan" className="btn-secondary text-sm py-2 px-4">
                            + New Plan
                        </Link>
                    </div>

                    {loading ? (
                        <div className="card flex items-center justify-center py-12">
                            <div className="spinner"></div>
                        </div>
                    ) : plans.length === 0 ? (
                        <div className="card text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">No study plans yet</h3>
                            <p className="text-gray-400 mb-4">Create your first AI-powered study plan to get started!</p>
                            <Link to="/create-plan" className="btn-primary inline-flex items-center space-x-2">
                                <span>Create Your First Plan</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {plans.map((plan) => {
                                const daysLeft = getDaysUntilExam(plan.examDate);
                                return (
                                    <div key={plan.id} className="card hover:border-violet-500/30 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {plan.subjects.slice(0, 3).map((subject, i) => (
                                                        <span
                                                            key={i}
                                                            className={`px-2 py-1 rounded-full text-xs font-medium ${subject.difficulty === 'Hard'
                                                                    ? 'bg-red-500/20 text-red-300'
                                                                    : subject.difficulty === 'Medium'
                                                                        ? 'bg-yellow-500/20 text-yellow-300'
                                                                        : 'bg-green-500/20 text-green-300'
                                                                }`}
                                                        >
                                                            {subject.name}
                                                        </span>
                                                    ))}
                                                    {plan.subjects.length > 3 && (
                                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                                                            +{plan.subjects.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-sm">
                                                    Created {formatDate(plan.createdAt)} • {plan.dailyHours}h/day
                                                </p>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className={`text-right ${daysLeft < 7 ? 'text-red-400' : daysLeft < 14 ? 'text-yellow-400' : 'text-green-400'}`}>
                                                    <p className="text-2xl font-bold">{daysLeft > 0 ? daysLeft : 0}</p>
                                                    <p className="text-xs">days left</p>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <Link
                                                        to={`/plan/${plan.id}`}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => plan.id && handleDelete(plan.id)}
                                                        disabled={deletingId === plan.id}
                                                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors text-gray-300 hover:text-red-400"
                                                    >
                                                        {deletingId === plan.id ? (
                                                            <div className="spinner w-5 h-5"></div>
                                                        ) : (
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
