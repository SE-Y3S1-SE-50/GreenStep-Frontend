export interface Tree {
  id: string;
  _id?: string; // MongoDB format compatibility
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
  imageUrl?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface CareRecord {
  id: string;
  _id?: string; // MongoDB format compatibility
  treeId: string;
  date: string;
  action: 'watering' | 'fertilizing' | 'pruning' | 'pest_control' | 'other';
  notes: string;
  healthRating: number; // 1-5 scale
  images?: string[];
  materials?: string[]; // MongoDB field
  weather?: {
    temperature: number;
    humidity: number;
    precipitation: number;
  };
  createdAt?: string; // MongoDB field
  updatedAt?: string; // MongoDB field
  __v?: number; // MongoDB field
}

export interface GrowthMeasurement {
  id: string;
  treeId: string;
  date: string;
  height: number;
  diameter: number;
  canopySpread?: number;
  notes?: string;
}

export interface CarbonCalculation {
  treeId: string;
  date: string;
  estimatedCarbonAbsorbed: number;
  calculationMethod: 'standard' | 'species_specific' | 'measured';
}

export interface DashboardStats {
  totalTrees: number;
  totalCarbonAbsorbed: number;
  averageHealth: number;
  totalCareRecords: number;
  treesPlantedThisMonth: number;
  communityTotalTrees: number;
  communityTotalCarbon: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }[];
}

export interface AnalyticsData {
  growthTrend: ChartData;
  carbonAbsorption: ChartData;
  healthDistribution: ChartData;
  speciesDistribution: ChartData;
  monthlyProgress: ChartData;
  careActivity: ChartData;
}

export interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed?: number;
  conditions: string;
}

export interface CareReminder {
  id: string;
  treeId: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'health_check';
  dueDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface TreeSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  carbonAbsorptionRate: number; // kg CO2 per year
  averageHeight: number;
  averageLifespan: number;
  optimalConditions: {
    soilType: string[];
    sunExposure: string;
    waterNeeds: string;
    hardinessZones: number[];
  };
  careInstructions: {
    watering: string;
    fertilizing: string;
    pruning: string;
    pestControl: string;
  };
}
