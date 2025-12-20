import type { VercelRequest, VercelResponse } from '@vercel/node';

interface SubmitRequestBody {
  courseName: string;
  telegram?: string;
  notes?: string;
  fileUrls: string[];
  fileNames: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || 'wpinrui';
  const repo = process.env.GITHUB_REPO || 'nicer-tt';

  if (!token) {
    console.error('GITHUB_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { courseName, telegram, notes, fileUrls, fileNames } = req.body as SubmitRequestBody;

  const hasFiles = fileUrls && fileUrls.length > 0;
  const hasNotes = notes && notes.trim().length > 0;

  if (!courseName || (!hasFiles && !hasNotes)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Build issue body
  const filesList = hasFiles
    ? fileUrls.map((url, i) => `- [${fileNames[i] || `File ${i + 1}`}](${url})`).join('\n')
    : '*No files uploaded*';

  const body = `## New Upgrading Course Submission

**Course Name:** ${courseName}

**Uploaded Files:**
${filesList}

${notes ? `**Notes:**\n${notes}\n` : ''}
${telegram ? `**Contact:** ${telegram}` : '*No contact provided*'}

---
*Submitted via contribution form*`;

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        title: `[Upgrading Course] ${courseName}`,
        body,
        labels: ['upgrading-course', 'contribution'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return res.status(500).json({ error: 'Failed to create issue' });
    }

    const issue = await response.json();

    return res.status(200).json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    });
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return res.status(500).json({ error: 'Failed to create issue' });
  }
}
