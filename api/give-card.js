import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, type, comment } = req.body || {};

    if (!name || !type) {
      return res.status(400).json({ error: 'Missing required fields: name, type' });
    }

    const validTypes = ['Documentation', 'Workflow', 'Communication'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid violation type. Must be one of: ${validTypes.join(', ')}` });
    }

    // Find employee by exact name (case-insensitive)
    const { rows: matches } = await sql`
      SELECT id, name FROM employees WHERE LOWER(name) = LOWER(${name}) LIMIT 1
    `;

    if (!matches || matches.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const employeeId = matches[0].id;
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    await sql`
      INSERT INTO violations (employee_id, date, type, comment)
      VALUES (${employeeId}, ${dateStr}, ${type}, ${comment || ''})
    `;

    return res.status(200).json({ success: true, employeeId });
  } catch (error) {
    console.error('Error in give-card:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


