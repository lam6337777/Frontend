import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { wishlistService } from '@/services/wishlistService';
import type { RootState } from './store';

/** Chỉ lưu danh sách ID sản phẩm yêu thích để tô trái tim trên mọi thẻ sản phẩm */
interface WishlistState {
    ids: string[];
}

export const fetchWishlistIds = createAsyncThunk('wishlist/fetchIds', async () => {
    const res = await wishlistService.getIds();
    return res.data || [];
});

/** Bật/tắt yêu thích. Cập nhật giao diện ngay, hoàn tác nếu API lỗi. */
export const toggleWishlist = createAsyncThunk(
    'wishlist/toggle',
    async (productId: string, { getState, rejectWithValue }) => {
        const liked = (getState() as RootState).wishlist.ids.includes(productId);
        try {
            if (liked) await wishlistService.remove(productId);
            else await wishlistService.add(productId);
            return { productId, liked: !liked };
        } catch (e) {
            return rejectWithValue({ productId, liked });
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: { ids: [] } as WishlistState,
    reducers: {
        clearWishlist: (state) => {
            state.ids = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlistIds.fulfilled, (state, action) => {
                state.ids = action.payload;
            })
            .addCase(toggleWishlist.pending, (state, action) => {
                const id = action.meta.arg;
                state.ids = state.ids.includes(id) ? state.ids.filter((x) => x !== id) : [id, ...state.ids];
            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                const p = action.payload as { productId: string; liked: boolean } | undefined;
                if (!p) return;
                state.ids = p.liked ? [p.productId, ...state.ids.filter((x) => x !== p.productId)] : state.ids.filter((x) => x !== p.productId);
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
