import { HashingProvider } from './hashing.provider';
import * as bcrypt from 'bcrypt';

export class BcryptProvider implements HashingProvider {
  /**
   * Hashes a given password using bcrypt.
   *
   * @param options - The options for hashing the password.
   * @param options.password - The password to be hashed. Can be a string or a Buffer.
   *
   * @returns A Promise that resolves to the hashed password as a string.
   */
  public async hashPassword({
    password,
  }: {
    password: string | Buffer;
  }): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    return hashed;
  }

  /**
   * Compares a given password with its hashed version.
   *
   * @param password - The password to compare. It can be a string or a Buffer.
   * @param hashedPassword - The hashed version of the password to compare against.
   *
   * @returns A Promise that resolves to a boolean indicating whether the password matches the hashed password.
   */
  comparePasswords({
    password,
    hashedPassword,
  }: {
    password: string | Buffer;
    hashedPassword: string;
  }): Promise<boolean> {
    const compare = bcrypt.compare(password, hashedPassword);
    return compare;
  }
}
