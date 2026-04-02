import { useState } from 'react';
import { router } from 'expo-router';
import { ENDPOINTS } from '../constants/api';
import { saveToken, removeToken, getToken, saveClient, removeClient } from '../constants/storage';

const extractErrorMessage = async (res: Response) => {
  try {
    const body = await res.json();
    return body?.message ?? 'Une erreur est survenue.';
  } catch {
    return 'Une erreur est survenue.';
  }
};

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: {
    email: string; password: string; fullName: string;
    phone: string; address: string; city?: string;
  }) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res));
      const json = await res.json();
      const token = json?.token ?? json?.access_token;
      const client = json?.client;
      if (token) {
        await saveToken(token);
        if (client?.id && client?.email && client?.fullName) {
          await saveClient(client);
        }
        router.replace('/');
        return;
      }
      router.replace('/(auth)/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de creer le compte.');
    } finally { setLoading(false); }
  };

  const login = async (email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Identifiants invalides.');
      const token = json?.token ?? json?.access_token;
      const client = json?.client;
      if (!token) throw new Error('Token manquant dans la reponse.');
      await saveToken(token);
      if (client?.id && client?.email && client?.fullName) {
        await saveClient(client);
      }
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de se connecter.');
    } finally { setLoading(false); }
  };

  const logout = async () => {
    try {
      const token = await getToken();
      if (token) {
        await fetch(ENDPOINTS.logout, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // If backend logout fails, we still clear local token.
    }
    await Promise.all([removeToken(), removeClient()]);
    router.replace('/(auth)/login');
  };

  return { register, login, logout, loading, error };
}