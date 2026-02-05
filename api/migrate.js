import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS avatar TEXT`;
    res.status(200).json({ success: true, message: 'Migration complete: avatar column added' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: error.message });
  }
}
