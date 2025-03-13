import { useEffect } from 'react';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Layout from '@/components/layout/Layout';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  // Clear localStorage if there's an issue with the stored data
  useEffect(() => {
    try {
      // Debug: Log all localStorage keys and values
      console.log('DEBUG: Checking localStorage data');
      const keys = ['creatorsgpt_access_token', 'creatorsgpt_refresh_token', 'creatorsgpt_user'];
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          if (key.includes('token')) {
            console.log(`${key}: ${value.substring(0, 20)}...`);
          } else {
            console.log(`${key}: ${value}`);
          }
        } else {
          console.log(`${key}: null`);
        }
      });
      
      // Check if we can parse the user data
      const userJson = localStorage.getItem('creatorsgpt_user');
      if (userJson) {
        const user = JSON.parse(userJson);
        console.log('Parsed user object:', user);
        console.log('User ID type:', typeof user.id);
        console.log('User ID value:', user.id);
      }
      
      // Check if tokens exist
      const accessToken = localStorage.getItem('creatorsgpt_access_token');
      const refreshToken = localStorage.getItem('creatorsgpt_refresh_token');
      
      // If we have a user but no tokens, or tokens but no user, clear everything
      if ((userJson && (!accessToken || !refreshToken)) || 
          (!userJson && (accessToken || refreshToken))) {
        console.log('Inconsistent auth state detected, clearing localStorage');
        localStorage.removeItem('creatorsgpt_access_token');
        localStorage.removeItem('creatorsgpt_refresh_token');
        localStorage.removeItem('creatorsgpt_user');
      }
    } catch (error) {
      // If there's an error parsing the user data, clear localStorage
      console.error('Error parsing user data, clearing localStorage', error);
      localStorage.removeItem('creatorsgpt_access_token');
      localStorage.removeItem('creatorsgpt_refresh_token');
      localStorage.removeItem('creatorsgpt_user');
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
} 