export class CommandHistory {
  private history: string[] = [];
  private index: number = -1;
  private current: string = '';

  constructor() {
    try {
      const saved = sessionStorage.getItem('terminal-history');
      if (saved) this.history = JSON.parse(saved);
    } catch {
      // Ignore storage errors
    }
  }

  push(command: string) {
    if (command && command !== this.history[this.history.length - 1]) {
      this.history.push(command);
      try {
        sessionStorage.setItem('terminal-history', JSON.stringify(this.history.slice(-50)));
      } catch {
        // Ignore storage errors
      }
    }
    this.index = -1;
    this.current = '';
  }

  up(currentInput: string): string | null {
    if (this.history.length === 0) return null;

    if (this.index === -1) {
      this.current = currentInput;
      this.index = this.history.length - 1;
    } else if (this.index > 0) {
      this.index--;
    }

    return this.history[this.index];
  }

  down(): string | null {
    if (this.index === -1) return null;

    if (this.index < this.history.length - 1) {
      this.index++;
      return this.history[this.index];
    }

    this.index = -1;
    return this.current;
  }

  reset() {
    this.index = -1;
    this.current = '';
  }
}
