import { Directory, File, Paths } from 'expo-file-system';
import { TextStorage } from './TextStorage';

export class ExpoFileTextStorage implements TextStorage {
  async read(key: string): Promise<string | null> {
    const file = this.file(key);
    return file.exists ? file.text() : null;
  }

  async write(key: string, value: string): Promise<void> {
    const file = this.file(key);
    file.parentDirectory.create({ intermediates: true, idempotent: true });
    file.write(value);
  }

  private file(key: string): File {
    // Resolve native paths lazily so storage errors stay inside request handling.
    return new File(
      new Directory(Paths.document, 'pokemon-v1'),
      `${encodeURIComponent(key)}.json`,
    );
  }
}
