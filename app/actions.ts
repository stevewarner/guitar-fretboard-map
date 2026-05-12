'use server';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { ChordType } from '@/types';
import { createTab, createIntervals } from '@/app/utils';

const TAB_PATTERN = /^(?:[0-9x]{6}|(x|[0-9]|1\d|2[0-4])(,(x|[0-9]|1\d|2[0-4])){5})$/;

function validateChordInputs(name: string, tab: string, startFret: number, numFrets: number) {
  if (!name?.trim()) return 'Chord name is required';
  if (!TAB_PATTERN.test(tab)) return 'Tab must be 6 values containing only numbers and x';
  if (isNaN(startFret) || startFret < 1 || startFret > 24) return 'Starting fret must be between 1 and 24';
  if (isNaN(numFrets) || numFrets < 1 || numFrets > 9) return 'Number of frets must be between 1 and 9';
  return null;
}

// CREATE NEW

export async function createNewChord(
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  const name = formData.get('name') as string;
  const tab = formData.get('tab') as string;
  const startFret = Number(formData.get('startFret'));
  const numFrets = Number(formData.get('numFrets'));
  const intervals = formData.get('intervals') as string;

  const validationError = validateChordInputs(name, tab, startFret, numFrets);
  if (validationError) return { success: false, message: validationError };

  let isSuccessful = false;

  try {
    await sql.query(
      'INSERT INTO chords (name, tab, tab_id, start_fret, num_frets, intervals) VALUES ($1, $2, $3, $4, $5, $6)',
      [name, createTab(tab), tab, startFret, numFrets, createIntervals(intervals)],
    );
    isSuccessful = true;

    revalidatePath('/chord');

    return { success: true, message: 'Successfully created new chord' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
    return { success: false, message: 'Failed to create chord' };
  } finally {
    if (isSuccessful && name) {
      redirect(`/chord/${encodeURIComponent(name)}`);
    }
  }
}

// EDIT

export async function updateChord(
  chord: ChordType | null,
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  const name = formData.get('name') as string;
  const tab = formData.get('tab') as string;
  const startFret = Number(formData.get('startFret'));
  const numFrets = Number(formData.get('numFrets'));
  const intervals = formData.get('intervals') as string;

  const validationError = validateChordInputs(name, tab, startFret, numFrets);
  if (validationError) return { success: false, message: validationError };

  let isSuccessful = false;

  try {
    await sql.query(
      'UPDATE chords SET name = $1, tab = $2, intervals = $3, tab_id = $4, start_fret = $5, num_frets = $6 WHERE id = $7',
      [name, createTab(tab), createIntervals(intervals), tab, startFret, numFrets, chord?.id],
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
