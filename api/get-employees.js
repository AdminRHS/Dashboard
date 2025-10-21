import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // Get all employees
    const result = await sql`
      SELECT id, name, role, dept, email, discord_id, join_date
      FROM employees
      ORDER BY name
    `;

    const employees = result || [];

    // Get violations for each employee
    const employeesWithViolations = await Promise.all(
      employees.map(async (employee) => {
        const violationsResult = await sql`
          SELECT date, type, comment
          FROM violations
          WHERE employee_id = ${employee.id}
          ORDER BY date DESC
        `;

        const violations = violationsResult || [];

        return {
          id: employee.id,
          name: employee.name,
          role: employee.role,
          dept: employee.dept,
          email: employee.email,
          discordId: employee.discord_id,
          joinDate: employee.join_date,
          violations: violations.map(v => ({
            date: v.date,
            type: v.type,
            comment: v.comment
          }))
        };
      })
    );

    res.status(200).json(employeesWithViolations);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
}
