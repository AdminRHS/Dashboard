import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, role, dept, email, discordId, joinDate, avatar } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const normalizedJoinDate = joinDate ? new Date(joinDate).toISOString().split('T')[0] : null;

    const result = await sql`
      INSERT INTO employees (name, role, dept, email, discord_id, join_date, avatar)
      VALUES (
        ${name},
        ${role || ''},
        ${dept || ''},
        ${email || ''},
        ${discordId || ''},
        ${normalizedJoinDate},
        ${avatar || null}
      )
      RETURNING id, name, role, dept, email, discord_id, join_date, avatar
    `;

    const row = result[0];
    if (!row) {
      throw new Error('Insert succeeded but no row returned');
    }

    const employee = {
      id: row.id,
      name: row.name,
      role: row.role,
      dept: row.dept,
      email: row.email,
      discordId: row.discord_id,
      avatar: row.avatar || null,
      joinDate: row.join_date,
      violations: []
    };

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error('Error adding employee:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
