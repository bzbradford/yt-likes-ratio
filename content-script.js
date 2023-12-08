// --- Parses view count and likes count for YouTube videos --- //

// element definitions
var ratioElemId = 'yt-likes-ratio';

// where to look for view counts
var viewCountSelector1 = '#info > span'; // via .innerText on initial page load
var viewCountSelector2 = '#view-count'; // via .ariaLabel after initial page load, receives periodic updates

// where to look for likes count in .ariaLabel, receives periodic updates
var likeButtonSelector = '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > like-button-view-model > toggle-button-view-model > button';

// container to watch for removal of the likes ratio element to trigger re-creating it
var reloadTriggerSelector = '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div'

// insert the ratio element after this one
var ratioElemAnchor = '#top-level-buttons-computed > segmented-like-dislike-button-view-model > yt-smartimation > div > div > like-button-view-model'

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

// returns the ratio text parsed from views and likes
const parseRatio = () => {
  // Get and parse the view count, location moves several seconds after page load
  let vc1 = $(viewCountSelector1) // initial, number in .innnerText
  let vc1Text = vc1 ? vc1.innerText : null;
  let vc2 = $(viewCountSelector2) // rendered later, number in .ariaLabel
  let vc2Text = vc2 ? vc2.ariaLabel : null;
  let viewsText = vc2Text ? vc2Text : vc1Text;
  if (viewsText == null) return;
  viewsText = viewsText.split(' ')[0].replace(/,/g, '');
  let views = parseInt(viewsText);
  // console.log('views: ', views)

  // Parse the likes count, expected format 'like this video along with 3,239 other people'
  let likesText = $(likeButtonSelector).ariaLabel
  // console.log('likes: ', likesText)
  likesText = likesText.split('with ')[1].split(' ')[0]
  likesText = likesText.replace(/,/g, '').replace('K', '000').replace('M', '000000').replace('B', '000000000');
  if (likesText.includes('.')) likesText = likesText.substring(0, likesText.length - 1);

  // create the ratio
  let likes = parseInt(likesText);
  if (isNaN(likes)) likes = 0;
  let ratio = likes * 1.0 / views;
  let ratioText = `${(ratio * 100).toFixed(2)}% liked`;
  // console.log('YouTube Likes Ratio >> ' + likes + ' likes / ' + views + ' views = ' + ratioText);
  return ratioText;
}

// creates or updates the likes ratio container
const createRatioElem = (ratioText) => {
  if ($(`#${ratioElemId}`)) {
    // console.log('elem already exists');
    $(`#${ratioElemId} > div`).innerText = ratioText;
  } else {
    // console.log('created new element');
    const ratioElem = document.createElement('div');
    ratioElem.id = ratioElemId;
    ratioElem.classList.add('yt-spec-button-shape-next--mono');
    ratioElem.classList.add('yt-spec-button-shape-next--tonal');
    ratioElem.style.cssText = 'white-space: nowrap;';
    ratioElem.innerHTML = `<div class="yt-spec-button-shape-next--size-m yt-spec-button-shape-next--segmented-start">${ratioText}</div>`;
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
        if (removedNode.id === ratioElemId) {
          // console.log('regenerating like ratio')
          parseLikes();
        }
      });
    }
  });
});

// wait for view and likes elements to be ready on the page to run the parse
elementReady(likeButtonSelector).then(() => {
  parseLikes();
  observer.observe($('title'), { attributes: true });
  observer.observe($(viewCountSelector2), { attributes: true });
  observer.observe($(likeButtonSelector), { attributes: true });
  removalObserver.observe($(reloadTriggerSelector), { childList: true, subtree: true });
});
