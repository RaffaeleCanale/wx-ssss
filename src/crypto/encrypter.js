function generateRandomBytes(length) {
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return bytes.buffer;
}

async function generateKeyFromPassword(password, salt, mode, options) {
    const passwordKey = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: options.iterations,
            hash: options.hash,
        },
        passwordKey,
        {
            name: "AES-GCM",
            length: options.keySize * 8,
        },
        false,
        [mode]
    );
}

function getDefaultOptions() {
    return {
        ivSize: 12,
        saltSize: 16,
        iterations: 1000000,
        keySize: 32,
        hash: "SHA-256",
    };
}

async function encrypt(input, passwordStr, options = getDefaultOptions()) {
    const salt = generateRandomBytes(options.saltSize);
    const key = await generateKeyFromPassword(
        passwordStr,
        salt,
        "encrypt",
        options
    );

    const iv = generateRandomBytes(options.ivSize);

    const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        input
    );

    return {
        options,
        salt,
        iv,
        encryptedData: cipherBuffer,
    };
}

async function decrypt(data, passwordStr) {
    const key = await generateKeyFromPassword(
        passwordStr,
        data.salt,
        "decrypt",
        data.options
    );

    return await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: data.iv,
        },
        key,
        data.encryptedData
    );
}
