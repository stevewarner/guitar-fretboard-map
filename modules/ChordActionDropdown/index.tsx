'use client';

import { reportChord } from '@/app/actions';
import EditIcon from '@/svgs/edit.svg';
import FlagIcon from '@/svgs/flag.svg';

interface ChordActionDropdownProps {
  id: number;
}

const ChordActionDropdown = ({ id }: ChordActionDropdownProps) => {
  return (
    <div className="flex gap-2">
      {/* <button
        className="flex items-center gap-2 p-2"
        onClick={() => {
          console.log('EDIT');
          //    open modal
        }}
      >
        <EditIcon className="" height={20} width={20} />
        Edit
      </button> */}
      <button
        className="flex items-center gap-2 p-2"
        onClick={() => {
          console.log('REPORT');
          reportChord({ id });
        }}
      >
        <FlagIcon className="" height={20} width={20} />
        Report
      </button>
    </div>
  );
};

export default ChordActionDropdown;
