'use server';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';
import { ChordType } from '@/types';

import { revalidatePath } from 'next/cache';

// Array needs to be formatted with each el as a string
const createTab = (val: string) => {
  const newArr: string[] = [];
  val.split('').map((fretNum: string) => {
    !!fretNum && newArr.push(`'${fretNum}'`);
  });
  return newArr;
};

// CREATE NEW

export async function createNewChord(
  prevState: {
    success: boolean;
    message: string;
  },
  formData: FormData,
) {
  const rawData = {
    name: formData.get('name') as string,
    tab: formData.get('tab') as string,
    startFret: formData.get('startFret') as string,
    numFrets: formData.get('numFrets') as string,
  };
  const name = formData.get('name') as string;
  const tab = formData.get('tab') as string;
  const startFret = formData.get('startFret') as string;
  const numFrets = formData.get('numFrets') as string;

  const tabArr = createTab(tab);

  let isSuccessful = false;

  try {
    await sql.query(
      `INSERT INTO chords (name, tab, tab_id, start_fret, num_frets) VALUES ('${name}', array [${tabArr}], '${tab}', ${startFret}, ${numFrets});`,
    );
    isSuccessful = true;

    // revalidate cache
    revalidatePath('/chord');

    return { success: true, message: 'Successfully created new chord' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
    return {
      success: false,
      message: 'Failed to create chord',
      inputs: rawData,
    };
  } finally {
    if (isSuccessful && name) {
      // redirect to new chord page
      redirect(`/chord/${encodeURIComponent(name?.toString())}`);
    }
  }
}

// EDIT

export async function updateChord(
  chord: ChordType | null,
  prevState: {
    success: boolean;
    message: string;
  },
  formData: FormData,
) {
  const name = formData.get('name');
  const tab = formData.get('tab');
  const startFret = formData.get('startFret');
  const numFrets = formData.get('numFrets');

  const tabArr = createTab(tab as string);

  let isSuccessful = false;

  try {
    await sql.query(
      `UPDATE chords SET name = '${name}', tab = array [${tabArr}], tab_id = '${tab}', start_fret = ${startFret}, num_frets = ${numFrets} WHERE id = ${chord?.id};`,
    );
    isSuccessful = true;

    // revalidate cache
    revalidatePath('/chord');

    return { success: true, message: 'Successfully created new chord' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
    return { success: false, message: 'Failed to create chord' };
  } finally {
    if (isSuccessful && name) {
      // redirect to new chord page
      redirect(`/chord/${encodeURIComponent(name?.toString())}`);
    }
  }
}

// REPORT

interface ReportChordProps {
  id: number;
}
export async function reportChord({ id }: ReportChordProps) {
  try {
    await sql.query(
      `UPDATE chords SET report_count = report_count + 1 WHERE id = ${id};`,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
  }
}
