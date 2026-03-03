/**
 * @module uiStore
 * @description Zustand store for UI-level state: dark mode toggle, left/right
 * panel visibility. Separated from graphStore to keep UI chrome state
 * independent of data concerns.
 */

import { create } from 'zustand';

/**
 * UI state for panel visibility and theme preference.
 * - `darkMode` toggles the `.dark` class on `documentElement`
 * - `leftPanelOpen` / `rightPanelOpen` control sidebar width transitions
 */
interface UIState {
    darkMode: boolean;
    leftPanelOpen: boolean;
    rightPanelOpen: boolean;
    toggleDarkMode: () => void;
    toggleLeftPanel: () => void;
    toggleRightPanel: () => void;
    setRightPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    darkMode: true,
    leftPanelOpen: true,
    rightPanelOpen: false,

    toggleDarkMode: () => set((state) => {
        const next = !state.darkMode;
        document.documentElement.classList.toggle('dark', next);
        return { darkMode: next };
    }),

    toggleLeftPanel: () => set((state) => ({ leftPanelOpen: !state.leftPanelOpen })),
    toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),
    setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
}));
