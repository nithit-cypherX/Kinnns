const container = document.querySelector(".carousel-container");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

let index = 0;

function updateCarousel() {
    const offset = -index * 100; // Move slides horizontally
    container.style.transform = `translateX(${offset}%)`;
}

nextBtn.addEventListener("click", () => {
    index = (index + 1) % 3; // Loop through slides
    updateCarousel();
});

prevBtn.addEventListener("click", () => {
    index = (index - 1 + 3) % 3; // Loop backward
    updateCarousel();
});
