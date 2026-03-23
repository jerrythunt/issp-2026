import { getFirestore, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { app } from "./firebase";

const db = getFirestore(app);

export async function getSurvey() {
    const snapshot = await getDocs(collection(db, "survey")); // get all documents
    return snapshot.docs.map(doc => doc.data()); // return objects
}

export async function submit(surveyorID, surveyID, responses) {
    try {
        await setDoc(doc(db, "responses", `Surveyor-${surveyorID}-Survey-${surveyID}`), { // create new document for surveyor response data
            surveyorID, surveyID, responses,
        }); 

    } catch(err) {
        console.error("Submission failed: ", err);
        throw err;
    }
}