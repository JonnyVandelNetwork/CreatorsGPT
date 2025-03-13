import { useState, useEffect } from 'react';
import Head from 'next/head';
import { isAuthenticated, getUser, removeToken } from '@/lib/auth';
import { useRouter } from 'next/router';
import '../styles/debug.css';

export default function DebugPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [cssEnabled, setCssEnabled] = useState(true);
  const [pointerEventsFixed, setPointerEventsFixed] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const authenticated = isAuthenticated();
    console.log('Debug page loaded, is authenticated:', authenticated);
    
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

  const handleButtonClick = (buttonName: string) => {
    console.log(`Button clicked: ${buttonName}`);
    setEventLog(prev => [...prev, `Button clicked: ${buttonName}`]);
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

  const toggleCss = () => {
    setCssEnabled(!cssEnabled);
    
    // Toggle debug CSS
    const debugStylesheet = document.querySelector('link[href="/debug.css"]');
    if (debugStylesheet) {
      debugStylesheet.remove();
    } else {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/debug.css';
      document.head.appendChild(link);
    }
  };

  const fixPointerEvents = () => {
    setPointerEventsFixed(!pointerEventsFixed);
    setEventLog(prev => [...prev, `Pointer events fix ${!pointerEventsFixed ? 'applied' : 'removed'}`]);
    
    // Apply fix to all elements
    if (!pointerEventsFixed) {
      document.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).style.pointerEvents = 'auto';
      });
    } else {
      document.querySelectorAll('*').forEach(el => {
        (el as HTMLElement).style.pointerEvents = '';
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Head>
        <title>CreatorsGPT - Debug Page</title>
        <meta name="description" content="Debug page for CreatorsGPT" />
        <link rel="icon" href="/favicon.ico" />
        {cssEnabled && <link rel="stylesheet" href="/debug.css" />}
      </Head>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Debug Tools</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">User Info</h2>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40">
            {userInfo ? JSON.stringify(userInfo, null, 2) : 'Not authenticated'}
          </pre>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Debug Controls</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={toggleCss}
              className="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {cssEnabled ? 'Disable Debug CSS' : 'Enable Debug CSS'}
            </button>
            <button
              onClick={fixPointerEvents}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {pointerEventsFixed ? 'Remove Pointer Events Fix' : 'Apply Pointer Events Fix'}
            </button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Click Test</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleButtonClick('Button 1')}
              className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Button 1
            </button>
            <button
              onClick={() => handleButtonClick('Button 2')}
              className="py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Button 2
            </button>
            <div 
              onClick={() => handleButtonClick('Div with onClick')}
              className="py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-center cursor-pointer"
            >
              Div with onClick
            </div>
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleButtonClick('Link');
              }}
              className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center"
            >
              Link
            </a>
          </div>
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
              onClick={() => handleRedirect('/test')}
              className="py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Go to Test Page
            </button>
            <button
              onClick={() => handleRedirect('/test-avatar')}
              className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Avatar Test
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