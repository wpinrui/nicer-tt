# LLM Instructions for Converting Content Upgrading Schedules

Use this prompt with Claude.ai to convert your content upgrading schedule (PDF, image, or text) into the required JSON format.

## Prompt Template

```
Convert this content upgrading schedule to JSON format:

{
  "courseName": "MODULE_CODE - Full Module Name",
  "sessions": [
    {
      "date": "DD/MM",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "venue": "Building-Floor-Room",
      "tutor": "Name"
    }
  ]
}

Rules:
- courseName: Include module code and name (e.g., "ABC1234 - Introduction to Psychology")
- date: DD/MM format (e.g., "15/01" for January 15, "03/02" for February 3)
- startTime/endTime: 24-hour HH:MM format (e.g., "09:00", "14:30", "17:00")
- venue: Full venue string (e.g., "NIE7-01-TR701", "NIE5-B1-05")
- tutor: Full name with title (e.g., "Dr. Jane Smith", "Prof. John Doe")
- If venue or tutor is unknown or varies, use empty string ""
- Include ALL sessions from the schedule
- Output only the JSON, no markdown code blocks

[Paste your schedule content here]
```

## Example Output

For a course "Introduction to Educational Psychology" (ABC1234) with 3 sessions:

```json
{
  "courseName": "ABC1234 - Introduction to Educational Psychology",
  "sessions": [
    {
      "date": "15/01",
      "startTime": "09:00",
      "endTime": "12:00",
      "venue": "NIE7-01-TR701",
      "tutor": "Dr. Jane Smith"
    },
    {
      "date": "22/01",
      "startTime": "09:00",
      "endTime": "12:00",
      "venue": "NIE7-01-TR701",
      "tutor": "Dr. Jane Smith"
    },
    {
      "date": "29/01",
      "startTime": "14:00",
      "endTime": "17:00",
      "venue": "NIE5-B1-05",
      "tutor": "Prof. John Doe"
    }
  ]
}
```

## Adding to the App

1. Save the JSON output as `{filename}.json` in `src/data/upgrading-courses/`
2. Open `src/data/upgrading-courses/index.ts`
3. Add import: `import NewCourse from './NewCourse.json';`
4. Add to array: `export const UPGRADING_COURSES: UpgradingCourse[] = [NewCourse, ...];`
5. Rebuild the app

## Notes

- Date format must be DD/MM (day/month), not MM/DD
- Times must be 24-hour format, not 12-hour
- Each session can have different venue/tutor if they vary
