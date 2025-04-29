document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript Loaded!");

  var heroSection = document.querySelector(".hero.hero-image");
  var heroNavbar = document.getElementById("heroNavbar");
  var mainNavbar = document.getElementById("mainNavbar");

  if (!heroSection || !heroNavbar || !mainNavbar) {
    console.error("Error: One or more elements not found.");
    return;
  }

  console.log("Elements found!");

  // Initially hide the main navbar smoothly
  mainNavbar.style.opacity = "0";
  mainNavbar.style.visibility = "hidden";

  window.addEventListener("scroll", function () {

    if (window.scrollY > heroSection.clientHeight - 50) {
      heroNavbar.style.opacity = "0";
      heroNavbar.style.visibility = "hidden";

      mainNavbar.style.opacity = "1";
      mainNavbar.style.visibility = "visible";
    } else {
      heroNavbar.style.opacity = "1";
      heroNavbar.style.visibility = "visible";

      mainNavbar.style.opacity = "0";
      mainNavbar.style.visibility = "hidden";
    }
  });

  // 👇 Backend images URL
  const backendBaseURL = 'http://localhost:3000/images/homepage/';

  // List of elements and backend image files
  const backgrounds = [
    { selector: '.hero-image', filename: 'hero_image.png' },
    { selector: '.sectionTwo-image', filename: 'sectionTwo_image.png' },
    { selector: '.pageFour-content-image', filename: 'section4_appetizer.png' },
    { selector: '.footer-section-image', filename: 'footer_image.png' },
    { selector: '.sectionThree-image2', filename: 'section3_image2.png' },
    { selector: '.sectionThree-image3', filename: 'section3_image3.png' },
  ];

  backgrounds.forEach(item => {
    const element = document.querySelector(item.selector);
    if (element) {
      element.style.backgroundImage = `url(${backendBaseURL}${item.filename})`;
    }
  });

  // ✨ Fixed: Image paths for Section3-Carousel
  const imageList = [
    `${backendBaseURL}section3_image1.png`,
    `${backendBaseURL}section3_image2.png`,
    `${backendBaseURL}section3_image3.png`,
  ];

  let currentIndex = 0;
  const carouselImg = document.getElementById("carouselImage");

  function nextImage() {
    // Fade out
    carouselImg.style.opacity = 0.3;

    // After fade-out, change image and fade in
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % imageList.length;
      carouselImg.src = imageList[currentIndex];
      carouselImg.style.opacity = 1;
    }, 300); // match the CSS transition
  }

  // Auto change every 3 seconds
  setInterval(nextImage, 3000);

  // ✨ Fixed: Section 4 Footer Items
  const footerItems = document.querySelectorAll(".pageFour-footer-item");
  const imageDiv = document.querySelector(".pageFour-content-image");
  const descriptionText = document.getElementById("pageFour-description");

  const categoryImages = {
    appetizer: `${backendBaseURL}section4_appetizer.png`,
    "main-course": `${backendBaseURL}section4_main-course.png`,
    ingredient: `${backendBaseURL}section4_ingredient.png`,
    place: `${backendBaseURL}section4_place.png`,
    dessert: `${backendBaseURL}section4_dessert.png`,
  };

  const categoryDescriptions = {
    appetizer: "Start your journey with delightful bites to awaken your senses.",
    "main-course": "Indulge in a rich, satisfying main course crafted to perfection.",
    ingredient: "Discover the magic behind each dish with our finest ingredients.",
    place: "Dine under the stars with views that steal your breath away.",
    dessert: "End your experience on a sweet note with our signature desserts.",
  };

  footerItems.forEach((item) => {
    item.addEventListener("click", () => {
      const category = item.getAttribute("data-category").toLowerCase();
      const imageUrl = categoryImages[category];
      const newText = categoryDescriptions[category];

      // Change image
      imageDiv.style.backgroundImage = `url(${imageUrl})`;

      // Change description
      descriptionText.textContent = newText;

      // Circle highlight effect
      document.querySelectorAll(".pageFour-footer-circle").forEach((circle) => {
        circle.classList.remove("selected");
      });
      item.querySelector(".pageFour-footer-circle").classList.add("selected");
    });
  });

  // Auto-select Appetizer on page load
  document.querySelector('[data-category="appetizer"]').click();

  axios.get(`http://localhost:3000/topcourse`)
    .then(res => {
      const courses = res.data; // this is now an array of 3 courses
      const container = document.getElementById('reservation_card');

      container.innerHTML = ''; // Clear old content

      courses.forEach(course => {
        const card = document.createElement('div');
        card.className = 'pageFive-reservation-card';
        card.innerHTML = `
        <p class="pageFive-card-title">${course.course_name}</p>
        <p class="pageFive-card-price">$${parseFloat(course.price).toFixed(2)} / Person</p>
        <div class="pageFive-card-category">
          <h4>Detail</h4>
          <p>${course.course_description}</p>
        </div>
        <button class="pageFive-reserve-button" onclick="location.href='/course-detail-page?courseId=${course.course_id}'">
          RESERVE NOW
        </button>
      `;
        container.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
    });


});
