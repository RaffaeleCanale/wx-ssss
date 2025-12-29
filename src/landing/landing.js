function onImageClick(event) {
    const fullPage = document.getElementById("fullPage");

    fullPage.style.backgroundImage = `url(${event.target.src})`;
    fullPage.style.display = "block";
}
