import firebase_admin
from firebase_admin import credentials, firestore

def parseCol(collection):
    col = {}
    for doc in collection.stream():
        col[doc.id] = doc.to_dict()
    return col

def createCategory(database, category):
    '''
    Simulates POST request.
    Creates a new category in questions.
    '''
    database.collection("categories").document(category).set({"questions": []})

def createQuestion(database, category, question):
    '''
    Simulates POST request.
    Creates a new question.
    '''
    questions = parseCol(database.collection("categories"))[category]["questions"]
    questions.append(question)
    database.collection("categories").document(category).set({"questions": questions})

def createSurvey(database, surveyName, questions):
    '''
    Simulates POST request.
    Creates a new survey.
    '''
    database.collection("surveys").document(surveyName).set(questions)

def displaySurvey(database, surveyName):
    '''
    Simulates GET request.
    Create graph and display it (to be implemented)
    '''
    ss = parseCol(database.collection("surveys"))
    
    for k in ss[surveyName].keys():
        for q in ss[surveyName][k]:
            print(f"{q} in {k} category")

def freshInit(database):
    '''
    initializes dummy data from clean database

    db structure:
        categories
            category1
                {questions: [q1, q2, q3]} 
            category2
                {questions: [qn]}
            category3
        
        surveys
            test survey
                {category1: [question1, question2]}
                {category2: [anotherQuestion]}
    '''
    
    createCategory(database, "category1")
    createQuestion(database, "category1", "q1")
    createQuestion(database, "category1", "q2")
    createQuestion(database, "category1", "q3")

    createCategory(database, "category2")
    createQuestion(database, "category2", "qn")

    createCategory(database, "category3")

    createSurvey(database, "test survey", {"category1": ["q1", "q3"], "category2": ["qn"]})

# firestore > settings > service accounts > python > generate new private key > rename to serviceAccountKey.json
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

# freshInit(db)
displaySurvey(db, "test survey")
