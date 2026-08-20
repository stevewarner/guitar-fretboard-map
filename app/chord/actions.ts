'use server';
import { sql } from '@vercel/postgres';
import { revalidatePath, updateTag } from 'next/cache';
import { createTab } from '@/app/utils/createTab';
import { TAB_PATTERN } from '@/app/utils/validation';

export async function submitChordFeedback(
  shapeId: number,
  _prevState: { success: boolean; message: string },
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  if (!Number.isFinite(shapeId) || shapeId <= 0) {
    return { success: false, message: 'Invalid shape' };
  }
  const sentiment = formData.get('sentiment') as string | null;
  if (sentiment !== 'positive' && sentiment !== 'negative') {
    return { success: false, message: 'Please select a sentiment.' };
  }
  const description =
    (formData.get('description') as string | null)?.trim() || null;
  try {
    await sql.query(
      `INSERT INTO chord_feedback (chord_shape_id, sentiment, description) VALUES ($1, $2, $3)`,
      [shapeId, sentiment, description],
    );
    return { success: true, message: 'Thank you for the feedback!' };
  } catch (e) {
    console.error('Error submitting chord feedback:', e);
    return { success: false, message: 'Failed to submit feedback' };
  }
}

type FormState = { success: boolean; message: string };

function validate(
  qualityId: number,
  tabRelative: string,
  moveable: boolean,
  rootString: number | null,
  rootFinger: number | null,
  rootPc: number | null,
  inversion: number,
) {
  if (!Number.isFinite(qualityId) || qualityId <= 0)
    return 'Quality is required';
  if (!TAB_PATTERN.test(tabRelative))
    return 'Tab must be 6 values containing only numbers and x';
  if (moveable) {
    if (rootString === null || rootString < 1 || rootString > 6) {
      return 'Root string (1–6) is required for moveable shapes';
    }
    if (rootFinger === null || rootFinger < 0 || rootFinger > 4) {
      return 'Root finger (0–4) is required for moveable shapes';
    }
  } else {
    if (rootPc === null || rootPc < 0 || rootPc > 11) {
      return 'Root pitch class (0–11) is required for fixed shapes';
    }
  }
  if (!Number.isInteger(inversion) || inversion < 0 || inversion > 6) {
    return 'Inversion must be between 0 and 6';
  }
  return null;
}

export async function submitChordRequest(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const chordName =
    (formData.get('chordName') as string | null)?.trim() || null;
  const tab = (formData.get('tab') as string | null)?.trim() || '';

  if (!tab || !TAB_PATTERN.test(tab)) {
    return {
      success: false,
      message:
        'Tab must be 6 comma-separated values containing only numbers and x',
    };
  }

  try {
    await sql.query(
      `INSERT INTO chord_requests (chord_name, tab) VALUES ($1, $2)`,
      [chordName, tab],
    );
    return { success: true, message: 'Request submitted — thank you!' };
  } catch (e) {
    console.error('Error submitting chord request:', e);
    return {
      success: false,
      message: 'Failed to submit request. Please try again.',
    };
  }
}

// Auto-logs a visit to a quality page with no seeded shapes yet — upserts on
// quality_symbol so repeat visits increment visit_count instead of piling up
// duplicate rows. Fire-and-forget from the client; failures are swallowed
// since this is best-effort telemetry, not a user-facing action.
export async function logMissingChordVisit(
  qualitySymbol: string,
  qualityFullName: string,
  intervals: number[],
): Promise<void> {
  try {
    await sql.query(
      `INSERT INTO chord_requests (chord_name, source, quality_symbol, intervals, visit_count)
       VALUES ($1, 'auto', $2, $3, 1)
       ON CONFLICT (quality_symbol) WHERE source = 'auto'
       DO UPDATE SET visit_count = chord_requests.visit_count + 1`,
      [qualityFullName, qualitySymbol, intervals],
    );
  } catch (e) {
    console.error('Error logging missing chord visit:', e);
  }
}

export async function createNewChordShape(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const qualityId = Number(formData.get('qualityId'));
  const moveable = formData.get('moveable') === 'true';
  const isOpen = formData.get('isOpen') === 'true';
  const tabRelative = formData.get('tabRelative') as string;
  const rootStringRaw = formData.get('rootString');
  const rootFingerRaw = formData.get('rootFinger');
  const rootPcRaw = formData.get('rootPc');
  const openRootPcRaw = formData.get('openRootPc');
  const inversion = Number(formData.get('inversion'));
  const description =
    (formData.get('description') as string | null)?.trim() || null;

  const rootString = moveable && rootStringRaw ? Number(rootStringRaw) : null;
  const rootFinger = moveable && rootFingerRaw ? Number(rootFingerRaw) : null;
  const rootPc = !moveable && rootPcRaw ? Number(rootPcRaw) : null;
  // A fixed shape's own root_pc IS the root it's open at. A moveable shape has
  // no fixed root, so open_chords needs the specific root picked in the form —
  // see the "Open at root" field, only shown when moveable + open are both set.
  const openAtRootPc = moveable
    ? openRootPcRaw
      ? Number(openRootPcRaw)
      : null
    : rootPc;

  const error = validate(
    qualityId,
    tabRelative,
    moveable,
    rootString,
    rootFinger,
    rootPc,
    inversion,
  );
  if (error) return { success: false, message: error };
  if (isOpen && openAtRootPc === null) {
    return {
      success: false,
      message: 'Open root is required when "Open" is checked',
    };
  }

  const parsedTab = createTab(tabRelative);
  const tabArray = parsedTab.map((v) => (v === undefined ? null : String(v)));

  try {
    const { rows } = await sql.query<{ id: number }>(
      `INSERT INTO chord_shapes
        (quality_id, moveable, tab_relative, root_string, root_finger, root_pc, inversion, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        qualityId,
        moveable,
        tabArray,
        rootString,
        rootFinger,
        rootPc,
        inversion,
        description,
      ],
    );
    const newShapeId = rows[0].id;

    if (isOpen && openAtRootPc !== null) {
      await sql.query(
        `INSERT INTO open_chords (chord_shape_id, root_pc) VALUES ($1, $2)`,
        [newShapeId, openAtRootPc],
      );
    }

    updateTag('chord-data');
    revalidatePath('/chord');
    return { success: true, message: 'Shape created' };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Error creating chord shape:', e);
    return { success: false, message: 'Failed to create chord shape' };
  }
}
