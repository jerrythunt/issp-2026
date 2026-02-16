import { getFirestore, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export async function getSurvey() {
    const snapshot = await getDocs(collection(db, "survey")); // get all documents
    return snapshot.docs.map(doc => doc.data()); // return objects
}

export async function submit(surveyorID, surveyID, responses) {
    await setDoc(doc(db, "responses", `Surveyor-${surveyorID}-Survey-${surveyID}`), { surveyorID, surveyID, responses, }); // create new document for surveyor responses
}