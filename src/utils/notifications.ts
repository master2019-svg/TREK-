import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const createNotification = async (userId: string, data: {
  type: 'like' | 'follow' | 'achievement' | 'mention';
  message: string;
  target?: string;
  tab: string;
  actorName: string;
  actorPhoto?: string | null;
}) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId, // owner of the notification
      type: data.type,
      message: data.message,
      target: data.target || '',
      tab: data.tab,
      actorName: data.actorName,
      actorPhoto: data.actorPhoto || '',
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (e) {
    console.error("Failed to create alert", e);
  }
};
