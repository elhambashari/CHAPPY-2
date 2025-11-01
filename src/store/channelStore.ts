
import { create } from "zustand";

interface Channel {
  name: string;
  locked: boolean;
}

interface ChannelState {
  channels: Channel[];
  currentChannel: string | null;
  setChannels: (channels: Channel[]) => void;
  setCurrentChannel: (name: string) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  channels: [
    { name: "#code", locked: false },
    { name: "#random", locked: false },
    { name: "#group1", locked: true },
    { name: "#group2", locked: true },
  ],
  currentChannel: null,
  setChannels: (channels) => set({ channels }),
  setCurrentChannel: (name) => set({ currentChannel: name }),
}));
