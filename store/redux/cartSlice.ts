import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { cartService } from '@/services/cartService';
import { CartItemResponse } from '@/types/cart';
import { resolveAssetUrl } from '@/lib/utils';
import type { RootState } from './store';

/**
 * Giỏ hàng:
 * - Khách chưa đăng nhập: lưu ở localStorage của trình duyệt.
 * - Đã đăng nhập: giỏ hàng nằm ở backend, mọi thao tác gọi API rồi tải lại.
 * - Khi đăng nhập, giỏ của khách được gộp vào giỏ trên backend.
 */
export interface CartLine {
    variantId: number;
    serverId?: number; // id dòng giỏ hàng trên backend
    productId: string;
    name: string;
    image: string | null;
    size: string;
    color: string;
    price: number;
    quantity: number;
    stock: number;
}

interface CartState {
    items: CartLine[];
    hydrated: boolean;
    syncing: boolean;
}

const GUEST_KEY = 'pf:guest-cart';

const readGuest = (): CartLine[] => {
    try {
        const raw = localStorage.getItem(GUEST_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeGuest = (items: CartLine[]) => {
    try {
        localStorage.setItem(GUEST_KEY, JSON.stringify(items));
    } catch {
        // bỏ qua nếu trình duyệt chặn storage
    }
};

const fromServer = (r: CartItemResponse): CartLine => ({
    variantId: r.variantId,
    serverId: r.id,
    productId: r.productId,
    name: r.productName,
    image: resolveAssetUrl(r.primaryImageUrl),
    size: r.size,
    color: r.color,
    price: r.unitPrice,
    quantity: r.quantity,
    stock: r.stockQuantity,
});

const isAuthed = (getState: () => unknown) => (getState() as RootState).auth.isAuthenticated;

export const fetchServerCart = createAsyncThunk('cart/fetchServer', async () => {
    const res = await cartService.getCart();
    return (res.data || []).map(fromServer);
});

export const addToCart = createAsyncThunk(
    'cart/add',
    async (line: CartLine, { getState, dispatch }) => {
        if (isAuthed(getState)) {
            await cartService.addToCart({ variantId: line.variantId, quantity: line.quantity });
            await dispatch(fetchServerCart());
            return null;
        }
        return line;
    }
);

export const updateCartQuantity = createAsyncThunk(
    'cart/update',
    async ({ variantId, quantity }: { variantId: number; quantity: number }, { getState, dispatch }) => {
        const state = getState() as RootState;
        if (isAuthed(getState)) {
            const line = state.cart.items.find((i) => i.variantId === variantId);
            if (line?.serverId) {
                await cartService.updateCartItem(line.serverId, quantity);
                await dispatch(fetchServerCart());
            }
            return null;
        }
        return { variantId, quantity };
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/remove',
    async (variantId: number, { getState, dispatch }) => {
        const state = getState() as RootState;
        if (isAuthed(getState)) {
            const line = state.cart.items.find((i) => i.variantId === variantId);
            if (line?.serverId) {
                await cartService.removeCartItem(line.serverId);
                await dispatch(fetchServerCart());
            }
            return null;
        }
        return variantId;
    }
);

/** Sau khi đăng nhập: đẩy giỏ hàng khách lên backend rồi tải lại giỏ hàng hợp nhất */
export const mergeGuestCart = createAsyncThunk('cart/mergeGuest', async (_, { dispatch }) => {
    const guest = readGuest();
    for (const line of guest) {
        try {
            await cartService.addToCart({ variantId: line.variantId, quantity: line.quantity });
        } catch {
            // Sản phẩm hết hàng/không còn bán: bỏ qua dòng này
        }
    }
    writeGuest([]);
    await dispatch(fetchServerCart());
});

const cartSlice = createSlice({
    name: 'cart',
    initialState: { items: [], hydrated: false, syncing: false } as CartState,
    reducers: {
        hydrateGuestCart: (state) => {
            state.items = readGuest();
            state.hydrated = true;
        },
        /** Dùng khi đăng xuất hoặc sau khi đặt hàng thành công */
        resetCart: (state) => {
            state.items = [];
            writeGuest([]);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServerCart.pending, (state) => {
                state.syncing = true;
            })
            .addCase(fetchServerCart.fulfilled, (state, action) => {
                state.items = action.payload;
                state.hydrated = true;
                state.syncing = false;
            })
            .addCase(fetchServerCart.rejected, (state) => {
                state.syncing = false;
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                const line = action.payload;
                if (!line) return;
                const existing = state.items.find((i) => i.variantId === line.variantId);
                if (existing) {
                    existing.quantity = Math.min(existing.quantity + line.quantity, line.stock || Infinity);
                } else {
                    state.items.unshift(line);
                }
                writeGuest(state.items);
            })
            .addCase(updateCartQuantity.fulfilled, (state, action) => {
                const p = action.payload;
                if (!p) return;
                const line = state.items.find((i) => i.variantId === p.variantId);
                if (line) line.quantity = Math.max(1, Math.min(p.quantity, line.stock || p.quantity));
                writeGuest(state.items);
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                if (action.payload == null) return;
                state.items = state.items.filter((i) => i.variantId !== action.payload);
                writeGuest(state.items);
            });
    },
});

export const { hydrateGuestCart, resetCart } = cartSlice.actions;

export const selectCartCount = (s: RootState) => s.cart.items.reduce((n, i) => n + i.quantity, 0);
export const selectCartSubtotal = (s: RootState) => s.cart.items.reduce((n, i) => n + i.price * i.quantity, 0);

export default cartSlice.reducer;
