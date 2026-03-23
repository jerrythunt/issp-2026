import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { auth } from "./firebase";

const db = getFirestore();

// ------------------- Questions -------------------
export async function addQuestion(questionText, type = "scaled") {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const docRef = await addDoc(collection(db, "questions"), {
    text: questionText,
    type,
    createdAt: new Date(),
  });

  return docRef.id;
}

export async function fetchQuestions() {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const querySnapshot = await getDocs(collection(db, "questions"));
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function deleteQuestion(id) {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const docRef = doc(db, "questions", id);
  await deleteDoc(docRef);
}

// ------------------- Surveys -------------------
export async function createSurvey(name, questionIds) {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const docRef = await addDoc(collection(db, "surveys"), {
    name,
    questions: questionIds,
    createdAt: new Date(),
  });

  return docRef.id;
}
