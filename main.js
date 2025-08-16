let highestZ = 1;

const petalStyles = [
  'velvety-rose',
  'translucent-lily',
  'papery-poppy',
  'orchid-glow',
  'cherry-blossom'
];

// 🌸 Floating Petals (background)
const petalContainer = document.createElement('div');
petalContainer.className = 'floating-petals';
document.body.insertBefore(petalContainer, document.body.firstChild);

function createFloatingPetal() {
  const petal = document.createElement('div');
  petal.className = 'petal';
  petal.style.left = `${Math.random() * 100}vw`;
  petal.style.animationDuration = `${5 + Math.random() * 5}s`;
  petal.style.opacity = Math.random();
  petalContainer.appendChild(petal);
  setTimeout(() => petal.remove(), 10000);
}

setInterval(createFloatingPetal, 500);

class Paper {
  holdingPaper = false;
  touchStartX = 0;
  touchStartY = 0;
  touchMoveX = 0;
  touchMoveY = 0;
  prevTouchX = 0;
  prevTouchY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    paper.style.left = "50%";
    paper.style.top = "50%";
    paper.style.position = "absolute";
    paper.style.zIndex = highestZ++;
    paper.style.transform = `translate(-50%, -50%) rotateZ(${this.rotation}deg)`;

    const styleClass = petalStyles[Math.floor(Math.random() * petalStyles.length)];
    paper.classList.add(styleClass);
    paper.setAttribute('data-style', styleClass);

    const startDrag = (x, y, isRotating = false) => {
      if (this.holdingPaper) return;
      this.holdingPaper = true;
      paper.style.zIndex = highestZ++;
      paper.classList.add('selected');
      this.touchStartX = x;
      this.touchStartY = y;
      this.prevTouchX = x;
      this.prevTouchY = y;
      this.rotating = isRotating;
    };

    const moveDrag = (x, y) => {
      this.touchMoveX = x;
      this.touchMoveY = y;
      this.velX = this.touchMoveX - this.prevTouchX;
      this.velY = this.touchMoveY - this.prevTouchY;

      if (this.holdingPaper) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
        this.prevTouchX = this.touchMoveX;
        this.prevTouchY = this.touchMoveY;

        paper.style.transform = `translate(calc(-50% + ${this.currentPaperX}px), calc(-50% + ${this.currentPaperY}px)) rotateZ(${this.rotation}deg)`;
      }
    };

    const endDrag = () => {
      this.holdingPaper = false;
      this.rotating = false;
      paper.classList.remove('selected');
    };

    paper.addEventListener('touchstart', (e) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY, e.touches.length === 2);
    });

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX, e.touches[0].clientY);
    });

    paper.addEventListener('touchend', endDrag);

    paper.addEventListener('mousedown', (e) => {
      startDrag(e.clientX, e.clientY);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const onMouseUp = () => {
      endDrag();
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }
}

document.querySelectorAll('.paper').forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

const toggleBtn = document.getElementById('modeToggle');
const body = document.body;

body.classList.add('day-mode');
toggleBtn.textContent = '🌞';

toggleBtn.addEventListener('click', () => {
  if (body.classList.contains('day-mode')) {
    body.classList.remove('day-mode');
    body.classList.add('night-mode');
    toggleBtn.textContent = '🌙';
  } else {
    body.classList.remove('night-mode');
    body.classList.add('day-mode');
    toggleBtn.textContent = '🌞';
  }
});

const imageUpload = document.getElementById('imageUpload');
const imageElements = document.querySelectorAll('.paper.image img');

imageUpload.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files);
  if (files.length !== 3) {
    alert("Please upload exactly 3 images to personalize the animation.");
    return;
  }

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function(e) {
      if (imageElements[i]) {
        imageElements[i].classList.add('replacing');
        imageElements[i].src = e.target.result;
        setTimeout(() => {
          imageElements[i].classList.remove('replacing');
        }, 500);
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('http://localhost:8080/upload', {
        method: 'POST',
        body: formData
      });

      const msg = await res.text();
      console.log(`Image ${i + 1} uploaded:`, msg);
    } catch (err) {
      console.error(`Upload failed for image ${i + 1}:`, err);
    }
  }
});
