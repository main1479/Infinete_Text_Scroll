// fetch some projects from github api which has most likes (username would be main1479)
const username = 'main1479';
const apiUrl = `https://api.github.com/users/${username}/repos`;

fetch(apiUrl)
  .then((response) => response.json())
  .then((data) => {
    // Sort the projects based on the number of likes
    const sortedProjects = data.sort(
      (a, b) => b.stargazers_count - a.stargazers_count
    );

    // Get the project with the most likes
    const mostLikedProjects = sortedProjects.slice(0, 8);

    // Insert the projects into the DOM
    insertProjectsIntoDOM(mostLikedProjects);

    initAnimation();
  })
  .catch((error) => {
    console.error('Error fetching projects:', error);
  });

function generateProjectMarkup(project, index) {
  return `
<li class="projects__list__item">
  <span>${index + 1 < 10 ? `0${index + 1}` : index + 1}</span>
  <a href="${project.html_url}" class="projects__list__link">
    ${project.full_name.split('/')[1]} 
  </a>
</li>
`;
}

function insertProjectsIntoDOM(projects) {
  const projectsList = document.querySelector('.projects__list');

  projectsList.innerHTML = projects
    .map((project, index) => generateProjectMarkup(project, index))
    .join('');
}

function initAnimation() {
  /*--------------------
Vars
--------------------*/
  const projectContainer = document.querySelector('.projects');
  const projects = document.querySelectorAll('.projects__list__item');
  let itemHeight = projects[0].clientHeight;
  let wrapHeight = projects.length * itemHeight;

  let scrollSpeed = 0;
  let oldScrollY = 0;
  let scrollY = 0;
  let y = 0;

  /*--------------------
Lerp
--------------------*/
  const lerp = (v0, v1, t) => {
    return v0 * (1 - t) + v1 * t;
  };

  /*--------------------
Dispose
--------------------*/
  const dispose = (scroll) => {
    gsap.set(projects, {
      y: (i) => {
        return i * itemHeight + scroll;
      },
      modifiers: {
        y: (y) => {
          const s = gsap.utils.wrap(
            -itemHeight,
            wrapHeight - itemHeight,
            parseInt(y)
          );
          return `${s}px`;
        },
      },
    });
  };
  dispose(0);

  /*--------------------
Wheel
--------------------*/
  const handleMouseWheel = (e) => {
    scrollY -= e.deltaY;
  };

  /*--------------------
Touch
--------------------*/
  let touchStart = 0;
  let touchY = 0;
  let isDragging = false;
  const handleTouchStart = (e) => {
    touchStart = e.clientY || e.touches[0].clientY;
    isDragging = true;
    projectContainer.classList.add('dragging');
  };
  const handleTouchMove = (e) => {
    if (!isDragging) return;
    touchY = e.clientY || e.touches[0].clientY;
    scrollY += (touchY - touchStart) * 2.5;
    touchStart = touchY;
  };
  const handleTouchEnd = () => {
    isDragging = false;
    projectContainer.classList.remove('is-dragging');
  };

  /*--------------------
Listeners
--------------------*/
  projectContainer.addEventListener('mousewheel', handleMouseWheel);

  projectContainer.addEventListener('touchstart', handleTouchStart);
  projectContainer.addEventListener('touchmove', handleTouchMove);
  projectContainer.addEventListener('touchend', handleTouchEnd);

  projectContainer.addEventListener('mousedown', handleTouchStart);
  projectContainer.addEventListener('mousemove', handleTouchMove);
  projectContainer.addEventListener('mouseleave', handleTouchEnd);
  projectContainer.addEventListener('mouseup', handleTouchEnd);

  projectContainer.addEventListener('selectstart', () => {
    return false;
  });

  /*--------------------
Resize
--------------------*/
  window.addEventListener('resize', () => {
    menuHeight = projectContainer.clientHeight;
    itemHeight = projects[0].clientHeight;
    wrapHeight = projects.length * itemHeight;
  });

  /*--------------------
Render
--------------------*/
  const render = () => {
    requestAnimationFrame(render);
    y = lerp(y, scrollY, 0.05);
    dispose(y);

    scrollSpeed = y - oldScrollY;
    oldScrollY = y;

    gsap.to(projects, {
      // scale: 1 - Math.min(100, Math.abs(scrollSpeed)) * 0.005,
      rotate: scrollSpeed * 0.2,
    });
  };
  render();
}
