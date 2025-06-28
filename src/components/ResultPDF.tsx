import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { QuizAnswer } from '../types/Question';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  scoreSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 5,
  },
  questionSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 15,
  },
  question: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 10,
  },
  correctAnswer: {
    color: '#059669',
  },
  incorrectAnswer: {
    color: '#dc2626',
  },
});

interface ResultPDFProps {
  score: number;
  answers: QuizAnswer[];
  totalQuestions: number;
  timeSpent: number;
  timestamp: Date;
  userName: string;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const ResultPDF: React.FC<ResultPDFProps> = ({
  score,
  answers,
  totalQuestions,
  timeSpent,
  timestamp,
  userName,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>C Programming Quiz Results</Text>
        <Text style={styles.subtitle}>Student: {userName}</Text>
        <Text style={styles.subtitle}>Date: {timestamp.toLocaleDateString()}</Text>
      </View>

      <View style={styles.scoreSection}>
        <Text style={styles.scoreText}>Score: {score}%</Text>
        <Text style={styles.detailText}>Total Questions: {totalQuestions}</Text>
        <Text style={styles.detailText}>Correct Answers: {answers.filter(a => a.isCorrect).length}</Text>
        <Text style={styles.detailText}>Time Spent: {formatTime(timeSpent)}</Text>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.scoreText, { fontSize: 16 }]}>Question Details</Text>
        {answers.map((answer, index) => (
          <View key={index} style={styles.question}>
            <Text style={styles.questionText}>
              {index + 1}. {answer.questionText}
            </Text>
            <Text style={[
              styles.answerText,
              answer.isCorrect ? styles.correctAnswer : styles.incorrectAnswer
            ]}>
              Your Answer: {answer.selected}
              {!answer.isCorrect && ` (Correct: ${answer.correct})`}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default ResultPDF; 