'use client';
import { useState } from 'react';
import { reportChord } from '@/app/actions';
import { Modal } from '@/components/Modal';
import NewChordForm from '@/components/NewChordForm';
import { DropdownMenu } from '@/components/DropdownMenu';
import EditIcon from '@/svgs/edit.svg';
import FlagIcon from '@/svgs/flag.svg';
import EllipsisIcon from '@/svgs/more.svg';
import { ChordType } from '@/types';

interface ChordActionDropdownProps {
  chord: ChordType;
}

const ChordActionDropdown = ({ chord }: ChordActionDropdownProps) => {
  const [modalOpen, toggleModalOpen] = useState(false);

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
            key="edit"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              // open modal
              toggleModalOpen(true);
            }}
          >
            <EditIcon className="" height={20} width={20} />
            Edit
          </button>,
          <button
            key="report"
            className="flex w-full items-center gap-2 border-none p-2 data-[focus]:bg-gray-100"
            onClick={() => {
              reportChord({ id: chord.id });
            }}
          >
            <FlagIcon className="" height={20} width={20} />
            Incorrect
          </button>,
        ]}
      />
      {modalOpen && (
        <Modal
          title={`Edit ${chord.name}`}
          onClose={() => toggleModalOpen(false)}
          content={<NewChordForm initFormValues={chord} />}
        />
      )}
    </>
  );
};

export default ChordActionDropdown;
