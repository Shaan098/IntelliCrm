import { create } from 'zustand';

interface UIStore {
  sidebarCollapsed: boolean;
  theme:            'dark' | 'light';
  toggleSidebar:    () => void;
  setSidebar:       (v: boolean) => void;
  toggleTheme:      () => void;
}

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarCollapsed: false,
  theme:            'dark',

  toggleSidebar: () =>
    set({ sidebarCollapsed: !get().sidebarCollapsed }),

  setSidebar: (v) =>
    set({ sidebarCollapsed: v }),

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    set({ theme: next });
  },
}));
