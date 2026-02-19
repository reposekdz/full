import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SchoolDB extends DBSchema {
  students: { key: number; value: any };
  grades: { key: number; value: any; indexes: { 'by-student': number } };
  attendance: { key: number; value: any; indexes: { 'by-student': number } };
  discipline: { key: number; value: any; indexes: { 'by-student': number } };
  messages: { key: number; value: any; indexes: { 'by-student': number } };
  fees: { key: number; value: any; indexes: { 'by-student': number } };
  timetable: { key: number; value: any; indexes: { 'by-student': number } };
  teachers: { key: number; value: any };
  exams: { key: number; value: any; indexes: { 'by-student': number } };
  pendingSync: { key: number; value: any; indexes: { 'by-type': string } };
}

let db: IDBPDatabase<SchoolDB>;

export async function initDB() {
  db = await openDB<SchoolDB>('school-management', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('students')) {
        db.createObjectStore('students', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('grades')) {
        const gradeStore = db.createObjectStore('grades', { keyPath: 'id' });
        gradeStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('attendance')) {
        const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' });
        attendanceStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('discipline')) {
        const disciplineStore = db.createObjectStore('discipline', { keyPath: 'id' });
        disciplineStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', { keyPath: 'id' });
        messageStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('fees')) {
        const feeStore = db.createObjectStore('fees', { keyPath: 'id' });
        feeStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('timetable')) {
        const timetableStore = db.createObjectStore('timetable', { keyPath: 'id' });
        timetableStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('teachers')) {
        db.createObjectStore('teachers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('exams')) {
        const examStore = db.createObjectStore('exams', { keyPath: 'id' });
        examStore.createIndex('by-student', 'student_id');
      }
      if (!db.objectStoreNames.contains('pendingSync')) {
        const syncStore = db.createObjectStore('pendingSync', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('by-type', 'type');
      }
    },
  });
  return db;
}

export async function saveToCache(store: keyof SchoolDB, data: any[]) {
  if (!db) await initDB();
  const tx = db.transaction(store, 'readwrite');
  await Promise.all(data.map(item => tx.store.put(item)));
  await tx.done;
}

export async function getFromCache(store: keyof SchoolDB, studentId?: number) {
  if (!db) await initDB();
  if (studentId && store !== 'students' && store !== 'teachers' && store !== 'pendingSync') {
    return await db.getAllFromIndex(store as any, 'by-student', studentId);
  }
  return await db.getAll(store);
}

export async function addPendingSync(type: string, data: any) {
  if (!db) await initDB();
  await db.add('pendingSync', { type, data, timestamp: Date.now() });
}

export async function getPendingSync() {
  if (!db) await initDB();
  return await db.getAll('pendingSync');
}

export async function clearPendingSync(id: number) {
  if (!db) await initDB();
  await db.delete('pendingSync', id);
}
