import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Create tables
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        dept VARCHAR(100),
        email VARCHAR(100),
        discord_id VARCHAR(100),
        join_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS violations (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        type VARCHAR(50) NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // 2. Clear existing data (optional)
    await sql`DELETE FROM violations`;
    await sql`DELETE FROM employees`;

    // 3. Fetch existing data from GitHub Pages
    const response = await fetch('https://adminrhs.github.io/Dashboard/data.json');
    const employees = await response.json();

    // 4. Insert employees
    for (const employee of employees) {
      const { rows } = await sql`
        INSERT INTO employees (name, role, dept, email, discord_id, join_date)
        VALUES (${employee.name}, ${employee.role}, ${employee.dept}, 
                ${employee.email}, ${employee.discordId}, ${employee.joinDate})
        RETURNING id
      `;
      
      const employeeId = rows[0].id;

      // 5. Insert violations
      for (const violation of employee.violations || []) {
        await sql`
          INSERT INTO violations (employee_id, date, type, comment)
          VALUES (${employeeId}, ${violation.date}, ${violation.type}, ${violation.comment})
        `;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `Migration completed successfully. Migrated ${employees.length} employees.` 
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
}
