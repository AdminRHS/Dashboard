import postgres from 'postgres';
import type { Employee, Violation } from '../types/domain';

const sql = postgres(process.env.DATABASE_URL);

export class Database {
  static async initTables(): Promise<boolean> {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(100),
          dept VARCHAR(100),
          email VARCHAR(100),
          discord_id VARCHAR(100),
          join_date DATE,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS violations (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          type VARCHAR(50) NOT NULL,
          comment TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS green_cards (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          type VARCHAR(50) NOT NULL,
          comment TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;

      console.log('Database tables initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing database tables:', error);
      return false;
    }
  }

  static async getEmployees(): Promise<Employee[]> {
    try {
      const employeesRows = await sql`
        SELECT id, name, role, dept, email, discord_id, join_date
        FROM employees
        ORDER BY name
      ` as any[];

      const employeesWithViolations = await Promise.all(
        employeesRows.map(async (employee: any) => {
          const violations = await sql`
            SELECT id, date, type, comment
            FROM violations
            WHERE employee_id = ${employee.id}
            ORDER BY date DESC
          ` as any[];

      return {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            dept: employee.dept,
            email: employee.email,
            discordId: employee.discord_id,
            joinDate: employee.join_date,
            violations: violations.map((v: any) => ({
              id: v.id,
              date: v.date,
              type: v.type,
              comment: v.comment
            }))
          };
        })
      );

      return employeesWithViolations as Employee[];
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  static async addViolation(employeeId: number, violation: Violation): Promise<boolean> {
    try {
      await sql`
        INSERT INTO violations (employee_id, date, type, comment)
        VALUES (${employeeId}, ${violation.date}, ${violation.type}, ${violation.comment || ''})
      `;

      return true;
    } catch (error) {
      console.error('Error adding violation:', error);
      throw error;
    }
  }

  static async getViolationStats(): Promise<Record<string, number>> {
    try {
      const stats = await sql`
        SELECT 
          COUNT(*) as total_violations,
          COUNT(DISTINCT employee_id) as employees_with_violations,
          COUNT(CASE WHEN type = 'Documentation' THEN 1 END) as documentation_violations,
          COUNT(CASE WHEN type = 'Workflow' THEN 1 END) as workflow_violations,
          COUNT(CASE WHEN type = 'Communication' THEN 1 END) as communication_violations
        FROM violations
      ` as any[];

      return stats[0];
    } catch (error) {
      console.error('Error fetching violation stats:', error);
      throw error;
    }
  }

  static async getViolationsByDateRange(startDate: string, endDate: string): Promise<any[]> {
    try {
      const rows = await sql`
        SELECT v.*, e.name as employee_name
        FROM violations v
        JOIN employees e ON v.employee_id = e.id
        WHERE v.date >= ${startDate} AND v.date <= ${endDate}
        ORDER BY v.date DESC
      ` as any[];

      return rows;
    } catch (error) {
      console.error('Error fetching violations by date range:', error);
      throw error;
    }
  }
}

export default Database;


