import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { getToken } from '../constants/storage';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        setHasToken(Boolean(token));
      } catch {
        setHasToken(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (isLoading) return null;

  return <Redirect href={hasToken ? '/(tabs)' : '/(auth)/login'} />;
}
