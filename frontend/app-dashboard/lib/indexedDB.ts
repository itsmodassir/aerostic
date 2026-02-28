import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AimstorsDB extends DBSchema {
  conversations: {
    key: string; // The tenantId
    value: {
      tenantId: string;
      data: any[];
      updatedAt: number;
    };
  };
  messages: {
    key: string; // The conversationId
    value: {
      conversationId: string;
      data: any[];
      updatedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<AimstorsDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<AimstorsDB>('aimstors-cache', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'tenantId' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'conversationId' });
      }
    },
  });
}

export async function getCachedConversations(tenantId: string): Promise<any[] | null> {
  if (!dbPromise) return null;
  const db = await dbPromise;
  const record = await db.get('conversations', tenantId);
  return record ? record.data : null;
}

export async function setCachedConversations(tenantId: string, data: any[]): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('conversations', {
    tenantId,
    data,
    updatedAt: Date.now(),
  });
}

export async function getCachedMessages(conversationId: string): Promise<any[] | null> {
  if (!dbPromise) return null;
  const db = await dbPromise;
  const record = await db.get('messages', conversationId);
  return record ? record.data : null;
}

export async function setCachedMessages(conversationId: string, data: any[]): Promise<void> {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put('messages', {
    conversationId,
    data,
    updatedAt: Date.now(),
  });
}
