import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // detect whether green_cards table exists once per request
    const [{ exists: greenCardsExists }] = await sql`
      SELECT to_regclass('public.green_cards') IS NOT NULL AS exists
    `;

    const employees = await sql`
      SELECT
        e.id,
        e.name,
        e.role,
        e.dept,
        e.email,
        e.discord_id,
        e.join_date,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', v.id,
                'date', v.date,
                'type', v.type,
                'comment', v.comment
              )
              ORDER BY v.date DESC
            )
            FROM violations v
            WHERE v.employee_id = e.id
          ),
          '[]'::json
        ) AS violations,
        ${
          greenCardsExists
            ? sql`
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', gc.id,
                        'date', gc.date,
                        'type', gc.type,
                        'comment', gc.comment
                      )
                      ORDER BY gc.date DESC
                    )
                    FROM green_cards gc
                    WHERE gc.employee_id = e.id
                  ),
                  '[]'::json
                )`
            : sql`'[]'::json`
        } AS green_cards
      FROM employees e
      ORDER BY e.name
    `;

    const normalized = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      dept: emp.dept,
      email: emp.email,
      discordId: emp.discord_id,
      joinDate: emp.join_date,
      violations: Array.isArray(emp.violations) ? emp.violations : [],
      greenCards: Array.isArray(emp.green_cards) ? emp.green_cards : []
    }));

    res.status(200).json(normalized);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      error: error.message,
      details: 'Check Vercel logs for more information'
    });
  }
}
