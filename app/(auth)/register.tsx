import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', phone: '', address: '', city: '',
  });
  const { register, loading, error } = useAuth();

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));
  const handleRegister = async () => {
    if (!form.email.trim() || !form.password || !form.fullName.trim() || !form.phone.trim() || !form.address.trim()) {
      Alert.alert('Champs requis', 'Remplis tous les champs obligatoires.');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Mot de passe', 'Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    await register({
      ...form,
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
    });
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.card}>
        <Text style={s.title}>Creer un compte</Text>
        {error && <Text style={s.error}>{error}</Text>}
        {(['fullName', 'email', 'phone', 'address', 'city'] as const).map(field => (
          <TextInput key={field} style={s.input}
            placeholder={{ fullName:'Nom complet', email:'Email', phone:'Telephone', address:'Adresse', city:'Ville' }[field]}
            value={form[field]} onChangeText={set(field)}
            keyboardType={field === 'email' ? 'email-address' : 'default'}
            autoCapitalize={field === 'email' ? 'none' : 'sentences'}
            placeholderTextColor="#98A2B3"
          />
        ))}
        <TextInput style={s.input} placeholder="Mot de passe (min 6 car.)"
          value={form.password} onChangeText={set('password')} secureTextEntry placeholderTextColor="#98A2B3" />

        <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>S&apos;inscrire</Text>}
        </TouchableOpacity>
        <Link href="/(auth)/login" style={s.link}>Deja un compte ? Se connecter</Link>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#F6F7FB', flexGrow: 1, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EAECF0', padding: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 20, textAlign: 'center', color: '#101828' },
  input: { borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 15, color: '#101828' },
  btn: { backgroundColor: '#4F46E5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, color: '#4F46E5', fontWeight: '600' },
  error: { color: '#B42318', marginBottom: 12, textAlign: 'center', fontWeight: '600' },
});