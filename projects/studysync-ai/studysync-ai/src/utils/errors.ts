/** Application error class - standardized error handling */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(code: string, message?: string, statusCode: number = 500) {
    super(message || "An error occurred");
    this.code = code;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}
