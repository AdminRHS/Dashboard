import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, name, role, dept, email, discordId, joinDate } = req.body || {};

    if (!id || !name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' });
    }

    const normalizedJoinDate = joinDate ? new Date(joinDate).toISOString().split('T')[0] : null;

    const result = await sql`
      UPDATE employees
      SET name = ${name},
          role = ${role || ''},
          dept = ${dept || ''},
          email = ${email || ''},
          discord_id = ${discordId || ''},
          join_date = ${normalizedJoinDate}
      WHERE id = ${id}
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


