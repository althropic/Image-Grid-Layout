/**
 * ImageGrid - A responsive image grid gallery with lightbox functionality
 * 
 * @param {HTMLElement} container - The container element for the grid
 * @param {Object} options - Configuration options
 */
class ImageGrid {
  constructor(container, options = {}) {
    this.container = container;
    this.images = [];
    this.currentIndex = 0;
    this.isOpen = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    // Default options
    this.options = {
      columns: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
        large: 4
      },
      gap: 16,
      enableLightbox: true,
      lazyLoad: true,
      onImageClick: null,
      onOpen: null,
      onClose: null,
      ...options
    };
    
    // Get lightbox elements
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImage = this.lightbox?.querySelector('.lightbox__image');
    this.lightboxTitle = this.lightbox?.querySelector('.lightbox__title');
    this.lightboxDescription = this.lightbox?.querySelector('.lightbox__description');
    this.lightboxCounter = this.lightbox?.querySelector('.lightbox__counter');
    
    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    
    // Initialize
    this._init();
  }
  
  _init() {
    if (this.options.enableLightbox && this.lightbox) {
      this._initLightbox();
    }
  }
  
  _initLightbox() {
    const closeBtn = this.lightbox.querySelector('.lightbox__close');
    const prevBtn = this.lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = this.lightbox.querySelector('.lightbox__nav--next');
    
    closeBtn?.addEventListener('click', () => this.close());
    prevBtn?.addEventListener('click', () => this.prev());
    nextBtn?.addEventListener('click', () => this.next());
    
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.close();
    });
  }
  
  render(images) {
    this.images = images;
    this.container.innerHTML = '';
    
    if (!images || images.length === 0) {
      this.container.classList.add('image-grid--empty');
      this.container.innerHTML = '<p>No images to display</p>';
      return;
    }
    
    this.container.classList.remove('image-grid--empty');
    images.forEach((image, index) => {
      const card = this._createCard(image, index);
      this.container.appendChild(card);
    });
  }
  
  _createCard(image, index) {
    const card = document.createElement('article');
    card.className = 'image-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${image.title || 'Image ' + image.id}`);
    
    const isPortrait = this._isPortrait(image);
    card.setAttribute('data-portrait', isPortrait);
    
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'image-card__image-wrapper';
    
    const img = document.createElement('img');
    img.className = 'image-card__image';
    img.src = image.thumbnail || image.src;
    img.alt = image.alt || image.title || '';
    if (this.options.lazyLoad) img.loading = 'lazy';
    img.onload = () => img.classList.add('loaded');
    
    const placeholder = document.createElement('div');
    placeholder.className = 'image-card__placeholder';
    
    const overlay = document.createElement('div');
    overlay.className = 'image-card__overlay';
    
    const zoomIcon = document.createElement('div');
    zoomIcon.className = 'image-card__zoom';
    zoomIcon.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path fill="currentColor" d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>`;
    
    const info = document.createElement('div');
    info.className = 'image-card__info';
    
    const title = document.createElement('h3');
    title.className = 'image-card__title';
    title.textContent = image.title || '';
    
    const description = document.createElement('p');
    description.className = 'image-card__description';
    description.textContent = image.description || '';
    
    info.appendChild(title);
    info.appendChild(description);
    overlay.appendChild(zoomIcon);
    imageWrapper.appendChild(img);
    imageWrapper.appendChild(placeholder);
    imageWrapper.appendChild(overlay);
    imageWrapper.appendChild(info);
    card.appendChild(imageWrapper);
    
    card.addEventListener('click', () => this._handleCardClick(image, index));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._handleCardClick(image, index);
      }
    });
    
    return card;
  }
  
  _isPortrait(image) {
    return !!(image.width && image.height && image.height > image.width);
  }
  
  _handleCardClick(image, index) {
    if (this.options.onImageClick) this.options.onImageClick(image);
    if (this.options.enableLightbox) this.open(index);
  }
  
  open(index) {
    if (!this.lightbox || index < 0 || index >= this.images.length) return;
    
    this.currentIndex = index;
    this.isOpen = true;
    
    this._updateLightboxContent();
    this.lightbox.classList.add('active');
    this.lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', this.handleKeyDown);
    this.lightbox.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    this.lightbox.addEventListener('touchend', this.handleTouchEnd, { passive: true });
    
    if (this.options.onOpen) this.options.onOpen();
    this.lightbox.querySelector('.lightbox__close')?.focus();
  }
  
  close() {
    if (!this.lightbox) return;
    
    this.isOpen = false;
    this.lightbox.classList.remove('active');
    this.lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    document.removeEventListener('keydown', this.handleKeyDown);
    this.lightbox.removeEventListener('touchstart', this.handleTouchStart);
    this.lightbox.removeEventListener('touchend', this.handleTouchEnd);
    
    if (this.options.onClose) this.options.onClose();
  }
  
  prev() {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.images.length - 1;
    this._updateLightboxContent();
  }
  
  next() {
    this.currentIndex = this.currentIndex < this.images.length - 1 ? this.currentIndex + 1 : 0;
    this._updateLightboxContent();
  }
  
  _updateLightboxContent() {
    const image = this.images[this.currentIndex];
    if (!image || !this.lightboxImage) return;
    
    this.lightboxImage.src = image.src;
    this.lightboxImage.alt = image.alt || image.title || '';
    if (this.lightboxTitle) this.lightboxTitle.textContent = image.title || '';
    if (this.lightboxDescription) this.lightboxDescription.textContent = image.description || '';
    if (this.lightboxCounter) this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.images.length}`;
  }
  
  getCurrentIndex() { return this.currentIndex; }
  getCurrentImage() { return this.images[this.currentIndex] || null; }
  isLightboxOpen() { return this.isOpen; }
  
  handleKeyDown(e) {
    if (!this.isOpen) return;
    switch (e.key) {
      case 'Escape': e.preventDefault(); this.close(); break;
      case 'ArrowLeft': e.preventDefault(); this.prev(); break;
      case 'ArrowRight': e.preventDefault(); this.next(); break;
    }
  }
  
  handleTouchStart(e) { this.touchStartX = e.changedTouches[0].screenX; }
  handleTouchEnd(e) { this.touchEndX = e.changedTouches[0].screenX; this._handleSwipe(); }
  
  _handleSwipe() {
    const diff = this.touchStartX - this.touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) this.next();
      else this.prev();
    }
  }
  
  destroy() {
    this.close();
    this.container.innerHTML = '';
    this.images = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageGrid;
}