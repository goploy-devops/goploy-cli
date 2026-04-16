export class GoployError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "GoployError";
  }
}

export class NetworkError extends GoployError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}

export class AuthError extends GoployError {
  constructor(message: string) {
    super(message, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class NotFoundError extends GoployError {
  constructor(message: string) {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class BusinessError extends GoployError {
  constructor(
    message: string,
    public readonly businessCode: number
  ) {
    super(message, "BUSINESS_ERROR");
    this.name = "BusinessError";
  }
}
