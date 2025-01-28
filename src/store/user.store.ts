import { initialStateUsuario } from "@/constants/initialStateUsuario";
import { IUsuario } from "@/interfaces/IUsuario";
import { create } from "zustand";

interface UserState {
  user: IUsuario;
  setUsuario: (user: IUsuario) => void;
}

export const userStore = create<UserState>((set) => ({
  user: initialStateUsuario,
  setUsuario: (user: IUsuario) => set({ user }),
}));
