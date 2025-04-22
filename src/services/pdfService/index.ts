import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generatePDF = async (element: HTMLElement): Promise<void> => {
  try {
    console.log('Starting PDF generation...');
    
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

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc: Document) => {
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
    const pdf = new jsPDF({
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