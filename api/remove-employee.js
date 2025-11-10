import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.body || {};
    if (!id) {
      return res.status(400).json({ error: 'Missing required field: id' });
    }

    const result = await sql`
      DELETE FROM employees WHERE id = ${id} RETURNING id
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing employee:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


