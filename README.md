# Image Grid

A modern, responsive image grid/gallery component with lightbox functionality for web applications.

## Overview

This project provides a reusable image grid component that displays images in a responsive grid layout with hover effects and a full-featured lightbox for viewing full-size images.

## Features

- Responsive grid layout (1-4 columns based on viewport)
- Hover effects with zoom and overlay
- Lightbox for full-size image viewing
- Lazy loading for performance
- Navigation between images in lightbox
- Keyboard support (Escape, Arrow keys)
- Touch swipe support for mobile devices
- Accessibility features (ARIA attributes, keyboard navigation)
- CSS custom properties for easy theming

## Project Structure

```
image-grid/
├── src/              # Implementation files
│   ├── index.html    # Demo page
│   ├── styles.css    # Component styling
│   └── script.js     # Grid and lightbox logic
├── tests/            # Test files
│   └── image-grid.test.js
├── PROJECT.md        # Project specification
├── README.md         # Project documentation
└── .gitignore        # Git ignore policy
```

## Usage

### Basic Initialization

```javascript
const container = document.getElementById('image-grid');
const imageGrid = new ImageGrid(container, {
  enableLightbox: true,
  lazyLoad: true
});

imageGrid.render(imagesData);
```

### Data Format

```javascript
const imagesData = [
  {
    id: 1,
    src: "https://example.com/full-image.jpg",
    thumbnail: "https://example.com/thumbnail.jpg",
    title: "Image Title",
    description: "Image description",
    alt: "Alt text for accessibility"
  }
];
```

### Public Methods

- `render(images)` - Render images in the grid
- `open(index)` - Open lightbox at specific index
- `close()` - Close the lightbox
- `prev()` - Go to previous image
- `next()` - Go to next image
- `destroy()` - Clean up the instance

## Styling Customization

Use CSS custom properties to customize the appearance:

```css
:root {
  --ig-card-bg: #ffffff;
  --ig-card-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  --ig-card-radius: 12px;
  --ig-accent-color: #3b82f6;
}
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge).