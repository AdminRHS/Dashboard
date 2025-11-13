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

    // Insert green card
    const insertResult = await sql`
      INSERT INTO green_cards (employee_id, date, type, comment)
      VALUES (${employeeId}, ${greenCard.date}, ${greenCard.type}, ${greenCard.comment || ''})
      RETURNING id
    `;
    
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

