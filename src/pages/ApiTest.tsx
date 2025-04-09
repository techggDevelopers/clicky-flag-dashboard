import React, { useState } from 'react';
import axios from 'axios';

const ApiTest: React.FC = () => {
    const [results, setResults] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testDirectApi = async () => {
        setLoading(true);
        setResults('Testing direct connection to API...\n');

        try {
            const response = await axios.get('https://techgg-clicky-flag-dashboard.onrender.com/health', {
                timeout: 10000
            });
            setResults(prev => prev + `Direct API connection successful: ${JSON.stringify(response.data)}\n`);
        } catch (error: any) {
            setResults(prev => prev + `Direct API error: ${error.message}\n`);
            if (error.response) {
                setResults(prev => prev + `Response data: ${JSON.stringify(error.response.data)}\n`);
            }
        }

        setLoading(false);
    };

    const testProxiedApi = async () => {
        setLoading(true);
        setResults('Testing proxied API connection...\n');

        try {
            const response = await axios.get('/api/health', {
                timeout: 10000
            });
            setResults(prev => prev + `Proxied API connection successful: ${JSON.stringify(response.data)}\n`);
        } catch (error: any) {
            setResults(prev => prev + `Proxied API error: ${error.message}\n`);
            if (error.response) {
                setResults(prev => prev + `Response data: ${JSON.stringify(error.response.data)}\n`);
            }
        }

        setLoading(false);
    };

    const checkNetworkDetails = () => {
        setResults(prev => prev + `\nBrowser URL: ${window.location.href}\n`);
        setResults(prev => prev + `Base URL: ${window.location.origin}\n`);
        setResults(prev => prev + `Node env: ${import.meta.env.MODE}\n`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={testDirectApi}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Test Direct API
                </button>

                <button
                    onClick={testProxiedApi}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    Test Proxied API
                </button>

                <button
                    onClick={checkNetworkDetails}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Check Network Details
                </button>
            </div>

            <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap h-96 overflow-auto">
                {results || 'Click a button to test API connection...'}
            </pre>
        </div>
    );
};

export default ApiTest; 