'use server';
import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

// Array needs to be formatted with each el as a string
const createTab = (val: string) => {
  const newArr: string[] = [];
  val.split('').map((fretNum: string) => {
    !!fretNum && newArr.push(`'${fretNum}'`);
  });
  return newArr;
};

export async function createNewChord(
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
      `INSERT INTO chords (name, tab, tab_id, start_fret, num_frets) VALUES ('${name}', array [${tabArr}], '${tab}', ${startFret}, ${numFrets});`,
    );
    isSuccessful = true;

    // revalidate cache
    revalidatePath('/');

    return { success: true, message: 'Successfully created new chord' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error:', e);
    return { success: false, message: 'Failed to create chord' };
  } finally {
    if (isSuccessful) {
      // redirect to new chord page
      redirect(`/chord/${name}`);
    }
  }
}
