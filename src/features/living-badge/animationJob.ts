export interface AnimationProgress {
  phase: 'rendering' | 'encoding';
  completed: number;
  total: number;
}

export interface AnimationJob {
  signal: AbortSignal;
  report: (progress: AnimationProgress) => void;
  finalizing: () => void;
}

export function abortable<T>(task: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    function abort() { reject(signal.reason); }
    signal.addEventListener('abort', abort, { once: true });
    if (signal.aborted) abort();
    task.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
  });
}

export function yieldToBrowser() {
  return new Promise<void>(resolve => setTimeout(resolve, 0));
}
