import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface AimstorsDB extends DBSchema {
    conversations: {
        key: string; // The composite key: `${tenantId}_${userId}`
        value: {
            id: string; // The composite key: `${tenantId}_${userId}`
            tenantId: string;
            userId: string;
            data: any[];
            updatedAt: number;
        };
    };
    messages: {
        key: string; // The composite key: `${tenantId}_${userId}_${conversationId}`
        value: {
            id: string; // The composite key: `${tenantId}_${userId}_${conversationId}`
            conversationId: string;
            tenantId: string;
            userId: string;
            data: any[];
            updatedAt: number;
        };
    };
}

let dbPromise: Promise<IDBPDatabase<AimstorsDB>> | null = null;

if (typeof window !== 'undefined') {
    dbPromise = openDB<AimstorsDB>('aimstors-cache', 2, {
        upgrade(db, oldVersion, newVersion, transaction) {
            if (oldVersion < 2) {
                // Clear old v1 stores to ensure clean slate for composite keys
                if (db.objectStoreNames.contains('conversations')) db.deleteObjectStore('conversations');
                if (db.objectStoreNames.contains('messages')) db.deleteObjectStore('messages');
            }

            if (!db.objectStoreNames.contains('conversations')) {
                db.createObjectStore('conversations', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('messages')) {
                db.createObjectStore('messages', { keyPath: 'id' });
            }
        },
    });
}

const MAX_CONVERSATIONS = 100;
const MAX_MESSAGES_PER_CONV = 200;

export async function getCachedConversations(tenantId: string, userId: string): Promise<any[] | null> {
    if (!dbPromise || !tenantId || !userId) return null;
    const db = await dbPromise;
    const key = `${tenantId}_${userId}`;
    const record = await db.get('conversations', key);
    return record ? record.data : null;
}

export async function setCachedConversations(tenantId: string, userId: string, data: any[]): Promise<void> {
    if (!dbPromise || !tenantId || !userId) return;
    const db = await dbPromise;
    const key = `${tenantId}_${userId}`;

    // Capacity Strategy: Store only the most recent N items
    const cappedData = data.slice(0, MAX_CONVERSATIONS);

    await db.put('conversations', {
        id: key,
        tenantId,
        userId,
        data: cappedData,
        updatedAt: Date.now(),
    });
}

export async function getCachedMessages(tenantId: string, userId: string, conversationId: string): Promise<any[] | null> {
    if (!dbPromise || !tenantId || !userId || !conversationId) return null;
    const db = await dbPromise;
    const key = `${tenantId}_${userId}_${conversationId}`;
    const record = await db.get('messages', key);
    return record ? record.data : null;
}

export async function setCachedMessages(tenantId: string, userId: string, conversationId: string, data: any[]): Promise<void> {
    if (!dbPromise || !tenantId || !userId || !conversationId) return;
    const db = await dbPromise;
    const key = `${tenantId}_${userId}_${conversationId}`;

    // Capacity Strategy: Store only the most recent N items globally
    // We keep the end of the array if messages are ordered chronically (oldest first).
    const cappedData = data.length > MAX_MESSAGES_PER_CONV
        ? data.slice(data.length - MAX_MESSAGES_PER_CONV)
        : data;

    await db.put('messages', {
        id: key,
        conversationId,
        tenantId,
        userId,
        data: cappedData,
        updatedAt: Date.now(),
    });
}

export async function clearCacheForUser(tenantId: string, userId: string): Promise<void> {
    if (!dbPromise) return;
    const db = await dbPromise;

    // Removing conversations for user
    const convKey = `${tenantId}_${userId}`;
    await db.delete('conversations', convKey);

    // Messages lookup requires iterating or bounds. We can clear all or iterate.
    const tx = db.transaction('messages', 'readwrite');
    const store = tx.objectStore('messages');
    let cursor = await store.openCursor();
    while (cursor) {
        if (cursor.value.tenantId === tenantId && cursor.value.userId === userId) {
            await cursor.delete();
        }
        cursor = await cursor.continue();
    }
    await tx.done;
}
