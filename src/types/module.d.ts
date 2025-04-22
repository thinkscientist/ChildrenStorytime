declare module 'html2canvas' {
  const html2canvas: any;
  export default html2canvas;
}

declare module 'jspdf' {
  const jsPDF: any;
  export default jsPDF;
}

// Add html2canvas to window object
declare global {
  interface Window {
    html2canvas: any;
  }
} 