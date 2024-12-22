'use client';
import { useState } from 'react';
import { reportChord } from '@/app/actions';
import { Modal } from '@/components/Modal';
import NewChordForm from '@/components/NewChordForm';
import EditIcon from '@/svgs/edit.svg';
import FlagIcon from '@/svgs/flag.svg';
import { ChordType } from '@/types';

interface ChordActionDropdownProps {
  chord: ChordType;
}

const ChordActionDropdown = ({ chord }: ChordActionDropdownProps) => {
  const [modalOpen, toggleModalOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          className="flex items-center gap-2 p-2"
          onClick={() => {
            // open modal
            toggleModalOpen(true);
          }}
        >
          <EditIcon className="" height={20} width={20} />
          Edit
        </button>
        <button
          className="flex items-center gap-2 p-2"
          onClick={() => {
            reportChord({ id: chord.id });
          }}
        >
          <FlagIcon className="" height={20} width={20} />
          Incorrect
        </button>
      </div>
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
