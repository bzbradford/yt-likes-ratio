// --- Parses view count and likes count for YouTube videos --- //

// element definitions
var ratioElemId = 'yt-likes-ratio';

// where to look for view counts, in .innerText
var viewCountSelector = "#count > ytd-video-view-count-renderer > span.view-count.style-scope.ytd-video-view-count-renderer"

// where to look for likes count in .ariaLabel
var likeButtonSelector = '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > like-button-view-model > toggle-button-view-model > button';

// container to watch for removal of the likes ratio element to trigger re-creating it
var removalObserverSelector = '#top-level-buttons-computed';

// insert the ratio element after this one
var ratioElemAnchor = '#top-level-buttons-computed > segmented-like-dislike-button-view-model';

// query selector aliases
const $ = document.querySelector.bind(document);

// await element then trigger callback
const elementReady = (selector) => {
  return new Promise((resolve, reject) => {
    let el = $(selector);
    if (el) {
      resolve(el);
      return;
    }
    new MutationObserver((mutationRecords, observer) => {
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
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

// convert text count to number
const parseCount = (str) => {
  str = str.replace(/,/g, '').replace('K', '000').replace('M', '000000').replace('B', '000000000');
  if (str.includes('.')) str = str.substring(0, str.length - 1);
  let count = parseInt(str);
  count = isNaN(count) ? 0 : count;
  return count;
}

// returns the ratio text parsed from views and likes
const parseRatio = () => {
  // parse the view count, expected format '93,123 views'
  let viewsElem = $(viewCountSelector)
  let viewsText = viewsElem ? viewsElem.innerText.split(' ')[0] : null;
  if (viewsText == null) return;
  let views = parseCount(viewsText);

  // Parse the likes count, expected format 'like this video along with 3,239 other people'
  let likesElem = $(likeButtonSelector);
  let likesText = likesElem ? likesElem.ariaLabel.split('with ')[1].split(' ')[0] : null;
  if (likesText == null) return;
  let likes = parseCount(likesText);

  // create the ratio
  let ratio = likes * 1.0 / views;
  let ratioText = `${(ratio * 100).toFixed(2)}% liked`;
  // console.log('YouTube Likes Ratio >> ' + likes + ' likes / ' + views + ' views = ' + ratioText);
  return ratioText;
}

// creates or updates the likes ratio container
const createRatioElem = (ratioText) => {
  if ($(`#${ratioElemId}`)) {
    // console.log('elem already exists');
    $(`#${ratioElemId}`).innerText = ratioText;
  } else {
    // console.log('created new element');
    const ratioElem = document.createElement('div');
    ratioElem.id = ratioElemId;
    ratioElem.classList.add('yt-spec-button-shape-next--mono', 'yt-spec-button-shape-next--tonal', 'yt-spec-button-shape-next--size-m');
    ratioElem.style.cssText = 'margin: 0 8px; white-space: nowrap;';
    ratioElem.innerText = ratioText;
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

const initialize = () => {
  // console.log('initialize called');
  (elementReady(viewCountSelector) && elementReady(likeButtonSelector) && elementReady(removalObserverSelector)).then(() => {
    // console.log('initialize activated');
    parseLikes();
    refreshObserver.observe($(viewCountSelector), { attributes: true });
    refreshObserver.observe($(likeButtonSelector), { attributes: true });
    removalObserver.observe($(removalObserverSelector), { childList: true, subtree: true });
  });
}

const initializeObserver = new MutationObserver(() => {
  // console.log('initilize observer')
  initialize();
})

// set up observer to trigger likes ratio update on specific page changes
const refreshObserver = new MutationObserver(() => {
  // console.log('refresh observer')
  parseLikes();
});

// if the likes element gets removed, regenerate it
const removalObserver = new MutationObserver((mutations) => {
  // console.log('removal observer called')
  mutations.forEach((mutation) => {
    if (mutation.type == 'childList') {
      mutation.removedNodes.forEach((removedNode) => {
        if (removedNode.id == ratioElemId) {
          // console.log('removal observer activated')
          initialize();
        }
      });
    }
  });
});

// wait for view and likes elements to be ready on the page to run the parse
// need to change this to reattach these observers on page change?
elementReady(likeButtonSelector).then(() => {
  initializeObserver.observe($('head'), { childList: true, subtree: true });
  initialize();
});
