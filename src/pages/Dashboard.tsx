import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Flag {
    _id: string;
    name: string;
    label: string;
    description: string;
    enabled: boolean;
}

interface UserFlag {
    _id: string;
    userId: string;
    flagName: string;
    enabled: boolean;
    updatedAt: string;
}

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [flags, setFlags] = useState<Flag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch flags from API
    useEffect(() => {
        const fetchFlags = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all flags
                const flagsResponse = await axios.get('/api/flags');
                const flagsData = flagsResponse.data;

                // Fetch user-specific flags
                const userFlagsResponse = await axios.get('/api/flags/user');
                const userFlagsData = userFlagsResponse.data;

                // Combine the data
                const combinedFlags = flagsData.map((flag: Flag) => {
                    const userFlag = userFlagsData.find((uf: UserFlag) => uf.flagName === flag.name);
                    return {
                        ...flag,
                        enabled: userFlag ? userFlag.enabled : false
                    };
                });

                setFlags(combinedFlags);
            } catch (error) {
                console.error('Error fetching flags:', error);
                setError('Failed to load flags. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlags();
    }, []);

    // Toggle flag function
    const toggleFlag = async (id: string, flagName: string, currentlyEnabled: boolean) => {
        try {
            // Optimistically update UI
            setFlags(prevFlags =>
                prevFlags.map(flag => {
                    // If we're enabling this flag (currently disabled), disable all others
                    if (!currentlyEnabled) {
                        return flag._id === id ? { ...flag, enabled: !currentlyEnabled } : { ...flag, enabled: false };
                    }
                    // If we're disabling, just update this one flag
                    return flag._id === id ? { ...flag, enabled: !currentlyEnabled } : flag;
                })
            );

            // Send update to server
            await axios.post(`/api/flags/toggle/${flagName}`, {
                enabled: !currentlyEnabled
            });
        } catch (error) {
            console.error('Error toggling flag:', error);
            // Revert the optimistic update
            setError('Failed to update flag. Please try again.');

            // Refresh flags to get current state
            const flagsResponse = await axios.get('/api/flags');
            const userFlagsResponse = await axios.get('/api/flags/user');

            // Re-combine data
            const flagsData = flagsResponse.data;
            const userFlagsData = userFlagsResponse.data;

            const combinedFlags = flagsData.map((flag: Flag) => {
                const userFlag = userFlagsData.find((uf: UserFlag) => uf.flagName === flag.name);
                return {
                    ...flag,
                    enabled: userFlag ? userFlag.enabled : false
                };
            });

            setFlags(combinedFlags);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading flags...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="mb-4 text-red-500 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Flags</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Feature Flags</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Toggle features on and off to control functionality.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
                    {flags.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No flags available.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {flags.map((flag) => (
                                <li key={flag._id} className="px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{flag.label}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{flag.description}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Flag ID: {flag.name}</p>
                                        </div>
                                        <div className="ml-4">
                                            <button
                                                onClick={() => toggleFlag(flag._id, flag.name, flag.enabled)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${flag.enabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                    }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.enabled ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 