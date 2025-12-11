export type View = 'DASHBOARD' | 'EQUIPMENT' | 'EMPLOYEES' | 'COLLECTIONS' | 'NEW_COLLECTION';

export interface Unit {
  id: string;
  name: string;
}

export interface Equipment {
  id: string;
  unitId: string;
  name: string;
  type: string;
  serialNumber: string;
  model?: string;
  manufacturer?: string;
  installationDate?: string;
  criticality: 'High' | 'Medium' | 'Low';
  customFields: { name: string; unit: string; }[];
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  employeeId: string; // Used for login (Matrícula)
  email: string;
  password: string;
  isAdmin?: boolean;
  passwordResetToken?: {
    token: string;
    expires: number; // timestamp
  };
}

export interface DataCollection {
  id: string;
  equipmentId: string;
  employeeId: string;
  date: string;
  vibration: number;
  temperature: number;
  pressure: number;
  notes: string;
  photo?: string; // base64 encoded image
  customFieldValues: Record<string, number>;
}