export interface ResumeRole {
  title: string;
  startDate: string;
  endDate?: string;
  bullets: string[];
}

export interface ResumeEmployer {
  company: string;
  companyLine: string;
  location: string;
  roles: ResumeRole[];
}

export interface ResumeEducation {
  school: string;
  location: string;
  degree: string;
  graduationYear: string;
}

export const resume = {
  name: "Jonathan Faircloth",
  title: "Senior Software Engineer",
  location: "Raleigh, NC",
  email: "jonathan@faircloth.dev",
  website: "faircloth.dev",
  github: "github.com/jafaircl",
  summary:
    "Senior software engineer with 10+ years of experience building internal platforms, data-intensive applications, and developer tooling in healthcare and advertising technology. Known for connecting systems, improving engineering quality, and delivering reliable software used at meaningful scale.",
  employers: [
    {
      company: "Thermo Fisher Scientific",
      companyLine:
        "Thermo Fisher Scientific (formerly Clario / WCG Clinical Services / VeraSci)",
      location: "Raleigh, NC",
      roles: [
        {
          title: "Senior Software Engineer",
          startDate: "2023-02-02",
          bullets: [
            "Built integration services and internal applications with Angular, Node.js, Python, Kafka, GraphQL, REST, and gRPC to connect products used globally in clinical trials for major pharmaceutical companies.",
            "Shipped data synchronization and embedded reporting features across web, iOS, and Android applications supporting more than 100,000 patients and clinicians across North America, Europe, South America, and Asia.",
            "Optimized large-scale report generation for datasets with millions of rows by redesigning processing and file output workflows, improving performance by 30% and reducing memory usage by 55%.",
            "Helped build and optimize multilingual AI-enabled workflows for clinical interview analysis, improving scoring accuracy and reducing turnaround time from hours to minutes.",
            "Led code reviews, mentored junior engineers, and helped raise unit test coverage in established projects from under 25% to over 85% by introducing stronger tooling and shared standards.",
            "Worked with product, design, and DevOps to improve CI/CD, automated testing, and release processes for software used in highly regulated clinical environments.",
            "Delivered a mobile platform update under a tight deadline by translating and modernizing a data synchronization component in Kotlin to meet updated app store requirements.",
          ],
        },
        {
          title: "Software Engineer",
          startDate: "2020-03-02",
          endDate: "2023-02-02",
          bullets: [
            "Led development of an internal configuration tool that enabled non-engineering teams to create and manage structured content without direct developer involvement.",
            "Trusted with high-priority work, helping teams deliver new solutions quickly during product, platform, and organizational transitions.",
            "Led the move from on-premises Active Directory to Azure AD B2C, Azure AD, and Okta, improving security and making authentication easier to manage.",
            "Standardized documentation across multiple projects, improving onboarding and making day-to-day development more efficient.",
          ],
        },
      ],
    },
    {
      company: "Healthgrades",
      companyLine: "Healthgrades",
      location: "Raleigh, NC",
      roles: [
        {
          title: "Advertising Technology Developer",
          startDate: "2018-03-02",
          endDate: "2020-03-02",
          bullets: [
            "Built applications with Angular, Node.js, and Python to improve lead generation through media mix optimization and A/B testing.",
            "Created Google Data Studio dashboards and custom JavaScript connectors for major advertising and analytics platforms, giving analysts a faster reporting workflow.",
            "Used machine learning and other AI tooling to support keyword generation, placement monitoring, ad copy drafting, and bidding strategy decisions.",
            "Reduced campaign launch time by automating landing page generation and campaign management across Google Ads, Bing Ads, Twitter Ads, and Facebook Ads from one dashboard.",
          ],
        },
        {
          title: "Digital Marketing Analyst",
          startDate: "2016-02-02",
          endDate: "2018-03-02",
          bullets: [
            "Built internal tooling that shortened Google Ads campaign launch time by 20%.",
            "Managed paid search, display, and social campaigns across Google, Bing, Yahoo, Facebook, Instagram, and multiple DSPs.",
            "Wrote Google Ads scripts in JavaScript to automate reporting, ad rotation, and bid optimization, improving efficiency by 25%.",
            "Set up analytics and conversion tracking with Google Tag Manager, Google Analytics, Facebook Pixel, and related platforms.",
          ],
        },
      ],
    },
  ] satisfies ResumeEmployer[],
  education: {
    school: "North Carolina State University",
    location: "Raleigh, NC",
    degree: "B.A. Sociology",
    graduationYear: "2010",
  } satisfies ResumeEducation,
  skillGroups: [
    {
      name: "Languages",
      skills: ["TypeScript", "JavaScript", "Python", "C#", "Swift", "Kotlin", "SQL"],
    },
    {
      name: "Frameworks & APIs",
      skills: ["Angular", "Node.js", "React", "GraphQL", "REST", "gRPC"],
    },
    {
      name: "Data & Delivery",
      skills: ["Apache Kafka", "Power BI", "CI/CD", "Automated Testing", "Git", "Okta", "Azure AD"],
    },
    {
      name: "Leadership",
      skills: ["Technical Leadership", "Mentoring", "Code Review", "Cross-functional Collaboration", "Architecture", "Agile Delivery"],
    },
  ],
};
