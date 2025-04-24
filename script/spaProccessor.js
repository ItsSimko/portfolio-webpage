var homepageId = "#home-page";
var spinnerId = "#loading-spinner";
var currentContentId;

$(() => {
  loadNewContent(homepageId);
});

async function loadNewContent(className) {
  if (className != currentContentId) {
    $(currentContentId).fadeOut();
    currentContentId = className;

    toggleContentLoader(true);

    setTimeout(async () => {
      $(className).fadeOut("hidden");
      $(className).fadeIn("block");
      
      if (className === "#project-page") {
        await loadGallery();
      }

      toggleContentLoader(false);
    }, 1500);
  }
}

async function loadGallery() {
  try {
    const response = await fetch('./config/gallery.json');
    const data = await response.json();
    
    const container = $('#gallery-container');
    container.empty();
    
    data.projects.forEach(project => {
      container.append(`
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h3 class="text-xl font-bold mb-2">${project.title}</h3>
          <p class="mb-4">${project.description}</p>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 class="font-semibold">Before</h4>
              <img src="${project.beforeImage}" alt="Before" class="w-full h-auto rounded">
            </div>
            <div>
              <h4 class="font-semibold">After</h4>
              <img src="${project.afterImage}" alt="After" class="w-full h-auto rounded">
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            ${project.techStack.map(tech => 
              `<span class="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm">${tech}</span>`
            ).join('')}
          </div>
        </div>
      `);
    });
  } catch (error) {
    console.error('Error loading gallery:', error);
  }
}

function toggleContentLoader(state) {
  if (state === true) {
    $(spinnerId).fadeIn();
  } else {
    $(spinnerId).fadeOut();
  }
}
