// Use dynamic imports with a different module loading fallback strategy
let html2canvasModule = null;
let jspdfModule = null;

// Fallback function for when modules fail to load
const fallbackToWindow = () => {
  if (window.html2canvas) {
    html2canvasModule = window.html2canvas;
  }
  if (window.jsPDF) {
    jspdfModule = window.jsPDF;
  }
};

// Preload modules with timeout and retry
const preloadModules = async (timeout = 5000, maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Module loading timed out')), timeout);
      });
      
      // Create a promise that loads the modules
      const loadModulesPromise = (async () => {
        // Try to load html2canvas first
        if (!html2canvasModule) {
          html2canvasModule = (await import('html2canvas')).default;
        }
        
        // Then try to load jsPDF
        if (!jspdfModule) {
          jspdfModule = (await import('jspdf')).jsPDF;
        }
      })();
      
      // Race the two promises
      await Promise.race([loadModulesPromise, timeoutPromise]);
      
      // If we get here, both modules are loaded
      return;
    } catch (error) {
      console.error(`Error preloading modules (attempt ${retries + 1}/${maxRetries}):`, error);
      retries++;
      
      if (retries < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
      } else {
        // Try fallback on last retry
        fallbackToWindow();
      }
    }
  }
};

// Call preloadModules immediately
preloadModules();

export const generatePDF = async (element) => {
  try {
    console.log('Starting PDF generation...');
    
    // Check if modules are loaded, if not, try to load them again with a longer timeout
    if (!html2canvasModule || !jspdfModule) {
      await preloadModules(10000, 5); // Longer timeout and more retries for final attempt
      
      // If still not loaded, try one last fallback
      if (!html2canvasModule || !jspdfModule) {
        // Try to load from CDN as last resort
        const loadFromCDN = () => {
          return new Promise((resolve, reject) => {
            // Load html2canvas from CDN
            const html2canvasScript = document.createElement('script');
            html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            html2canvasScript.onload = () => {
              html2canvasModule = window.html2canvas;
              resolve();
            };
            html2canvasScript.onerror = reject;
            document.head.appendChild(html2canvasScript);
            
            // Load jsPDF from CDN
            const jsPDFScript = document.createElement('script');
            jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            jsPDFScript.onload = () => {
              jspdfModule = window.jspdf.jsPDF;
              resolve();
            };
            jsPDFScript.onerror = reject;
            document.head.appendChild(jsPDFScript);
          });
        };
        
        try {
          await loadFromCDN();
        } catch (error) {
          console.error('Failed to load modules from CDN:', error);
          throw new Error('Failed to load PDF generation libraries');
        }
      }
    }
    
    // Wait for images to load
    const images = element.getElementsByTagName('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Add a small delay to ensure content is rendered
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvasModule(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById('story-content');
        if (clonedElement) {
          clonedElement.style.width = '100%';
          clonedElement.style.maxWidth = 'none';
          clonedElement.style.margin = '0';
          clonedElement.style.padding = '0';
        }
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jspdfModule({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('story.pdf');
    console.log('PDF generated successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 