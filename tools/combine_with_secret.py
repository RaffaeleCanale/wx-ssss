import sys
import os
import argparse
import json
import base64
import hashlib

sys.path.append(os.path.join(os.path.dirname(__file__), "vendor"))


import js2pysecrets as secrets

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
except ImportError:
    print("Error: This script requires the 'cryptography' library for AES-GCM.", file=sys.stderr)
    print("Please run: pip install cryptography", file=sys.stderr)
    sys.exit(1)


def derive_key(password: str, salt: bytes, iterations: int, key_length_bytes: int, hash_name: str = 'sha256') -> bytes:
    """
    Replicates JS: window.crypto.subtle.deriveKey(..., PBKDF2, hash_name, ...)
    """
    return hashlib.pbkdf2_hmac(
        hash_name,
        password.encode('utf-8'),
        salt,
        iterations,
        dklen=key_length_bytes
    )

def decrypt_data(data_dict, password):
    salt = base64.b64decode(data_dict['salt'])
    iv = base64.b64decode(data_dict['iv'])
    encrypted_data = base64.b64decode(data_dict['encryptedData'])

    options = data_dict['options']
    iterations = options.get('iterations')
    key_size_bytes = options.get('keySize')

    js_hash = options.get('hash')
    py_hash = js_hash.replace('-', '').lower()

    key = derive_key(password, salt, iterations, key_size_bytes, py_hash)

    aesgcm = AESGCM(key)
    try:
        decrypted_bytes = aesgcm.decrypt(iv, encrypted_data, None)
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        raise ValueError("Decryption failed. Wrong password or corrupted data?") from e

def decode_parts(shares, password):
    """
    Replicates JS: async function decodeParts(parts, password)
    """
    reconstructed_hex = secrets.combine(shares)
    secret_json_str = secrets.hex2str(reconstructed_hex)

    try:
        data_str = json.loads(secret_json_str)
    except json.JSONDecodeError:
        print("Error: The reconstructed secret is not valid JSON.", file=sys.stderr)
        print(f"Raw output: {secret_json_str}", file=sys.stderr)
        sys.exit(1)

    final_text = decrypt_data(data_str, password)
    return final_text

def main():
    parser = argparse.ArgumentParser(description="Combine shares and decrypt the result.")

    parser.add_argument('shares', metavar='SHARE', type=str, nargs='+',
                        help='The share strings to combine')
    parser.add_argument('-p', '--password', type=str, required=True,
                        help='The password used to encrypt the secret')

    args = parser.parse_args()

    try:
        result = decode_parts(args.shares, args.password)
        print("Reconstructed and decrypted secret:")
        print(result)
    except Exception as e:
        print(f"\nFAILURE: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()