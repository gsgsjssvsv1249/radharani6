let highestZ = 1;

class Paper {
  holdingPaper = false;
  startX = 0;
  startY = 0;
  moveX = 0;
  moveY = 0;
  prevX = 0;
  prevY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    const updateTransform = () => {
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    };

    const handleMove = (x, y) => {
      this.velX = x - this.prevX;
      this.velY = y - this.prevY;

      if (this.holdingPaper && !this.rotating) {
        this.currentPaperX += this.velX;
        this.currentPaperY += this.velY;
      }

      const dirX = x - this.startX;
      const dirY = y - this.startY;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);

      if (dirLength > 0) {
        const dirNormalizedX = dirX / dirLength;
        const dirNormalizedY = dirY / dirLength;

        const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
        let degrees = (180 * angle) / Math.PI;
        degrees = (360 + Math.round(degrees)) % 360;

        if (this.rotating) {
          this.rotation = degrees;
        }
      }

      this.prevX = x;
      this.prevY = y;

      updateTransform();
    };

    const startHandler = (x, y, isRightClick) => {
      if (this.holdingPaper) return;

      this.holdingPaper = true;
      paper.style.zIndex = highestZ++;
      this.startX = x;
      this.startY = y;
      this.prevX = x;
      this.prevY = y;

      if (isRightClick) {
        this.rotating = true;
      }
    };

    const endHandler = () => {
      this.holdingPaper = false;
      this.rotating = false;
    };

    // Mobile Touch Events
    paper.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startHandler(touch.clientX, touch.clientY, false);
    });

    paper.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    });

    paper.addEventListener('touchend', endHandler);

    // Desktop Mouse Events
    paper.addEventListener('mousedown', (e) => {
      if (e.button === 0 || e.button === 2) {
        startHandler(e.clientX, e.clientY, e.button === 2);
      }
    });

    document.addEventListener('mousemove', (e) => {
      handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', endHandler);

    // Prevent right-click context menu on papers
    paper.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

const papers = Array.from(document.querySelectorAll('.paper'));

papers.forEach((paper) => {
  const p = new Paper();
  p.init(paper);
});
