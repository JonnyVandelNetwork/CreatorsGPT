import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/router';

export default function TestPage() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated();
    console.log('Test page loaded, is authenticated:', authenticated);
    
    if (!authenticated) {
      console.log('User is not authenticated, redirecting to login page');
      router.push('/auth/login');
    } else {
      const user = getUser();
      console.log('Current user:', user);
      setUserInfo(user);
      
      // Add to event log
      setEventLog(prev => [...prev, `Page loaded, user: ${JSON.stringify(user)}`]);
    }
  }, [router]);

  const handleButtonClick = () => {
    console.log('Button clicked, current count:', count);
    setCount(count + 1);
    setEventLog(prev => [...prev, `Button clicked, count: ${count + 1}`]);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    removeToken();
    setEventLog(prev => [...prev, 'Logged out']);
    router.push('/auth/login');
  };

  const handleRedirect = (path: string) => {
    console.log('Redirecting to:', path);
    setEventLog(prev => [...prev, `Redirecting to: ${path}`]);
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Head>
        <title>CreatorsGPT - Test Page</title>
        <meta name="description" content="Test page for CreatorsGPT" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Event Handling Test</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">User Info</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
            {userInfo ? JSON.stringify(userInfo, null, 2) : 'Not authenticated'}
          </pre>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Counter: {count}</h2>
          <button
            onClick={handleButtonClick}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Increment Counter
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Navigation</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRedirect('/')}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Go to Home
            </button>
            <button
              onClick={() => handleRedirect('/auth/login')}
              className="py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Go to Login
            </button>
            <button
              onClick={() => handleRedirect('/auth/signup')}
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Go to Signup
            </button>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-2">Event Log</h2>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
            {eventLog.map((event, index) => (
              <div key={index} className="text-sm mb-1">
                {event}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 