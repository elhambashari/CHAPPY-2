
import { create } from "zustand";

interface UserState {
  username: string | null;
  token: string | null;
  setUser: (username: string, token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: null,
  token: null,
  setUser: (username, token) => set({ username, token }),
  logout: () => set({ username: null, token: null }),
}));
