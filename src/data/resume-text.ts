import { resume, type ResumeEmployer } from "./resume";
import { formatMonthYear } from "../utils";

function renderEmployer(employer: ResumeEmployer) {
  const lines: string[] = [employer.companyLine, employer.location];

  employer.roles.forEach((role) => {
    const range = `${formatMonthYear(role.startDate)} - ${role.endDate ? formatMonthYear(role.endDate) : "Present"}`;
    lines.push("");
    lines.push(`${role.title} | ${range}`);
    role.bullets.forEach((bullet) => {
      lines.push(`- ${bullet}`);
    });
  });

  return lines.join("\n");
}

export function renderResumeText() {
  return [
    resume.name,
    `${resume.location} | ${resume.email} | ${resume.website}`,
    "",
    "SUMMARY",
    resume.summary,
    "",
    "EXPERIENCE",
    ...resume.employers.map(renderEmployer),
    "",
    "EDUCATION",
    `${resume.education.school}, ${resume.education.location} - ${resume.education.degree}, ${resume.education.graduationYear}`,
    "",
    "SKILLS",
    ...resume.skillGroups.map((group) => `${group.name}: ${group.skills.join(", ")}`),
    "",
  ].join("\n");
}
