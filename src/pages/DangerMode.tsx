import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface CriticalFlag {
    _id: string;
    name: string;
    label: string;
    description: string;
    enabled: boolean;
    criticalLevel: 'high' | 'extreme';
}

const DangerMode: React.FC = () => {
    const { user, logout } = useAuth();
    const [criticalFlags, setCriticalFlags] = useState<CriticalFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmationId, setConfirmationId] = useState<string | null>(null);

    useEffect(() => {
        const fetchFlags = async () => {
            setLoading(true);
            setError(null);
            try {
                // In a real app with a complete API, you'd fetch critical flags from a specific endpoint
                // Here we'll use the same flags endpoint but treat them as critical in danger mode
                const response = await axios.get('/api/flags');

                // Transform the flags to add a criticalLevel property
                const criticalFlagsData = response.data.map((flag: any) => ({
                    ...flag,
                    criticalLevel: flag.name === 'F1' ? 'extreme' : 'high',
                    enabled: false
                }));

                // Get user-specific flags to determine which ones are enabled
                const userFlagsResponse = await axios.get('/api/flags/user');
                const userFlags = userFlagsResponse.data;

                // Update enabled status based on user flags
                const combinedFlags = criticalFlagsData.map((flag: CriticalFlag) => {
                    const userFlag = userFlags.find((uf: any) => uf.flagName === flag.name);
                    return {
                        ...flag,
                        enabled: userFlag ? userFlag.enabled : false
                    };
                });

                setCriticalFlags(combinedFlags);
            } catch (error) {
                console.error('Error fetching critical flags:', error);
                setError('Failed to load critical controls. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchFlags();
    }, []);

    const requestConfirmation = (id: string) => {
        setConfirmationId(id);
    };

    const cancelConfirmation = () => {
        setConfirmationId(null);
    };

    const toggleCriticalFlag = async (id: string, flagName: string, currentlyEnabled: boolean) => {
        try {
            // Optimistically update UI
            setCriticalFlags(prevFlags => {
                // If we're enabling this flag, disable all others
                if (!currentlyEnabled) {
                    return prevFlags.map(flag =>
                        flag._id === id ? { ...flag, enabled: true } : { ...flag, enabled: false }
                    );
                }
                // If we're disabling, just update this one flag
                return prevFlags.map(flag =>
                    flag._id === id ? { ...flag, enabled: false } : flag
                );
            });

            // Send update to server
            await axios.post(`/api/flags/toggle/${flagName}`, {
                enabled: !currentlyEnabled
            });

            setConfirmationId(null);
        } catch (error) {
            console.error('Error toggling critical flag:', error);
            setError('Failed to update control. Please try again.');

            // Refresh flags to get current state
            const flagsResponse = await axios.get('/api/flags');
            const userFlagsResponse = await axios.get('/api/flags/user');

            // Transform and combine data again
            const flagsData = flagsResponse.data.map((flag: any) => ({
                ...flag,
                criticalLevel: flag.name === 'F1' ? 'extreme' : 'high'
            }));

            const userFlags = userFlagsResponse.data;

            const combinedFlags = flagsData.map((flag: CriticalFlag) => {
                const userFlag = userFlags.find((uf: any) => uf.flagName === flag.name);
                return {
                    ...flag,
                    enabled: userFlag ? userFlag.enabled : false
                };
            });

            setCriticalFlags(combinedFlags);
            setConfirmationId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-red-600 dark:text-red-400">Loading critical controls...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="mb-4 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 dark:text-red-300 mb-2">Error Loading Controls</h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-red-50 dark:bg-red-900/20">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">⚠️ DANGER MODE ACTIVATED ⚠️</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {user?.username}, you have access to critical system controls. Use with extreme caution.
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30">
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Critical System Controls</h3>
                        <p className="text-sm text-red-600 dark:text-red-400">
                            These controls can cause permanent and irreversible changes to the system.
                        </p>
                    </div>

                    {criticalFlags.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">No critical controls available.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {criticalFlags.map((flag) => (
                                <li key={flag._id} className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="mb-4 sm:mb-0">
                                            <div className="flex items-center">
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{flag.label}</h3>
                                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${flag.criticalLevel === 'extreme'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                                    }`}>
                                                    {flag.criticalLevel.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{flag.description}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Flag ID: {flag.name}</p>
                                        </div>
                                        <div>
                                            {confirmationId === flag._id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => toggleCriticalFlag(flag._id, flag.name, flag.enabled)}
                                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={cancelConfirmation}
                                                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => requestConfirmation(flag._id)}
                                                    className={`px-4 py-2 rounded text-white ${flag.enabled
                                                        ? 'bg-red-600 hover:bg-red-700'
                                                        : 'bg-gray-500 hover:bg-gray-600'
                                                        }`}
                                                >
                                                    {flag.enabled ? 'Disable' : 'Enable'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {flag.enabled && (
                                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 rounded-md">
                                            <p className="text-sm text-red-800 dark:text-red-400">
                                                <strong>Warning:</strong> This critical control is currently active. System might be in an unstable state.
                                            </p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Blog Section */}
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Latest Updates</h2>

                    <div className="space-y-8">
                        <article className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>March 15, 2024</span>
                                <span className="mx-2">•</span>
                                <span>System Updates</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Enhanced Security Protocols Implemented
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                Our team has recently implemented new security protocols to ensure the safety of critical system controls.
                                These updates include improved authentication measures and enhanced monitoring capabilities.
                            </p>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src="https://ui-avatars.com/api/?name=Admin&background=random"
                                        alt="Admin"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">System Administrator</p>
                                </div>
                            </div>
                        </article>

                        <article className="border-b border-gray-200 dark:border-gray-700 pb-8">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <span>March 10, 2024</span>
                                <span className="mx-2">•</span>
                                <span>Maintenance</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Scheduled System Maintenance Complete
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                The recent system maintenance has been successfully completed. All critical systems are now running
                                with improved performance and stability. Users may notice enhanced response times and better overall reliability.
                            </p>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full"
                                        src="https://ui-avatars.com/api/?name=Tech&background=random"
                                        alt="Tech"
                                    />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Technical Team</p>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DangerMode; 