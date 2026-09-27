/** Errors the client should see verbatim, with an HTTP status (the Express app used 400/401). */
export class HttpError extends Error {
  constructor(
    public status: 400 | 401 | 404 | 429 | 500 | 502 | 503,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () => new HttpError(401, "Unauthorized");
