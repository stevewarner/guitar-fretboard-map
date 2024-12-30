import { Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface DropdownMenuProps {
  triggerElement: React.ReactNode;
  menuContents: React.ReactNode[];
}

export const DropdownMenu = ({
  triggerElement,
  menuContents,
}: DropdownMenuProps) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton as={Fragment}>{triggerElement}</MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        {menuContents.map((item, index) => (
          <MenuItem key={index}>{item}</MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
};
