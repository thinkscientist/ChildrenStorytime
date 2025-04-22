// PDF Service
// This service handles PDF generation using html2canvas and jsPDF

// Import modules
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Function to generate PDF
export const generatePDF = async (element: HTMLElement): Promise<void> => {
  try {
    // Wait for any images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('story.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}; 