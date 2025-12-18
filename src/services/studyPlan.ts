import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { StudyPlan, StudyPlanInput } from '../types';

const PLANS_COLLECTION = 'studyPlans';

// Helper to convert Firestore data to StudyPlan type
const mapDocToPlan = (doc: any): StudyPlan => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
    } as StudyPlan;
};

// Create a new study plan
export const createStudyPlan = async (
    userId: string,
    input: StudyPlanInput,
    aiPlan: string
): Promise<string> => {
    const docRef = await addDoc(collection(db, PLANS_COLLECTION), {
        userId,
        subjects: input.subjects,
        examDate: input.examDate,
        dailyHours: input.dailyHours,
        aiPlan,
        createdAt: Timestamp.now(),
    });
    return docRef.id;
};

// Get all study plans for a user
export const getUserPlans = async (userId: string): Promise<StudyPlan[]> => {
    const q = query(
        collection(db, PLANS_COLLECTION),
        where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToPlan).sort((a, b) =>
        b.createdAt.getTime() - a.createdAt.getTime()
    );
};

// Get a single study plan by ID
export const getPlanById = async (planId: string): Promise<StudyPlan | null> => {
    const docRef = doc(db, PLANS_COLLECTION, planId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return mapDocToPlan(docSnap);
    }
    return null;
};

// Delete a study plan
export const deletePlan = async (planId: string): Promise<void> => {
    await deleteDoc(doc(db, PLANS_COLLECTION, planId));
};
