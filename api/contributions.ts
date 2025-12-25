import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GitHubIssue {
  title: string;
}

const PREFIX = '[Upgrading Course] ';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'wpinrui';
  const repo = process.env.GITHUB_REPO || 'nicer-tt';

  if (!token) {
    console.error('GITHUB_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?labels=upgrading-course,contribution&state=open&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return res.status(500).json({ error: 'Failed to fetch issues' });
    }

    const issues: GitHubIssue[] = await response.json();

    // Extract course titles (strip prefix), dedupe, sort
    const courses = [
      ...new Set(
        issues
          .map((issue) => issue.title)
          .filter((title) => title.startsWith(PREFIX))
          .map((title) => title.slice(PREFIX.length).trim())
      ),
    ].sort();

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Error fetching GitHub issues:', error);
    return res.status(500).json({ error: 'Failed to fetch issues' });
  }
}
