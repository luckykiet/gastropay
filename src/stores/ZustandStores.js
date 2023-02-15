import { nanoid } from 'nanoid';
import { create } from 'zustand';

const useStore = create((set) => ({
    settings: {}, setSettings: (settings) => set(() => ({ settings })),
    isSidebarShowed: false, setIsSidebarShowed: (isSidebarShowed) => set(() => ({ isSidebarShowed })),
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
    decrementCartItem: (id) => set((state) => {
        const newCartItems = [...state.cartItems];
        const index = newCartItems.findIndex((i) => i.id === id);
        newCartItems[index].quantity -= 1;
        if (!newCartItems[index].quantity) {
            newCartItems.splice(index, 1);
        }
        return { cartItems: newCartItems };
    }),
    incrementCartItem: (id) => set((state) => {
        const newCartItems = [...state.cartItems];
        const index = newCartItems.findIndex((i) => i.id === id);
        newCartItems[index].quantity += 1;
        return { cartItems: newCartItems };
    }),
    removeCartItem: (id) => set((state) => {
        const newCartItems = [...state.cartItems];
        const index = newCartItems.findIndex((i) => i.id === id);
        newCartItems.splice(index, 1);
        return { cartItems: newCartItems };
    }),
}));

export const useCartItems = () => useStore((state) => state.cartItems);
export const useAddToCartItem = () => useStore((state) => state.addToCartItem);
export const useRemoveCartItem = () => useStore((state) => state.removeCartItem);
export const useDecrementCartItem = () => useStore((state) => state.decrementCartItem);
export const useIncrementCartItem = () => useStore((state) => state.incrementCartItem);

export const useSettings = () => useStore((state) => state.settings);
export const useSetSettings = () => useStore((state) => state.setSettings);

export const useIsSidebarShowed = () => useStore((state) => state.isSidebarShowed);
export const useSetIsSidebarShowed = () => useStore((state) => state.setIsSidebarShowed);
