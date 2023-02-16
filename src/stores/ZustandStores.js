import { nanoid } from 'nanoid';
import { create } from 'zustand';
import produce from 'immer';
import { useCallback } from 'react';

const useStore = create((set) => ({
    choosedRestaurant: {},
    setChoosedRestaurant: (restaurant) => set({ restaurant }),

    settings: {},
    setSettings: (settings) => set({ settings }),

    isSidebarShowed: false,
    setIsSidebarShowed: (isSidebarShowed) => set({ isSidebarShowed }),

    cartItems: [],
    addToCartItem: (item, quantity) =>
        set(
            produce((state) => {
                const existingItemIndex = state.cartItems.findIndex((i) => i.ean === item.ean);
                if (existingItemIndex >= 0) {
                    state.cartItems[existingItemIndex].quantity += quantity || 1;
                } else {
                    state.cartItems.push({
                        id: nanoid(),
                        ean: item.ean,
                        name: item.name,
                        price: item.price,
                        quantity: quantity || 1,
                    });
                }
            })
        ),
    decrementCartItem: (id) =>
        set(
            produce((state) => {
                const index = state.cartItems.findIndex((i) => i.id === id);
                state.cartItems[index].quantity -= 1;
                if (!state.cartItems[index].quantity) {
                    state.cartItems.splice(index, 1);
                }
            })
        ),
    incrementCartItem: (id) =>
        set(
            produce((state) => {
                const index = state.cartItems.findIndex((i) => i.id === id);
                state.cartItems[index].quantity += 1;
            })
        ),
    removeCartItem: (id) =>
        set(
            produce((state) => {
                const index = state.cartItems.findIndex((i) => i.id === id);
                state.cartItems.splice(index, 1);
            })
        ),
}));

// Memoized selectors
export const useCartItems = () => useStore(useCallback((state) => state.cartItems, []));
export const useAddToCartItem = () => useStore(useCallback((state) => state.addToCartItem, []));
export const useRemoveCartItem = () => useStore(useCallback((state) => state.removeCartItem, []));
export const useDecrementCartItem = () => useStore(useCallback((state) => state.decrementCartItem, []));
export const useIncrementCartItem = () => useStore(useCallback((state) => state.incrementCartItem, []));

export const useSettings = () => useStore(useCallback((state) => state.settings, []));
export const useSetSettings = () => useStore(useCallback((state) => state.setSettings, []));

export const useChoosedRestaurant = () => useStore(useCallback((state) => state.choosedRestaurant, []));
export const useSetChoosedRestaurant = () => useStore(useCallback((state) => state.setChoosedRestaurant, []));

export const useIsSidebarShowed = () => useStore(useCallback((state) => state.isSidebarShowed, []));
export const useSetIsSidebarShowed = () => useStore(useCallback((state) => state.setIsSidebarShowed, []));