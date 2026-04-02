import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Order, useOrders } from '../../hooks/useOrders';

export default function OrdersScreen() {
  const { orders, loading, error, fetchOrders } = useOrders();

  const statusColor: Record<string, string> = {
    pending: '#BA7517', confirmed: '#185FA5',
    in_transit: '#8B5CF6',
    delivered: '#0F6E56', cancelled: '#A32D2D',
  };

  return (
    <View style={s.container}>
      <View style={s.topArea}>
        <Text style={s.title}>Mes commandes</Text>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/orders/create')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.addBtnText}>+ Nouvelle</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchOrders} />}
        renderItem={({ item }: { item: Order }) => (
          <TouchableOpacity style={s.card} onPress={() => router.push(`/orders/${item.id}`)}>
            <Text style={s.orderId}>Commande #{item.id.slice(0, 8)}</Text>
            <Text style={s.address}>{item.deliveryCity}</Text>
            <View
              style={[
                s.badge,
                { backgroundColor: (statusColor[item.status] ?? '#999') + '20' },
              ]}
            >
              <Text style={[s.badgeText, { color: statusColor[item.status] ?? '#999' }]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={s.empty}>
            {error ? error : "Aucune commande pour l'instant."}
          </Text>
        }
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  topArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF0',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#101828' },
  addBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700' },
  card: { backgroundColor: '#fff', margin: 8, marginHorizontal: 16, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#e0e0e0' },
  orderId: { fontWeight: '600', fontSize: 15, marginBottom: 4 },
  address: { color: '#666', fontSize: 13, marginBottom: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 15 },
});