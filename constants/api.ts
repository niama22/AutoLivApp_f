import Constants from 'expo-constants';
import { Platform } from 'react-native';

const rawApiUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:8000/clients/api';

const API_URL =
  Platform.OS === 'android' ? rawApiUrl.replace('localhost', '10.0.2.2') : rawApiUrl;

export { API_URL };

export const ENDPOINTS = {
  register: `${API_URL}/auth/register`,
  login: `${API_URL}/auth/login`,
  logout: `${API_URL}/auth/logout`,
  me: `${API_URL}/clients/me`,
  orders: `${API_URL}/orders`,
  importOrders: `${API_URL}/orders/import`,
};