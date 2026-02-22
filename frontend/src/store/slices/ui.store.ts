import { create } from 'zustand';

interface UIState {
  // Modal states
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  isCartDrawerOpen: boolean;
  isMobileMenuOpen: boolean;

  // Theme
  theme: 'light' | 'dark';

  // Loading states
  globalLoading: boolean;
  loadingText: string | null;

  // Actions
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
  toggleCartDrawer: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleMobileMenu: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setGlobalLoading: (loading: boolean, text?: string) => void;
  resetUI: () => void;
}

const initialState: Omit<UIState, 'actions'> = {
  isLoginModalOpen: false,
  isRegisterModalOpen: false,
  isCartDrawerOpen: false,
  isMobileMenuOpen: false,
  theme: 'light',
  globalLoading: false,
  loadingText: null,
};

export const useUIStore = create<UIState>((set, get) => ({
  ...initialState,

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  openRegisterModal: () => set({ isRegisterModalOpen: true }),
  closeRegisterModal: () => set({ isRegisterModalOpen: false }),

  toggleCartDrawer: () => set(state => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
  openCartDrawer: () => set({ isCartDrawerOpen: true }),
  closeCartDrawer: () => set({ isCartDrawerOpen: false }),

  toggleMobileMenu: () => set(state => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  setGlobalLoading: (loading, text = null) => set({ globalLoading: loading, loadingText: text }),

  resetUI: () => set(initialState),
}));
