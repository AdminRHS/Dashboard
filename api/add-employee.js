import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, role, dept, email, discordId, joinDate } = req.body || {};

    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    const normalizedJoinDate = joinDate ? new Date(joinDate).toISOString().split('T')[0] : null;

    const { rows } = await sql`
      INSERT INTO employees (name, role, dept, email, discord_id, join_date)
      VALUES (
        ${name},
        ${role || ''},
        ${dept || ''},
        ${email || ''},
        ${discordId || ''},
        ${normalizedJoinDate}
      )
      RETURNING id, name, role, dept, email, discord_id, join_date
    `;

    const employee = {
      id: rows[0].id,
      name: rows[0].name,
      role: rows[0].role,
      dept: rows[0].dept,
      email: rows[0].email,
      discordId: rows[0].discord_id,
      joinDate: rows[0].join_date,
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


