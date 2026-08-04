'use client';
import { useState } from 'react';
import { DropdownMenu } from '@/components/DropdownMenu';
import { ChordFeedbackModal } from '@/modules/chordv2/ChordFeedbackModal';
import { downloadSvg } from '@/app/utils/downloadSvg';
import { downloadImage } from '@/app/utils/downloadImage';
import EllipsisIcon from '@/svgs/more.svg';
import FlagIcon from '@/svgs/flag.svg';
import ShareIcon from '@/svgs/share.svg';
import ExportIcon from '@/svgs/download.svg';

interface ChordShapeActionDropdownProps {
  shapeId: number;
  chordName: string;
  svgId: string;
}

export const ChordShapeActionDropdown = ({
  shapeId,
  chordName,
  svgId,
}: ChordShapeActionDropdownProps) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const getSvg = () => {
    const el = document.getElementById(svgId);
    return el instanceof SVGSVGElement ? el : null;
  };

  return (
    <>
      <DropdownMenu
        triggerElement={
          <button className="flex min-h-11 min-w-11 items-center justify-center gap-2 border-none p-2">
            <span className="sr-only">Open options menu</span>
            <EllipsisIcon aria-hidden="true" height={20} width={20} />
          </button>
        }
        menuContents={[
          <button
            key="share"
            className="flex w-full items-center gap-2 border-none p-2"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            <ShareIcon height={20} width={20} />
            Share URL
          </button>,
          <button
            key="svg"
            className="flex w-full items-center gap-2 border-none p-2"
            onClick={() => {
              const svg = getSvg();
              if (svg)
                downloadSvg({ svgElement: svg, fileName: `${chordName}.svg` });
            }}
          >
            <ExportIcon height={20} width={20} />
            Download SVG
          </button>,
          <button
            key="png"
            className="flex w-full items-center gap-2 border-none p-2"
            onClick={() => {
              const svg = getSvg();
              if (svg)
                downloadImage({ element: svg, fileName: `${chordName}.png` });
            }}
          >
            <ExportIcon height={20} width={20} />
            Download PNG
          </button>,
          <button
            key="feedback"
            className="flex w-full items-center gap-2 border-none p-2"
            onClick={() => setFeedbackOpen(true)}
          >
            <FlagIcon height={20} width={20} />
            Feedback
          </button>,
        ]}
      />
      {feedbackOpen && (
        <ChordFeedbackModal
          shapeId={shapeId}
          chordName={chordName}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
    </>
  );
};
