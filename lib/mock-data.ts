import { User, Company } from './types';

// Mock companies
export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Tech Solutions Inc.',
    logo: '🏢',
    industry: 'Technology',
    size: '50-200',
    status: 'active',
  },
  {
    id: '2',
    name: 'Global Finance Corp',
    logo: '🏦',
    industry: 'Finance',
    size: '200-500',
    status: 'active',
  },
  {
    id: '3',
    name: 'Retail Masters Ltd',
    logo: '🛍️',
    industry: 'Retail',
    size: '10-50',
    status: 'active',
  },
  {
    id: '4',
    name: 'Healthcare Plus',
    logo: '🏥',
    industry: 'Healthcare',
    size: '100-200',
    status: 'active',
  },
  {
    id: '5',
    name: 'Manufacturing Pro',
    logo: '🏭',
    industry: 'Manufacturing',
    size: '500-1000',
    status: 'inactive',
  },
];

// Mock users
export const mockUsers: Record<string, User> = {
  'admin@bixssca.com': {
    id: '1',
    email: 'admin@bixssca.com',
    name: 'Admin User',
    role: 'admin',
    avatar: '👨‍💼',
  },
  'ca@bixssca.com': {
    id: '2',
    email: 'ca@bixssca.com',
    name: 'John CA Professional',
    role: 'ca',
    avatar: '👤',
    companies: mockCompanies.slice(0, 3), // CA handles multiple companies
    selectedCompany: mockCompanies[0],
  },
  'company@techsolutions.com': {
    id: '3',
    email: 'company@techsolutions.com',
    name: 'Sarah Tech',
    role: 'company',
    avatar: '👩',
    company: mockCompanies[0], // Company rep has single company
  },
};

// Mock credentials
export const mockCredentials = [
  { email: 'admin@bixssca.com', password: 'admin123', role: 'admin' },
  { email: 'ca@bixssca.com', password: 'ca123', role: 'ca' },
  { email: 'company@techsolutions.com', password: 'company123', role: 'company' },
];