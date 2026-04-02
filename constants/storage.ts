import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'jwt_token';
const CLIENT_KEY = 'client_profile';

export type ClientProfile = {
  id: string;
  email: string;
  fullName: string;
};

export const saveToken = (token: string) =>
  AsyncStorage.setItem(TOKEN_KEY, token);

export const getToken = () =>
  AsyncStorage.getItem(TOKEN_KEY);

export const removeToken = () =>
  AsyncStorage.removeItem(TOKEN_KEY);

export const saveClient = (client: ClientProfile) =>
  AsyncStorage.setItem(CLIENT_KEY, JSON.stringify(client));

export const getClient = async (): Promise<ClientProfile | null> => {
  const raw = await AsyncStorage.getItem(CLIENT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as ClientProfile;
  } catch {
    return null;
  }
};

export const removeClient = () =>
  AsyncStorage.removeItem(CLIENT_KEY);