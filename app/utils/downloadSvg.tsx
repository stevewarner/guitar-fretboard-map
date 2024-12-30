export const downloadSvg = ({
  svgElement,
  fileName,
}: {
  svgElement: SVGSVGElement;
  fileName: string;
}) => {
  const clonedSvgElement = svgElement.cloneNode(true) as SVGSVGElement;

  // Remove the width and height attributes from the cloned SVG
  clonedSvgElement.removeAttribute('width');
  clonedSvgElement.removeAttribute('height');
  // serialize svg
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvgElement as Node);

  // create a blob
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  // create a link
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  // clean up
  URL.revokeObjectURL(url);
};
