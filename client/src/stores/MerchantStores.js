import { create } from 'zustand';
import { useCallback } from 'react';

const useStore = create((set) => ({
    chosenRestaurant: {},
    setChosenRestaurant: (chosenRestaurant) => set({ chosenRestaurant }),
}));

export const useChosenRestaurant = () => useStore(useCallback((state) => state.chosenRestaurant, []));
export const useSetChosenRestaurant = () => useStore(useCallback((state) => state.setChosenRestaurant, []));
