import { nanoid } from 'nanoid';
import { create } from 'zustand';

const useStore = create((set) => ({
    settings: {}, setSettings: (settings) => set(() => ({ settings })),
    cartItems: [], addToCartItem: (item, quantity) => set((state) => {
        const newCartItems = [...state.cartItems];
        const existingItemIndex = newCartItems.findIndex((i) => i.ean === item.ean);
        if (existingItemIndex >= 0) {
            newCartItems[existingItemIndex].quantity += quantity || 1;
        } else {
            newCartItems.push({ id: nanoid(), ean: item.ean, name: item.name, price: item.price, quantity: quantity || 1 });
        }
        return { cartItems: newCartItems };
    }),
}));

export const useCartItems = () => useStore((state) => state.cartItems);
export const useAddToCartItem = () => useStore((state) => state.addToCartItem);

export const useSettings = () => useStore((state) => state.settings);
export const useSetSettings = () => useStore((state) => state.setSettings);
