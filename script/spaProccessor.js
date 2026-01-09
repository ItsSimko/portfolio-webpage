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
    console.log('Loading gallery...');
    // Try both relative path and full path for local file access
    let response;
    try {
      response = await fetch('./config/gallery.json');
      if (!response.ok) throw new Error('Failed to fetch');
    } catch (e) {
      response = await fetch('config/gallery.json');
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Gallery data loaded:', data);
    
    const container = $('#gallery-container');
    container.empty();
    
    if (!data.projects || data.projects.length === 0) {
      container.append('<p class="text-center">No projects found in gallery</p>');
      return;
    }
    
    data.projects.forEach((project, index) => {
      console.log(`Loading project ${index}: ${project.title}`);
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
    $('#gallery-container').html(`
      <div class="text-center text-red-500">
        <p>Failed to load gallery</p>
        <p>${error.message}</p>
        <p class="mt-4">Please make sure you're viewing this through a local web server.</p>
        <p class="text-sm">You can run: <code class="bg-gray-100 p-1">python -m http.server 8000</code></p>
      </div>
    `);
  }
}

function toggleContentLoader(state) {
  if (state === true) {
    $(spinnerId).fadeIn();
  } else {
    $(spinnerId).fadeOut();
  }
}
