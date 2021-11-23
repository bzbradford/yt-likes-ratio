// Parses view count and likes count for YouTube videos

var countSelector = "#info #info-text #count"
var likesSelector = "#menu-container #top-level-buttons-computed #text"

function elementReady(selector) {
    return new Promise((resolve, reject) => {
        let el = document.querySelector(selector);
        if (el) {
          resolve(el); 
          return
        }
        new MutationObserver((mutationRecords, observer) => {
            Array.from(document.querySelectorAll(selector)).forEach((element) => {
                resolve(element);
                observer.disconnect();
            });
        })
        .observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    });
}

function parseLikes() {
    try {
        // Remove any existing likes ratio element
        if (document.contains(document.getElementById("yt-likes-ratio"))) {
            document.getElementById("yt-likes-ratio").remove();
        }

        // Get and parse the view count element
        var viewsContainer = document.querySelector(countSelector)
        var viewsElem = viewsContainer.getElementsByClassName("view-count")[0]
        var viewsText = viewsElem.innerText.split(" ")[0].replace(/,/g, '');
        var views = parseInt(viewsText);
        // console.log(views + " views");

        // Get and parse the likes count element
        likesElem = document.querySelector(likesSelector)
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

// Observe video change or like button press and refresh the count
function createObservers() {
    const observer = new MutationObserver(() => { parseLikes(); });
    observer.observe(document.querySelector("title"), { attributes: true });
    observer.observe(document.querySelector("#menu-container #top-level-buttons-computed #button #button"), { attributes: true });
}

// Wait for both elements to be ready on the page
(elementReady(countSelector) && elementReady(likesSelector)).then(() => { parseLikes(); createObservers(); })
