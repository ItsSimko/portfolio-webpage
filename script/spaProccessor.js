var spinnerId = "#loading-spinner";
var pageContainerId = "#page-content";
var currentPage;

// Map hash values to page files
const routes = {
  '': 'home',
  'home': 'home',
  'projects': 'projects',
  'about': 'about',
  'contact': 'contact'
};

// Cache loaded pages to avoid re-fetching
const pageCache = {};

$(() => {
  // Load the page based on URL hash, or default to home
  const hash = window.location.hash.replace('#', '');
  const initialPage = routes[hash] || 'home';
  loadPage(initialPage);
  
  // Listen for browser back/forward navigation
  $(window).on('hashchange', function() {
    const hash = window.location.hash.replace('#', '');
    const page = routes[hash] || 'home';
    loadPage(page);
  });
});

async function loadPage(pageName) {
  if (pageName === currentPage) return;
  
  currentPage = pageName;
  
  // Update URL hash
  if (window.location.hash !== '#' + pageName) {
    history.replaceState(null, null, '#' + pageName);
  }

  toggleContentLoader(true);

  try {
    let html;
    
    // Check cache first
    if (pageCache[pageName]) {
      html = pageCache[pageName];
    } else {
      // Fetch the page HTML
      const response = await fetch(`./pages/${pageName}.html`);
      if (!response.ok) {
        throw new Error(`Page not found: ${pageName}`);
      }
      html = await response.text();
      pageCache[pageName] = html;
    }

    // Small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300));

    // Update page content
    $(pageContainerId).fadeOut(200, async function() {
      $(this).html(html).fadeIn(200);
      
      // Run page-specific initialization
      if (pageName === 'projects') {
        await loadGallery();
      }
      
      toggleContentLoader(false);
    });

  } catch (error) {
    console.error('Error loading page:', error);
    $(pageContainerId).html(`
      <div class="text-center text-red-500 p-8">
        <p class="text-xl">Page not found</p>
        <p>${error.message}</p>
      </div>
    `);
    toggleContentLoader(false);
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
    
    // Add image modal if it doesn't exist
    if ($('#image-modal').length === 0) {
      $('body').append(`
        <div id="image-modal" class="fixed inset-0 bg-black bg-opacity-80 z-50 hidden flex items-center justify-center p-4">
          <div class="relative max-w-4xl max-h-full">
            <button id="modal-close" class="absolute -top-10 right-0 text-white text-3xl hover:text-gray-300">&times;</button>
            <img id="modal-image" src="" alt="Expanded image" class="max-w-full max-h-[90vh] rounded-lg shadow-2xl">
          </div>
        </div>
      `);
      
      // Close modal on click
      $('#image-modal, #modal-close').on('click', function(e) {
        if (e.target === this || e.target.id === 'modal-close') {
          $('#image-modal').addClass('hidden').removeClass('flex');
        }
      });
      
      // Close on escape key
      $(document).on('keydown', function(e) {
        if (e.key === 'Escape') {
          $('#image-modal').addClass('hidden').removeClass('flex');
        }
      });
    }
    
    if (!data.projects || data.projects.length === 0) {
      container.append('<p class="text-center">No projects found in gallery</p>');
      return;
    }
    
    data.projects.forEach((project, index) => {
      console.log(`Loading project ${index}: ${project.title}`);
      
      // Determine project type (default to before-after for backwards compatibility)
      const projectType = project.type || 'before-after';
      
      if (projectType === 'before-after') {
        container.append(`
          <div class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="text-lg font-bold mb-2">${project.title}</h3>
            <p class="text-sm mb-3">${project.description}</p>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <h4 class="font-semibold text-sm mb-1">Before</h4>
                <img src="${project.beforeImage}" alt="Before" class="w-full max-h-40 object-contain rounded-lg shadow cursor-pointer hover:opacity-80 transition-opacity expandable-image">
              </div>
              <div>
                <h4 class="font-semibold text-sm mb-1">After</h4>
                <img src="${project.afterImage}" alt="After" class="w-full max-h-40 object-contain rounded-lg shadow cursor-pointer hover:opacity-80 transition-opacity expandable-image">
              </div>
            </div>
            <div class="flex flex-wrap gap-1">
              ${project.techStack.map(tech => 
                `<span class="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs">${tech}</span>`
              ).join('')}
            </div>
          </div>
        `);
      } else if (projectType === 'showcase') {
        // Support both single image and array of images
        const images = project.images || (project.image ? [project.image] : []);
        
        container.append(`
          <div class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="text-lg font-bold mb-2">${project.title}</h3>
            <p class="text-sm mb-3">${project.description}</p>
            ${images.length > 0 ? `
              <div class="grid grid-cols-${Math.min(images.length, 4)} gap-2 mb-3">
                ${images.map((img, i) => `
                  <img src="${img}" alt="${project.title} ${i + 1}" class="w-full h-24 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity expandable-image">
                `).join('')}
              </div>
            ` : ''}
            <div class="flex flex-wrap gap-1 mb-3">
              ${project.techStack.map(tech => 
                `<span class="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full text-xs">${tech}</span>`
              ).join('')}
            </div>
            <div class="flex gap-2">
              ${project.liveUrl ? `
                <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" 
                   class="bg-sky-500 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm">
                  Live Demo
                </a>
              ` : ''}
              ${project.repoUrl ? `
                <a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer"
                   class="bg-gray-700 hover:bg-gray-800 text-white px-3 py-1.5 rounded-lg transition-colors text-sm">
                  GitHub
                </a>
              ` : ''}
            </div>
          </div>
        `);
      }
    });
    
    // Add click handler for expandable images
    $('.expandable-image').on('click', function() {
      const imgSrc = $(this).attr('src');
      $('#modal-image').attr('src', imgSrc);
      $('#image-modal').removeClass('hidden').addClass('flex');
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
