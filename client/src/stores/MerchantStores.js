import { create } from 'zustand';
import { useCallback } from 'react';

const useStore = create((set) => ({
    choosenRestaurant: {},
    setChoosenRestaurant: (choosenRestaurant) => set({ choosenRestaurant }),
}));

export const useChoosenRestaurant = () => useStore(useCallback((state) => state.choosenRestaurant, []));
export const useSetChoosenRestaurant = () => useStore(useCallback((state) => state.setChoosenRestaurant, []));
