export class RequestController {
  private abortController: AbortController | null = null;

  getSignal(): AbortSignal {
    this.abort();
    this.abortController = new AbortController();
    return this.abortController.signal;
  }

  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

