import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, role, dept, email, discordId, joinDate, avatar } = req.body || {};

    // Check if id is valid (can be 0, but must be a number)
    const employeeId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (employeeId === null || employeeId === undefined || isNaN(employeeId) || !name || name.trim() === '') {
      return res.status(400).json({ 
        error: 'Missing required fields: id (must be a number), name',
        received: { id, name, employeeId }
      });
    }

    const normalizedJoinDate = joinDate ? new Date(joinDate).toISOString().split('T')[0] : null;

    const result = await sql`
      UPDATE employees
      SET name = ${name.trim()},
          role = ${role || ''},
          dept = ${dept || ''},
          email = ${email || ''},
          discord_id = ${discordId || ''},
          avatar = ${avatar !== undefined ? (avatar || null) : sql`avatar`},
          join_date = ${normalizedJoinDate}
      WHERE id = ${employeeId}
      RETURNING id
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating employee:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
