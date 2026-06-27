import { useCallback, useState } from 'react';
import { addVisitWithItems, type AddVisitPayload } from '../../../data';

type SubmitResult = { restaurantId: string; visitId: string };

type UseAddVisitResult = {
  submit: (payload: AddVisitPayload) => Promise<SubmitResult>;
  saving: boolean;
  error: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Could not save the visit. Please try again.';
}

/**
 * Persists a visit (restaurant + visit + items) via
 * {@link addVisitWithItems}. Exposes `saving`/`error`; re-throws so callers
 * can react to success/failure of an individual submit.
 */
export function useAddVisit(): UseAddVisitResult {
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (payload: AddVisitPayload): Promise<SubmitResult> => {
      setSaving(true);
      setError(null);
      try {
        return await addVisitWithItems(payload);
      } catch (err) {
        setError(getErrorMessage(err));
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { submit, saving, error };
}
