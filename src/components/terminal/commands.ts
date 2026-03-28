import { resume } from "../../data/resume";
import { formatMonthYear } from "../../utils";

export interface CommandResult {
  html: string;
  className?: string;
}

type CommandHandler = (args: string[]) => CommandResult | CommandResult[];

// Track pending timeouts so they can be cancelled between commands
const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

export function clearPendingTimeouts() {
  pendingTimeouts.forEach(id => clearTimeout(id));
  pendingTimeouts.length = 0;
}

const PAGES = [
  { name: 'blog', path: '/blog', description: 'Articles on software engineering' },
  { name: 'projects', path: '/projects', description: 'Things I\'ve built' },
  { name: 'resume', path: '/resume', description: 'My professional experience' },
];

const commands: Record<string, CommandHandler> = {
  help: () => {
    const entries = [
      ['help', 'Show available commands'],
      ['ls', 'List pages'],
      ['cd &lt;page&gt;', 'Navigate to a page'],
      ['whoami', 'About me'],
      ['cat resume.txt', 'View resume'],
      ['cat about.txt', 'About this site'],
      ['theme &lt;light|dark&gt;', 'Change theme'],
      ['echo &lt;text&gt;', 'Echo text'],
      ['date', 'Show current date'],
      ['clear', 'Clear terminal'],
    ];

    const rows = entries.map(([cmd, desc]) =>
      `<span class="help-cmd">${cmd}</span><span class="help-desc">${desc}</span>`
    ).join('');

    return { html: `<div class="help-table">${rows}</div>` };
  },

  ls: () => {
    const items = PAGES.map(p =>
      `<span class="ls-item"><a href="${p.path}">${p.name}/</a></span>`
    ).join('');

    return { html: `<div class="ls-list">${items}</div>` };
  },

  cd: (args) => {
    const target = args[0]?.replace(/\//g, '');
    if (!target) {
      return { html: 'Usage: cd &lt;page&gt;', className: 'error' };
    }

    const page = PAGES.find(p => p.name === target);
    if (!page) {
      return { html: `cd: no such directory: ${target}`, className: 'error' };
    }

    // Navigate after a brief delay for visual effect
    setTimeout(() => {
      window.location.href = page.path;
    }, 150);

    return { html: `Navigating to ${page.path}...`, className: 'muted' };
  },

  whoami: () => {
    return [
      { html: '' },
      { html: resume.name, className: 'accent' },
      { html: `${resume.title} · ${resume.location}` },
      { html: '' },
      { html: 'I build web applications, internal platforms, and developer tools.' },
      { html: 'Currently working on clinical data systems at Clario following' },
      { html: 'the VeraSci and WCG Clinical Services acquisitions.' },
      { html: '' },
      { html: `<a href="https://${resume.github}">${resume.github}</a>  ·  <a href="mailto:${resume.email}">${resume.email}</a>`, className: 'muted' },
    ];
  },

  cat: (args) => {
    const file = args[0];

    if (file === 'resume.txt') {
      const lines: CommandResult[] = [
        { html: '' },
        { html: '═══════════════════════════════════════════', className: 'muted' },
        { html: resume.name.toUpperCase(), className: 'accent' },
        { html: `${resume.title} · ${resume.location}`, className: 'muted' },
        { html: '═══════════════════════════════════════════', className: 'muted' },
        { html: '' },
        { html: 'SUMMARY', className: 'accent' },
        { html: '───────────────────────────────────────────', className: 'muted' },
        { html: resume.summary, className: 'muted' },
        { html: '' },
        { html: 'EXPERIENCE', className: 'accent' },
        { html: '───────────────────────────────────────────', className: 'muted' },
        { html: '' },
      ];

      resume.employers.forEach((employer) => {
        lines.push({ html: employer.companyLine });
        lines.push({ html: `  ${employer.location}`, className: 'muted' });

        employer.roles.forEach((role) => {
          const dateRange = `${formatMonthYear(role.startDate)}–${role.endDate ? formatMonthYear(role.endDate) : 'Present'}`;
          lines.push({ html: '' });
          lines.push({ html: `  ${role.title} · ${dateRange}` });

          role.bullets.slice(0, 3).forEach((bullet) => {
            lines.push({ html: `    • ${bullet}`, className: 'muted' });
          });
        });

        lines.push({ html: '' });
      });

      lines.push(
        { html: 'SKILLS', className: 'accent' },
        { html: '───────────────────────────────────────────', className: 'muted' },
        { html: resume.skillGroups.map((group) => `${group.name}: ${group.skills.join(', ')}`).join('  |  ') },
        { html: '' },
        { html: 'EDUCATION', className: 'accent' },
        { html: '───────────────────────────────────────────', className: 'muted' },
        { html: `${resume.education.degree} · ${resume.education.school} · ${resume.education.graduationYear}` },
        { html: '' },
        { html: 'Full resume: <a href="/resume">/resume</a> · Print view: <a href="/resume-print">/resume-print</a>', className: 'muted' },
        { html: 'Download TXT: <a href="/jonathan-faircloth-resume.txt">/jonathan-faircloth-resume.txt</a>', className: 'muted' },
      );

      return lines;
    }

    if (file === 'about.txt') {
      return [
        { html: '' },
        { html: 'This site is built with Astro, Tailwind CSS, and TypeScript.', className: 'muted' },
        { html: 'The terminal UI is vanilla TypeScript.' },
        { html: 'Deployed on Cloudflare Pages.' },
        { html: '' },
        { html: 'Source: <a href="https://github.com/jafaircl/faircloth.xyz">github.com/jafaircl/faircloth.xyz</a>', className: 'muted' },
      ];
    }

    if (!file) {
      return { html: 'Usage: cat &lt;filename&gt;', className: 'error' };
    }

    return { html: `cat: ${file}: No such file or directory`, className: 'error' };
  },

  echo: (args) => {
    return { html: args.join(' ') || '' };
  },

  date: () => {
    return { html: new Date().toString() };
  },

  clear: () => {
    // Handled specially in terminal.ts
    return { html: '' };
  },

  theme: (args) => {
    const mode = args[0];
    if (mode !== 'light' && mode !== 'dark') {
      return { html: 'Usage: theme &lt;light|dark&gt;', className: 'error' };
    }

    localStorage.setItem('theme', mode);
    document.documentElement.classList.toggle('dark', mode === 'dark');

    // Update theme toggle button if it exists
    const toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.setAttribute('data-theme', mode);

    return { html: `Theme set to ${mode}`, className: 'muted' };
  },

  exit: () => {
    (window as any).switchUIMode?.('standard');
    return { html: 'Switching to standard view...', className: 'muted' };
  },

  // Easter eggs
  sudo: () => {
    return { html: 'Nice try. You don\'t have permission here.', className: 'error' };
  },

  'rm': (args) => {
    if (args.join(' ').includes('-rf')) {
      const lines: CommandResult[] = [
        { html: 'Deleting everything...', className: 'error' },
      ];
      pendingTimeouts.push(setTimeout(() => {
        const output = document.querySelector('.terminal-output-inner');
        if (output) {
          const outputScroller = document.querySelector('.terminal-output');
          const msgs = ['Removing node_modules/...', 'Removing .git/...', 'Removing ~/Applications...', 'Just kidding. 😄'];
          msgs.forEach((msg, i) => {
            pendingTimeouts.push(setTimeout(() => {
              const line = document.createElement('div');
              line.className = `terminal-line ${i < 3 ? 'error' : 'accent'}`;
              line.textContent = msg;
              output.appendChild(line);
              if (outputScroller) outputScroller.scrollTop = outputScroller.scrollHeight;
            }, (i + 1) * 500));
          });
        }
      }, 100));
      return lines;
    }
    return { html: 'rm: missing operand', className: 'error' };
  },

  vim: () => {
    return [
      { html: 'You\'ve opened vim. Good luck getting out.', className: 'muted' },
      { html: 'Hint: :q!', className: 'muted' },
    ];
  },

  neofetch: () => {
    return [
      { html: '' },
      { html: '  ╔═══════════════════════════╗', className: 'accent' },
      { html: '  ║   faircloth.dev            ║', className: 'accent' },
      { html: '  ╚═══════════════════════════╝', className: 'accent' },
      { html: '' },
      { html: `  <span class="help-cmd">OS</span>      Astro 6 + Cloudflare Pages` },
      { html: `  <span class="help-cmd">Shell</span>   TypeScript 5` },
      { html: `  <span class="help-cmd">UI</span>      Tailwind CSS 4` },
      { html: `  <span class="help-cmd">Font</span>    JetBrains Mono` },
      { html: `  <span class="help-cmd">Theme</span>   Catppuccin Mocha (muted)` },
      { html: '' },
    ];
  },
};

export function executeCommand(input: string): { name: string; results: CommandResult[] } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const name = parts[0].toLowerCase();
  const args = parts.slice(1);

  const handler = commands[name];
  if (!handler) {
    return {
      name,
      results: [{ html: `Command not found: ${name}. Type <span class="help-cmd">help</span> for available commands.`, className: 'error' }],
    };
  }

  const result = handler(args);
  const results = Array.isArray(result) ? result : [result];

  return { name, results };
}

export function getCommandNames(): string[] {
  return Object.keys(commands);
}
