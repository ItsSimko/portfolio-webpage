var homepageId = "#home-page";
var spinnerId = "#loading-spinner";
var currentContentId;

$(() => {
  loadNewContent(homepageId);
});

function loadNewContent(className) {
  if (className != currentContentId) {
    $(currentContentId).fadeOut();
    currentContentId = className;

    toggleContentLoader(true);

    setTimeout(() => {
      $(className).fadeOut("hidden");
      $(className).fadeIn("block");

      toggleContentLoader(false);
    }, 1500);
  }
}

function toggleContentLoader(state) {
  if (state === true) {
    $(spinnerId).fadeIn();
  } else {
    $(spinnerId).fadeOut();
  }
}
