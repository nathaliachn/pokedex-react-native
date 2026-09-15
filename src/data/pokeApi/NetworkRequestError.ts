export class NetworkRequestError extends Error {
  constructor(cause: unknown) {
    super('Unable to reach PokéAPI.', { cause });
    this.name = 'NetworkRequestError';
  }
}
