/** Storage boundary; implementations may reject on unavailable or damaged storage. */
export interface TextStorage {
  read(key: string): Promise<string | null>;
  write(key: string, value: string): Promise<void>;
}
