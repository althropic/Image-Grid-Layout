/**
 * Unit tests for ImageGrid component
 */

const mockHTML = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="image-grid"></div>
  <div id="lightbox" class="lightbox" aria-hidden="true">
    <button class="lightbox__close">&times;</button>
    <button class="lightbox__nav lightbox__nav--prev"></button>
    <div class="lightbox__content">
      <img class="lightbox__image" src="" alt="">
      <div class="lightbox__caption">
        <h3 class="lightbox__title"></h3>
        <p class="lightbox__description"></p>
      </div>
    </div>
    <button class="lightbox__nav lightbox__nav--next"></button>
    <div class="lightbox__counter"></div>
  </div>
</body>
</html>
`;

const testImages = [
  { id: 1, src: "https://example.com/image1.jpg", thumbnail: "https://example.com/thumbnail1.jpg", title: "Test Image 1", description: "Test description 1", alt: "Alt text 1" },
  { id: 2, src: "https://example.com/image2.jpg", thumbnail: "https://example.com/thumbnail2.jpg", title: "Test Image 2", description: "Test description 2", alt: "Alt text 2" },
  { id: 3, src: "https://example.com/image3.jpg", thumbnail: "https://example.com/thumbnail3.jpg", title: "Test Image 3", description: "Test description 3", alt: "Alt text 3" }
];

// Import ImageGrid
const ImageGrid = require('../src/script.js');

describe('ImageGrid', () => {
  let container, imageGrid, lightbox;
  
  beforeEach(() => {
    document.body.innerHTML = mockHTML;
    container = document.getElementById('image-grid');
    lightbox = document.getElementById('lightbox');
    imageGrid = new ImageGrid(container, { enableLightbox: true, lazyLoad: true });
  });
  
  afterEach(() => {
    if (imageGrid) imageGrid.destroy();
    document.body.innerHTML = '';
  });
  
  describe('Constructor', () => {
    test('should initialize with default options', () => {
      const defaultGrid = new ImageGrid(container);
      expect(defaultGrid.options.enableLightbox).toBe(true);
      expect(defaultGrid.options.lazyLoad).toBe(true);
    });
    
    test('should merge custom options with defaults', () => {
      const customGrid = new ImageGrid(container, { gap: 24 });
      expect(customGrid.options.gap).toBe(24);
    });
    
    test('should store reference to container', () => {
      expect(imageGrid.container).toBe(container);
    });
  });
  
  describe('render()', () => {
    test('should render image cards', () => {
      imageGrid.render(testImages);
      expect(container.querySelectorAll('.image-card').length).toBe(3);
    });
    
    test('should clear previous content on re-render', () => {
      imageGrid.render(testImages);
      imageGrid.render([testImages[0]]);
      expect(container.querySelectorAll('.image-card').length).toBe(1);
    });
    
    test('should handle empty images array', () => {
      imageGrid.render([]);
      expect(container.classList.contains('image-grid--empty')).toBe(true);
      expect(container.textContent).toContain('No images to display');
    });
    
    test('should create image elements with correct src', () => {
      imageGrid.render(testImages);
      const img = container.querySelector('.image-card__image');
      expect(img.src).toContain('thumbnail1.jpg');
    });
    
    test('should fallback to src if thumbnail not provided', () => {
      imageGrid.render([{ id: 1, src: "test.jpg", title: "Test" }]);
      const img = container.querySelector('.image-card__image');
      expect(img.src).toContain('test.jpg');
    });
    
    test('should create correct accessible attributes', () => {
      imageGrid.render(testImages);
      const card = container.querySelector('.image-card');
      expect(card.getAttribute('tabindex')).toBe('0');
      expect(card.getAttribute('role')).toBe('button');
    });
  });
  
  describe('Lightbox', () => {
    test('should open lightbox on image click', () => {
      imageGrid.render(testImages);
      container.querySelector('.image-card').click();
      expect(lightbox.classList.contains('active')).toBe(true);
    });
    
    test('should close lightbox on close button click', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      lightbox.querySelector('.lightbox__close').click();
      expect(lightbox.classList.contains('active')).toBe(false);
    });
    
    test('should close lightbox on Escape key', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      expect(lightbox.classList.contains('active')).toBe(false);
    });
    
    test('should close lightbox when clicking backdrop', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      lightbox.click();
      expect(lightbox.classList.contains('active')).toBe(false);
    });
    
    test('should update lightbox image content', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      expect(lightbox.querySelector('.lightbox__image').src).toContain('image1.jpg');
    });
    
    test('should update lightbox counter', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      expect(lightbox.querySelector('.lightbox__counter').textContent).toBe('1 / 3');
    });
    
    test('should navigate to next image', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      imageGrid.next();
      expect(imageGrid.getCurrentIndex()).toBe(1);
    });
    
    test('should navigate to previous image', () => {
      imageGrid.render(testImages);
      imageGrid.open(1);
      imageGrid.prev();
      expect(imageGrid.getCurrentIndex()).toBe(0);
    });
    
    test('should wrap to last image when going prev from first', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      imageGrid.prev();
      expect(imageGrid.getCurrentIndex()).toBe(2);
    });
    
    test('should wrap to first image when going next from last', () => {
      imageGrid.render(testImages);
      imageGrid.open(2);
      imageGrid.next();
      expect(imageGrid.getCurrentIndex()).toBe(0);
    });
    
    test('should navigate with ArrowLeft and ArrowRight keys', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      expect(imageGrid.getCurrentIndex()).toBe(1);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      expect(imageGrid.getCurrentIndex()).toBe(0);
    });
    
    test('should lock body scroll when open', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      expect(document.body.style.overflow).toBe('hidden');
    });
    
    test('should restore body scroll when closed', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      imageGrid.close();
      expect(document.body.style.overflow).toBe('');
    });
  });
  
  describe('Public methods', () => {
    test('getCurrentIndex() should return current index', () => {
      imageGrid.render(testImages);
      imageGrid.open(1);
      expect(imageGrid.getCurrentIndex()).toBe(1);
    });
    
    test('getCurrentImage() should return current image data', () => {
      imageGrid.render(testImages);
      imageGrid.open(0);
      expect(imageGrid.getCurrentImage()).toEqual(testImages[0]);
    });
    
    test('isLightboxOpen() should return correct state', () => {
      imageGrid.render(testImages);
      expect(imageGrid.isLightboxOpen()).toBe(false);
      imageGrid.open(0);
      expect(imageGrid.isLightboxOpen()).toBe(true);
    });
    
    test('destroy() should clean up', () => {
      imageGrid.render(testImages);
      imageGrid.destroy();
      expect(container.innerHTML).toBe('');
      expect(imageGrid.images.length).toBe(0);
    });
  });
  
  describe('Portrait detection', () => {
    test('should detect portrait images', () => {
      imageGrid.render([{ id: 1, src: "test.jpg", title: "Portrait", width: 300, height: 600 }]);
      const card = container.querySelector('.image-card');
      expect(card.getAttribute('data-portrait')).toBe('true');
    });
    
    test('should detect landscape images', () => {
      imageGrid.render([{ id: 1, src: "test.jpg", title: "Landscape", width: 600, height: 300 }]);
      const card = container.querySelector('.image-card');
      expect(card.getAttribute('data-portrait')).toBe('false');
    });
  });
  
  describe('Keyboard navigation', () => {
    test('should open lightbox on Enter key', () => {
      imageGrid.render(testImages);
      const card = container.querySelector('.image-card');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(lightbox.classList.contains('active')).toBe(true);
    });
    
    test('should open lightbox on Space key', () => {
      imageGrid.render(testImages);
      const card = container.querySelector('.image-card');
      card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      expect(lightbox.classList.contains('active')).toBe(true);
    });
  });
});

if (typeof jest === 'undefined') {
  console.log('Running ImageGrid tests...');
  console.log('For full test results, run with Jest: npx jest image-grid.test.js');
}