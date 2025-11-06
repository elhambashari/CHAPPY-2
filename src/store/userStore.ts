
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  username: string | null;
  token: string | null;
  isGuest: boolean;
  hydrated: boolean; 
  setUser: (username: string, token: string) => void;
  setGuest: (guest: boolean) => void;
  logout: () => void;
  setHydrated: (state: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: null,
      token: null,
      isGuest: false,
      hydrated: false,

      setUser: (username, token) =>
        set({ username, token, isGuest: false }),

      setGuest: (guest) =>
        set({
          username: guest ? "Guest" : null,
          token: null,
          isGuest: guest,
        }),

      logout: () => set({ username: null, token: null, isGuest: false }),

      setHydrated: (state) => set({ hydrated: state }),
    }),
    {
      name: "user-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true); 
      },
    }
  )
);
