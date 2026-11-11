import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { wishlistService } from '@/services/wishlistService';

/** Chỉ lưu danh sách ID sản phẩm yêu thích để tô trái tim trên mọi thẻ sản phẩm */
interface WishlistState {
    ids: string[];
}

export const fetchWishlistIds = createAsyncThunk('wishlist/fetchIds', async () => {
    const res = await wishlistService.getIds();
    return res.data || [];
});

/**
 * Bật/tắt yêu thích. Cập nhật giao diện ngay, hoàn tác nếu API lỗi.
 * `liked` là trạng thái TRƯỚC khi bấm, do nơi gọi truyền vào: action `pending` (cập nhật lạc quan)
 * chạy trước payloadCreator, nên đọc getState() ở đây sẽ thấy trạng thái đã bị đảo và gọi nhầm API.
 */
export const toggleWishlist = createAsyncThunk(
    'wishlist/toggle',
    async ({ productId, liked }: { productId: string; liked: boolean }, { rejectWithValue }) => {
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
                const { productId: id, liked } = action.meta.arg;
                state.ids = liked ? state.ids.filter((x) => x !== id) : [id, ...state.ids.filter((x) => x !== id)];
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
