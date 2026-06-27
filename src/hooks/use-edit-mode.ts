import { useState } from 'react';

/**
 * View/edit toggle for an editable settings panel. Panels start in read-only
 * (view) mode; the user presses Edit to make changes, then Save or Cancel.
 */
export function useEditMode() {
  const [editing, setEditing] = useState(false);
  return {
    editing,
    startEditing: () => setEditing(true),
    stopEditing: () => setEditing(false),
  };
}
