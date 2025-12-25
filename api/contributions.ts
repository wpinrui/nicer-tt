import type { VercelRequest, VercelResponse } from '@vercel/node';

interface GitHubIssue {
  title: string;
}

interface CourseInfo {
  code: string;
  name: string;
}

/**
 * Extract course info from issue title.
 * Titles are formatted: "[Upgrading Course] QUB511 - Biodiversity and Environmental Biology"
 * Returns { code: "QUB511", name: "Biodiversity and Environmental Biology" }
 */
function extractCourseInfo(title: string): CourseInfo | null {
  // Remove the "[Upgrading Course] " prefix
  const prefix = '[Upgrading Course] ';
  if (!title.startsWith(prefix)) {
    return null;
  }

  const remainder = title.slice(prefix.length).trim();

  // Split by " - " to get code and name
  const dashIndex = remainder.indexOf(' - ');
  if (dashIndex > 0) {
    return {
      code: remainder.slice(0, dashIndex).trim(),
      name: remainder.slice(dashIndex + 3).trim(),
    };
  }

  // No dash separator - use entire remainder as code
  return {
    code: remainder,
    name: '',
  };
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

    // Extract course info and dedupe by code
    const courseMap = new Map<string, CourseInfo>();
    for (const issue of issues) {
      const info = extractCourseInfo(issue.title);
      if (info && !courseMap.has(info.code)) {
        courseMap.set(info.code, info);
      }
    }

    // Sort by code and return as array
    const courses = [...courseMap.values()].sort((a, b) => a.code.localeCompare(b.code));

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Error fetching GitHub issues:', error);
    return res.status(500).json({ error: 'Failed to fetch issues' });
  }
}
