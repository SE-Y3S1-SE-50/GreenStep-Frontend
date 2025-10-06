import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CareReminder } from '../types/dashboard';
import { ms, s, fontSize } from '../utils/responsive';

interface CareReminderCardProps {
  reminder: CareReminder;
  treeName: string;
  onPress: () => void;
  onComplete: () => void;
}

const CareReminderCard: React.FC<CareReminderCardProps> = ({ 
  reminder, 
  treeName, 
  onPress, 
  onComplete 
}) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'watering': return 'water';
      case 'fertilizing': return 'nutrition';
      case 'pruning': return 'cut';
      case 'health_check': return 'medical';
      default: return 'checkmark-circle';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'watering': return '#0ea5e9';
      case 'fertilizing': return '#8b5cf6';
      case 'pruning': return '#f59e0b';
      case 'health_check': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const isOverdue = () => {
    const dueDate = new Date(reminder.dueDate);
    const now = new Date();
    return now > dueDate;
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(reminder.dueDate);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const actionColor = getActionColor(reminder.type);
  const priorityColor = getPriorityColor(reminder.priority);
  const overdue = isOverdue();
  const daysUntilDue = getDaysUntilDue();

  return (
    <TouchableOpacity 
      style={[styles.container, overdue && styles.overdueContainer]} 
      onPress={onPress}
      android_ripple={Platform.OS === 'android' ? { color: '#e5e7eb' } : undefined}
    >
      <View style={styles.header}>
        <View style={styles.actionContainer}>
          <View style={[styles.actionIcon, { backgroundColor: actionColor }]}>
            <Ionicons name={getActionIcon(reminder.type)} size={ms(20)} color="white" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>
              {reminder.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={styles.treeName}>{treeName}</Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Text style={styles.priorityText}>{reminder.priority}</Text>
          </View>
          {reminder.isCompleted && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {reminder.notes && (
          <Text style={styles.notes}>{reminder.notes}</Text>
        )}
        
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons 
              name="calendar" 
              size={ms(14)} 
              color={overdue ? '#ef4444' : '#6b7280'} 
            />
            <Text style={[styles.dateText, overdue && styles.overdueText]}>
              {overdue 
                ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`
                : daysUntilDue === 0 
                  ? 'Due today'
                  : `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
              }
            </Text>
          </View>
          
          {!reminder.isCompleted && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={onComplete}
            >
              <Ionicons name="checkmark-circle" size={ms(20)} color="#16a34a" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: ms(14),
    borderRadius: ms(12),
    marginBottom: s(10),
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  overdueContainer: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: s(40),
    height: s(40),
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize(15),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: s(2),
  },
  treeName: {
    fontSize: fontSize(13),
    color: '#6b7280',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: ms(12),
    marginBottom: s(8),
  },
  priorityText: {
    color: 'white',
    fontSize: fontSize(12),
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  completedBadge: {
    backgroundColor: '#16a34a',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  notes: {
    fontSize: fontSize(13),
    color: '#374151',
    marginBottom: s(10),
    lineHeight: fontSize(20),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    marginLeft: s(6),
    fontSize: fontSize(13),
    color: '#6b7280',
    fontWeight: '500',
  },
  overdueText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  completeButton: {
    padding: s(8),
  },
});

export default CareReminderCard;
