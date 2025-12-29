function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    navigator.clipboard.writeText(element.innerText);

    element.style.backgroundColor = "#334155";
    setTimeout(() => {
        element.style.backgroundColor = "#0f172a";
    }, 300);
}
