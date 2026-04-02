import { useCallback, useState } from 'react';
import { ENDPOINTS } from '../constants/api';
import { getToken, removeClient, saveClient } from '../constants/storage';

export type ClientProfile = {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  address?: string;
  city?: string;
};

type UpdateProfileInput = Partial<Pick<ClientProfile, 'fullName' | 'phone' | 'address' | 'city'>>;

export function useProfile() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch(ENDPOINTS.me, { method: 'GET', headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Impossible de charger le profil.');
      setProfile(json);
      if (json?.id && json?.email && json?.fullName) {
        await saveClient({ id: json.id, email: json.email, fullName: json.fullName });
      }
      return json as ClientProfile;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur profil.';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const updateProfile = useCallback(async (data: UpdateProfileInput) => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch(ENDPOINTS.me, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message ?? 'Impossible de mettre a jour le profil.');
      setProfile(json);
      if (json?.id && json?.email && json?.fullName) {
        await saveClient({ id: json.id, email: json.email, fullName: json.fullName });
      }
      return json as ClientProfile;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur mise a jour.';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const deactivateAccount = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch(ENDPOINTS.me, { method: 'DELETE', headers });
      if (!res.ok) {
        let message = 'Impossible de desactiver le compte.';
        try {
          const json = await res.json();
          message = json?.message ?? message;
        } catch {}
        throw new Error(message);
      }
      await removeClient();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur desactivation.';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  return { profile, loading, error, fetchProfile, updateProfile, deactivateAccount };
}
