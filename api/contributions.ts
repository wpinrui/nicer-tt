import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GitHubIssue {
  title: string;
  state: string;
}

/**
 * Extract course code from issue title.
 * Titles are formatted: "[Upgrading Course] QUB511 - Biodiversity and Environmental Biology"
 * Returns just the course code (e.g., "QUB511", "QUE512-G1")
 */
function extractCourseCode(title: string): string | null {
  // Remove the "[Upgrading Course] " prefix
  const prefix = '[Upgrading Course] ';
  if (!title.startsWith(prefix)) {
    return null;
  }

  const remainder = title.slice(prefix.length).trim();

  // Match course code patterns like QUB511, QUE512-G1
  const match = remainder.match(/^[A-Z]{2,4}\d{3}(-G\d+)?/);
  if (match) {
    return match[0];
  }

  // Fallback: return first word if no pattern match
  const firstWord = remainder.split(/[\s-]/)[0];
  return firstWord || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET
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

    // Extract unique course codes
    const courseCodes = issues
      .map((issue) => extractCourseCode(issue.title))
      .filter((code): code is string => code !== null);

    // Remove duplicates and sort
    const uniqueCodes = [...new Set(courseCodes)].sort();

    return res.status(200).json({
      success: true,
      courseCodes: uniqueCodes,
    });
  } catch (error) {
    console.error('Error fetching GitHub issues:', error);
    return res.status(500).json({ error: 'Failed to fetch issues' });
  }
}
