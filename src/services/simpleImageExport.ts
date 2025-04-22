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
    container.innerHTML = element.innerHTML;
    document.body.appendChild(container);

    // Use the browser's native screenshot capabilities
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    
    // Draw white background
    if (context) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create a data URL from the element
      const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${container.offsetWidth}" height="${container.offsetHeight}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${container.innerHTML}
            </div>
          </foreignObject>
        </svg>`
      )))}`;
      
      // Create an image from the data URL
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      
      // Draw the image
      context.drawImage(img, 0, 0);
      
      // Clean up
      document.body.removeChild(container);
      
      // Convert to image and trigger download
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = 'my-story.png';
      link.href = image;
      link.click();
    }
  } catch (error) {
    console.error('Error exporting image:', error);
    throw error;
  }
}; 