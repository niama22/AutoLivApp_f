import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export default function ProfileScreen() {
  const { logout, loading: authLoading } = useAuth();
  const { profile, loading, error, fetchProfile, updateProfile, deactivateAccount } = useProfile();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    setFullName(profile?.fullName ?? '');
    setPhone(profile?.phone ?? '');
    setAddress(profile?.address ?? '');
    setCity(profile?.city ?? '');
  }, [profile]);

  const save = async () => {
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
      });
      Alert.alert('Succes', 'Profil mis a jour.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Mise a jour impossible.';
      Alert.alert('Erreur', message);
    }
  };

  const onDeactivate = () => {
    Alert.alert('Supprimer le compte', 'Cette action est irreversible. Continuer ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          try {
            await deactivateAccount();
            await logout();
          } catch (e) {
            const message = e instanceof Error ? e.message : 'Desactivation impossible.';
            Alert.alert('Erreur', message);
          }
        },
      },
    ]);
  };

  if (loading && !profile) {
    return (
      <View style={s.loader}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.headerRow}>
        <View style={s.avatarWrap}>
          <Ionicons name="person" size={26} color="#4F46E5" />
        </View>
        <View>
          <Text style={s.title}>Mon profil</Text>
          <Text style={s.subtitle}>Gerez vos informations personnelles</Text>
        </View>
      </View>

      {error ? <Text style={s.error}>{error}</Text> : null}

      <View style={s.card}>
        <Text style={s.label}>Email</Text>
        <Text style={s.email}>{profile?.email ?? '-'}</Text>

        <Text style={s.label}>Nom complet</Text>
        <TextInput style={s.input} value={fullName} onChangeText={setFullName} />

        <Text style={s.label}>Telephone</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={s.label}>Adresse</Text>
        <TextInput style={s.input} value={address} onChangeText={setAddress} />

        <Text style={s.label}>Ville</Text>
        <TextInput style={s.input} value={city} onChangeText={setCity} />
      </View>

      <TouchableOpacity style={s.primaryBtn} onPress={save} disabled={loading}>
        <View style={s.btnInner}>
          <Ionicons name="save-outline" size={16} color="#fff" />
          <Text style={s.primaryText}>{loading ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={s.outlineBtn} onPress={logout} disabled={authLoading}>
        <View style={s.btnInner}>
          <Ionicons name="log-out-outline" size={16} color="#4F46E5" />
          <Text style={s.outlineText}>{authLoading ? 'Deconnexion...' : 'Se deconnecter'}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={s.dangerBtn} onPress={onDeactivate} disabled={loading}>
        <View style={s.btnInner}>
          <Ionicons name="trash-outline" size={16} color="#B42318" />
          <Text style={s.dangerText}>Supprimer mon compte</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FB' },
  container: { padding: 20, backgroundColor: '#F6F7FB', flexGrow: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#121A2C' },
  subtitle: { marginTop: 6, marginBottom: 16, fontSize: 14, color: '#667085' },
  error: { color: '#B42318', marginBottom: 12, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
  },
  label: { marginTop: 10, marginBottom: 6, color: '#344054', fontSize: 13, fontWeight: '600' },
  email: { color: '#475467', fontSize: 15, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 18,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 13,
    marginTop: 10,
  },
  outlineText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
  dangerBtn: {
    alignItems: 'center',
    paddingVertical: 13,
    marginTop: 12,
    borderRadius: 10,
    backgroundColor: '#FEE4E2',
  },
  dangerText: { color: '#B42318', fontWeight: '700', fontSize: 14 },
});
