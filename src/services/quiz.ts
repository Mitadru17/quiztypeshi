import { collection, addDoc, getDocs, query, orderBy, where, doc, getDoc, serverTimestamp, Timestamp, writeBatch, WriteBatch } from 'firebase/firestore';
import { db } from './firebase';
import { QuizResult } from '../types/Result';
import { Question } from '../types/Question';

const QUIZ_STATE_KEY = 'quiz_state';
const QUIZ_TIME_KEY = 'quiz_time';
const ADMIN_EMAIL = 'mitadruroy006@gmail.com'; // Updated admin email

// Fisher-Yates shuffle algorithm
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface QuizState {
  questions: Question[];
  answers: { [key: string]: string };
  currentQuestionIndex: number;
  timeLeft: number;
  startTime: number;
}

export const generateQuestions = async (): Promise<Question[]> => {
  // Mock AI-generated questions about C Programming Structures and Functions
  const questions: Question[] = [
    {
      id: "q1",
      question: "What keyword is used to define a structure in C?",
      options: ["define", "class", "struct", "object"],
      correctAnswer: "struct"
    },
    {
      id: "q2", 
      question: "How do you access a member of a structure using a pointer?",
      options: ["ptr.member", "ptr->member", "ptr::member", "*ptr.member"],
      correctAnswer: "ptr->member"
    },
    {
      id: "q3",
      question: "What is the correct way to declare a function in C?",
      options: ["function int add()", "int add()", "def add():", "int add() {}"],
      correctAnswer: "int add()"
    },
    {
      id: "q4",
      question: "Which operator is used to get the address of a variable?",
      options: ["*", "&", "#", "@"],
      correctAnswer: "&"
    },
    {
      id: "q5",
      question: "What does the 'sizeof' operator return for a structure?",
      options: ["Number of members", "Size in bytes", "Memory address", "Structure name"],
      correctAnswer: "Size in bytes"
    },
    {
      id: "q6",
      question: "How do you pass a structure to a function by reference?",
      options: ["func(struct s)", "func(&s)", "func(*s)", "func(s*)"],
      correctAnswer: "func(&s)"
    },
    {
      id: "q7",
      question: "What is function prototype in C?",
      options: ["Function definition", "Function declaration", "Function call", "Function pointer"],
      correctAnswer: "Function declaration"
    },
    {
      id: "q8",
      question: "Can a structure contain a pointer to itself?",
      options: ["Yes", "No", "Only in C++", "Depends on compiler"],
      correctAnswer: "Yes"
    },
    {
      id: "q9",
      question: "What is the default return type of a function in C?",
      options: ["void", "int", "char", "float"],
      correctAnswer: "int"
    },
    {
      id: "q10",
      question: "How do you initialize a structure variable?",
      options: ["struct name = {values}", "name = {values}", "Both A and B", "None of the above"],
      correctAnswer: "Both A and B"
    },
    {
      id: "q11",
      question: "What is recursion in C functions?",
      options: ["Function calling another function", "Function calling itself", "Function with no return", "Function with multiple parameters"],
      correctAnswer: "Function calling itself"
    },
    {
      id: "q12",
      question: "Can a function return a structure in C?",
      options: ["Yes", "No", "Only pointers", "Only arrays"],
      correctAnswer: "Yes"
    },
    {
      id: "q13",
      question: "What is the scope of variables declared inside a function?",
      options: ["Global", "Local", "Static", "External"],
      correctAnswer: "Local"
    },
    {
      id: "q14",
      question: "How do you create an array of structures?",
      options: ["struct name[size]", "struct[size] name", "name struct[size]", "[size] struct name"],
      correctAnswer: "struct name[size]"
    },
    {
      id: "q15",
      question: "What happens when you don't return a value from a non-void function?",
      options: ["Compilation error", "Runtime error", "Undefined behavior", "Returns 0"],
      correctAnswer: "Undefined behavior"
    }
  ];

  // Shuffle the questions before returning
  return shuffleArray(questions);
};

export const saveQuizState = (state: QuizState): void => {
  localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
};

export const getQuizState = (): QuizState | null => {
  const state = localStorage.getItem(QUIZ_STATE_KEY);
  if (!state) return null;
  return JSON.parse(state);
};

export const clearQuizState = (): void => {
  localStorage.removeItem(QUIZ_STATE_KEY);
  localStorage.removeItem(QUIZ_TIME_KEY);
};

export const saveQuizResult = async (result: Omit<QuizResult, 'id'>): Promise<string> => {
  try {
    console.log('Starting to save quiz result to Firestore');
    
    // Convert Date to Firestore Timestamp
    const resultWithTimestamp = {
      ...result,
      timestamp: Timestamp.fromDate(result.timestamp),
      serverTimestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const resultsRef = collection(db, 'results');
    const docRef = await addDoc(resultsRef, resultWithTimestamp);
    
    console.log('Quiz result saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving quiz result:', error);
    throw new Error('Failed to save quiz result to database');
  }
};

export const getQuizResults = async (userEmail: string): Promise<QuizResult[]> => {
  try {
    console.log('Fetching quiz results for user:', userEmail);
    
    const resultsRef = collection(db, 'results');
    const q = query(
      resultsRef,
      where('userEmail', '==', userEmail),
      orderBy('serverTimestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamp back to Date
        timestamp: data.timestamp?.toDate() || new Date(data.createdAt)
      };
    }) as QuizResult[];

    console.log('Retrieved results count:', results.length);
    return results;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw new Error('Failed to fetch quiz results from database');
  }
};

export const getAllResults = async (): Promise<QuizResult[]> => {
  try {
    console.log('Fetching all quiz results');
    
    const resultsRef = collection(db, 'results');
    const q = query(resultsRef, orderBy('serverTimestamp', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
      id: doc.id,
        ...data,
        // Convert Firestore Timestamp back to Date
        timestamp: data.timestamp?.toDate() || new Date(data.createdAt)
      };
    }) as QuizResult[];

    console.log('Retrieved all results count:', results.length);
    return results;
  } catch (error) {
    console.error('Error fetching all results:', error);
    throw new Error('Failed to fetch all results from database');
  }
};

export const isAdminUser = (email: string): boolean => {
  return email === ADMIN_EMAIL;
};

export const getQuizResultById = async (resultId: string): Promise<QuizResult | null> => {
  try {
    if (!resultId) {
      throw new Error('Result ID is required');
    }

    const docRef = doc(db, 'results', resultId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore Timestamp back to Date
        timestamp: data.timestamp?.toDate() || new Date(data.createdAt)
      } as QuizResult;
    }
    return null;
  } catch (error) {
    console.error('Error fetching result:', error);
    throw new Error('Failed to fetch quiz result');
  }
};

export const exportResultsToCSV = (results: QuizResult[]): void => {
  const headers = ['Email', 'Score', 'Total Questions', 'Correct', 'Incorrect', 'Time Spent', 'Timestamp'];
  
  const csvContent = [
    headers.join(','),
    ...results.map(result => [
      result.userEmail,
      result.score,
      result.totalQuestions,
      result.answers.filter(a => a.isCorrect).length,
      result.answers.filter(a => !a.isCorrect).length,
      `${Math.floor(result.timeSpent / 60)}m ${result.timeSpent % 60}s`,
      result.timestamp.toLocaleString()
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `quiz_results_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const deleteUserResults = async (userEmail: string): Promise<void> => {
  try {
    console.log('Starting to delete results for user:', userEmail);
    
    const resultsRef = collection(db, 'results');
    const q = query(resultsRef, where('userEmail', '==', userEmail));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.size} documents to delete for user:`, userEmail);
    
    if (querySnapshot.empty) {
      console.log('No documents found to delete');
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      console.log('Deleting document:', doc.id);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Successfully deleted ${querySnapshot.size} results for user:`, userEmail);
  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete user results: ${error.message}`);
    }
    throw new Error('Failed to delete user results: Unknown error');
  }
};

export const deleteAllResults = async (): Promise<void> => {
  try {
    console.log('Starting to delete all results');
    
    const resultsRef = collection(db, 'results');
    const querySnapshot = await getDocs(resultsRef);

    console.log(`Found ${querySnapshot.size} total documents to delete`);
    
    if (querySnapshot.empty) {
      console.log('No documents found to delete');
      return;
    }

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      console.log('Deleting document:', doc.id);
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Successfully deleted ${querySnapshot.size} results`);
  } catch (error) {
    console.error('Error details:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete all results: ${error.message}`);
    }
    throw new Error('Failed to delete all results: Unknown error');
  }
};