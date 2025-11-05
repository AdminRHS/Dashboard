import postgres from 'postgres';

// Initialize database connection
const sql = postgres(process.env.DATABASE_URL);

// Database utility functions
export class Database {
  
  // Initialize database tables
  static async initTables() {
    try {
      // Create employees table
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

      // Create violations table
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

      console.log('Database tables initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing database tables:', error);
      return false;
    }
  }

  // Get all employees with violations
  static async getEmployees() {
    try {
      const { rows: employees } = await sql`
        SELECT id, name, role, dept, email, discord_id, join_date
        FROM employees
        ORDER BY name
      `;

      const employeesWithViolations = await Promise.all(
        employees.map(async (employee) => {
          const { rows: violations } = await sql`
            SELECT id, date, type, comment
            FROM violations
            WHERE employee_id = ${employee.id}
            ORDER BY date DESC
          `;

          return {
            id: employee.id,
            name: employee.name,
            role: employee.role,
            dept: employee.dept,
            email: employee.email,
            discordId: employee.discord_id,
            joinDate: employee.join_date,
            violations: violations.map(v => ({
              id: v.id,
              date: v.date,
              type: v.type,
              comment: v.comment
            }))
          };
        })
      );

      return employeesWithViolations;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }

  // Add violation to employee
  static async addViolation(employeeId, violation) {
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

  // Get violation statistics
  static async getViolationStats() {
    try {
      const { rows: stats } = await sql`
        SELECT 
          COUNT(*) as total_violations,
          COUNT(DISTINCT employee_id) as employees_with_violations,
          COUNT(CASE WHEN type = 'Documentation' THEN 1 END) as documentation_violations,
          COUNT(CASE WHEN type = 'Workflow' THEN 1 END) as workflow_violations,
          COUNT(CASE WHEN type = 'Communication' THEN 1 END) as communication_violations
        FROM violations
      `;

      return stats[0];
    } catch (error) {
      console.error('Error fetching violation stats:', error);
      throw error;
    }
  }

  // Get violations by date range
  static async getViolationsByDateRange(startDate, endDate) {
    try {
      const { rows } = await sql`
        SELECT v.*, e.name as employee_name
        FROM violations v
        JOIN employees e ON v.employee_id = e.id
        WHERE v.date >= ${startDate} AND v.date <= ${endDate}
        ORDER BY v.date DESC
      `;

      return rows;
    } catch (error) {
      console.error('Error fetching violations by date range:', error);
      throw error;
    }
  }
}

export default Database;
