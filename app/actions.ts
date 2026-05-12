'use server';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';
import { ChordType } from '@/types';

import { revalidatePath } from 'next/cache';

const createTab = (val: string): string[] => {
  const splitVal = val.length === 6 ? '' : ',';
  return val.split(splitVal).filter(Boolean);
};

const createIntervals = (val: string): string[] => {
  const splitVal = val.length === 6 ? '' : ',';
  return val.split(splitVal);
};

// CREATE NEW

export async function createNewChord(
  prevState: {
    success: boolean;
    message: string;
  },
  formData: FormData,
) {
  const name = formData.get('name') as string;
  const tab = formData.get('tab') as string;
  const startFret = formData.get('startFret') as string;
  const numFrets = formData.get('numFrets') as string;
  const intervals = formData.get('intervals');

  const tabArr = createTab(tab);
  const intervalsArr = createIntervals(intervals as string);

  let isSuccessful = false;

  try {
    await sql.query(
      'INSERT INTO chords (name, tab, tab_id, start_fret, num_frets, intervals) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, tabArr, tab, Number(startFret), Number(numFrets), intervalsArr],
    );
    isSuccessful = true;

    revalidatePath('/chord');

    return { success: true, message: 'Successfully created new chord' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
    return {
      success: false,
      message: 'Failed to create chord',
      inputs: { name, tab, startFret, numFrets },
    };
  } finally {
    if (isSuccessful && name) {
      redirect(`/chord/${encodeURIComponent(name)}`);
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
  const name = formData.get('name') as string;
  const tab = formData.get('tab') as string;
  const startFret = formData.get('startFret') as string;
  const numFrets = formData.get('numFrets') as string;
  const intervals = formData.get('intervals');

  const tabArr = createTab(tab);
  const intervalsArr = createIntervals(intervals as string);

  let isSuccessful = false;

  try {
    await sql.query(
      'UPDATE chords SET name = $1, tab = $2, intervals = $3, tab_id = $4, start_fret = $5, num_frets = $6 WHERE id = $7',
      [name, tabArr, intervalsArr, tab, Number(startFret), Number(numFrets), chord?.id],
    );
    isSuccessful = true;

    revalidatePath('/chord');

    return { success: true, message: 'Successfully updated chord' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
    return { success: false, message: 'Failed to update chord' };
  } finally {
    if (isSuccessful && name) {
      redirect(`/chord/${encodeURIComponent(name)}`);
    }
  }
}

// REPORT

interface ReportChordProps {
  id: number;
}
export async function reportChord({ id }: ReportChordProps) {
  try {
    await sql.query('UPDATE chords SET report_count = report_count + 1 WHERE id = $1', [id]);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
  }
}
