import { create } from 'zustand';

export type DashboardFilter = {
  types: string[];
  methods: string[];
  dateRange: { start: string | null; end: string | null };
  search: string;
};

interface DashboardStore {
  filters: DashboardFilter;
  setTypes: (types: string[]) => void;
  setMethods: (methods: string[]) => void;
  setDateRange: (start: string | null, end: string | null) => void;
  setSearch: (search: string) => void;
  resetFilters: () => void;
}

const initialFilters: DashboardFilter = {
  types: [],
  methods: [],
  dateRange: { start: null, end: null },
  search: '',
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  filters: initialFilters,
  setTypes: (types) => set((state) => ({ filters: { ...state.filters, types } })),
  setMethods: (methods) => set((state) => ({ filters: { ...state.filters, methods } })),
  setDateRange: (start, end) => set((state) => ({ filters: { ...state.filters, dateRange: { start, end } } })),
  setSearch: (search) => set((state) => ({ filters: { ...state.filters, search } })),
  resetFilters: () => set({ filters: initialFilters }),
})); 