const cards = document.querySelectorAll('.card-wrapper'); // Updated: target wrapper not inner card
let current = 1;

function updateCards() {
  cards.forEach((wrapper, index) => {
    const card = wrapper.querySelector('.team-card');
    const isVisible = index >= current - 1 && index <= current + 1;

    wrapper.style.display = isVisible ? 'block' : 'none';
    card.classList.toggle('active', index === current);
  });

  // hide arrows at edges
  document.getElementById('prev').style.visibility = current === 0 ? 'hidden' : 'visible';
  document.getElementById('next').style.visibility = current === cards.length - 1 ? 'hidden' : 'visible';
}

function nextCard() {
  if (current < cards.length - 1) {
    current++;
    updateCards();
  }
}

function prevCard() {
  if (current > 0) {
    current--;
    updateCards();
  }
}

document.getElementById('next').addEventListener('click', nextCard);
document.getElementById('prev').addEventListener('click', prevCard);

// allow arrow key navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') nextCard();
  if (e.key === 'ArrowLeft') prevCard();
});

updateCards(); // Initial setup
