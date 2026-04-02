import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, View } from 'react-native';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../hooks/useOrders';

export default function CreateOrderScreen() {
  const { createOrder, importOrders, loading: ordersLoading } = useOrders();

  // Manual create fields
  const [items, setItems] = useState([{ vehicleModel: '', quantity: '1' }]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [notes, setNotes] = useState('');

  // Import fields
  const [file, setFile] = useState<{ uri: string; type?: string; name?: string } | null>(null);
  const [importDeliveryAddress, setImportDeliveryAddress] = useState('');
  const [importDeliveryCity, setImportDeliveryCity] = useState('');
  const [importNotes, setImportNotes] = useState('');

  const updateItem = (index: number, key: 'vehicleModel' | 'quantity', value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { vehicleModel: '', quantity: '1' }]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets?.length) return;

      const asset = res.assets[0];
      const name = asset.name?.toLowerCase() ?? '';
      const isAllowed =
        name.endsWith('.csv') ||
        name.endsWith('.xls') ||
        name.endsWith('.xlsx');

      if (!isAllowed) {
        Alert.alert('Format non supporte', 'Choisis un fichier CSV ou Excel (.xls/.xlsx).');
        return;
      }

      setFile({ uri: asset.uri, type: asset.mimeType ?? undefined, name: asset.name ?? undefined });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Import annule ou erreur inconnue.';
      Alert.alert('Erreur', message);
    }
  };

  const submit = async () => {
    if (!deliveryAddress || !deliveryCity) {
      return Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
    }

    const parsedItems = items.map((item) => ({
      vehicleModel: item.vehicleModel.trim(),
      quantity: Number.parseInt(item.quantity, 10),
    }));

    if (parsedItems.some((item) => !item.vehicleModel)) {
      return Alert.alert('Erreur', 'Chaque ligne doit avoir un modele de vehicule.');
    }

    if (parsedItems.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      return Alert.alert('Erreur', 'Chaque quantite doit etre un entier positif.');
    }

    try {
      await createOrder({
        items: parsedItems,
        deliveryAddress,
        deliveryCity,
        notes,
      });
      Alert.alert('Succes', 'Commande creee !', [
        { text: 'OK', onPress: () => router.replace('/orders') },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Creation de commande impossible.';
      Alert.alert('Erreur', message);
    }
  };

  const submitImport = async () => {
    if (!file) {
      return Alert.alert('Fichier requis', 'Choisis un fichier CSV ou Excel.');
    }

    try {
      await importOrders(file, {
        deliveryAddress: importDeliveryAddress.trim() || undefined,
        deliveryCity: importDeliveryCity.trim() || undefined,
        notes: importNotes.trim() || undefined,
      });

      Alert.alert('Succes', 'Import termine.', [
        { text: 'OK', onPress: () => router.replace('/orders') },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Import impossible.';
      Alert.alert('Erreur', message);
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>Ajouter une commande</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Ajout manuel</Text>

        <Text style={s.label}>Articles (modele + quantite) *</Text>
        {items.map((item, index) => (
          <View key={`item-${index}`} style={s.itemRow}>
            <View style={s.itemColModel}>
              <TextInput
                style={s.input}
                value={item.vehicleModel}
                onChangeText={(value) => updateItem(index, 'vehicleModel', value)}
                placeholder="ex: Toyota Corolla"
              />
            </View>
            <View style={s.itemColQty}>
              <TextInput
                style={s.input}
                value={item.quantity}
                onChangeText={(value) => updateItem(index, 'quantity', value)}
                keyboardType="numeric"
                placeholder="Qty"
              />
            </View>
            <TouchableOpacity style={s.removeBtn} onPress={() => removeItem(index)}>
              <Ionicons name="trash-outline" size={18} color="#B42318" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={s.addItemBtn} onPress={addItem}>
          <View style={s.btnInner}>
            <Ionicons name="add-outline" size={16} color="#4F46E5" />
            <Text style={s.addItemText}>Ajouter un modele</Text>
          </View>
        </TouchableOpacity>

        <Text style={s.label}>Adresse de livraison *</Text>
        <TextInput style={s.input} value={deliveryAddress} onChangeText={setDeliveryAddress} />

        <Text style={s.label}>Ville *</Text>
        <TextInput style={s.input} value={deliveryCity} onChangeText={setDeliveryCity} />

        <Text style={s.label}>Notes</Text>
        <TextInput
          style={[s.input, { height: 90 }]}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity style={s.primaryBtn} onPress={submit} disabled={ordersLoading}>
          <View style={s.btnInner}>
            <Ionicons name="add-circle-outline" size={16} color="#fff" />
            <Text style={s.primaryText}>Créer la commande</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Importer CSV/Excel</Text>

        <TouchableOpacity style={s.outlineBtn} onPress={pickFile} disabled={ordersLoading}>
          <View style={s.btnInner}>
            <Ionicons name="document-attach-outline" size={16} color="#4F46E5" />
            <Text style={s.outlineText}>{file?.name ? 'Fichier selectionne' : 'Choisir un fichier'}</Text>
          </View>
        </TouchableOpacity>

        <Text style={s.helper}>
          Colonnes attendues: <Text style={s.helperBold}>vehicleModel</Text>, <Text style={s.helperBold}>quantity</Text>.
          Options: deliveryAddress, deliveryCity, notes.
        </Text>

        <Text style={s.label}>Adresse (override - optionnel)</Text>
        <TextInput
          style={s.input}
          value={importDeliveryAddress}
          onChangeText={setImportDeliveryAddress}
          placeholder="ex: 123 Rue Tanger"
        />

        <Text style={s.label}>Ville (override - optionnel)</Text>
        <TextInput
          style={s.input}
          value={importDeliveryCity}
          onChangeText={setImportDeliveryCity}
          placeholder="ex: Tanger"
        />

        <Text style={s.label}>Notes (override - optionnel)</Text>
        <TextInput
          style={[s.input, { height: 70 }]}
          value={importNotes}
          onChangeText={setImportNotes}
          multiline
        />

        <TouchableOpacity style={s.primaryBtn} onPress={submitImport} disabled={ordersLoading}>
          <View style={s.btnInner}>
            <Ionicons name="cloud-upload-outline" size={16} color="#fff" />
            <Text style={s.primaryText}>{ordersLoading ? 'Import...' : 'Importer'}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#F6F7FB', flexGrow: 1 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 18, color: '#101828' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EAECF0',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 10, color: '#101828' },
  label: { fontSize: 13, color: '#667085', marginBottom: 6, marginTop: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#D0D5DD', borderRadius: 12, padding: 13, fontSize: 15, backgroundColor: '#fff' },
  primaryBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  outlineText: { color: '#4F46E5', fontWeight: '800', fontSize: 15 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  helper: { marginTop: 10, marginBottom: 2, color: '#667085', fontSize: 12 },
  helperBold: { fontWeight: '800', color: '#344054' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  itemColModel: { flex: 1.4 },
  itemColQty: { flex: 0.7 },
  removeBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C7D7FE',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
  },
  addItemText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
});