// Vercel API endpoint для оновлення data.json через GitHub Actions
export default async function handler(req, res) {
  // Тільки POST запити
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, commitMessage = 'Update data.json via API' } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Data is required' });
    }

    // Валідація JSON
    try {
      JSON.parse(data);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON format' });
    }

    // Конфігурація GitHub
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_OWNER = process.env.GITHUB_OWNER || 'adminrhs';
    const GITHUB_REPO = process.env.GITHUB_REPO || 'Dashboard';

    if (!GITHUB_TOKEN) {
      return res.status(500).json({ error: 'GitHub token not configured' });
    }

    // Викликаємо GitHub Actions workflow
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/update-data-dispatch.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            data: data,
            commit_message: commitMessage
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', errorText);
      return res.status(500).json({ 
        error: 'Failed to trigger workflow',
        details: errorText
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Data update triggered successfully' 
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
}
