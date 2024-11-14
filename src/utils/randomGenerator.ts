import { randomBytes } from "crypto";

export const generateNumberString = (length: number = 6): string => {
  const characters = "1234567890";

  const randomBytesBuffer = randomBytes(length);

  const randomCharactersArray = Array.from(
    randomBytesBuffer,
    (byte) => characters[byte % characters.length]
  );

  const randomString = randomCharactersArray.join("");

  return randomString;
};

export const generateRandomString = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytesBuffer = randomBytes(length);
  const randomCharactersArray = Array.from(
    randomBytesBuffer,
    (byte) => characters[byte % characters.length]
  );
  const randomString = randomCharactersArray.join('');
  return randomString;
};