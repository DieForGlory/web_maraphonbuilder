import { create } from 'zustand';

export const useBuildStore = create((set) => ({
  shell: null,
  weapons: [],
  implants: [],

  setShell: (shell) => set({ shell }),

  addWeapon: (weapon) => set((state) => ({
    weapons: [...state.weapons, { ...weapon, selectedMods: [] }]
  })),

  removeWeapon: (weaponId) => set((state) => ({
    weapons: state.weapons.filter(w => w.id !== weaponId)
  })),

  toggleMod: (weaponId, mod) => set((state) => ({
    weapons: state.weapons.map(w => {
      if (w.id !== weaponId) return w;

      const hasMod = w.selectedMods.find(m => m.id === mod.id);
      const sameTypeMod = w.selectedMods.find(m => m.type === mod.type);

      let newMods = [...w.selectedMods];

      if (hasMod) {
        newMods = newMods.filter(m => m.id !== mod.id);
      } else {
        if (sameTypeMod) {
          newMods = newMods.filter(m => m.type !== mod.type);
        }
        newMods.push(mod);
      }

      return { ...w, selectedMods: newMods };
    })
  })),

  addImplant: (implant) => set((state) => ({
    implants: [...state.implants, implant]
  })),

  removeImplant: (implantId) => set((state) => ({
    implants: state.implants.filter(i => i.id !== implantId)
  })),

  resetBuild: () => set({ shell: null, weapons: [], implants: [] })
}));