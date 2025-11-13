import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { greenCardId, employeeId, name, date, type, comment } = req.body || {};

    if (greenCardId) {
      const result = await sql`
        DELETE FROM green_cards WHERE id = ${greenCardId}
        RETURNING id
      `;
      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Green card not found' });
      }
      return res.status(200).json({ success: true });
    }

    // Flexible deletion by composite fields
    if (!type || !date || (!employeeId && !name)) {
      return res.status(400).json({ error: 'Missing required fields: date, type and (employeeId or name)' });
    }

    let targetEmployeeId = employeeId;
    if (!targetEmployeeId && name) {
      const exact = await sql`SELECT id FROM employees WHERE LOWER(TRIM(name)) = LOWER(TRIM(${name})) LIMIT 1`;
      if (exact && exact.length === 1) {
        targetEmployeeId = exact[0].id;
      } else {
        const partial = await sql`SELECT id,name FROM employees WHERE LOWER(name) ILIKE '%' || LOWER(${name}) || '%' LIMIT 2`;
        if (partial.length === 1) {
          targetEmployeeId = partial[0].id;
        } else {
          return res.status(404).json({ error: 'Employee not found' });
        }
      }
    }

    const del = await sql`
      DELETE FROM green_cards
      WHERE employee_id = ${targetEmployeeId}
        AND date = ${date}
        AND type = ${type}
        AND COALESCE(comment,'') = COALESCE(${comment || ''}, '')
      RETURNING id
    `;
    if (!del || del.length === 0) {
      return res.status(404).json({ error: 'Green card not found' });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting green card:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

