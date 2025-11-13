import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employeeId, greenCard } = req.body;

    // Validate input
    if (!employeeId || !greenCard || !greenCard.date || !greenCard.type) {
      return res.status(400).json({ 
        error: 'Missing required fields: employeeId, greenCard.date, greenCard.type' 
      });
    }

    // Validate green card type
    const validTypes = ['Documentation', 'Workflow', 'Communication', 'Achievement', 'Recognition'];
    if (!validTypes.includes(greenCard.type)) {
      return res.status(400).json({ 
        error: `Invalid green card type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Check if employee exists
    const result = await sql`
      SELECT id FROM employees WHERE id = ${employeeId}
    `;

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Ensure green_cards table exists (create if not exists)
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS green_cards (
          id SERIAL PRIMARY KEY,
          employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          type VARCHAR(50) NOT NULL,
          comment TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
    } catch (tableError) {
      // Table might already exist or there's a permission issue
      // Check if table exists by trying to query it
      try {
        await sql`SELECT 1 FROM green_cards LIMIT 1`;
        // Table exists, continue
      } catch (checkError) {
        // Table doesn't exist and we can't create it
        console.error('Cannot access green_cards table:', checkError);
        return res.status(500).json({ 
          error: 'Database table error',
          details: 'The green_cards table could not be created or accessed. Please check database permissions.'
        });
      }
    }

    // Insert green card
    const insertResult = await sql`
      INSERT INTO green_cards (employee_id, date, type, comment)
      VALUES (${employeeId}, ${greenCard.date}, ${greenCard.type}, ${greenCard.comment || ''})
      RETURNING id
    `;
    
    if (!insertResult || insertResult.length === 0) {
      throw new Error('Failed to insert green card');
    }
    
    res.status(200).json({ 
      success: true,
      id: insertResult[0].id,
      message: 'Green card added successfully' 
    });
  } catch (error) {
    console.error('Error adding green card:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
}

