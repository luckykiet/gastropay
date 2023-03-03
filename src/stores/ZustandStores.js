import { nanoid } from 'nanoid';
import { create } from 'zustand';
import produce from 'immer';
import { useCallback } from 'react';

const useStore = create((set) => ({
    choosenRestaurant: {},
    setChoosenRestaurant: (choosenRestaurant) => set({ choosenRestaurant }),

    settings: {},
    setSettings: (settings) => set({ settings }),

    tips: 0,
    setTips: (tips) => set({ tips }),

    tables: [],
    setTables: (tables) => set({ tables }),

    cartItems: [],
    setCartItems: (cartItems) => set({ cartItems }),
    addToCartItems: (item, quantity) =>
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
    decrementCartItems: (id) =>
        set(
            produce((state) => {
                const index = state.cartItems.findIndex((i) => i.id === id);
                state.cartItems[index].quantity -= 1;
                if (!state.cartItems[index].quantity) {
                    state.cartItems.splice(index, 1);
                }
            })
        ),
    incrementCartItems: (id) =>
        set(
            produce((state) => {
                const index = state.cartItems.findIndex((i) => i.id === id);
                state.cartItems[index].quantity += 1;
            })
        ),
    removeCartItems: (id) =>
        set(
            produce((state) => {
                const index = state.cartItems.findIndex((i) => i.id === id);
                state.cartItems.splice(index, 1);
            })
        ),
}));

export const useCartItems = () => useStore(useCallback((state) => state.cartItems, []));
export const useSetCartItems = () => useStore(useCallback((state) => state.setCartItems, []));
export const useAddToCartItem = () => useStore(useCallback((state) => state.addToCartItems, []));
export const useRemoveCartItem = () => useStore(useCallback((state) => state.removeCartItems, []));
export const useDecrementCartItem = () => useStore(useCallback((state) => state.decrementCartItems, []));
export const useIncrementCartItem = () => useStore(useCallback((state) => state.incrementCartItems, []));

export const useSettings = () => useStore(useCallback((state) => state.settings, []));
export const useSetSettings = () => useStore(useCallback((state) => state.setSettings, []));

export const useTables = () => useStore(useCallback((state) => state.tables, []));
export const useSetTables = () => useStore(useCallback((state) => state.setTables, []));

export const useChoosenRestaurant = () => useStore(useCallback((state) => state.choosenRestaurant, []));
export const useSetChoosenRestaurant = () => useStore(useCallback((state) => state.setChoosenRestaurant, []));

export const useTips = () => useStore(useCallback((state) => state.tips, []));
export const useSetTips = () => useStore(useCallback((state) => state.setTips, []));
