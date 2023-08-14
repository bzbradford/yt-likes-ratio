// --- Parses view count and likes count for YouTube videos --- //

// element definitions
var viewsSelector = "#count > ytd-video-view-count-renderer > span.view-count.style-scope.ytd-video-view-count-renderer"
var likesSelector = "#segmented-like-button > ytd-toggle-button-renderer > yt-button-shape > button"
var likeButtonSelector = "#segmented-like-button > ytd-toggle-button-renderer > yt-button-shape > button";
var ratioElemId = "yt-likes-ratio";

// await element then trigger callback
const elementReady = (selector) => {
  return new Promise((resolve, reject) => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    new MutationObserver((mutationRecords, observer) => {
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  });
}

const parseLikes = () => {
  try {
    // Remove any existing likes ratio element
    if (document.contains(document.getElementById(ratioElemId))) {
      document.getElementById(ratioElemId).remove();
    }

    // Get and parse the view count element
    let viewsElem = document.querySelector(viewsSelector);
    let viewsText = viewsElem.innerText.split(" ")[0].replace(/,/g, '');
    let views = parseInt(viewsText);

    // Get and parse the likes count element
    let likesElem = document.querySelector(likesSelector);
    let likesText = likesElem.ariaLabel
    if (likesText.includes("like this video")) {
      likesText = likesText.split("with ")[1].split(" ")[0]
    } else {
      likesText = likesText.split(" ")[0]
    }
    likesText = likesText.replace(/,/g, '').replace("K", "000").replace("M", "000000").replace("B", "000000000");
    if (likesText.includes(".")) {
      likesText = likesText.substring(0, likesText.length - 1);
    }

    // Create ratio
    let likes = parseInt(likesText);

    if (!isNaN(likes)) {
      let ratio = likes * 1.0 / views;
      let ratioText = "(" + (ratio * 100).toFixed(2) + "% liked)";

      // Log the results
      console.log("Parsed likes as " + likes + " likes / " + views + " views = " + ratioText);

      // Create element with ratio text in it
      const ratioElem = document.createElement("span");
      ratioElem.id = ratioElemId;
      ratioElem.style.marginLeft = "0.5em";

      const ratioContent = document.createTextNode(ratioText);
      ratioElem.appendChild(ratioContent);
      likesElem.insertBefore(ratioElem, null);  
    } else {
      console.log("This video has no likes yet.")
    }
  } catch(err) {
    console.log("Parsing view counts failed with error: " + err.message);
  }
}

// set up observer to trigger likes ratio update on specific page changes
const observer = new MutationObserver(() => { parseLikes() });

// create an observer on the page title to trigger the parse
elementReady("title").then(() => {
  observer.observe(document.querySelector("title"), { attributes: true })
});

// create observer on the like button to re-parse
elementReady(likeButtonSelector).then(() => {
  observer.observe(document.querySelector(likeButtonSelector), { attributes: true })
});

// wait for view and likes elements to be ready on the page to run the parse
(elementReady(viewsSelector) && elementReady(likesSelector)).then(() => { parseLikes() });
