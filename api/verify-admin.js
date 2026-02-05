export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body || {};
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return res.status(500).json({ error: 'ADMIN_TOKEN not configured' });
  }

  if (token === adminToken) {
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid token' });
}
