import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getClient } from '@/constants/storage';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const { logout, loading: authLoading } = useAuth();
  const [clientName, setClientName] = useState<string>('Client');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClient = async () => {
      try {
        const client = await getClient();
        setClientName(client?.fullName ?? 'Client');
      } finally {
        setIsLoading(false);
      }
    };
    loadClient();
  }, []);

  if (isLoading) {
    return (
      <View style={s.loaderWrap}>
        <ActivityIndicator size="large" color="#534AB7" />
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.badge}>ESPACE CLIENT</Text>
        <Text style={s.title}>Bienvenue, {clientName}</Text>
        <Text style={s.subtitle}>Votre compte est actif et securise.</Text>

        <TouchableOpacity style={s.logoutBtn} onPress={logout} disabled={authLoading}>
          <Text style={s.logoutText}>{authLoading ? 'Deconnexion...' : 'Se deconnecter'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F6F7FB',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    color: '#3538CD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
    color: '#101828',
  },
  subtitle: {
    fontSize: 15,
    color: '#475467',
    marginBottom: 30,
  },
  logoutBtn: {
    backgroundColor: '#A32D2D',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
