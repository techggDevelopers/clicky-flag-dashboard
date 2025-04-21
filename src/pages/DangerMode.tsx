import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const DangerMode: React.FC = () => {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const enableF1Flag = async () => {
            try {
                // Enable F1 flag for the user
                await axios.post('/api/flags/toggle/F1', {
                    enabled: true
                });
                setLoading(false);
            } catch (error) {
                console.error('Error enabling F1 flag:', error);
                setLoading(false);
            }
        };

        enableF1Flag();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            {/* <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tech Blog</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Latest updates and insights</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header> */}

            {/* Blog Section */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Updates</h2>

                    <div className="space-y-8">
                        <article className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>March 15, 2024</span>
                                <span className="mx-2">•</span>
                                <span>Technology</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                The Future of Web Development
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Web development continues to evolve at a rapid pace. New frameworks and tools are emerging
                                that promise to make development faster and more efficient. In this post, we explore the
                                latest trends and what they mean for developers.
                            </p>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                                        alt="John Doe"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Senior Developer</p>
                                </div>
                            </div>
                        </article>

                        <article className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>March 10, 2024</span>
                                <span className="mx-2">•</span>
                                <span>Security</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Best Practices for Secure Authentication
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Security is more important than ever in today's digital landscape. This article covers
                                the latest best practices for implementing secure authentication systems, including
                                multi-factor authentication and passwordless login options.
                            </p>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src="https://ui-avatars.com/api/?name=Jane+Smith&background=random"
                                        alt="Jane Smith"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Jane Smith</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Security Expert</p>
                                </div>
                            </div>
                        </article>

                        <article className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>March 5, 2024</span>
                                <span className="mx-2">•</span>
                                <span>DevOps</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Streamlining Your CI/CD Pipeline
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Continuous Integration and Continuous Deployment are essential for modern software
                                development. Learn how to optimize your pipeline for faster deployments and better
                                quality assurance.
                            </p>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src="https://ui-avatars.com/api/?name=Mike+Johnson&background=random"
                                        alt="Mike Johnson"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Mike Johnson</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">DevOps Engineer</p>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DangerMode; 