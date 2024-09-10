document.addEventListener('mousemove', function(e) {
    const button = document.querySelector('.start-button');

    // Get the cursor's position relative to the window
    const x = e.clientX;
    const y = e.clientY;

    // Calculate the center of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate the offset based on cursor position with reduced amount
    const offsetX = (x - centerX) / centerX * 3; // Reduce multiplier for less jiggle
    const offsetY = (y - centerY) / centerY * 3;

    // Apply the transform to create the jiggle effect within bounds
    button.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});

// Remove jiggle effect on mouse out
document.querySelector('.aspect-ratio-box').addEventListener('mouseleave', function() {
    const button = document.querySelector('.start-button');
    button.style.transform = 'translate(0, 0)';
});
