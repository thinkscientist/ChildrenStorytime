export const exportAsImage = async (element: HTMLElement): Promise<void> => {
  try {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '20px';
    container.style.zIndex = '-1';
    
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    container.appendChild(clone);
    document.body.appendChild(container);

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size to match container
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    if (context) {
      // Draw white background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Use html2canvas if available
      if (window.html2canvas) {
        const canvas = await window.html2canvas(container, {
          backgroundColor: '#ffffff',
          scale: 2, // Higher quality
          logging: false,
          useCORS: true
        });
        
        // Convert to image and trigger download
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'my-story.png';
        link.href = image;
        link.click();
      } else {
        // Fallback to basic canvas rendering
        const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${container.offsetWidth}" height="${container.offsetHeight}">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif;">
                ${container.innerHTML}
              </div>
            </foreignObject>
          </svg>`
        )))}`;
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUrl;
        });
        
        context.drawImage(img, 0, 0);
        
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'my-story.png';
        link.href = image;
        link.click();
      }
      
      // Clean up
      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Error exporting image:', error);
    throw error;
  }
}; 