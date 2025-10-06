import { Tree, CareRecord, GrowthMeasurement, CarbonCalculation, DashboardStats } from '../types/dashboard';

// Mock data service - in a real app, this would connect to your backend API
class DashboardService {
  private trees: Tree[] = [];
  private careRecords: CareRecord[] = [];
  private growthMeasurements: GrowthMeasurement[] = [];
  private carbonCalculations: CarbonCalculation[] = [];

  // Tree Management
  async getTrees(): Promise<Tree[]> {
    return this.trees;
  }

  async getTreeById(id: string): Promise<Tree | null> {
    return this.trees.find(tree => tree.id === id) || null;
  }

  async addTree(tree: Omit<Tree, 'id'>): Promise<Tree> {
    const newTree: Tree = {
      ...tree,
      id: Date.now().toString(),
    };
    this.trees.push(newTree);
    return newTree;
  }

  async updateTree(id: string, updates: Partial<Tree>): Promise<Tree | null> {
    const index = this.trees.findIndex(tree => tree.id === id);
    if (index === -1) return null;

    this.trees[index] = { ...this.trees[index], ...updates };
    return this.trees[index];
  }

  async deleteTree(id: string): Promise<boolean> {
    const index = this.trees.findIndex(tree => tree.id === id);
    if (index === -1) return false;

    this.trees.splice(index, 1);
    // Also remove related care records and measurements
    this.careRecords = this.careRecords.filter(record => record.treeId !== id);
    this.growthMeasurements = this.growthMeasurements.filter(measurement => measurement.treeId !== id);
    this.carbonCalculations = this.carbonCalculations.filter(calc => calc.treeId !== id);
    
    return true;
  }

  // Care Records
  async getCareRecords(treeId?: string): Promise<CareRecord[]> {
    if (treeId) {
      return this.careRecords.filter(record => record.treeId === treeId);
    }
    return this.careRecords;
  }

  async addCareRecord(record: Omit<CareRecord, 'id'>): Promise<CareRecord> {
    const newRecord: CareRecord = {
      ...record,
      id: Date.now().toString(),
    };
    this.careRecords.push(newRecord);
    return newRecord;
  }

  async updateCareRecord(id: string, updates: Partial<CareRecord>): Promise<CareRecord | null> {
    const index = this.careRecords.findIndex(record => record.id === id);
    if (index === -1) return null;

    this.careRecords[index] = { ...this.careRecords[index], ...updates };
    return this.careRecords[index];
  }

  // Growth Measurements
  async getGrowthMeasurements(treeId: string): Promise<GrowthMeasurement[]> {
    return this.growthMeasurements.filter(measurement => measurement.treeId === treeId);
  }

  async addGrowthMeasurement(measurement: Omit<GrowthMeasurement, 'id'>): Promise<GrowthMeasurement> {
    const newMeasurement: GrowthMeasurement = {
      ...measurement,
      id: Date.now().toString(),
    };
    this.growthMeasurements.push(newMeasurement);
    return newMeasurement;
  }

  // Carbon Calculations
  async getCarbonCalculations(treeId: string): Promise<CarbonCalculation[]> {
    return this.carbonCalculations.filter(calc => calc.treeId === treeId);
  }

  async calculateCarbonAbsorption(treeId: string, date: string): Promise<number> {
    const tree = await this.getTreeById(treeId);
    if (!tree) return 0;

    // Simple carbon calculation based on tree age and species
    const plantDate = new Date(tree.plantDate);
    const currentDate = new Date(date);
    const ageInYears = (currentDate.getTime() - plantDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // Base carbon absorption rate (this would be more sophisticated in a real app)
    const baseRate = 10; // kg CO2 per year
    const speciesMultiplier = this.getSpeciesCarbonMultiplier(tree.species);
    const sizeMultiplier = Math.min(tree.height / 10, 1); // Larger trees absorb more
    
    return baseRate * speciesMultiplier * sizeMultiplier * ageInYears;
  }

  private getSpeciesCarbonMultiplier(species: string): number {
    // Simplified species-specific carbon absorption multipliers
    const multipliers: { [key: string]: number } = {
      'Quercus robur': 1.5, // Oak
      'Acer saccharum': 1.2, // Maple
      'Pinus strobus': 1.8, // Pine
      'Betula pendula': 1.0, // Birch
      'Fraxinus excelsior': 1.3, // Ash
    };
    
    return multipliers[species] || 1.0;
  }

  // Dashboard Statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const totalTrees = this.trees.length;
    const totalCarbonAbsorbed = this.trees.reduce((sum, tree) => sum + tree.carbonAbsorbed, 0);
    
    const averageHealth = totalTrees > 0 ? 
      this.trees.reduce((sum, tree) => {
        const healthScore = tree.healthStatus === 'excellent' ? 4 : 
                           tree.healthStatus === 'good' ? 3 :
                           tree.healthStatus === 'fair' ? 2 : 1;
        return sum + healthScore;
      }, 0) / totalTrees : 0;

    const totalCareRecords = this.careRecords.length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const treesPlantedThisMonth = this.trees.filter(tree => {
      const plantDate = new Date(tree.plantDate);
      return plantDate.getMonth() === currentMonth && plantDate.getFullYear() === currentYear;
    }).length;

    // Mock community data - in a real app, this would come from your backend
    const communityTotalTrees = totalTrees * 15; // Assuming 15 users in community
    const communityTotalCarbon = totalCarbonAbsorbed * 15;

    return {
      totalTrees,
      totalCarbonAbsorbed,
      averageHealth,
      totalCareRecords,
      treesPlantedThisMonth,
      communityTotalTrees,
      communityTotalCarbon,
    };
  }

  // Analytics Data
  async getGrowthTrendData(treeId: string, months: number = 6): Promise<{ labels: string[]; data: number[] }> {
    const measurements = await this.getGrowthMeasurements(treeId);
    const sortedMeasurements = measurements.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const labels: string[] = [];
    const data: number[] = [];

    // Generate monthly data points
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      
      labels.push(monthLabel);
      
      // Find closest measurement for this month
      const measurement = sortedMeasurements.find(m => {
        const measurementDate = new Date(m.date);
        return measurementDate.getMonth() === date.getMonth() && 
               measurementDate.getFullYear() === date.getFullYear();
      });
      
      data.push(measurement ? measurement.height : 0);
    }

    return { labels, data };
  }

  async getMonthlyProgressData(): Promise<{ labels: string[]; data: number[] }> {
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      
      labels.push(monthLabel);
      
      const treesPlanted = this.trees.filter(tree => {
        const plantDate = new Date(tree.plantDate);
        return plantDate.getMonth() === date.getMonth() && 
               plantDate.getFullYear() === date.getFullYear();
      }).length;
      
      data.push(treesPlanted);
    }

    return { labels, data };
  }

  async getSpeciesDistribution(): Promise<{ labels: string[]; data: number[] }> {
    const speciesCount: { [key: string]: number } = {};
    
    this.trees.forEach(tree => {
      const commonName = this.getCommonName(tree.species);
      speciesCount[commonName] = (speciesCount[commonName] || 0) + 1;
    });

    return {
      labels: Object.keys(speciesCount),
      data: Object.values(speciesCount),
    };
  }

  private getCommonName(scientificName: string): string {
    const commonNames: { [key: string]: string } = {
      'Quercus robur': 'Oak',
      'Acer saccharum': 'Maple',
      'Pinus strobus': 'Pine',
      'Betula pendula': 'Birch',
      'Fraxinus excelsior': 'Ash',
    };
    
    return commonNames[scientificName] || scientificName;
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const sampleTrees: Tree[] = [
      {
        id: '1',
        name: 'Oak Tree #1',
        species: 'Quercus robur',
        location: 'Backyard Garden',
        plantDate: '2024-01-15',
        height: 2.5,
        diameter: 0.15,
        healthStatus: 'excellent',
        lastWatered: '2024-01-20',
        lastFertilized: '2024-01-18',
        notes: 'Growing well in partial shade',
        carbonAbsorbed: 12.5,
      },
      {
        id: '2',
        name: 'Maple Tree #1',
        species: 'Acer saccharum',
        location: 'Front Yard',
        plantDate: '2024-02-01',
        height: 1.8,
        diameter: 0.12,
        healthStatus: 'good',
        lastWatered: '2024-01-19',
        lastFertilized: '2024-01-15',
        notes: 'Needs more sunlight',
        carbonAbsorbed: 8.2,
      },
      {
        id: '3',
        name: 'Pine Tree #1',
        species: 'Pinus strobus',
        location: 'Side Garden',
        plantDate: '2023-11-20',
        height: 3.2,
        diameter: 0.18,
        healthStatus: 'excellent',
        lastWatered: '2024-01-18',
        lastFertilized: '2024-01-10',
        notes: 'Thriving in current location',
        carbonAbsorbed: 18.7,
      },
    ];

    const sampleCareRecords: CareRecord[] = [
      {
        id: '1',
        treeId: '1',
        date: '2024-01-20',
        action: 'watering',
        notes: 'Deep watering session',
        healthRating: 5,
      },
      {
        id: '2',
        treeId: '2',
        date: '2024-01-19',
        action: 'fertilizing',
        notes: 'Applied organic fertilizer',
        healthRating: 4,
      },
      {
        id: '3',
        treeId: '3',
        date: '2024-01-18',
        action: 'pruning',
        notes: 'Removed dead branches',
        healthRating: 5,
      },
    ];

    this.trees = sampleTrees;
    this.careRecords = sampleCareRecords;
  }
}

export default new DashboardService();
