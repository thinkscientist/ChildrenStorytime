declare module 'html2canvas' {
  interface Html2CanvasOptions {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string;
    scrollY?: number;
    windowWidth?: number;
    windowHeight?: number;
    onclone?: (clonedDoc: Document) => void;
  }

  function html2canvas(element: HTMLElement, options?: Html2CanvasOptions): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'jspdf' {
  interface jsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: 'pt' | 'px' | 'in' | 'mm' | 'cm' | 'm';
    format?: string | [number, number];
  }

  class jsPDF {
    constructor(options?: jsPDFOptions);
    addImage(imageData: string, format: string, x: number, y: number, width: number, height: number): void;
    save(filename: string): void;
    getImageProperties(imageData: string): { width: number; height: number };
    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };
  }

  export { jsPDF };
} 