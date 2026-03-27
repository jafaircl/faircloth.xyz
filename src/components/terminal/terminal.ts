import { executeCommand, getCommandNames, clearPendingTimeouts, type CommandResult } from './commands';
import { CommandHistory } from './history';
import '../../styles/terminal.css';

const PROMPT = '~/faircloth.xyz &gt;';

const BOOT_LINES = [
  { text: '', delay: 0 },
  { text: 'Welcome to faircloth.xyz', className: 'accent', delay: 100 },
  { text: '', delay: 50 },
  { text: 'Jonathan Faircloth · Senior Software Engineer', delay: 80 },
  { text: '', delay: 50 },
  { text: 'Type <span class="help-cmd">help</span> to see available commands.', className: 'muted', delay: 80 },
  { text: '', delay: 50 },
];

export function initTerminal(container: HTMLElement) {
  const history = new CommandHistory();

  // Build DOM
  container.innerHTML = `
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-dots">
          <span class="terminal-dot red"></span>
          <span class="terminal-dot yellow"></span>
          <span class="terminal-dot green"></span>
        </div>
        <span class="terminal-title">visitor@faircloth.xyz</span>
        <button class="terminal-exit" id="terminal-exit-btn">Exit Terminal</button>
      </div>
      <div class="terminal-output" id="terminal-output">
        <div class="terminal-output-inner" id="terminal-output-inner"></div>
        <div class="terminal-input-line">
          <span class="terminal-prompt">${PROMPT}</span>
          <input
            type="text"
            class="terminal-input"
            id="terminal-input"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            placeholder="Type a command..."
            aria-label="Terminal input"
          />
        </div>
        <div class="terminal-scroll-anchor" id="terminal-scroll-anchor" aria-hidden="true"></div>
      </div>
    </div>
  `;

  const outputScroller = document.getElementById('terminal-output')!;
  const output = document.getElementById('terminal-output-inner')!;
  const input = document.getElementById('terminal-input') as HTMLInputElement;
  const exitBtn = document.getElementById('terminal-exit-btn')!;
  const scrollAnchor = document.getElementById('terminal-scroll-anchor')!;
  let shouldAutoScroll = true;

  function isNearBottom() {
    const threshold = 24;
    return outputScroller.scrollTop + outputScroller.clientHeight >= outputScroller.scrollHeight - threshold;
  }

  function scrollToBottom(force: boolean = false) {
    if (!force && !shouldAutoScroll) return;
    scrollAnchor.scrollIntoView({ block: 'end' });
  }

  outputScroller.addEventListener('scroll', () => {
    shouldAutoScroll = isNearBottom();
  });

  const observer = new MutationObserver(() => {
    scrollToBottom();
  });

  observer.observe(output, { childList: true });

  // Exit button
  exitBtn.addEventListener('click', () => {
    observer.disconnect();
    (window as any).switchUIMode?.('standard');
  });

  // Click anywhere to focus input
  container.addEventListener('click', () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      input.focus();
    }
  });

  function appendLine(html: string, className: string = 'output') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = html;
    output.appendChild(line);
    scrollToBottom();
  }

  function appendCommandLine(cmd: string) {
    appendLine(`<span class="prompt">${PROMPT}</span>${escapeHtml(cmd)}`, 'command');
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function handleCommand(cmd: string) {
    const trimmed = cmd.trim();
    clearPendingTimeouts();
    appendCommandLine(trimmed);
    history.push(trimmed);
    shouldAutoScroll = true;

    if (trimmed === 'clear') {
      output.replaceChildren();
      scrollToBottom(true);
      return;
    }

    const result = executeCommand(trimmed);
    if (result) {
      result.results.forEach((r: CommandResult) => {
        appendLine(r.html, r.className || 'output');
      });
    }
  }

  // Autocomplete
  function autocomplete(partial: string): string | null {
    if (!partial) return null;

    const parts = partial.split(/\s+/);
    const cmdNames = getCommandNames();

    // Autocomplete command name
    if (parts.length === 1) {
      const matches = cmdNames.filter(c => c.startsWith(parts[0].toLowerCase()));
      if (matches.length === 1) return matches[0] + ' ';
      return null;
    }

    // Autocomplete page names for cd
    if (parts[0] === 'cd' && parts.length === 2) {
      const pages = ['blog', 'projects', 'resume'];
      const matches = pages.filter(p => p.startsWith(parts[1].toLowerCase()));
      if (matches.length === 1) return `cd ${matches[0]}`;
      return null;
    }

    // Autocomplete filenames for cat
    if (parts[0] === 'cat' && parts.length === 2) {
      const files = ['resume.txt', 'about.txt'];
      const matches = files.filter(f => f.startsWith(parts[1].toLowerCase()));
      if (matches.length === 1) return `cat ${matches[0]}`;
      return null;
    }

    return null;
  }

  // Keyboard handling
  input.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = input.value;
      input.value = '';
      if (cmd.trim()) {
        handleCommand(cmd);
      }
      scrollToBottom(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = history.up(input.value);
      if (prev !== null) input.value = prev;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = history.down();
      if (next !== null) input.value = next;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const completed = autocomplete(input.value);
      if (completed) input.value = completed;
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      output.replaceChildren();
    }
  });

  // Boot sequence
  async function boot() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion) {
      // Skip animation, show all at once
      BOOT_LINES.forEach(line => {
        if (line.text) appendLine(line.text, line.className || 'output');
      });
      scrollToBottom(true);
      input.focus();
      return;
    }

    input.disabled = true;

    for (const line of BOOT_LINES) {
      await new Promise(resolve => setTimeout(resolve, line.delay));
      if (line.text || line.text === '') {
        appendLine(line.text || '&nbsp;', line.className || 'output');
      }
    }

    input.disabled = false;
    scrollToBottom(true);
    input.focus();
  }

  boot();
}
