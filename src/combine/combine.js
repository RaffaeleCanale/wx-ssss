function combine() {
    const parts = getParts();

    updatePartsUi(parts);
    updateOutput(parts);
}

function getParts() {
    const parts = [];

    const inputs = document.querySelectorAll("#inputs input");
    for (const input of inputs) {
        const partValue = input.value.trim();
        parts.push(partValue);
    }
    return parts;
}

async function updateOutput(parts) {
    const output = document.getElementById("output");
    const span = document.createElement("span");
    output.innerHTML = "";
    output.appendChild(span);

    try {
        const secret = await decodeParts(parts);

        span.textContent = secret;
        span.className = "secret";
    } catch (error) {
        if (error.name === "OperationError") {
            span.textContent = "Invalid password";
            return;
        }
        span.textContent = error.message;
    }
}

async function decodeParts(parts) {
    const password = document.getElementById("password").value;

    const nonEmptyParts = parts.filter((part) => part !== "");
    if (nonEmptyParts.length < 2) {
        throw new Error("Please provide additional parts.");
    }

    const secretHex = secrets.combine(nonEmptyParts);
    const secret = secrets.hex2str(secretHex);

    if (!password) {
        return secret;
    }

    const dataStr = JSON.parse(secret);
    const data = {
        options: dataStr.options,
        salt: base64ToBytes(dataStr.salt),
        iv: base64ToBytes(dataStr.iv),
        encryptedData: base64ToBytes(dataStr.encryptedData),
    };
    const decryptedBuffer = await decrypt(data, password);
    return new TextDecoder().decode(decryptedBuffer);
}

function updatePartsUi(parts) {
    let hasEmptyFields = false;

    for (const [index, part] of parts.entries()) {
        const label = document.getElementById(`input-${index}-label`);

        if (part !== "") {
            try {
                const result = secrets.extractShareComponents(part);
                label.innerHTML = `<div>Part ${result.id}</div>${checkIcon}`;
            } catch (e) {
                label.innerHTML = `<div>Invalid part</div>${crossIcon}`;
            }
        } else {
            label.innerHTML = arrowRightIcon;
            hasEmptyFields = true;
        }
    }

    if (!hasEmptyFields) {
        const inputsDiv = document.getElementById("inputs");

        const label = document.createElement("div");
        label.setAttribute("id", `input-${parts.length}-label`);
        label.setAttribute("class", "row");
        label.innerHTML = arrowRightIcon;
        inputsDiv.appendChild(label);

        const input = document.createElement("input");
        input.setAttribute("placeholder", "Enter another part");
        input.setAttribute("oninput", "combine()");
        inputsDiv.appendChild(input);
    }
}
