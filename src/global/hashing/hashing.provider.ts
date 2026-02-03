export abstract class HashingProvider {
  abstract hashPassword({
    password,
  }: {
    password: string | Buffer;
  }): Promise<string>;

  /**
   * Compares a plain text password with a hashed password.
   *
   * @param options - The options for password comparison.
   * @param options.password - The plain text password to compare. Can be a string or a Buffer.
   * @param options.hashedPassword - The hashed password to compare against.
   * @returns A promise that resolves to a boolean indicating whether the passwords match.
   */
  abstract comparePasswords({
    password,
    hashedPassword,
  }: {
    password: string | Buffer;
    hashedPassword: string;
  }): Promise<boolean>;
}
