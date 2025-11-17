export interface Violation {
  id?: number;
  date: string | Date;
  type: string;
  comment?: string;
}

export interface GreenCard {
  id?: number;
  date: string | Date;
  type: string;
  comment?: string;
}

export interface Employee {
  id?: number;
  name: string;
  role: string;
  dept: string;
  email?: string;
  discordId?: string;
  joinDate?: string | Date;
  violations: Violation[];
  greenCards?: GreenCard[];
}


