import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import adminService from '../../services/adminService'

const initialState = {
  stats: null,
  users: [], usersMeta: { total: 0, page: 1, pages: 1 },
  userDetail: null,
  pendingDrivers: [], pendingDriversMeta: { total: 0, page: 1, pages: 1 },
  trips: [], tripsMeta: { total: 0, page: 1, pages: 1 },
  bookings: [], bookingsMeta: { total: 0, page: 1, pages: 1 },
  wallet: [], walletMeta: { total: 0, page: 1, pages: 1 }, walletSummary: [],
  isLoading: false,
  usersLoading: false, userDetailLoading: false,
  driversLoading: false,
  tripsLoading: false,
  bookingsLoading: false,
  walletLoading: false,
  error: null,
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try { return (await adminService.getStats()).data.data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (params = {}, { rejectWithValue }) => {
  try { return (await adminService.getUsers(params)).data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchUserDetail = createAsyncThunk('admin/fetchUserDetail', async (id, { rejectWithValue }) => {
  try { return (await adminService.getUserById(id)).data.data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchPendingDrivers = createAsyncThunk('admin/fetchPendingDrivers', async (params = {}, { rejectWithValue }) => {
  try { return (await adminService.getPendingDrivers(params)).data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchAllTrips = createAsyncThunk('admin/fetchAllTrips', async (params = {}, { rejectWithValue }) => {
  try { return (await adminService.getAllTrips(params)).data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchAllBookings = createAsyncThunk('admin/fetchAllBookings', async (params = {}, { rejectWithValue }) => {
  try { return (await adminService.getAllBookings(params)).data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const fetchWalletTransactions = createAsyncThunk('admin/fetchWallet', async (params = {}, { rejectWithValue }) => {
  try { return (await adminService.getWalletTransactions(params)).data }
  catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const updateUserRole = createAsyncThunk('admin/updateUserRole', async ({ userId, role }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.updateUserRole(userId, role)
    dispatch(fetchUsers({ page: getState().admin.usersMeta.page }))
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const verifyStudentUser = createAsyncThunk('admin/verifyStudent', async (userId, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.verifyStudent(userId)
    dispatch(fetchUsers({ page: getState().admin.usersMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const toggleSuspendUser = createAsyncThunk('admin/suspendUser', async ({ userId, reason }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.suspendUser(userId, reason)
    dispatch(fetchUsers({ page: getState().admin.usersMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, { rejectWithValue, dispatch }) => {
  try {
    await adminService.deleteUser(userId)
    dispatch(fetchUsers({ page: 1 }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const approveDriver = createAsyncThunk('admin/approveDriver', async (driverId, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.approveDriver(driverId)
    dispatch(fetchPendingDrivers({ page: getState().admin.pendingDriversMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const rejectDriver = createAsyncThunk('admin/rejectDriver', async ({ driverId, reason }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.rejectDriver(driverId, reason)
    dispatch(fetchPendingDrivers({ page: getState().admin.pendingDriversMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const cancelAdminTrip = createAsyncThunk('admin/cancelTrip', async ({ tripId, reason }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.cancelTrip(tripId, reason)
    dispatch(fetchAllTrips({ page: getState().admin.tripsMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const cancelAdminBooking = createAsyncThunk('admin/cancelBooking', async ({ bookingId, reason }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.cancelBooking(bookingId, reason)
    dispatch(fetchAllBookings({ page: getState().admin.bookingsMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const adminAddMoney = createAsyncThunk('admin/addMoney', async ({ userId, amount, note }, { rejectWithValue, dispatch, getState }) => {
  try {
    const res = await adminService.adminAddWalletMoney(userId, amount, note)
    // If detail modal is open for this user, refresh it
    if (getState().admin.userDetail?.user?._id === userId) {
      dispatch(fetchUserDetail(userId))
    }
    dispatch(fetchUsers({ page: getState().admin.usersMeta.page }))
    return res.data
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const adminVerifyStudent = createAsyncThunk('admin/verifyStudent2', async ({ userId, verified }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.verifyStudent(userId, verified)
    dispatch(fetchUsers({ page: getState().admin.usersMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

export const adminVerifyDriver = createAsyncThunk('admin/verifyDriver', async ({ userId, approved, reason }, { rejectWithValue, dispatch, getState }) => {
  try {
    await adminService.manualVerifyDriver(userId, approved, reason)
    dispatch(fetchUsers({ page: getState().admin.usersMeta.page }))
    dispatch(fetchStats())
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Failed') }
})

// ─── Slice ────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (s) => { s.error = null },
    clearUserDetail: (s) => { s.userDetail = null },
  },
  extraReducers: (builder) => {
    const loading = (key) => (s) => { s[key] = true }
    const done    = (key) => (s) => { s[key] = false }

    builder
      .addCase(fetchStats.pending,  loading('isLoading'))
      .addCase(fetchStats.fulfilled, (s, a) => { s.isLoading = false; s.stats = a.payload })
      .addCase(fetchStats.rejected,  (s, a) => { s.isLoading = false; s.error = a.payload })

      .addCase(fetchUsers.pending,  loading('usersLoading'))
      .addCase(fetchUsers.fulfilled, (s, a) => {
        s.usersLoading = false
        s.users = a.payload.data
        s.usersMeta = { total: a.payload.total, page: a.payload.page, pages: a.payload.pages }
      })
      .addCase(fetchUsers.rejected,  (s, a) => { s.usersLoading = false; s.error = a.payload })

      .addCase(fetchUserDetail.pending,  loading('userDetailLoading'))
      .addCase(fetchUserDetail.fulfilled, (s, a) => { s.userDetailLoading = false; s.userDetail = a.payload })
      .addCase(fetchUserDetail.rejected,  (s, a) => { s.userDetailLoading = false; s.error = a.payload })

      .addCase(fetchPendingDrivers.pending,  loading('driversLoading'))
      .addCase(fetchPendingDrivers.fulfilled, (s, a) => {
        s.driversLoading = false
        s.pendingDrivers = a.payload.data
        s.pendingDriversMeta = { total: a.payload.total, page: a.payload.page, pages: a.payload.pages }
      })
      .addCase(fetchPendingDrivers.rejected,  (s, a) => { s.driversLoading = false; s.error = a.payload })

      .addCase(fetchAllTrips.pending,  loading('tripsLoading'))
      .addCase(fetchAllTrips.fulfilled, (s, a) => {
        s.tripsLoading = false
        s.trips = a.payload.data
        s.tripsMeta = { total: a.payload.total, page: a.payload.page, pages: a.payload.pages }
      })
      .addCase(fetchAllTrips.rejected,  (s, a) => { s.tripsLoading = false; s.error = a.payload })

      .addCase(fetchAllBookings.pending,  loading('bookingsLoading'))
      .addCase(fetchAllBookings.fulfilled, (s, a) => {
        s.bookingsLoading = false
        s.bookings = a.payload.data
        s.bookingsMeta = { total: a.payload.total, page: a.payload.page, pages: a.payload.pages }
      })
      .addCase(fetchAllBookings.rejected,  (s, a) => { s.bookingsLoading = false; s.error = a.payload })

      .addCase(fetchWalletTransactions.pending,  loading('walletLoading'))
      .addCase(fetchWalletTransactions.fulfilled, (s, a) => {
        s.walletLoading = false
        s.wallet = a.payload.data
        s.walletMeta = { total: a.payload.total, page: a.payload.page, pages: a.payload.pages }
        s.walletSummary = a.payload.summary || []
      })
      .addCase(fetchWalletTransactions.rejected,  (s, a) => { s.walletLoading = false; s.error = a.payload })
  },
})

export const { clearError, clearUserDetail } = adminSlice.actions
export default adminSlice.reducer
