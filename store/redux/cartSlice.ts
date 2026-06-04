import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
    id: string; // SKU
    variantId: number;
    name: string;
    price: number;
    brand: string;
    size: string;
    quantity: number;
    image?: string | null;
}

interface CartState {
    items: CartItem[];
}

// Hàm tải dữ liệu từ sessionStorage
const loadState = (): CartState => {
    try {
        if (typeof window === 'undefined') return { items: [] };
        const serializedState = sessionStorage.getItem('cart');
        if (serializedState === null) {
            return { items: [] };
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return { items: [] };
    }
};

// Hàm lưu dữ liệu vào sessionStorage
const saveState = (state: CartState) => {
    try {
        if (typeof window === 'undefined') return;
        const serializedState = JSON.stringify(state);
        sessionStorage.setItem('cart', serializedState);
    } catch (err) {
        console.error('Không thể lưu giỏ hàng:', err);
    }
};

const initialState: CartState = loadState();

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find(
                item => item.id === action.payload.id && item.size === action.payload.size
            );
            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }
            saveState(state); // Lưu lại sau khi thêm
        },
        removeItem: (state, action: PayloadAction<{ id: number | string; size: string }>) => {
            state.items = state.items.filter(
                item => !(item.id === action.payload.id && item.size === action.payload.size)
            );
            saveState(state); // Lưu lại sau khi xóa
        },
        updateQuantity: (
            state,
            action: PayloadAction<{ id: number | string; size: string; quantity: number }>
        ) => {
            const item = state.items.find(
                i => i.id === action.payload.id && i.size === action.payload.size
            );
            if (item) {
                item.quantity = action.payload.quantity;
            }
            saveState(state); // Lưu lại sau khi cập nhật
        },
        clearCart: (state) => {
            state.items = [];
            saveState(state); // Lưu lại sau khi xóa sạch
        },
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
            saveState(state);
        },
    },
});

export const { addItem, removeItem, updateQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;

