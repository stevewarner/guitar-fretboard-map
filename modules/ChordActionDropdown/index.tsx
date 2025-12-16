'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { reportChord } from '@/app/actions';
import { Modal } from '@/components/Modal';
import NewChordForm from '@/components/NewChordForm';
import { DropdownMenu } from '@/components/DropdownMenu';
import ShareIcon from '@/svgs/share.svg';
import EditIcon from '@/svgs/edit.svg';
import FlagIcon from '@/svgs/flag.svg';
import EllipsisIcon from '@/svgs/more.svg';
import ExportIcon from '@/svgs/download.svg';
import { ChordType } from '@/types';
import { downloadSvg } from '@/app/utils/downloadSvg';
import { downloadImage } from '@/app/utils/downloadImage';

interface ChordActionDropdownProps {
  id: string;
  chord: ChordType;
}

const ChordActionDropdown = ({ id, chord }: ChordActionDropdownProps) => {
  const [modalOpen, toggleModalOpen] = useState(false);

  const pathname = usePathname();

  return (
    <>
      <DropdownMenu
        triggerElement={
          <button className="flex items-center gap-2 border-none p-2">
            <span className="sr-only">Open options menu</span>
            <EllipsisIcon aria-hidden="true" height={20} width={20} />
          </button>
        }
        menuContents={[
          <button
            key="share"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              // copy to clipboard
              navigator.clipboard.writeText(
                `${window.location.origin}${pathname}#${chord.tab_id}`,
              );
            }}
          >
            <ShareIcon height={20} width={20} />
            Share URL
          </button>,
          <button
            key="export"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              // export SVG
              const svgElement = document.getElementById(
                id,
              ) as unknown as SVGSVGElement;
              downloadSvg({ svgElement, fileName: `${chord.name}.svg` });
            }}
          >
            <ExportIcon height={20} width={20} />
            Download SVG
          </button>,
          <button
            key="export-png"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              // export PNG
              const svgElement = document.getElementById(
                id,
              ) as unknown as SVGSVGElement;
              downloadImage({
                element: svgElement,
                fileName: `${chord.name}.png`,
              });
            }}
          >
            <ExportIcon height={20} width={20} />
            Download PNG
          </button>,
          <button
            key="edit"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              // open modal
              toggleModalOpen(true);
            }}
          >
            <EditIcon height={20} width={20} />
            Edit
          </button>,
          <button
            key="report"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              reportChord({ id: chord.id });
            }}
          >
            <FlagIcon height={20} width={20} />
            Incorrect
          </button>,
        ]}
      />
      {modalOpen && (
        <Modal
          title={`Edit ${chord.name}`}
          onClose={() => toggleModalOpen(false)}
          content={<NewChordForm initFormValues={chord} isEdit />}
        />
      )}
    </>
  );
};

export default ChordActionDropdown;
