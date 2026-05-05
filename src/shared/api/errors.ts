export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}
