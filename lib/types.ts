// User and authentication types
export type UserRole = 'admin' | 'ca' | 'company';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  companies?: Company[]; // For CA role - multiple companies
  company?: Company; // For company representative - single company
  selectedCompany?: Company; // Currently selected company for CA
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchCompany: (companyId: string) => void;
}