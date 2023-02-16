import { nanoid } from 'nanoid';
import { create } from 'zustand';
import produce from 'immer';
import { useCallback } from 'react';

const useStore = create((set) => ({
    choosenRestaurant: {},
    setChoosenRestaurant: (choosenRestaurant) => set({ choosenRestaurant }),

    settings: {},
    setSettings: (settings) => set({ settings }),

    isSidebarShowed: false,
    setIsSidebarShowed: (isSidebarShowed) => set({ isSidebarShowed }),

    cartItems: [],
    setCartItem: (cartItems) => set([cartItems]),
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
export const useSetCartItems = () => useStore(useCallback((state) => state.setCartItem, []));
export const useAddToCartItem = () => useStore(useCallback((state) => state.addToCartItem, []));
export const useRemoveCartItem = () => useStore(useCallback((state) => state.removeCartItem, []));
export const useDecrementCartItem = () => useStore(useCallback((state) => state.decrementCartItem, []));
export const useIncrementCartItem = () => useStore(useCallback((state) => state.incrementCartItem, []));

export const useSettings = () => useStore(useCallback((state) => state.settings, []));
export const useSetSettings = () => useStore(useCallback((state) => state.setSettings, []));

export const useChoosenRestaurant = () => useStore(useCallback((state) => state.choosenRestaurant, []));
export const useSetChoosenRestaurant = () => useStore(useCallback((state) => state.setChoosenRestaurant, []));

export const useIsSidebarShowed = () => useStore(useCallback((state) => state.isSidebarShowed, []));
export const useSetIsSidebarShowed = () => useStore(useCallback((state) => state.setIsSidebarShowed, []));