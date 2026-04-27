// Cipher utility functions for EncDecy

/**
 * Caesar Cipher - shifts letters by a given key
 */
export function caesarEncrypt(text, shift) {
  const shiftNum = parseInt(shift, 10) || 0;
  return text
    .split('')
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(((code - base + shiftNum) % 26 + 26) % 26 + base);
      }
      return char;
    })
    .join('');
}

export function caesarDecrypt(text, shift) {
  const shiftNum = parseInt(shift, 10) || 0;
  return caesarEncrypt(text, 26 - (shiftNum % 26));
}

/**
 * Base64 Encoding/Decoding
 */
export function base64Encode(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    return 'Error: Unable to encode to Base64';
  }
}

export function base64Decode(text) {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch (e) {
    return 'Error: Invalid Base64 string';
  }
}

/**
 * ROT13 - special case of Caesar cipher with shift 13
 */
export function rot13(text) {
  return caesarEncrypt(text, 13);
}

/**
 * XOR Cipher - symmetric encryption/decryption with a key
 */
export function xorCipher(text, key) {
  if (!key) return text;
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  // Convert to printable Base64 to avoid binary corruption in display
  return btoa(unescape(encodeURIComponent(result)));
}

export function xorDecipher(text, key) {
  if (!key) return text;
  try {
    const decoded = decodeURIComponent(escape(atob(text)));
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return 'Error: Invalid XOR encrypted text';
  }
}

/**
 * Reverse Text
 */
export function reverseText(text) {
  return text.split('').reverse().join('');
}

/**
 * Vigenère Cipher
 */
export function vigenereEncrypt(text, key) {
  if (!key) return text;
  let result = '';
  let keyIndex = 0;
  const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanKey) return text;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code >= 65 && code <= 90 ? 65 : 97;
      const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 97;
      result += String.fromCharCode(((code - base + keyChar) % 26) + base);
      keyIndex++;
    } else {
      result += char;
    }
  }
  return result;
}

export function vigenereDecrypt(text, key) {
  if (!key) return text;
  let result = '';
  let keyIndex = 0;
  const cleanKey = key.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanKey) return text;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code >= 65 && code <= 90 ? 65 : 97;
      const keyChar = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 97;
      result += String.fromCharCode(((code - base - keyChar + 26) % 26) + base);
      keyIndex++;
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Atbash Cipher (substitution: A<->Z, B<->Y, etc.)
 */
export function atbash(text) {
  return text
    .split('')
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const base = code >= 65 && code <= 90 ? 65 : 97;
        return String.fromCharCode(base + (25 - (code - base)));
      }
      return char;
    })
    .join('');
}

/**
 * Main process function that routes to the correct cipher
 */
export function processText(text, algorithm, mode, key) {
  if (!text) return '';

  switch (algorithm) {
    case 'caesar':
      return mode === 'encrypt' ? caesarEncrypt(text, key) : caesarDecrypt(text, key);
    case 'base64':
      return mode === 'encrypt' ? base64Encode(text) : base64Decode(text);
    case 'rot13':
      return rot13(text);
    case 'xor':
      return mode === 'encrypt' ? xorCipher(text, key) : xorDecipher(text, key);
    case 'reverse':
      return reverseText(text);
    case 'vigenere':
      return mode === 'encrypt' ? vigenereEncrypt(text, key) : vigenereDecrypt(text, key);
    case 'atbash':
      return atbash(text);
    default:
      return text;
  }
}

/**
 * Check if an algorithm requires a key
 */
export function requiresKey(algorithm) {
  return ['caesar', 'xor', 'vigenere'].includes(algorithm);
}

/**
 * Get key placeholder text
 */
export function getKeyPlaceholder(algorithm) {
  switch (algorithm) {
    case 'caesar':
      return 'Enter shift number (e.g., 3)';
    case 'xor':
      return 'Enter secret key';
    case 'vigenere':
      return 'Enter keyword (letters only)';
    default:
      return '';
  }
}

