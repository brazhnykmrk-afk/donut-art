/**
 * Error type thrown by the service layer. API handlers translate it into an
 * HTTP response; anything else becomes a generic 500.
 */
export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const notFound = (message = "Resource not found") =>
  new ServiceError("NOT_FOUND", message, 404);

export const forbidden = (message = "You are not allowed to do this") =>
  new ServiceError("FORBIDDEN", message, 403);
