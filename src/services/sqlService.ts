import { PerjalananDinas } from '../types/perjadin';
import { auth } from '../firebase/config';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      return {
        Authorization: `Bearer ${token}`,
      };
    }
  } catch {
    // ignore
  }
  return {};
}

export async function fetchPerjalananFromSql(): Promise<PerjalananDinas[]> {
  const headers = await getAuthHeader();
  const res = await fetch('/api/perjadin', { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Gagal memuat data dari database PostgreSQL`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function savePerjalananToSql(item: PerjalananDinas): Promise<void> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const res = await fetch('/api/perjadin', {
    method: 'POST',
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Gagal menyimpan data ke database PostgreSQL`);
  }
}

export async function deletePerjalananFromSql(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`/api/perjadin/${id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Gagal menghapus data di database PostgreSQL`);
  }
}

export async function batchSyncToSql(items: PerjalananDinas[]): Promise<number> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  const res = await fetch('/api/perjadin/batch', {
    method: 'POST',
    headers,
    body: JSON.stringify({ records: items }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Gagal batch sync ke database PostgreSQL`);
  }
  const json = await res.json();
  return json.count || items.length;
}

export async function syncUserToSql(uid: string, email: string, displayName?: string): Promise<void> {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeader()),
  };
  await fetch('/api/users/sync', {
    method: 'POST',
    headers,
    body: JSON.stringify({ uid, email, displayName }),
  });
}
