/* =============================================
   Swipe Interaction Controller
   
   Handles touch/mouse drag, card animation,
   and swipe gestures for the Tinder-style UI.
   ============================================= */

class SwipeController {
  /**
   * @param {HTMLElement} container - The card container element
   * @param {Function} onSwipe - Callback: (direction: 'left'|'right') => void
   */
  constructor(container, onSwipe) {
    this.container = container;
    this.onSwipe = onSwipe;
    this.card = null;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.threshold = 80; // px to trigger a swipe

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  /** Attach event listeners to the current top card */
  attachTo(card) {
    this.detach();
    this.card = card;
    if (!card) return;

    card.addEventListener('pointerdown', this._onPointerDown);
  }

  /** Remove listeners from current card */
  detach() {
    if (this.card) {
      this.card.removeEventListener('pointerdown', this._onPointerDown);
    }
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    this.card = null;
    this.isDragging = false;
  }

  _onPointerDown(e) {
    if (e.button !== 0) return; // Only left click / primary touch
    this.isDragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.currentX = 0;

    this.card.style.transition = 'none';
    this.card.setPointerCapture(e.pointerId);

    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
  }

  _onPointerMove(e) {
    if (!this.isDragging || !this.card) return;

    this.currentX = e.clientX - this.startX;
    const rotation = this.currentX * 0.08; // Slight rotation
    const opacity = Math.min(Math.abs(this.currentX) / this.threshold, 1);

    this.card.style.transform = `translateX(${this.currentX}px) rotate(${rotation}deg)`;

    // Show yes/no overlay based on direction
    const yesOverlay = this.card.querySelector('.card-overlay-yes');
    const noOverlay = this.card.querySelector('.card-overlay-no');

    if (yesOverlay && noOverlay) {
      if (this.currentX > 10) {
        yesOverlay.style.opacity = opacity;
        noOverlay.style.opacity = 0;
      } else if (this.currentX < -10) {
        noOverlay.style.opacity = opacity;
        yesOverlay.style.opacity = 0;
      } else {
        yesOverlay.style.opacity = 0;
        noOverlay.style.opacity = 0;
      }
    }
  }

  _onPointerUp(e) {
    if (!this.isDragging || !this.card) return;
    this.isDragging = false;

    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);

    if (Math.abs(this.currentX) >= this.threshold) {
      const direction = this.currentX > 0 ? 'right' : 'left';
      this._animateExit(direction);
    } else {
      this._snapBack();
    }
  }

  /** Animate the card flying off screen */
  _animateExit(direction) {
    const card = this.card;
    const className = direction === 'left' ? 'exit-left' : 'exit-right';

    // Reset overlays
    const yesOverlay = card.querySelector('.card-overlay-yes');
    const noOverlay = card.querySelector('.card-overlay-no');
    if (yesOverlay) yesOverlay.style.opacity = direction === 'right' ? 1 : 0;
    if (noOverlay) noOverlay.style.opacity = direction === 'left' ? 1 : 0;

    // Clear any entering animation and inline styles so exit animation takes over
    card.classList.remove('entering');
    card.style.transition = 'none';
    card.style.transform = '';

    // Force a reflow so the browser registers the cleared state before adding exit
    void card.offsetHeight;

    card.style.transition = '';
    card.classList.add(className);

    card.addEventListener('animationend', () => {
      this.onSwipe(direction);
    }, { once: true });
  }

  /** Snap card back to center */
  _snapBack() {
    if (!this.card) return;
    this.card.style.transition = 'transform 300ms cubic-bezier(0.2, 0, 0, 1)';
    this.card.style.transform = 'translateX(0) rotate(0deg)';

    const yesOverlay = this.card.querySelector('.card-overlay-yes');
    const noOverlay = this.card.querySelector('.card-overlay-no');
    if (yesOverlay) yesOverlay.style.opacity = 0;
    if (noOverlay) noOverlay.style.opacity = 0;
  }

  /** Programmatic swipe (from button click) */
  triggerSwipe(direction) {
    if (!this.card) return;
    const className = direction === 'left' ? 'exit-left' : 'exit-right';

    // Show appropriate overlay
    const yesOverlay = this.card.querySelector('.card-overlay-yes');
    const noOverlay = this.card.querySelector('.card-overlay-no');
    if (yesOverlay) yesOverlay.style.opacity = direction === 'right' ? 1 : 0;
    if (noOverlay) noOverlay.style.opacity = direction === 'left' ? 1 : 0;

    // Clear entering animation so exit animation can take over
    this.card.classList.remove('entering');
    void this.card.offsetHeight;

    this.card.classList.add(className);

    this.card.addEventListener('animationend', () => {
      this.onSwipe(direction);
    }, { once: true });
  }
}
