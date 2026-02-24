// ============================================
// EVALUX - Data Models & Initial State
// Fire Safety Management Platform
// ============================================

export const currentUser = {
  id: '',
  name: '',
  email: '',
  role: '',
  avatar: null,
  company: '',
  phone: '',
  certifications: [],
  lastLogin: null,
};

// Buildings / Properties
export const buildings = [];

// Inspections
export const inspections = [];

// Equipment Inventory
export const equipment = [];

// Work Orders
export const workOrders = [];

// Compliance Records
export const complianceRecords = [];

// Notifications
export const notifications = [];

// Dashboard Analytics (empty state)
export const dashboardStats = {
  totalBuildings: 0,
  totalInspections: 0,
  completedInspections: 0,
  overdueInspections: 0,
  scheduledInspections: 0,
  complianceRate: 0,
  totalEquipment: 0,
  operationalEquipment: 0,
  openWorkOrders: 0,
  criticalWorkOrders: 0,
  totalDeficiencies: 0,
  resolvedDeficiencies: 0,
};

export const monthlyInspections = [];
export const complianceByCategory = [];
export const buildingRiskDistribution = [];
export const workOrderTrend = [];
export const recentActivity = [];

// Team Members
export const teamMembers = [];
