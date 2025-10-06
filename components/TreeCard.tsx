import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tree } from '../types/dashboard';
import { ms, s, fontSize } from '../utils/responsive';

interface TreeCardProps {
  tree: Tree;
  onPress: () => void;
  onCarePress: () => void;
}

const TreeCard: React.FC<TreeCardProps> = ({ tree, onPress, onCarePress }) => {
  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#16a34a';
      case 'good': return '#84cc16';
      case 'fair': return '#eab308';
      case 'poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'excellent': return 'leaf';
      case 'good': return 'leaf-outline';
      case 'fair': return 'warning-outline';
      case 'poor': return 'alert-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getDaysSinceLastWatered = () => {
    const lastWatered = new Date(tree.lastWatered);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastWatered.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getWateringUrgency = () => {
    const daysSince = getDaysSinceLastWatered();
    if (daysSince <= 3) return { color: '#16a34a', text: 'Recently watered' };
    if (daysSince <= 7) return { color: '#eab308', text: 'Needs watering soon' };
    return { color: '#ef4444', text: 'Needs watering urgently' };
  };

  const wateringStatus = getWateringUrgency();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      android_ripple={Platform.OS === 'android' ? { color: '#e5e7eb' } : undefined}
    >
      <View style={styles.header}>
        <View style={styles.treeInfo}>
          <Text style={styles.treeName}>{tree.name}</Text>
          <Text style={styles.treeSpecies}>{tree.species}</Text>
          <Text style={styles.treeLocation}>{tree.location}</Text>
        </View>
        <View style={[styles.healthBadge, { backgroundColor: getHealthColor(tree.healthStatus) }]}>
          <Ionicons name={getHealthIcon(tree.healthStatus)} size={ms(16)} color="white" />
          <Text style={styles.healthText}>{tree.healthStatus}</Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="resize" size={ms(16)} color="#6b7280" />
          <Text style={styles.statText}>{tree.height}m</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="radio-button-off" size={ms(16)} color="#6b7280" />
          <Text style={styles.statText}>{tree.diameter}m</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="cloudy" size={ms(16)} color="#6b7280" />
          <Text style={styles.statText}>{tree.carbonAbsorbed}kg</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="water" size={ms(16)} color={wateringStatus.color} />
          <Text style={[styles.statText, { color: wateringStatus.color }]}>
            {getDaysSinceLastWatered()}d
          </Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <View style={styles.dateContainer}>
          <Text style={styles.plantedDate}>
            Planted: {new Date(tree.plantDate).toLocaleDateString()}
          </Text>
          <Text style={[styles.wateringStatus, { color: wateringStatus.color }]}>
            {wateringStatus.text}
          </Text>
        </View>
        <TouchableOpacity style={styles.careButton} onPress={onCarePress}>
          <Ionicons name="heart" size={ms(16)} color="#16a34a" />
          <Text style={styles.careButtonText}>Care</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: ms(16),
    borderRadius: ms(12),
    marginBottom: s(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  treeInfo: {
    flex: 1,
  },
  treeName: {
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: s(2),
  },
  treeSpecies: {
    fontSize: fontSize(13),
    color: '#6b7280',
    marginBottom: s(2),
  },
  treeLocation: {
    fontSize: fontSize(12),
    color: '#9ca3af',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(8),
    paddingVertical: s(4),
    borderRadius: ms(12),
  },
  healthText: {
    color: 'white',
    fontSize: fontSize(12),
    fontWeight: '500',
    marginLeft: s(4),
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: s(10),
    paddingVertical: s(10),
    backgroundColor: '#f9fafb',
    borderRadius: ms(8),
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: s(4),
    fontSize: fontSize(13),
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flex: 1,
  },
  plantedDate: {
    fontSize: fontSize(12),
    color: '#9ca3af',
    marginBottom: s(2),
  },
  wateringStatus: {
    fontSize: fontSize(12),
    fontWeight: '500',
  },
  careButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: s(12),
    paddingVertical: s(6),
    borderRadius: ms(16),
  },
  careButtonText: {
    marginLeft: s(4),
    fontSize: fontSize(12),
    color: '#16a34a',
    fontWeight: '500',
  },
});

export default TreeCard;
