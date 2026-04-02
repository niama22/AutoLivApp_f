import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Champs requis', 'Email et mot de passe sont obligatoires.');
      return;
    }
    await login(email.trim(), password);
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>AutoLivApp</Text>
        <Text style={s.subtitle}>Connexion client</Text>

        {error && <Text style={s.error}>{error}</Text>}

        <TextInput
          style={s.input} placeholder="Email"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          placeholderTextColor="#98A2B3"
        />
        <TextInput
          style={s.input} placeholder="Mot de passe"
          value={password} onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#98A2B3"
        />

        <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Se connecter</Text>}
        </TouchableOpacity>

        <Link href="/(auth)/register" style={s.link}>
          Pas encore de compte ? S&apos;inscrire
        </Link>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#F6F7FB' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#EAECF0', padding: 20 },
  title: { fontSize: 30, fontWeight: '700', textAlign: 'center', marginBottom: 4, color: '#101828' },
  subtitle: { fontSize: 15, color: '#667085', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 15, color: '#101828' },
  btn: { backgroundColor: '#4F46E5', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 20, color: '#4F46E5', fontWeight: '600' },
  error: { color: '#B42318', marginBottom: 12, textAlign: 'center', fontWeight: '600' },
});