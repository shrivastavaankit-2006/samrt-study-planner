import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold gradient-text">StudyPlanner</span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-4">
                            <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                                Dashboard
                            </Link>
                            <Link to="/create-plan" className="text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                                Create Plan
                            </Link>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                                >
                                    <img
                                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=8b5cf6&color=fff`}
                                        alt="Profile"
                                        className="w-8 h-8 rounded-full border-2 border-violet-400"
                                    />
                                    <span className="font-medium">{user.name || 'User'}</span>
                                    <svg className={`w-4 h-4 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 glass-card py-2">
                                        <div className="px-4 py-2 border-b border-white/10">
                                            <p className="text-sm text-gray-400">Signed in as</p>
                                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mobile menu button */}
                    {user && (
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Mobile Navigation */}
                {user && isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        <Link to="/dashboard" className="block text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                            Dashboard
                        </Link>
                        <Link to="/create-plan" className="block text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                            Create Plan
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left text-red-400 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
