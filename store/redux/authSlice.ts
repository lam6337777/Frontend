import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/auth';
import { authService } from '@/services/authService';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthChecked: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isAuthChecked: false,
    error: null,
};

export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await authService.register(data);
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Register failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/login',
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await authService.login(data);
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const getMe = createAsyncThunk(
    'auth/me',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authService.getMe();
            if (response.success) return response.data;
            return rejectWithValue(response.message);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            authService.logout();
        },
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        setAuthChecked: (state, action: PayloadAction<boolean>) => {
            state.isAuthChecked = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                // Lưu token vào localStorage nếu có
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                // Lưu token vào localStorage nếu có
                if (action.payload.token) {
                    localStorage.setItem('token', action.payload.token);
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Get Me
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action: PayloadAction<User>) => {
                state.isLoading = false;
                state.isAuthChecked = true;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(getMe.rejected, (state) => {
                state.isLoading = false;
                state.isAuthChecked = true;
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { logout, clearError, updateUser, setAuthChecked } = authSlice.actions;
export default authSlice.reducer;
