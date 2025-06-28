import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { QuizResult } from '../types/Result';

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
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  emailCell: {
    flex: 2,
  },
  scoreCell: {
    color: '#059669',
  },
  lowScoreCell: {
    color: '#dc2626',
  },
  dateCell: {
    flex: 1.5,
  },
});

interface AdminResultsPDFProps {
  results: QuizResult[];
  exportDate: Date;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const AdminResultsPDF: React.FC<AdminResultsPDFProps> = ({ results, exportDate }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Quiz Results Summary</Text>
        <Text style={styles.subtitle}>Export Date: {formatDate(exportDate)}</Text>
        <Text style={styles.subtitle}>Total Results: {results.length}</Text>
      </View>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.emailCell]}>User</Text>
          <Text style={styles.tableCell}>Score</Text>
          <Text style={styles.tableCell}>Questions</Text>
          <Text style={[styles.tableCell, styles.dateCell]}>Date</Text>
          <Text style={styles.tableCell}>Time Spent</Text>
        </View>

        {results.map((result, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.emailCell]}>
              {result.userName || result.userEmail.split('@')[0]}\n
              <Text style={{ fontSize: 8, color: '#64748b' }}>{result.userEmail}</Text>
            </Text>
            <Text style={[
              styles.tableCell,
              result.score >= 60 ? styles.scoreCell : styles.lowScoreCell
            ]}>
              {result.score}%
            </Text>
            <Text style={styles.tableCell}>
              {result.totalQuestions}
            </Text>
            <Text style={[styles.tableCell, styles.dateCell]}>
              {formatDate(result.timestamp)}
            </Text>
            <Text style={styles.tableCell}>
              {formatTime(result.timeSpent)}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default AdminResultsPDF; 