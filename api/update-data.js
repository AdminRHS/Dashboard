import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, commitMessage } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Missing data in request body' });
    }

    // Parse and validate JSON data
    let employees;
    try {
      employees = JSON.parse(data);
      if (!Array.isArray(employees)) {
        throw new Error('Data must be an array of employees');
      }
    } catch (parseError) {
      return res.status(400).json({ 
        error: 'Invalid JSON format in data field',
        details: parseError.message
      });
    }

    // Clear existing data
    await sql`DELETE FROM violations`;
    await sql`DELETE FROM employees`;

    // Insert new data
    for (const employee of employees) {
      // Validate employee data
      if (!employee.name) {
        continue; // Skip invalid employees
      }

      const { rows } = await sql`
        INSERT INTO employees (name, role, dept, email, discord_id, join_date)
        VALUES (${employee.name}, ${employee.role || ''}, ${employee.dept || ''}, 
                ${employee.email || ''}, ${employee.discordId || ''}, ${employee.joinDate || null})
        RETURNING id
      `;
      
      const employeeId = rows[0].id;

      // Insert violations
      for (const violation of employee.violations || []) {
        if (violation.date && violation.type) {
          await sql`
            INSERT INTO violations (employee_id, date, type, comment)
            VALUES (${employeeId}, ${violation.date}, ${violation.type}, ${violation.comment || ''})
          `;
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Updated database with ${employees.length} employees` 
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
}