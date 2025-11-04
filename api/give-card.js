import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, type, comment, employeeId } = req.body || {};

    if ((!employeeId && !name) || !type) {
      return res.status(400).json({ error: 'Missing required fields: (employeeId or name), type' });
    }

    const validTypes = ['Documentation', 'Workflow', 'Communication'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Invalid violation type. Must be one of: ${validTypes.join(', ')}` });
    }

    let targetEmployeeId = employeeId;

    if (!targetEmployeeId && name) {
      // Try exact match ignoring surrounding spaces and case
      const exact = await sql`
        SELECT id, name FROM employees
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(${name}))
        LIMIT 1
      `;

      if (exact && exact.length === 1) {
        targetEmployeeId = exact[0].id;
      } else {
        // Fallback: partial match (ambiguous-safe)
        const partial = await sql`
          SELECT id, name FROM employees
          WHERE LOWER(name) ILIKE '%' || LOWER(${name}) || '%'
          LIMIT 2
        `;
        if (partial.length === 1) {
          targetEmployeeId = partial[0].id;
        } else if (partial.length > 1) {
          return res.status(409).json({ error: 'Ambiguous name', candidates: partial.map(r => r.name) });
        }
      }
    }

    if (!targetEmployeeId) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    await sql`
      INSERT INTO violations (employee_id, date, type, comment)
      VALUES (${targetEmployeeId}, ${dateStr}, ${type}, ${comment || ''})
    `;

    return res.status(200).json({ success: true, employeeId: targetEmployeeId });
  } catch (error) {
    console.error('Error in give-card:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


