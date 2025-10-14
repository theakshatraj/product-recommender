import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { getProducts, getUsers } from '../services/api';

const ApiDebugger = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, testFn) => {
    setLoading(true);
    try {
      const startTime = Date.now();
      const data = await testFn();
      const endTime = Date.now();
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'success',
          data: data,
          time: endTime - startTime,
          message: `Success in ${endTime - startTime}ms`
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          error: error.message,
          message: `Error: ${error.message}`
        }
      }));
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setResults({});
    await testEndpoint('Products API', () => getProducts());
    await testEndpoint('Users API', () => getUsers());
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-heading font-bold text-neutral-900">
              API Connection Debugger
            </h1>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Testing...' : 'Test APIs'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([name, result]) => (
              <div
                key={name}
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(result.status)}
                  <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>
                </div>
                
                <p className={`font-medium ${
                  result.status === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {result.message}
                </p>

                {result.status === 'success' && result.data && (
                  <div className="mt-3 p-3 bg-white rounded border">
                    <details>
                      <summary className="cursor-pointer font-medium text-neutral-700">
                        View Response Data
                      </summary>
                      <pre className="mt-2 text-xs text-neutral-600 overflow-auto max-h-32">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                {result.status === 'error' && (
                  <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                    <p className="text-sm text-red-700 font-mono">
                      {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {Object.keys(results).length === 0 && !loading && (
              <div className="text-center py-8 text-neutral-500">
                <p>Click "Test APIs" to check the connection</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
            <h3 className="font-semibold text-neutral-900 mb-2">API Configuration:</h3>
            <div className="text-sm text-neutral-600 space-y-1">
              <p><strong>Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}</p>
              <p><strong>Frontend URL:</strong> {window.location.origin}</p>
              <p><strong>Expected Backend:</strong> http://localhost:8000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugger;
