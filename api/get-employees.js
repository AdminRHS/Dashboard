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

    // Get violations and green cards for each employee
    const employeesWithViolations = await Promise.all(
      employees.map(async (employee) => {
        const violationsResult = await sql`
          SELECT id, date, type, comment
          FROM violations
          WHERE employee_id = ${employee.id}
          ORDER BY date DESC
        `;

        // Get green cards (check if table exists, if not return empty array)
        let greenCardsResult = [];
        try {
          greenCardsResult = await sql`
            SELECT id, date, type, comment
            FROM green_cards
            WHERE employee_id = ${employee.id}
            ORDER BY date DESC
          `;
        } catch (error) {
          // Table might not exist yet, return empty array
          console.log('Green cards table not found, returning empty array');
        }

        const violations = violationsResult || [];
        const greenCards = greenCardsResult || [];

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
          })),
          greenCards: greenCards.map(gc => ({
            id: gc.id,
            date: gc.date,
            type: gc.type,
            comment: gc.comment
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
