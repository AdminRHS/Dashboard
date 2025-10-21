import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employeeId, violation } = req.body;

    // Validate input
    if (!employeeId || !violation || !violation.date || !violation.type) {
      return res.status(400).json({ 
        error: 'Missing required fields: employeeId, violation.date, violation.type' 
      });
    }

    // Validate violation type
    const validTypes = ['Documentation', 'Workflow', 'Communication'];
    if (!validTypes.includes(violation.type)) {
      return res.status(400).json({ 
        error: `Invalid violation type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Check if employee exists
    const { rows: employeeCheck } = await sql`
      SELECT id FROM employees WHERE id = ${employeeId}
    `;

    if (employeeCheck.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Insert violation
    await sql`
      INSERT INTO violations (employee_id, date, type, comment)
      VALUES (${employeeId}, ${violation.date}, ${violation.type}, ${violation.comment || ''})
    `;
    
    res.status(200).json({ 
      success: true, 
      message: 'Violation added successfully' 
    });
  } catch (error) {
    console.error('Error adding violation:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
}
