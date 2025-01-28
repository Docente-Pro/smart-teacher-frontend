import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Hex.parse(import.meta.env.VITE_ENCRYPTION_KEY);
const iv = CryptoJS.enc.Hex.parse(import.meta.env.VITE_ENCRYPTION_IV);

export function encrypt(text: string) {
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
  return encrypted.toString();
}

export function decrypt(text: string) {
  const decrypted = CryptoJS.AES.decrypt(text, key, { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
