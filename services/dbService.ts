
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GenerationLog } from '../types';

/**
 * Saves activity metadata to Firestore without storing actual images.
 * This ensures zero storage costs.
 */
export const logGenerationActivity = async (
  featureType: GenerationLog['featureType'],
  prompt: string,
  uploadedMeta?: GenerationLog['uploadedImageMeta'],
  generatedInfo?: GenerationLog['generatedImageInfo']
): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Authentication required.');

  try {
    const docRef = await addDoc(collection(db, 'generation_logs'), {
      userId: user.uid,
      featureType,
      prompt: prompt || 'No prompt provided',
      uploadedImageMeta: uploadedMeta || [],
      generatedImageInfo: generatedInfo || { resolution: '1024x1024' },
      createdAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error: any) {
    console.error("Logging failed:", error);
    throw new Error("Failed to log activity. Check your network.");
  }
};

/**
 * Retrieves the user's activity log.
 */
export const getUserLogs = async (): Promise<GenerationLog[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, 'generation_logs'),
    where('userId', '==', user.uid),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  try {
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as GenerationLog));
  } catch (error) {
    console.error("Fetch Logs Failed:", error);
    return [];
  }
};

export const deleteLog = async (id: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Unauthenticated');
  await deleteDoc(doc(db, 'generation_logs', id));
};
