import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useDashboard } from '../../contexts/DashboardContext';
import { useAuth } from '../../contexts/AuthContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive utilities
const isTablet = screenWidth >= 768;
const isLandscape = screenWidth > screenHeight;
const isSmallScreen = screenWidth < 375;

// Responsive values
const getResponsivePadding = () => isTablet ? 32 : isSmallScreen ? 16 : 20;
const getResponsiveFontSize = (base: number) => {
  if (isTablet) return base + 2;
  if (isSmallScreen) return base - 1;
  return base;
};
const getResponsiveSpacing = (base: number) => {
  if (isTablet) return base + 4;
  if (isSmallScreen) return base - 2;
  return base;
};

interface Tree {
  id: string;
  name: string;
  species: string;
  location: string;
  plantDate: string;
  height: number;
  diameter: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  lastWatered: string;
  lastFertilized: string;
  notes: string;
  carbonAbsorbed: number;
}

interface CareRecord {
  id: string;
  treeId: string;
  date: string;
  action: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'other';
  notes: string;
  healthRating: number; // 1-5 scale
}

const Dashboard: React.FC = () => {
  const { 
    trees, 
    careRecords, 
    reminders, 
    stats, 
    isLoading, 
    error,
    addTree,
    updateTree,
    deleteTree,
    addCareRecord,
    markReminderCompleted,
    getAnalyticsData,
    clearError
  } = useDashboard();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  
  const { isAuthenticated } = useAuth();
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [showAddTreeModal, setShowAddTreeModal] = useState(false);
  const [showEditTreeModal, setShowEditTreeModal] = useState(false);
  const [showCareModal, setShowCareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trees' | 'analytics' | 'care'>('overview');
  
  // Form state for adding new tree
  const [newTreeForm, setNewTreeForm] = useState({
    name: '',
    species: '',
    location: '',
    plantDate: '',
    height: '',
    diameter: '',
    notes: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Edit form state
  const [editTreeForm, setEditTreeForm] = useState({
    name: '',
    species: '',
    location: '',
    plantDate: '',
    height: '',
    diameter: '',
    healthStatus: 'good',
    notes: ''
  });
  const [editFormErrors, setEditFormErrors] = useState<{[key: string]: string}>({});
  
  // Care record form state
  const [careForm, setCareForm] = useState({
    action: '',
    notes: '',
    healthRating: '3'
  });
  const [careFormErrors, setCareFormErrors] = useState<{[key: string]: string}>({});
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  // Load analytics data when component mounts
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const [growthTrend, communityData] = await Promise.all([
          getAnalyticsData('growthTrend', { months: 6 }),
          getAnalyticsData('community')
        ]);
        
        setAnalyticsData({
          growthTrend,
          community: communityData
        });
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      }
    };

    if (isAuthenticated) {
      loadAnalyticsData();
    }
  }, [isAuthenticated, getAnalyticsData]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  // Debug trees data
  useEffect(() => {
    console.log('🔍 Trees loaded:', trees.length);
    if (trees.length > 0) {
      console.log('🔍 First tree ID:', trees[0].id);
      console.log('🔍 First tree _id:', trees[0]._id);
    }
  }, [trees]);

  // Debug care records data
  useEffect(() => {
    console.log('🔍 Care records loaded:', careRecords.length);
    if (careRecords.length > 0) {
      console.log('🔍 First care record:', careRecords[0]);
    }
  }, [careRecords]);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 1,
  };

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

  // Use stats from API or calculate from local data
  const totalCarbonAbsorbed = stats?.totalCarbonAbsorbed || trees.reduce((sum, tree) => sum + tree.carbonAbsorbed, 0);
  const averageHealth = stats?.averageHealth || (trees.length > 0 ? 
    trees.reduce((sum, tree) => {
      const healthScore = tree.healthStatus === 'excellent' ? 4 : 
                         tree.healthStatus === 'good' ? 3 :
                         tree.healthStatus === 'fair' ? 2 : 1;
      return sum + healthScore;
    }, 0) / trees.length : 0);

  // Use real analytics data or fallback to calculated data
  const growthData = analyticsData?.growthTrend || {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Height (m)',
        data: [1.2, 1.5, 1.8, 2.1, 2.3, 2.5],
        color: (opacity = 1) => `rgba(22, 163, 74, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const carbonData = {
    labels: trees.map(t => t.species.split(' ')[0]), // Use first word of species name
    datasets: [
      {
        data: trees.map(t => t.carbonAbsorbed),
      },
    ],
  };

  const healthDistribution = {
    labels: ['Excellent', 'Good', 'Fair', 'Poor'],
    data: [
      trees.filter(t => t.healthStatus === 'excellent').length,
      trees.filter(t => t.healthStatus === 'good').length,
      trees.filter(t => t.healthStatus === 'fair').length,
      trees.filter(t => t.healthStatus === 'poor').length,
    ],
  };



  const validateTreeForm = () => {
    const errors: string[] = [];

    // Validate required fields
    if (!newTreeForm.name.trim()) {
      errors.push('Tree name is required');
    } else if (newTreeForm.name.trim().length < 2) {
      errors.push('Tree name must be at least 2 characters long');
    } else if (newTreeForm.name.trim().length > 50) {
      errors.push('Tree name must be less than 50 characters');
    }

    if (!newTreeForm.species.trim()) {
      errors.push('Species is required');
    } else if (newTreeForm.species.trim().length < 2) {
      errors.push('Species name must be at least 2 characters long');
    } else if (newTreeForm.species.trim().length > 100) {
      errors.push('Species name must be less than 100 characters');
    }

    if (!newTreeForm.location.trim()) {
      errors.push('Location is required');
    } else if (newTreeForm.location.trim().length < 2) {
      errors.push('Location must be at least 2 characters long');
    } else if (newTreeForm.location.trim().length > 100) {
      errors.push('Location must be less than 100 characters');
    }

    // Validate numeric fields
    if (!newTreeForm.height.trim()) {
      errors.push('Height is required');
    } else {
      const height = parseFloat(newTreeForm.height);
      if (isNaN(height)) {
        errors.push('Height must be a valid number');
      } else if (height <= 0) {
        errors.push('Height must be greater than 0');
      } else if (height > 100) {
        errors.push('Height must be less than 100 meters');
      }
    }

    if (!newTreeForm.diameter.trim()) {
      errors.push('Diameter is required');
    } else {
      const diameter = parseFloat(newTreeForm.diameter);
      if (isNaN(diameter)) {
        errors.push('Diameter must be a valid number');
      } else if (diameter <= 0) {
        errors.push('Diameter must be greater than 0');
      } else if (diameter > 10) {
        errors.push('Diameter must be less than 10 meters');
      }
    }

    // Validate plant date if provided
    if (newTreeForm.plantDate.trim()) {
      const plantDate = new Date(newTreeForm.plantDate);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      
      if (isNaN(plantDate.getTime())) {
        errors.push('Plant date must be a valid date (YYYY-MM-DD format)');
      } else if (plantDate > today) {
        errors.push('Plant date cannot be in the future');
      } else if (plantDate < minDate) {
        errors.push('Plant date cannot be before 1900');
      }
    }

    // Validate notes length if provided
    if (newTreeForm.notes && newTreeForm.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return errors;
  };

  const handleAddTree = async () => {
    // Validate form
    const validationErrors = validateTreeForm();
    
    if (validationErrors.length > 0) {
      Alert.alert(
        'Validation Error', 
        validationErrors.join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Parse validated data
      const height = parseFloat(newTreeForm.height);
      const diameter = parseFloat(newTreeForm.diameter);
      const plantDate = newTreeForm.plantDate || new Date().toISOString().split('T')[0];

      const success = await addTree({
        name: newTreeForm.name.trim(),
        species: newTreeForm.species.trim(),
        location: newTreeForm.location.trim(),
        plantDate: plantDate,
        height: height,
        diameter: diameter,
        healthStatus: 'good',
        lastWatered: new Date().toISOString(),
        lastFertilized: new Date().toISOString(),
        notes: newTreeForm.notes?.trim() || '',
        carbonAbsorbed: 0,
      });

      if (success) {
        setShowAddTreeModal(false);
        setNewTreeForm({
          name: '',
          species: '',
          location: '',
          plantDate: '',
          height: '',
          diameter: '',
          notes: ''
        });
        clearFormErrors();
        Alert.alert('Success', 'Tree added successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add tree. Please try again.');
    }
  };

  // Real-time validation for individual fields
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Tree name is required';
        if (value.trim().length < 2) return 'Tree name must be at least 2 characters';
        if (value.trim().length > 50) return 'Tree name must be less than 50 characters';
        return '';
      
      case 'species':
        if (!value.trim()) return 'Species is required';
        if (value.trim().length < 2) return 'Species name must be at least 2 characters';
        if (value.trim().length > 100) return 'Species name must be less than 100 characters';
        return '';
      
      case 'location':
        if (!value.trim()) return 'Location is required';
        if (value.trim().length < 2) return 'Location must be at least 2 characters';
        if (value.trim().length > 100) return 'Location must be less than 100 characters';
        return '';
      
      case 'height':
        if (!value.trim()) return 'Height is required';
        const height = parseFloat(value);
        if (isNaN(height)) return 'Height must be a valid number';
        if (height <= 0) return 'Height must be greater than 0';
        if (height > 100) return 'Height must be less than 100 meters';
        return '';
      
      case 'diameter':
        if (!value.trim()) return 'Diameter is required';
        const diameter = parseFloat(value);
        if (isNaN(diameter)) return 'Diameter must be a valid number';
        if (diameter <= 0) return 'Diameter must be greater than 0';
        if (diameter > 10) return 'Diameter must be less than 10 meters';
        return '';
      
      case 'plantDate':
        if (value.trim()) {
          const plantDate = new Date(value);
          const today = new Date();
          const minDate = new Date('1900-01-01');
          
          if (isNaN(plantDate.getTime())) return 'Invalid date format (YYYY-MM-DD)';
          if (plantDate > today) return 'Plant date cannot be in the future';
          if (plantDate < minDate) return 'Plant date cannot be before 1900';
        }
        return '';
      
      case 'notes':
        if (value && value.length > 500) return 'Notes must be less than 500 characters';
        return '';
      
      default:
        return '';
    }
  };

  const updateFormField = (field: string, value: string) => {
    setNewTreeForm(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    const error = validateField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const clearFormErrors = () => {
    setFormErrors({});
  };

  // Care record validation
  const validateCareForm = () => {
    const errors: string[] = [];

    if (!careForm.action.trim()) {
      errors.push('Care action is required');
    }

    if (!careForm.healthRating || isNaN(parseInt(careForm.healthRating))) {
      errors.push('Health rating is required');
    } else {
      const rating = parseInt(careForm.healthRating);
      if (rating < 1 || rating > 5) {
        errors.push('Health rating must be between 1 and 5');
      }
    }

    if (careForm.notes && careForm.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return errors;
  };

  const handleAddCareRecord = async () => {
    if (!selectedTree) {
      Alert.alert('Error', 'Please select a tree first');
      return;
    }

    const validationErrors = validateCareForm();
    
    if (validationErrors.length > 0) {
      Alert.alert(
        'Validation Error', 
        validationErrors.join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      console.log('🔍 DEBUGGING: Starting to add care record...');
      console.log('🔍 Selected tree:', selectedTree);
      console.log('🔍 Selected tree ID:', selectedTree?.id);
      console.log('🔍 Selected tree ID type:', typeof selectedTree?.id);
      console.log('🔍 Care form data:', careForm);
      console.log('🔍 Care records before adding:', careRecords.length);
      
      // Ensure we have a valid tree ID
      if (!selectedTree?.id) {
        console.error('🔍 ERROR: No valid tree ID found');
        Alert.alert('Error', 'No tree selected. Please select a tree first.');
        return;
      }
      
      // Use _id if id is not available (fallback)
      const treeId = selectedTree.id || (selectedTree as any)._id;
      console.log('🔍 Using tree ID:', treeId);
      
      const success = await addCareRecord({
        treeId: treeId,
        date: new Date().toISOString(),
        action: careForm.action.trim().toLowerCase() as 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'other',
        notes: careForm.notes?.trim() || '',
        healthRating: parseInt(careForm.healthRating),
      });

      console.log('🔍 Add care record result:', success);
      console.log('🔍 Care records after adding:', careRecords.length);

      if (success) {
        setShowCareModal(false);
        setCareForm({
          action: '',
          notes: '',
          healthRating: '3'
        });
        setCareFormErrors({});
        Alert.alert('Success', 'Care record added successfully!');
      } else {
        Alert.alert('Error', 'Failed to add care record. Please check console for details.');
      }
    } catch (error) {
      console.error('🔍 Error adding care record:', error);
      Alert.alert('Error', `Failed to add care record: ${error}`);
    }
  };

  const updateCareFormField = (field: string, value: string) => {
    setCareForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (careFormErrors[field]) {
      setCareFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const clearCareFormErrors = () => {
    setCareFormErrors({});
  };

  // Edit tree functions
  const openEditModal = (tree: Tree) => {
    setSelectedTree(tree);
    setEditTreeForm({
      name: tree.name,
      species: tree.species,
      location: tree.location,
      plantDate: tree.plantDate.split('T')[0], // Convert to YYYY-MM-DD format
      height: tree.height.toString(),
      diameter: tree.diameter.toString(),
      healthStatus: tree.healthStatus,
      notes: tree.notes || ''
    });
    setEditFormErrors({});
    setShowEditTreeModal(true);
  };

  const validateEditForm = () => {
    const errors: string[] = [];

    // Same validation as add form
    if (!editTreeForm.name.trim()) {
      errors.push('Tree name is required');
    } else if (editTreeForm.name.trim().length < 2) {
      errors.push('Tree name must be at least 2 characters long');
    } else if (editTreeForm.name.trim().length > 50) {
      errors.push('Tree name must be less than 50 characters');
    }

    if (!editTreeForm.species.trim()) {
      errors.push('Species is required');
    } else if (editTreeForm.species.trim().length < 2) {
      errors.push('Species name must be at least 2 characters long');
    } else if (editTreeForm.species.trim().length > 100) {
      errors.push('Species name must be less than 100 characters');
    }

    if (!editTreeForm.location.trim()) {
      errors.push('Location is required');
    } else if (editTreeForm.location.trim().length < 2) {
      errors.push('Location must be at least 2 characters long');
    } else if (editTreeForm.location.trim().length > 100) {
      errors.push('Location must be less than 100 characters');
    }

    if (!editTreeForm.height.trim()) {
      errors.push('Height is required');
    } else {
      const height = parseFloat(editTreeForm.height);
      if (isNaN(height)) {
        errors.push('Height must be a valid number');
      } else if (height <= 0) {
        errors.push('Height must be greater than 0');
      } else if (height > 100) {
        errors.push('Height must be less than 100 meters');
      }
    }

    if (!editTreeForm.diameter.trim()) {
      errors.push('Diameter is required');
    } else {
      const diameter = parseFloat(editTreeForm.diameter);
      if (isNaN(diameter)) {
        errors.push('Diameter must be a valid number');
      } else if (diameter <= 0) {
        errors.push('Diameter must be greater than 0');
      } else if (diameter > 10) {
        errors.push('Diameter must be less than 10 meters');
      }
    }

    if (editTreeForm.plantDate.trim()) {
      const plantDate = new Date(editTreeForm.plantDate);
      const today = new Date();
      const minDate = new Date('1900-01-01');
      
      if (isNaN(plantDate.getTime())) {
        errors.push('Plant date must be a valid date (YYYY-MM-DD format)');
      } else if (plantDate > today) {
        errors.push('Plant date cannot be in the future');
      } else if (plantDate < minDate) {
        errors.push('Plant date cannot be before 1900');
      }
    }

    if (editTreeForm.notes && editTreeForm.notes.length > 500) {
      errors.push('Notes must be less than 500 characters');
    }

    return errors;
  };

  const handleEditTree = async () => {
    if (!selectedTree) {
      Alert.alert('Error', 'No tree selected for editing');
      return;
    }

    const validationErrors = validateEditForm();
    
    if (validationErrors.length > 0) {
      Alert.alert(
        'Validation Error', 
        validationErrors.join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const height = parseFloat(editTreeForm.height);
      const diameter = parseFloat(editTreeForm.diameter);
      const plantDate = editTreeForm.plantDate || new Date().toISOString().split('T')[0];

      const success = await updateTree(selectedTree.id, {
        name: editTreeForm.name.trim(),
        species: editTreeForm.species.trim(),
        location: editTreeForm.location.trim(),
        plantDate: plantDate,
        height: height,
        diameter: diameter,
        healthStatus: editTreeForm.healthStatus as 'excellent' | 'good' | 'fair' | 'poor',
        notes: editTreeForm.notes?.trim() || '',
      });

      if (success) {
        setShowEditTreeModal(false);
        setEditTreeForm({
          name: '',
          species: '',
          location: '',
          plantDate: '',
          height: '',
          diameter: '',
          healthStatus: 'good',
          notes: ''
        });
        setEditFormErrors({});
        Alert.alert('Success', 'Tree updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update tree. Please try again.');
    }
  };

  const handleDeleteTree = async (tree: Tree) => {
    Alert.alert(
      'Delete Tree',
      `Are you sure you want to delete "${tree.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Frontend: Attempting to delete tree with ID:', tree.id);
              console.log('Frontend: Tree object:', tree);
              
              const success = await deleteTree(tree.id);
              console.log('Frontend: Delete result:', success);
              
              if (success) {
                Alert.alert('Success', 'Tree deleted successfully!');
              } else {
                Alert.alert('Error', 'Failed to delete tree. Please check console for details.');
              }
            } catch (error) {
              console.error('Frontend: Delete error:', error);
              Alert.alert('Error', `Failed to delete tree: ${error}`);
            }
          },
        },
      ]
    );
  };

  const updateEditFormField = (field: string, value: string) => {
    setEditTreeForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (editFormErrors[field]) {
      setEditFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const clearEditFormErrors = () => {
    setEditFormErrors({});
  };

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="leaf" size={24} color="#16a34a" />
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#16a34a" />
          ) : (
            <Text style={styles.statNumber}>{stats?.totalTrees || trees.length}</Text>
          )}
          <Text style={styles.statLabel}>Trees Planted</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="cloudy" size={24} color="#0ea5e9" />
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0ea5e9" />
          ) : (
            <Text style={styles.statNumber}>{totalCarbonAbsorbed.toFixed(1)}</Text>
          )}
          <Text style={styles.statLabel}>kg CO₂ Absorbed</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="heart" size={24} color="#ef4444" />
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Text style={styles.statNumber}>{averageHealth.toFixed(1)}/4</Text>
          )}
          <Text style={styles.statLabel}>Avg Health</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="calendar" size={24} color="#8b5cf6" />
          </View>
          {isLoading ? (
            <ActivityIndicator size="small" color="#8b5cf6" />
          ) : (
            <Text style={styles.statNumber}>{stats?.totalCareRecords || careRecords.length}</Text>
          )}
          <Text style={styles.statLabel}>Care Records</Text>
        </View>
      </View>

      {/* Growth Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tree Growth Over Time</Text>
        <LineChart
          data={growthData}
          width={windowWidth - (isTablet ? 64 : 48)}
          height={isTablet ? 280 : 220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Carbon Absorption Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Carbon Absorption by Species</Text>
        <BarChart
          data={carbonData}
          width={windowWidth - (isTablet ? 64 : 48)}
          height={isTablet ? 280 : 220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix="kg"
        />
      </View>

      {/* Health Distribution */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Tree Health Distribution</Text>
        <PieChart
          data={[
            { name: 'Excellent', population: healthDistribution.data[0], color: '#16a34a', legendFontColor: '#7F7F7F', legendFontSize: 12 },
            { name: 'Good', population: healthDistribution.data[1], color: '#84cc16', legendFontColor: '#7F7F7F', legendFontSize: 12 },
            { name: 'Fair', population: healthDistribution.data[2], color: '#eab308', legendFontColor: '#7F7F7F', legendFontSize: 12 },
            { name: 'Poor', population: healthDistribution.data[3], color: '#ef4444', legendFontColor: '#7F7F7F', legendFontSize: 12 },
          ]}
          width={windowWidth - (isTablet ? 64 : 48)}
          height={isTablet ? 280 : 220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );

  const renderTreesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.treesContainer}>
        {trees.map((tree, index) => (
          <TouchableOpacity
            key={tree.id || tree._id || `tree-${index}`}
            style={styles.treeCard}
            onPress={() => setSelectedTree(tree)}
          >
            <View style={styles.treeHeader}>
              <View style={styles.treeInfo}>
                <Text style={styles.treeName}>{tree.name}</Text>
                <Text style={styles.treeSpecies}>{tree.species}</Text>
                <Text style={styles.treeLocation}>{tree.location}</Text>
                <Text style={{fontSize: 10, color: '#666'}}>ID: {tree.id}</Text>
              </View>
              <View style={[styles.healthBadge, { backgroundColor: getHealthColor(tree.healthStatus) }]}>
                <Ionicons name={getHealthIcon(tree.healthStatus)} size={16} color="white" />
                <Text style={styles.healthText}>{tree.healthStatus}</Text>
              </View>
            </View>
            
            <View style={styles.treeStats}>
              <View style={styles.treeStat}>
                <Ionicons name="resize" size={16} color="#6b7280" />
                <Text style={styles.treeStatText}>{tree.height}m</Text>
              </View>
              <View style={styles.treeStat}>
                <Ionicons name="radio-button-off" size={16} color="#6b7280" />
                <Text style={styles.treeStatText}>{tree.diameter}m</Text>
              </View>
              <View style={styles.treeStat}>
                <Ionicons name="cloudy" size={16} color="#6b7280" />
                <Text style={styles.treeStatText}>{tree.carbonAbsorbed}kg</Text>
              </View>
            </View>
            
            <View style={styles.treeFooter}>
              <Text style={styles.plantedDate}>Planted: {new Date(tree.plantDate).toLocaleDateString()}</Text>
              <View style={styles.treeActions}>
                <TouchableOpacity 
                  style={styles.treeActionButton}
                  onPress={() => {
                    setSelectedTree(tree);
                    setShowCareModal(true);
                  }}
                >
                  <Ionicons name="heart" size={16} color="#16a34a" />
                  <Text style={styles.treeActionButtonText}>Care</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.treeActionButton}
                  onPress={() => openEditModal(tree)}
                >
                  <Ionicons name="create" size={16} color="#f59e0b" />
                  <Text style={styles.treeActionButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.treeActionButton}
                  onPress={() => handleDeleteTree(tree)}
                >
                  <Ionicons name="trash" size={16} color="#ef4444" />
                  <Text style={styles.treeActionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.addTreeButton}
          onPress={() => setShowAddTreeModal(true)}
        >
          <Ionicons name="add" size={24} color="#16a34a" />
          <Text style={styles.addTreeButtonText}>Add New Tree</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAnalyticsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.analyticsContainer}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Community Impact</Text>
          <View style={styles.impactMetrics}>
            <View style={styles.impactMetric}>
              <Text style={styles.impactNumber}>
                {isLoading ? '...' : (stats?.communityTotalTrees || analyticsData?.community?.totalTrees || trees.length)}
              </Text>
              <Text style={styles.impactLabel}>Total Trees</Text>
            </View>
            <View style={styles.impactMetric}>
              <Text style={styles.impactNumber}>
                {isLoading ? '...' : (stats?.communityTotalCarbon?.toFixed(0) || analyticsData?.community?.totalCarbonAbsorbed?.toFixed(0) || totalCarbonAbsorbed.toFixed(0))}
              </Text>
              <Text style={styles.impactLabel}>kg CO₂ Absorbed</Text>
            </View>
            <View style={styles.impactMetric}>
              <Text style={styles.impactNumber}>
                {isLoading ? '...' : (stats?.averageHealth?.toFixed(1) || analyticsData?.community?.averageHealth?.toFixed(1) || averageHealth.toFixed(1))}
              </Text>
              <Text style={styles.impactLabel}>Avg Health Score</Text>
            </View>
          </View>
        </View>

        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Your Trees Progress</Text>
          <BarChart
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                data: analyticsData?.growthTrend?.datasets?.[0]?.data || [0, 0, 0, 0, 0, trees.length],
              }],
            }}
            width={windowWidth - (isTablet ? 64 : 48)}
            height={isTablet ? 260 : 200}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Species Diversity</Text>
          {isLoading ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <PieChart
              data={(() => {
                // Calculate species distribution from real tree data
                const speciesCount: { [key: string]: number } = {};
                trees.forEach(tree => {
                  const species = tree.species.split(' ')[0]; // Get first word of species
                  speciesCount[species] = (speciesCount[species] || 0) + 1;
                });

                const colors = ['#16a34a', '#84cc16', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444'];
                const speciesData = Object.entries(speciesCount).map(([species, count], index) => ({
                  name: species,
                  population: count,
                  color: colors[index % colors.length],
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12
                }));

                // If no trees, show placeholder
                if (speciesData.length === 0) {
                  return [{
                    name: 'No Trees Yet',
                    population: 1,
                    color: '#e5e7eb',
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 12
                  }];
                }

                return speciesData;
              })()}
              width={windowWidth - (isTablet ? 64 : 48)}
              height={isTablet ? 260 : 200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          )}
        </View>

        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>Your Trees Health Distribution</Text>
          {isLoading ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <PieChart
              data={[
                { 
                  name: 'Excellent', 
                  population: trees.filter(t => t.healthStatus === 'excellent').length, 
                  color: '#16a34a', 
                  legendFontColor: '#7F7F7F', 
                  legendFontSize: 12 
                },
                { 
                  name: 'Good', 
                  population: trees.filter(t => t.healthStatus === 'good').length, 
                  color: '#84cc16', 
                  legendFontColor: '#7F7F7F', 
                  legendFontSize: 12 
                },
                { 
                  name: 'Fair', 
                  population: trees.filter(t => t.healthStatus === 'fair').length, 
                  color: '#f59e0b', 
                  legendFontColor: '#7F7F7F', 
                  legendFontSize: 12 
                },
                { 
                  name: 'Poor', 
                  population: trees.filter(t => t.healthStatus === 'poor').length, 
                  color: '#ef4444', 
                  legendFontColor: '#7F7F7F', 
                  legendFontSize: 12 
                },
              ]}
              width={windowWidth - (isTablet ? 64 : 48)}
              height={isTablet ? 260 : 200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderCareTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.careContainer}>
        {/* Care Records */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Care Records</Text>
        </View>
        {careRecords.length === 0 ? (
          <View style={styles.careRecord}>
            <Text style={styles.careNotes}>No care records found. Add a care record to see it here!</Text>
          </View>
        ) : (
          careRecords.slice(0, 5).map((record, index) => {
            console.log('🔍 Rendering care record:', record);
            console.log('🔍 Record ID:', record.id, 'Record _id:', record._id);
            
            // Find the tree name for this care record
            const tree = trees.find(t => t.id === record.treeId || t._id === record.treeId);
            const treeName = tree ? tree.name : 'Unknown Tree';
            
            return (
            <View key={record.id || record._id || `care-record-${index}`} style={styles.careRecord}>
              <View style={styles.careHeader}>
                <Text style={styles.careAction}>{record.action.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.careDate}>{new Date(record.date).toLocaleDateString()}</Text>
              </View>
              <View style={styles.careTreeInfo}>
                <Ionicons name="leaf" size={14} color="#16a34a" />
                <Text style={styles.careTreeName}>{treeName}</Text>
              </View>
              <Text style={styles.careNotes}>{record.notes}</Text>
              <View style={styles.careRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= record.healthRating ? "star" : "star-outline"}
                    size={16}
                    color="#eab308"
                  />
                ))}
              </View>
            </View>
            );
          })
        )}

        {/* Care Reminders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Care Reminders</Text>
        </View>
        {reminders.filter(r => !r.isCompleted).slice(0, 5).map((reminder, index) => (
          <TouchableOpacity
            key={reminder.id || (reminder as any)._id || `reminder-${index}`}
            style={styles.reminderCard}
            onPress={() => markReminderCompleted(reminder.id)}
          >
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderType}>{reminder.type.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.reminderDate}>{new Date(reminder.dueDate).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.reminderNotes}>{reminder.notes}</Text>
            <View style={styles.reminderPriority}>
              <Text style={[styles.priorityText, { color: reminder.priority === 'high' ? '#ef4444' : reminder.priority === 'medium' ? '#f59e0b' : '#10b981' }]}>
                {reminder.priority.toUpperCase()} PRIORITY
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.addCareButton}
          onPress={() => {
            // If no trees, show error
            if (trees.length === 0) {
              Alert.alert('No Trees', 'Please add a tree first before recording care activities.');
              return;
            }
            // Select first tree as default
            setSelectedTree(trees[0]);
            setShowCareModal(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color="#16a34a" />
          <Text style={styles.addCareButtonText}>Record Care Activity</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tree Care Dashboard</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons name="grid-outline" size={20} color={activeTab === 'overview' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trees' && styles.activeTab]}
          onPress={() => setActiveTab('trees')}
        >
          <Ionicons name="leaf-outline" size={20} color={activeTab === 'trees' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'trees' && styles.activeTabText]}>My Trees</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons name="analytics-outline" size={20} color={activeTab === 'analytics' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'care' && styles.activeTab]}
          onPress={() => setActiveTab('care')}
        >
          <Ionicons name="heart-outline" size={20} color={activeTab === 'care' ? '#16a34a' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'care' && styles.activeTabText]}>Care Log</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'trees' && renderTreesTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'care' && renderCareTab()}

      {/* Add Tree Modal */}
      <Modal
        visible={showAddTreeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Tree</Text>
            <TouchableOpacity onPress={() => {
              setShowAddTreeModal(false);
              clearFormErrors();
            }}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tree Name *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  formErrors.name ? styles.textInputError : null
                ]} 
                placeholder="e.g., Oak Tree #1" 
                value={newTreeForm.name}
                onChangeText={(value) => updateFormField('name', value)}
              />
              {formErrors.name ? (
                <Text style={styles.errorText}>{formErrors.name}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Species *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  formErrors.species ? styles.textInputError : null
                ]} 
                placeholder="e.g., Quercus robur" 
                value={newTreeForm.species}
                onChangeText={(value) => updateFormField('species', value)}
              />
              {formErrors.species ? (
                <Text style={styles.errorText}>{formErrors.species}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  formErrors.location ? styles.textInputError : null
                ]} 
                placeholder="e.g., Backyard Garden" 
                value={newTreeForm.location}
                onChangeText={(value) => updateFormField('location', value)}
              />
              {formErrors.location ? (
                <Text style={styles.errorText}>{formErrors.location}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Plant Date</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  formErrors.plantDate ? styles.textInputError : null
                ]} 
                placeholder="YYYY-MM-DD (optional)" 
                value={newTreeForm.plantDate}
                onChangeText={(value) => updateFormField('plantDate', value)}
              />
              {formErrors.plantDate ? (
                <Text style={styles.errorText}>{formErrors.plantDate}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Initial Height (m) *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  formErrors.height ? styles.textInputError : null
                ]} 
                placeholder="e.g., 1.5" 
                keyboardType="numeric" 
                value={newTreeForm.height}
                onChangeText={(value) => updateFormField('height', value)}
              />
              {formErrors.height ? (
                <Text style={styles.errorText}>{formErrors.height}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Initial Diameter (m) *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  formErrors.diameter ? styles.textInputError : null
                ]} 
                placeholder="e.g., 0.1" 
                keyboardType="numeric" 
                value={newTreeForm.diameter}
                onChangeText={(value) => updateFormField('diameter', value)}
              />
              {formErrors.diameter ? (
                <Text style={styles.errorText}>{formErrors.diameter}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  styles.textArea,
                  formErrors.notes ? styles.textInputError : null
                ]} 
                placeholder="Any additional notes about the tree..."
                multiline
                numberOfLines={4}
                value={newTreeForm.notes}
                onChangeText={(value) => updateFormField('notes', value)}
              />
              {formErrors.notes ? (
                <Text style={styles.errorText}>{formErrors.notes}</Text>
              ) : null}
              <Text style={styles.characterCount}>
                {newTreeForm.notes.length}/500 characters
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddTree}
            >
              <Text style={styles.saveButtonText}>Save Tree</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Care Record Modal */}
      <Modal
        visible={showCareModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Record Care for {selectedTree?.name || 'Tree'}
            </Text>
            <TouchableOpacity onPress={() => {
              setShowCareModal(false);
              clearCareFormErrors();
            }}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Care Action *</Text>
              <View style={styles.actionButtonsContainer}>
                {['watering', 'fertilizing', 'pruning', 'pest_control', 'other'].map((action) => (
                  <TouchableOpacity
                    key={action}
                    style={[
                      styles.actionButton,
                      careForm.action === action && styles.actionButtonSelected
                    ]}
                    onPress={() => updateCareFormField('action', action)}
                  >
                    <Text style={[
                      styles.actionButtonText,
                      careForm.action === action && styles.actionButtonTextSelected
                    ]}>
                      {action.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {careFormErrors.action ? (
                <Text style={styles.errorText}>{careFormErrors.action}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Health Rating *</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      careForm.healthRating === rating.toString() && styles.ratingButtonSelected
                    ]}
                    onPress={() => updateCareFormField('healthRating', rating.toString())}
                  >
                    <Ionicons 
                      name="star" 
                      size={24} 
                      color={careForm.healthRating === rating.toString() ? '#eab308' : '#d1d5db'} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabel}>
                {careForm.healthRating === '1' ? 'Poor' :
                 careForm.healthRating === '2' ? 'Fair' :
                 careForm.healthRating === '3' ? 'Good' :
                 careForm.healthRating === '4' ? 'Very Good' : 'Excellent'}
              </Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  styles.textArea,
                  careFormErrors.notes ? styles.textInputError : null
                ]} 
                placeholder="Any additional notes about the care activity..."
                multiline
                numberOfLines={4}
                value={careForm.notes}
                onChangeText={(value) => updateCareFormField('notes', value)}
              />
              {careFormErrors.notes ? (
                <Text style={styles.errorText}>{careFormErrors.notes}</Text>
              ) : null}
              <Text style={styles.characterCount}>
                {careForm.notes.length}/500 characters
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddCareRecord}
            >
              <Text style={styles.saveButtonText}>Record Care Activity</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Tree Modal */}
      <Modal
        visible={showEditTreeModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Tree</Text>
            <TouchableOpacity onPress={() => {
              setShowEditTreeModal(false);
              clearEditFormErrors();
            }}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tree Name *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  editFormErrors.name ? styles.textInputError : null
                ]} 
                placeholder="e.g., Oak Tree #1" 
                value={editTreeForm.name}
                onChangeText={(value) => updateEditFormField('name', value)}
              />
              {editFormErrors.name ? (
                <Text style={styles.errorText}>{editFormErrors.name}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Species *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  editFormErrors.species ? styles.textInputError : null
                ]} 
                placeholder="e.g., Quercus robur" 
                value={editTreeForm.species}
                onChangeText={(value) => updateEditFormField('species', value)}
              />
              {editFormErrors.species ? (
                <Text style={styles.errorText}>{editFormErrors.species}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  editFormErrors.location ? styles.textInputError : null
                ]} 
                placeholder="e.g., Backyard Garden" 
                value={editTreeForm.location}
                onChangeText={(value) => updateEditFormField('location', value)}
              />
              {editFormErrors.location ? (
                <Text style={styles.errorText}>{editFormErrors.location}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Plant Date</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  editFormErrors.plantDate ? styles.textInputError : null
                ]} 
                placeholder="YYYY-MM-DD" 
                value={editTreeForm.plantDate}
                onChangeText={(value) => updateEditFormField('plantDate', value)}
              />
              {editFormErrors.plantDate ? (
                <Text style={styles.errorText}>{editFormErrors.plantDate}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (m) *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  editFormErrors.height ? styles.textInputError : null
                ]} 
                placeholder="e.g., 1.5" 
                keyboardType="numeric" 
                value={editTreeForm.height}
                onChangeText={(value) => updateEditFormField('height', value)}
              />
              {editFormErrors.height ? (
                <Text style={styles.errorText}>{editFormErrors.height}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Diameter (m) *</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  editFormErrors.diameter ? styles.textInputError : null
                ]} 
                placeholder="e.g., 0.1" 
                keyboardType="numeric" 
                value={editTreeForm.diameter}
                onChangeText={(value) => updateEditFormField('diameter', value)}
              />
              {editFormErrors.diameter ? (
                <Text style={styles.errorText}>{editFormErrors.diameter}</Text>
              ) : null}
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Health Status</Text>
              <View style={styles.healthStatusContainer}>
                {['excellent', 'good', 'fair', 'poor'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.healthStatusButton,
                      editTreeForm.healthStatus === status && styles.healthStatusButtonSelected
                    ]}
                    onPress={() => updateEditFormField('healthStatus', status)}
                  >
                    <Text style={[
                      styles.healthStatusText,
                      editTreeForm.healthStatus === status && styles.healthStatusTextSelected
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput 
                style={[
                  styles.textInput, 
                  styles.textArea,
                  editFormErrors.notes ? styles.textInputError : null
                ]} 
                placeholder="Any additional notes about the tree..."
                multiline
                numberOfLines={4}
                value={editTreeForm.notes}
                onChangeText={(value) => updateEditFormField('notes', value)}
              />
              {editFormErrors.notes ? (
                <Text style={styles.errorText}>{editFormErrors.notes}</Text>
              ) : null}
              <Text style={styles.characterCount}>
                {editTreeForm.notes.length}/500 characters
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleEditTree}
            >
              <Text style={styles.saveButtonText}>Update Tree</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

// Create responsive styles
const createResponsiveStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: getResponsivePadding(),
    paddingVertical: getResponsiveSpacing(16),
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize(24),
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: getResponsivePadding(),
    paddingVertical: getResponsiveSpacing(12),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#dcfce7',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#16a34a',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: getResponsivePadding(),
  },
  statsContainer: {
    flexDirection: isTablet ? 'row' : 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: getResponsiveSpacing(20),
  },
  statCard: {
    width: isTablet ? '23%' : '48%',
    backgroundColor: '#ffffff',
    padding: getResponsiveSpacing(20),
    borderRadius: 12,
    marginBottom: getResponsiveSpacing(16),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  treesContainer: {
    paddingTop: 20,
  },
  treeCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  treeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  treeInfo: {
    flex: 1,
  },
  treeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  treeSpecies: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  treeLocation: {
    fontSize: 12,
    color: '#9ca3af',
  },
  healthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  healthText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  treeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  treeStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treeStatText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
  },
  treeFooter: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 8,
  },
  plantedDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  careButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  careButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  addTreeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dcfce7',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addTreeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
  },
  analyticsContainer: {
    paddingTop: 20,
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  impactMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactMetric: {
    alignItems: 'center',
  },
  impactNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  careContainer: {
    paddingTop: 20,
  },
  careRecord: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  careHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  careAction: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  careDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  careTreeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  careTreeName: {
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '500',
    marginLeft: 4,
  },
  careNotes: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  actionButtonTextSelected: {
    color: '#16a34a',
  },
  careRating: {
    flexDirection: 'row',
  },
  addCareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dcfce7',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  addCareButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#16a34a',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textInputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  characterCount: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    textAlign: 'right',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  ratingButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  ratingButtonSelected: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  treeActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 4,
    gap: 8,
    alignSelf: 'stretch',
  },
  treeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  treeActionButtonText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  healthStatusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  healthStatusButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  healthStatusButtonSelected: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  healthStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  healthStatusTextSelected: {
    color: '#16a34a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  reminderCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  reminderDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reminderNotes: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  reminderPriority: {
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// Create styles instance
const styles = createResponsiveStyles();

export default Dashboard;
