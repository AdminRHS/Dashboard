// Configuration and constants
const departmentColors = {
    'Design': '#6D28D9', 
    'Development': '#147857', 
    'AI Team': '#147857', 
    'Project Management': '#8e1c1c',
    'Lead Generation': '#EC4899', 
    'Sales': '#EC4899', 
    'Video Production': '#F97316', 
    'Recruiting': '#4299e1',
    'Finance': '#4299e1', 
    'default': '#4B5563'
};

const API_CONFIG = {
    getEmployees: 'https://dashboard-eight-beta-59.vercel.app/api/get-employees',
    addViolation: 'https://dashboard-eight-beta-59.vercel.app/api/add-violation',
    updateData: 'https://dashboard-eight-beta-59.vercel.app/api/update-data'
};

// Global state variables
let currentDate = new Date();
let dataFileHandle = null; // File System Access API handle (if granted)
let dataFileName = null;   // For UI display / downloads
let employees = [];
