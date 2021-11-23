function parseLikes() {
    try {
        // Remove any existing likes ratio element
        if (document.contains(document.getElementById("yt-likes-ratio"))) {
            document.getElementById("yt-likes-ratio").remove();
        }

        // Get and parse the view count element
        viewsElem = document.getElementsByClassName("view-count")[0]
        var viewsText = viewsElem.innerText.split(" ")[0].replace(/,/g, '');
        var views = parseInt(viewsText);
        // console.log(views + " views");

        // Get and parse the likes count element
        likesElem = document.querySelector("#top-level-buttons-computed").querySelector("#text");
        var likesText = likesElem.ariaLabel;
        likesText = likesText.split(" ")[0].replace(/,/g, '');
        likesText = likesText.replace("K", "000").replace("M", "000000").replace("B", "000000000");
        if (likesText.includes(".")) {
            likesText = likesText.substring(0, likesText.length - 1);
        }
        var likes = parseInt(likesText);
        // console.log(likes + " likes");

        // Create ratio
        var ratio = likes * 1.0 / views;
        var ratioText = "(" + (ratio * 100).toFixed(2) + "% liked)";
        // console.log(ratioText);

        // Create element with ratio text in it
        const ratioElem = document.createElement("span");
        ratioElem.id = "yt-likes-ratio";
        ratioElem.style.marginLeft = "0.5em";
        const ratioContent = document.createTextNode(ratioText);
        ratioElem.appendChild(ratioContent);
        likesElem.insertBefore(ratioElem, null);
    } catch(err) {
        console.log("Parsing view counts failed with error: " + err.message);
    }
}

// Watch for video change or like button push and trigger refresh
function createObservers() {
    const observer = new MutationObserver(function() { setTimeout(parseLikes(), 1) });
    const observerOpts = { attributes: true };
    observer.observe(document.querySelector("title"), observerOpts);
    observer.observe(document.querySelector("#top-level-buttons-computed").querySelector("#button"), observerOpts);
}

// Wait for page to load fully
function docReady(fn) {
    if (document.readyState === "complete" || document.readyState === "interactive") {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function() {
    parseLikes();
    createObservers();
});
