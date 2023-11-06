// --- Parses view count and likes count for YouTube videos --- //

// element definitions
var viewsSelector = '#count > ytd-video-view-count-renderer > span.view-count.style-scope.ytd-video-view-count-renderer';
var likeButtonSelector = '#segmented-like-button > ytd-toggle-button-renderer > yt-button-shape > button';
var ratioElemId = 'yt-likes-ratio';
var ratioElemAnchor = '#segmented-like-button > ytd-toggle-button-renderer > yt-button-shape > button > div.yt-spec-button-shape-next__button-text-content';

// aliases
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

// await element then trigger callback
const elementReady = (selector) => {
  return new Promise((resolve, reject) => {
    let el = $(selector);
    if (el) {
      resolve(el);
      return;
    }
    new MutationObserver((mutationRecords, observer) => {
      Array.from($$(selector)).forEach((element) => {
        resolve(element);
        observer.disconnect();
      });
    }).observe(document.documentElement, { childList: true, subtree: true });
  });
}

// inserts a new node after a reference node in the DOM
const insertAfter = (newNode, referenceNodeSelector) => {
  const referenceNode = $(referenceNodeSelector);
  if (referenceNode && referenceNode.parentNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
}

// returns the ratio text parsed from views and likes
const parseRatio = () => {
  // Get and parse the view count element
  let viewsText = $(viewsSelector).innerText.split(' ')[0].replace(/,/g, '');
  let views = parseInt(viewsText);

  // Get and parse the likes count element
  let likesText = $(likeButtonSelector).ariaLabel

  // parse the text
  if (likesText.includes('like this video')) {
    likesText = likesText.split('with ')[1].split(' ')[0]
  } else {
    likesText = likesText.split(' ')[0]
  }
  likesText = likesText.replace(/,/g, '').replace('K', '000').replace('M', '000000').replace('B', '000000000');
  if (likesText.includes('.')) likesText = likesText.substring(0, likesText.length - 1);

  // create the ratio
  let likes = parseInt(likesText);
  if (isNaN(likes)) likes = 0;
  let ratio = likes * 1.0 / views;
  let ratioText = '(' + (ratio * 100).toFixed(2) + '% liked)';
  console.log('YouTube Likes Ratio >> Parsed likes as ' + likes + ' likes / ' + views + ' views = ' + ratioText);
  return ratioText;
}

// creates or updates the likes ratio container
const createRatioElem = (ratioText) => {
  let existingElem = $(`#${ratioElemId}`);
  if (existingElem) {
    // console.log('elem already exists');
    existingElem.innerText = ratioText;
  } else {
    // console.log('created new element')
    const ratioElem = document.createElement('div');
    ratioElem.id = ratioElemId;
    ratioElem.style.marginLeft = '0.5em';
    const ratioContent = document.createTextNode(ratioText);
    ratioElem.appendChild(ratioContent);
    insertAfter(ratioElem, ratioElemAnchor);
    return ratioElem;
  }
}

// main function
const parseLikes = () => {
  try {
    let ratioText = parseRatio();
    createRatioElem(ratioText);
  } catch(err) {
    console.log('YouTube Likes Ratio >> Parsing view counts failed with error: ' + err.message);
  }
}

// set up observer to trigger likes ratio update on specific page changes
const observer = new MutationObserver((mutations) => {
  parseLikes();
});

// if the likes element gets removed, regenerate it
const removalObserver = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      mutation.removedNodes.forEach(function(removedNode) {
        if (removedNode.id === ratioElemId) parseLikes();
      });
    }
  });
});

// wait for view and likes elements to be ready on the page to run the parse
(elementReady(viewsSelector) && elementReady(likeButtonSelector)).then(() => {
  parseLikes();
  observer.observe($('title'), { attributes: true });
  observer.observe($(likeButtonSelector), { attributes: true });
  removalObserver.observe($('#segmented-like-button'), { childList: true, subtree: true });
});
