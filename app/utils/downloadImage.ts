export const downloadImage = async ({
  element,
  fileName,
}: {
  element: HTMLImageElement | SVGSVGElement;
  fileName: string;
}) => {
  let dataUrl: string;

  if (element instanceof SVGSVGElement) {
    // Always export SVG as a 400x400 PNG
    const size = 400;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(element);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Load the SVG as an image
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0, size, size);
      dataUrl = canvas.toDataURL('image/png');
    } else {
      URL.revokeObjectURL(svgUrl);
      throw new Error('downloadImage: Could not get canvas context.');
    }
    URL.revokeObjectURL(svgUrl);
  } else if (element instanceof HTMLImageElement) {
    // Ensure the image is fully loaded before drawing
    if (!element.complete || element.naturalWidth === 0) {
      await new Promise<void>((resolve, reject) => {
        element.onload = () => resolve();
        element.onerror = reject;
      });
    }
    const canvas = document.createElement('canvas');
    canvas.width = element.naturalWidth;
    canvas.height = element.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(element, 0, 0);
      dataUrl = canvas.toDataURL('image/png');
    } else {
      throw new Error('downloadImage: Could not get canvas context.');
    }
  } else {
    throw new Error(
      'downloadImage: element is not an SVGSVGElement or HTMLImageElement',
    );
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};
