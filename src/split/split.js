function validate(total, required, secret, password, confirmPassword) {
    if (total < 2) {
        return "Total must be at least 1";
    } else if (total > 255) {
        return "Total must be at most 255";
    } else if (required < 2) {
        return "Required must be at least 1";
    } else if (required > 255) {
        return "Required must be at most 255";
    } else if (isNaN(total)) {
        return "Invalid value for total";
    } else if (isNaN(required)) {
        return "Invalid value for required";
    } else if (required > total) {
        return "Required must be less than total";
    } else if (secret.length == 0) {
        return "Secret is blank";
    } else if (password.length > 0 && password !== confirmPassword) {
        return "Passwords do not match";
    } else {
        return undefined;
    }
}

async function getSecretContent(secretStr, password) {
    if (!password) {
        return secretStr;
    }

    const input = new TextEncoder().encode(secretStr);
    const data = await encrypt(input, password);

    const encoded = {
        options: data.options,
        salt: bytesToBase64(data.salt),
        iv: bytesToBase64(data.iv),
        encryptedData: bytesToBase64(data.encryptedData),
    };
    return JSON.stringify(encoded);
}

async function updateParts() {
    const id = createReadableId();
    const threshold = Number(document.getElementById("requiredParts").value);
    const numShares = Number(document.getElementById("totalParts").value);
    const secret = document.getElementById("secret").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const output = document.getElementById("output");

    const error = validate(
        numShares,
        threshold,
        secret,
        password,
        confirmPassword
    );

    if (error !== undefined) {
        output.innerHTML = `<span class="placeholder error">${error}</span>`;
        return;
    }

    const padLength = 1024;

    const shares = secrets.share(
        secrets.str2hex(await getSecretContent(secret, password)),
        numShares,
        threshold,
        padLength
    );

    const fields = [];
    for (const [index, share] of shares.entries()) {
        fields.push(`<li>
                        <div class="share-container">
                            <span id="share_${index}" class="share">${share}</span>
                            <button onclick="copyToClipboard('share_${index}')">
                                ${ccIcon}
                            </button>
                        </div>
                    </li>`);
    }

    const downloadAllUrl = await createDownloadAllContent(shares, id);
    const downloadAllFileName = `parts_${id}.tar.gz`;

    output.innerHTML = `
                    <p>
                     <a href="${downloadAllUrl}" download="${downloadAllFileName}">⏬ Download all parts (${
        shares.length
    })</a>
                    </p>
                    <ol>
                        ${fields.join("\n")}
                    </ol>
                `;
}

function createReadableId(length = 6) {
    // Excluded: I, L, O (look like numbers) and U (to avoid accidental profanity)
    // Added: 3, 4, 7, 9 for extra entropy, but kept them distinct.
    const charset = "ABCDEFGHJKMNPQRSTVWXYZ3479";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }

    return result;
}

async function createDownloadAllContent(shares, id) {
    const threshold = document.getElementById("requiredParts").value;
    const customHeader = document.getElementById("customHeader").value;

    const files = shares.map((share, index) => ({
        name: `part_${index + 1}_${id}.html`,
        data: template
            .replaceAll("__SELF_PART__", share)
            .replaceAll("__THRESHOLD__", threshold)
            .replaceAll("__SELF_PART_NUMBER__", index + 1)
            .replaceAll("__CUSTOM_HEADER__", customHeader)
            .replaceAll("__GROUP_ID__", id),
    }));

    const data = await createTarGzip(files);
    const blob = new Blob([data], { type: "application/x-tar" });
    return URL.createObjectURL(blob);
}
