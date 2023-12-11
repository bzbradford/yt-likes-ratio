// --- Parses view count and likes count for YouTube videos --- //

let hasNoErrors = true;

// element definitions
let ratioElemId = 'yt-likes-ratio';

// where to look for view counts, in .innerText
let viewCountSelector = "#count > ytd-video-view-count-renderer > span.view-count.style-scope.ytd-video-view-count-renderer"

// where to look for likes count in .ariaLabel
let likeButtonSelector = '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > like-button-view-model > toggle-button-view-model > button';

// container to watch for removal of the likes ratio element to trigger re-creating it
let removalObserverSelector = '#top-level-buttons-computed';

// insert the ratio element after this one
let ratioElemAnchor = '#top-level-buttons-computed > segmented-like-dislike-button-view-model';

// query selector alias
const $ = document.querySelector.bind(document);

// await element then resolve promise
const elementReady = (selector) => {
  return new Promise((resolve) => {
    const el = $(selector);
    if (el) {
      resolve(el);
    } else {
      const observer = new MutationObserver(() => {
        const el = $(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }
  });
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
  if (viewsText === null) return;
  let views = parseCount(viewsText);

  // Parse the likes count, expected format 'like this video along with 3,239 other people'
  let likesElem = $(likeButtonSelector);
  let likesText = likesElem ? likesElem.ariaLabel.split('with ')[1].split(' ')[0] : null;
  if (likesText === null) return;
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
    $(`#${ratioElemId}`).innerText = ratioText;
  } else {
    const ratioElem = document.createElement('div');
    ratioElem.id = ratioElemId;
    ratioElem.classList.add(
      'yt-spec-button-shape-next--mono',
      'yt-spec-button-shape-next--tonal',
      'yt-spec-button-shape-next--size-m'
    );
    ratioElem.style.cssText = 'white-space: nowrap; margin-left: 8px;';
    ratioElem.innerText = ratioText;
    let anchorElem = $(ratioElemAnchor)
    if (!anchorElem) throw new Error('Could not find anchor element ' + ratioElemAnchor);
    anchorElem.insertAdjacentElement('afterend', ratioElem)

    // check spacing to the next bubble
    let nextElem = ratioElem.nextSibling;
    if (nextElem) {
      if (window.getComputedStyle(nextElem).getPropertyValue('margin-left') === '0px') {
        ratioElem.style.marginRight = '8px';
      }
    }
  }
}

// main function
const parseLikes = () => {
  if (!hasNoErrors) return;
  try {
    let ratioText = parseRatio();
    createRatioElem(ratioText);
  } catch(err) {
    console.warn('YouTube Likes Ratio >>', err.message);
    hasNoErrors = false;
  }
}

// await elements then parse and set up observers to persist and update the ratio
const initialize = () => {
  (elementReady(viewCountSelector) && elementReady(likeButtonSelector) && elementReady(removalObserverSelector)).then(() => {
    parseLikes();
    refreshObserver.observe($(viewCountSelector), { attributes: true });
    refreshObserver.observe($(likeButtonSelector), { attributes: true });
    removalObserver.observe($(removalObserverSelector), { childList: true, subtree: true });
  });
}

// triggers full initialize
const initializeObserver = new MutationObserver(() => {
  initialize();
})

// trigger update on specific page changes
const refreshObserver = new MutationObserver(() => {
  parseLikes();
});

// if the likes element gets removed, regenerate it
const removalObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.removedNodes.forEach((removedNode) => {
      if (removedNode.id === ratioElemId) initialize();
    });
  });
});

// wait for like button be ready on the page then initialize
elementReady(likeButtonSelector).then(() => {
  initializeObserver.observe($('head'), { childList: true, subtree: true });
  initialize();
});
