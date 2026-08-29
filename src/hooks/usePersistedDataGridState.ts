import { useEffect, useState } from 'react';
import type { GridColumnVisibilityModel, GridFilterModel, GridSortModel } from '@mui/x-data-grid';

type PersistedState = {
  columnVisibilityModel: GridColumnVisibilityModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
};

const emptyState: PersistedState = {
  columnVisibilityModel: {},
  sortModel: [],
  filterModel: { items: [] },
};

export function usePersistedDataGridState(storageKey: string) {
  const [state, setState] = useState<PersistedState>(emptyState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<PersistedState>;
        setState({
          columnVisibilityModel: saved.columnVisibilityModel ?? {},
          sortModel: Array.isArray(saved.sortModel) ? saved.sortModel : [],
          filterModel: saved.filterModel?.items ? saved.filterModel : { items: [] },
        });
      }
    } catch {
      // Ignore malformed or unavailable browser storage and use defaults.
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage can be disabled or full; the table remains fully functional.
    }
  }, [hydrated, state, storageKey]);

  return {
    ...state,
    onColumnVisibilityModelChange: (columnVisibilityModel: GridColumnVisibilityModel) =>
      setState(current => ({ ...current, columnVisibilityModel })),
    onSortModelChange: (sortModel: GridSortModel) =>
      setState(current => ({ ...current, sortModel })),
    onFilterModelChange: (filterModel: GridFilterModel) =>
      setState(current => ({ ...current, filterModel })),
  };
}
