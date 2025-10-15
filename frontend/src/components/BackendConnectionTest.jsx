import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { 
  getUsers, 
  getProducts, 
  getUserRecommendations, 
  recordInteraction 
} from '../services/api';

const BackendConnectionTest = () => {
  const [tests, setTests] = useState({
    users: { status: 'pending', message: 'Testing users API...', data: null },
    products: { status: 'pending', message: 'Testing products API...', data: null },
    recommendations: { status: 'pending', message: 'Testing recommendations API...', data: null },
    interactions: { status: 'pending', message: 'Testing interactions API...', data: null }
  });

  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    
    // Test Users API
    try {
      setTests(prev => ({ ...prev, users: { status: 'loading', message: 'Testing users API...', data: null } }));
      const users = await getUsers();
      setTests(prev => ({ 
        ...prev, 
        users: { 
          status: 'success', 
          message: `Found ${Array.isArray(users) ? users.length : 0} users`, 
          data: users 
        } 
      }));
    } catch (error) {
      setTests(prev => ({ 
        ...prev, 
        users: { 
          status: 'error', 
          message: `Users API failed: ${error.message}`, 
          data: null 
        } 
      }));
    }

    // Test Products API
    try {
      setTests(prev => ({ ...prev, products: { status: 'loading', message: 'Testing products API...', data: null } }));
      const products = await getProducts();
      setTests(prev => ({ 
        ...prev, 
        products: { 
          status: 'success', 
          message: `Found ${Array.isArray(products) ? products.length : 0} products`, 
          data: products 
        } 
      }));
    } catch (error) {
      setTests(prev => ({ 
        ...prev, 
        products: { 
          status: 'error', 
          message: `Products API failed: ${error.message}`, 
          data: null 
        } 
      }));
    }

    // Test Recommendations API (if we have users)
    if (tests.users.data && Array.isArray(tests.users.data) && tests.users.data.length > 0) {
      try {
        setTests(prev => ({ ...prev, recommendations: { status: 'loading', message: 'Testing recommendations API...', data: null } }));
        const recommendations = await getUserRecommendations(tests.users.data[0].id);
        setTests(prev => ({ 
          ...prev, 
          recommendations: { 
            status: 'success', 
            message: `Found ${Array.isArray(recommendations) ? recommendations.length : 0} recommendations`, 
            data: recommendations 
          } 
        }));
      } catch (error) {
        setTests(prev => ({ 
          ...prev, 
          recommendations: { 
            status: 'error', 
            message: `Recommendations API failed: ${error.message}`, 
            data: null 
          } 
        }));
      }
    }


    // Test Interactions API (if we have users and products)
    if (tests.users.data && tests.products.data && 
        Array.isArray(tests.users.data) && tests.users.data.length > 0 &&
        Array.isArray(tests.products.data) && tests.products.data.length > 0) {
      try {
        setTests(prev => ({ ...prev, interactions: { status: 'loading', message: 'Testing interactions API...', data: null } }));
        const result = await recordInteraction(
          tests.users.data[0].id, 
          tests.products.data[0].id, 
          'view'
        );
        setTests(prev => ({ 
          ...prev, 
          interactions: { 
            status: 'success', 
            message: `Interaction recorded successfully`, 
            data: result 
          } 
        }));
      } catch (error) {
        setTests(prev => ({ 
          ...prev, 
          interactions: { 
            status: 'error', 
            message: `Interactions API failed: ${error.message}`, 
            data: null 
          } 
        }));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      case 'loading':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const allTestsPassed = Object.values(tests).every(test => test.status === 'success');
  const anyTestsFailed = Object.values(tests).some(test => test.status === 'error');

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-neutral-900 mb-4">
            Backend Connection Test
          </h1>
          <p className="text-lg text-neutral-700 mb-8">
            Testing all API endpoints to ensure end-to-end functionality
          </p>
          
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
          </button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {Object.entries(tests).map(([testName, test]) => (
            <div
              key={testName}
              className={`border rounded-lg p-6 ${getStatusColor(test.status)}`}
            >
              <div className="flex items-center space-x-3 mb-3">
                {getStatusIcon(test.status)}
                <h3 className="text-lg font-semibold capitalize text-neutral-900">
                  {testName} API
                </h3>
              </div>
              
              <p className={`font-medium ${getStatusTextColor(test.status)}`}>
                {test.message}
              </p>
              
              {test.data && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <details>
                    <summary className="cursor-pointer font-medium text-neutral-700">
                      View Response Data
                    </summary>
                    <pre className="mt-2 text-xs text-neutral-600 overflow-auto max-h-32">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overall Status */}
        <div className={`border rounded-lg p-6 ${
          allTestsPassed ? 'bg-green-50 border-green-200' : 
          anyTestsFailed ? 'bg-red-50 border-red-200' : 
          'bg-neutral-50 border-neutral-200'
        }`}>
          <div className="flex items-center space-x-3 mb-3">
            {allTestsPassed ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : anyTestsFailed ? (
              <X className="w-6 h-6 text-red-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-gray-400" />
            )}
            <h3 className="text-xl font-semibold text-neutral-900">
              Overall Status
            </h3>
          </div>
          
          {allTestsPassed ? (
            <div className="text-green-700">
              <p className="font-medium mb-2">✅ All tests passed!</p>
              <p>Backend connection is working perfectly. The application is ready for end-to-end functionality.</p>
            </div>
          ) : anyTestsFailed ? (
            <div className="text-red-700">
              <p className="font-medium mb-2">❌ Some tests failed</p>
              <p>Please check the backend server is running and all endpoints are properly configured.</p>
            </div>
          ) : (
            <div className="text-gray-700">
              <p className="font-medium mb-2">⏳ Tests not run yet</p>
              <p>Click "Run Connection Tests" to verify backend connectivity.</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-3">
            Instructions
          </h3>
          <div className="space-y-2 text-neutral-700">
            <p>1. Ensure the backend server is running on <code className="bg-neutral-100 px-2 py-1 rounded">http://localhost:8000</code></p>
            <p>2. Click "Run Connection Tests" to test all API endpoints</p>
            <p>3. All tests should pass for full end-to-end functionality</p>
            <p>4. If tests fail, check backend logs and ensure all endpoints are implemented</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendConnectionTest;
