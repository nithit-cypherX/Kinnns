const cards = document.querySelectorAll('.card');
let current = 1;

function updateCards() {
  cards.forEach((card, index) => {
    card.classList.remove('active');
    card.style.display = (index >= current - 1 && index <= current + 1) ? 'block' : 'none';
  });
  cards[current].classList.add('active');
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

updateCards();
