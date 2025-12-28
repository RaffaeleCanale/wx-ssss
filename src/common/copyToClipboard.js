function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    navigator.clipboard.writeText(element.innerText);

    element.style.backgroundColor = "#d4edda";
    setTimeout(() => {
        element.style.backgroundColor = "#f4f4f4";
    }, 300);
}
