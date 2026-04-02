import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useOrders } from '../../hooks/useOrders';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useOrders();

  const order = useMemo(() => orders.find((item) => item.id === id), [id, orders]);

  if (!id) {
    return (
      <View style={s.container}>
        <Text style={s.error}>Commande introuvable.</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={s.container}>
        <Text style={s.error}>Chargement des details ou commande indisponible.</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Commande #{order.id.slice(0, 8)}</Text>
      <Text style={s.line}>Statut: {order.status}</Text>
      <Text style={s.line}>Adresse: {order.deliveryAddress}</Text>
      <Text style={s.line}>Ville: {order.deliveryCity}</Text>
      {order.notes ? <Text style={s.line}>Notes: {order.notes}</Text> : null}

      <Text style={s.section}>Articles</Text>
      {order.items.map((item, index) => (
        <Text key={`${item.vehicleModel}-${index}`} style={s.item}>
          - {item.vehicleModel} x{item.quantity}
        </Text>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  line: { fontSize: 15, color: '#333', marginBottom: 8 },
  section: { fontSize: 17, fontWeight: '600', marginTop: 18, marginBottom: 10 },
  item: { fontSize: 14, color: '#555', marginBottom: 6 },
  error: { fontSize: 15, color: '#A32D2D' },
});
