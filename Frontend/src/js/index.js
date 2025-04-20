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
    console.log("Scroll position:", window.scrollY);

    if (window.scrollY > heroSection.clientHeight - 50) {
      console.log("Switching to main navbar");
      heroNavbar.style.opacity = "0";
      heroNavbar.style.visibility = "hidden";

      mainNavbar.style.opacity = "1";
      mainNavbar.style.visibility = "visible";
    } else {
      console.log("Showing hero navbar");
      heroNavbar.style.opacity = "1";
      heroNavbar.style.visibility = "visible";

      mainNavbar.style.opacity = "0";
      mainNavbar.style.visibility = "hidden";
    }
  });
});

// Image paths for Section3-Carousel
const imageList = [
  "./src/assets/images/section3_image1.png",
  "./src/assets/images/section3_image2.png",
  "./src/assets/images/section3_image3.png",
];

let currentIndex = 0;
const carouselImg = document.getElementById("carouselImage");

// Function to change to the next image
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

// Auto change every 3 seconds (3000 milliseconds)
setInterval(nextImage, 3000);

// Image, selected-circle, description change Section 4
const footerItems = document.querySelectorAll(".pageFour-footer-item");
const imageDiv = document.querySelector(".pageFour-content-image");
const descriptionText = document.getElementById("pageFour-description");

const categoryImages = {
  appetizer: "./src/assets/images/section4_appetizer.png",
  "main-course": "./src/assets/images/section4_main-course.png",
  ingredient: "./src/assets/images/section4_ingredient.png",
  place: "./src/assets/images/section4_place.png",
  dessert: "./src/assets/images/section4_dessert.png",
};

const categoryDescriptions = {
  appetizer: "Start your journey with delightful bites to awaken your senses.",
  "main-course":
    "Indulge in a rich, satisfying main course crafted to perfection.",
  ingredient:
    "Discover the magic behind each dish with our finest ingredients.",
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
