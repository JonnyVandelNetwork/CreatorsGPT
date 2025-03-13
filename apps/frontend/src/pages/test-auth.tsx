import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';

export default function TestAuth() {
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication status
    const authenticated = isAuthenticated();
    setAuthStatus(authenticated ? 'Authenticated' : 'Not authenticated');
    
    // Get user data if authenticated
    if (authenticated) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    setAuthStatus('Not authenticated');
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Auth Test - CreatorsGPT</title>
        <meta name="description" content="Test authentication in CreatorsGPT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Authentication Test Page
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Authentication Status</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{authStatus}</p>
            </div>

            {user && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Data</h3>
                <pre className="mt-1 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <Link href="/auth/login" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                Go to Login Page
              </Link>
              
              <Link href="/auth/signup" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Go to Signup Page
              </Link>
              
              {isAuthenticated() && (
                <button
                  onClick={handleLogout}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              )}
              
              <Link href="/" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                Go to Home Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 