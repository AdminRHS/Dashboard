import type { Employee, Violation } from '../types/domain';
export declare class Database {
    static initTables(): Promise<boolean>;
    static getEmployees(): Promise<Employee[]>;
    static addViolation(employeeId: number, violation: Violation): Promise<boolean>;
    static getViolationStats(): Promise<Record<string, number>>;
    static getViolationsByDateRange(startDate: string, endDate: string): Promise<any[]>;
}
export default Database;
