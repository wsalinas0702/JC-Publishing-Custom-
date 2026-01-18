# Space Background

## Overview
A Three.js-powered animated space background featuring stars and colorful nebula effects. The animation responds to mouse/touch movement for an interactive parallax effect.

## Project Structure
- `index.html` - Main entry point, loads Three.js from CDN and main.js
- `main.js` - Three.js scene setup with stars, glow planes, and animation loop
- `style.css` - Dark cosmic gradient backgrounds and canvas styling
- `experiments/` - Additional experimental versions

## Running Locally
The project is served as static files. A simple HTTP server on port 5000 serves the content.

## Technologies
- Three.js (v0.128.0) - 3D graphics library loaded from CDN
- Vanilla HTML/CSS/JavaScript

## Features
- WebGL-rendered starfield with thousands of stars
- Colored glow planes for nebula effect (purple and green)
- Mouse/touch parallax camera movement
- Reduced motion support for accessibility
- Mobile-optimized star count
- Graceful fallback if WebGL is unavailable
