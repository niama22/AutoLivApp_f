import { useState, useEffect } from 'react';
import { ENDPOINTS } from '../constants/api';
import { getToken } from '../constants/storage';

export type OrderStatus = 'pending' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';

export type OrderItemInput = {
  vehicleModel: string;
  quantity: number;
};

export type OrderInput = {
  items: OrderItemInput[];
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
};

export type ImportOrdersInput = {
  deliveryAddress?: string;
  deliveryCity?: string;
  notes?: string;
};

export type Order = {
  id: string;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryCity: string;
  notes?: string;
  items: OrderItemInput[];
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeader = async () => {
    const token = await getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeader();
      const res = await fetch(ENDPOINTS.orders, { headers });
      if (!res.ok) throw new Error('Impossible de charger les commandes.');
      const json = await res.json();
      setOrders(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data: OrderInput) => {
    const headers = await authHeader();
    const res = await fetch(ENDPOINTS.orders, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Creation de commande impossible.');
    return res.json();
  };

  const importOrders = async (
    file: { uri: string; type?: string; name?: string },
    dto: ImportOrdersInput,
  ) => {
    const tokenHeaders = await authHeader();
    // When using FormData, we let fetch set the correct multipart boundary.
    // Also remove Content-Type: application/json.
    const { 'Content-Type': _ct, ...headers } = tokenHeaders;

    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type ?? 'application/octet-stream',
      name: file.name ?? 'orders',
    } as any);

    if (dto.deliveryAddress) formData.append('deliveryAddress', dto.deliveryAddress);
    if (dto.deliveryCity) formData.append('deliveryCity', dto.deliveryCity);
    if (dto.notes) formData.append('notes', dto.notes);

    const res = await fetch(ENDPOINTS.importOrders, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      let message = 'Import impossible.';
      try {
        const json = await res.json();
        message = json?.message ?? message;
      } catch {}
      throw new Error(message);
    }

    return res.json();
  };

  const updateOrder = async (id: string, data: Partial<OrderInput>) => {
    const headers = await authHeader();
    const res = await fetch(`${ENDPOINTS.orders}/${id}`, {
      method: 'PATCH', headers, body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Mise a jour de commande impossible.');
    return res.json();
  };

  useEffect(() => { fetchOrders(); }, []);

  return { orders, loading, error, fetchOrders, createOrder, updateOrder, importOrders };
}