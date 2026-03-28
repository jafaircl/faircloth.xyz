import { renderResumeText } from "../data/resume-text";

export function GET() {
  return new Response(renderResumeText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="jonathan-faircloth-resume.txt"',
    },
  });
}
