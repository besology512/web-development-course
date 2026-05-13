import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'ghost_protocol_default_secret';

export const encryptMessage = (text: string) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptMessage = (ciphertext: string) => {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || '[DECRYPTION_ERROR]';
    } catch (e) {
        return '[DECRYPTION_ERROR]';
    }
};
