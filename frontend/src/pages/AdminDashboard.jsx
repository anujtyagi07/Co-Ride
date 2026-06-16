import { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Loader, Modal } from '../components/common'
import {
  fetchStats, fetchUsers, fetchUserDetail, fetchPendingDrivers,
  fetchAllTrips, fetchAllBookings, fetchWalletTransactions,
  updateUserRole, verifyStudentUser, toggleSuspendUser, deleteUser,
  approveDriver, rejectDriver,
  cancelAdminTrip, cancelAdminBooking,
  adminAddMoney, adminVerifyStudent, adminVerifyDriver,
  clearUserDetail,
} from '../store/slices/adminSlice'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS    = { ADMIN:'bg-red-100 text-red-800', DRIVER:'bg-blue-100 text-blue-800', USER:'bg-gray-100 text-gray-800' }
const BOOKING_COLORS = { PENDING:'bg-yellow-100 text-yellow-800', CONFIRMED:'bg-blue-100 text-blue-800', IN_PROGRESS:'bg-purple-100 text-purple-800', COMPLETED:'bg-green-100 text-green-800', CANCELLED:'bg-red-100 text-red-800' }
const TRIP_COLORS    = { ACTIVE:'bg-green-100 text-green-800', COMPLETED:'bg-blue-100 text-blue-800', CANCELLED:'bg-red-100 text-red-800' }
const DRIVER_STATUS_COLORS = { PENDING:'bg-yellow-100 text-yellow-800', APPROVED:'bg-green-100 text-green-800', REJECTED:'bg-red-100 text-red-800' }

const fmt    = (n) => Number(n || 0).toLocaleString('en-IN')
const fmtRs  = (n) => `₹${fmt(n)}`
const fmtDate= (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' }) : '—'

function Badge({ label, color }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>
}

function Pagination({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <span className="text-sm text-gray-500">Page {meta.page} of {meta.pages} · {fmt(meta.total)} total</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={meta.page >= meta.pages} onClick={() => onPage(meta.page + 1)}>Next</Button>
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'text-gray-800', sub }) {
  return (
    <Card className="text-center py-5">
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </Card>
  )
}

// ─── Cancel/Reason Modal Helper ───────────────────────────────────────────────

function CancelModal({ isOpen, onClose, title, description, onConfirm, confirmLabel = 'Confirm Cancel', confirmVariant = 'danger' }) {
  const [reason, setReason] = useState('')
  const handleConfirm = () => { onConfirm(reason); setReason('') }
  const handleClose   = () => { setReason(''); onClose() }
  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{description}</p>
        <textarea
          placeholder="Reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="input-field w-full h-24 resize-none"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>Back</Button>
          <Button variant={confirmVariant} onClick={handleConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Add Money Modal ──────────────────────────────────────────────────────────

function AddMoneyModal({ user, isOpen, onClose }) {
  const dispatch = useDispatch()
  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]     = useState('')

  const PRESETS = [50, 100, 200, 500, 1000, 2000]

  const handleAdd = async () => {
    const parsed = Number(amount)
    if (!parsed || parsed <= 0) { setError('Enter a valid amount'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await dispatch(adminAddMoney({ userId: user._id, amount: parsed, note })).unwrap()
      setSuccess(`✓ ${res.data?.name}'s wallet updated to ₹${Number(res.data?.newBalance).toLocaleString('en-IN')}`)
      setAmount(''); setNote('')
    } catch (e) { setError(e) }
    setLoading(false)
  }

  const handleClose = () => { setAmount(''); setNote(''); setSuccess(''); setError(''); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Test Money to Wallet">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-800">{user?.name}</div>
            <div className="text-sm text-gray-500">{user?.email}</div>
            <div className="text-sm font-semibold text-green-700">Current balance: {fmtRs(user?.walletBalance)}</div>
          </div>
        </div>

        {/* Preset buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Quick amounts</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  amount === String(p)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-400'
                }`}
              >
                ₹{p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Amount (₹)</label>
          <input
            type="number"
            min="1"
            placeholder="Enter custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {/* Optional note */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Note (optional)</label>
          <input
            type="text"
            placeholder="e.g. Testing booking flow"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field w-full"
          />
        </div>

        {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">{success}</div>}
        {error   && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>Close</Button>
          <Button onClick={handleAdd} disabled={loading || !amount}>
            {loading ? 'Adding…' : `Add ${amount ? fmtRs(Number(amount)) : 'Money'}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── User Detail Modal ────────────────────────────────────────────────────────

function UserDetailModal({ isOpen, onClose }) {
  const { userDetail, userDetailLoading } = useSelector((s) => s.admin)
  const dispatch = useDispatch()
  const [moneyModal, setMoneyModal] = useState(false)

  useEffect(() => { if (!isOpen) dispatch(clearUserDetail()) }, [isOpen, dispatch])

  const ud = userDetail
  return (
    <>
    <Modal isOpen={isOpen && !moneyModal} onClose={onClose} title="User Detail">
      {userDetailLoading && <div className="flex justify-center py-10"><Loader size="lg" /></div>}
      {ud && !userDetailLoading && (() => {
        const { user, bookings, trips, transactions, earningsSummary } = ud
        return (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Profile */}
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-xl font-bold text-primary-600">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email} {user.phone && `· ${user.phone}`}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge label={user.role} color={ROLE_COLORS[user.role]} />
                  {user.isSuspended && <Badge label="SUSPENDED" color="bg-red-200 text-red-900" />}
                  {user.isStudent && <Badge label={user.isVerified ? 'Verified Student' : 'Unverified Student'} color={user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} />}
                  {user.role === 'DRIVER' && <Badge label={`Driver: ${user.driverStatus}`} color={DRIVER_STATUS_COLORS[user.driverStatus] || 'bg-gray-100 text-gray-700'} />}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-700">{fmtRs(user.walletBalance)}</div>
                <div className="text-xs text-gray-400 mb-1">Wallet Balance</div>
                <Button variant="outline" size="sm" onClick={() => setMoneyModal(true)}>+ Add Money</Button>
              </div>
            </div>

            {/* Driver earnings summary */}
            {user.role === 'DRIVER' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-blue-700">{fmtRs(earningsSummary.totalEarned)}</div>
                  <div className="text-xs text-blue-500">Total Earned (75%)</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <div className="text-xl font-bold text-gray-700">{fmt(earningsSummary.totalRides)}</div>
                  <div className="text-xs text-gray-500">Rides Completed</div>
                </div>
              </div>
            )}

            {/* Driver documents */}
            {user.role === 'DRIVER' && user.driverDocuments && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Uploaded Documents</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(user.driverDocuments).map(([key, val]) => {
                    if (!val || (Array.isArray(val) && val.length === 0)) return null
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
                    const isUploaded = Array.isArray(val) ? val.length > 0 : !!val
                    return (
                      <div key={key} className={`p-2 rounded text-xs font-medium flex items-center gap-2 ${isUploaded ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                        <span>{isUploaded ? '✓' : '○'}</span>
                        <span>{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent bookings */}
            {bookings.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Recent Bookings ({bookings.length})</h4>
                <div className="space-y-2">
                  {bookings.slice(0, 8).map((b) => (
                    <div key={b._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{b.trip?.from} → {b.trip?.to}</span>
                        <span className="text-gray-400 text-xs ml-2">{fmtDate(b.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge label={b.status} color={BOOKING_COLORS[b.status] || 'bg-gray-100 text-gray-700'} />
                        <span className="font-semibold text-gray-700">{fmtRs(b.totalPrice)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent trips (driver) */}
            {trips.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Trips as Driver ({trips.length})</h4>
                <div className="space-y-2">
                  {trips.slice(0, 5).map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className="font-medium">{t.from} → {t.to}</span>
                        <span className="text-gray-400 text-xs ml-2">{fmtDate(t.departureTime)}</span>
                      </div>
                      <Badge label={t.status} color={TRIP_COLORS[t.status] || 'bg-gray-100 text-gray-700'} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent wallet transactions */}
            {transactions.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Wallet History ({transactions.length})</h4>
                <div className="space-y-2">
                  {transactions.slice(0, 8).map((t) => (
                    <div key={t._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <div>
                        <span className={t.type === 'CREDIT' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {t.type === 'CREDIT' ? '+' : '-'}{fmtRs(t.amount)}
                        </span>
                        <span className="text-gray-400 text-xs ml-2">{t.description}</span>
                      </div>
                      <span className="text-xs text-gray-400">{fmtDate(t.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}
    </Modal>

    {/* Add Money sub-modal rendered on top */}
    {ud && (
      <AddMoneyModal
        user={ud.user}
        isOpen={moneyModal}
        onClose={() => setMoneyModal(false)}
      />
    )}
    </>
  )
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ stats, onTabChange }) {
  if (!stats) return <div className="flex justify-center py-20"><Loader size="lg" /></div>
  const { users, trips, bookings, revenue } = stats

  return (
    <div className="space-y-8">
      {/* Alert banners */}
      <div className="space-y-2">
        {users.pendingDriverApprovals > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 cursor-pointer" onClick={() => onTabChange('drivers')}>
            <div className="flex items-center gap-3">
              <span className="text-xl">🚗</span>
              <div>
                <p className="font-medium text-blue-800">{users.pendingDriverApprovals} driver application{users.pendingDriverApprovals > 1 ? 's' : ''} awaiting review</p>
                <p className="text-sm text-blue-600">Click to review documents</p>
              </div>
            </div>
            <span className="text-blue-500">→</span>
          </div>
        )}
        {users.pendingVerifications > 0 && (
          <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 cursor-pointer" onClick={() => onTabChange('users')}>
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium text-yellow-800">{users.pendingVerifications} student verification{users.pendingVerifications > 1 ? 's' : ''} pending</p>
                <p className="text-sm text-yellow-600">Click to verify</p>
              </div>
            </div>
            <span className="text-yellow-500">→</span>
          </div>
        )}
        {users.suspended > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <span className="text-xl">🚫</span>
            <p className="text-red-800 font-medium">{users.suspended} suspended account{users.suspended > 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* Users */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Users</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label="Total" value={fmt(users.total)} color="text-primary-600" />
          <StatCard label="Passengers" value={fmt(users.passengers)} color="text-green-600" />
          <StatCard label="Drivers" value={fmt(users.drivers)} color="text-blue-600" />
          <StatCard label="Admins" value={fmt(users.admins)} color="text-red-600" />
          <StatCard label="Suspended" value={fmt(users.suspended)} color="text-red-500" />
          <StatCard label="Pending Verify" value={fmt(users.pendingVerifications)} color="text-yellow-600" />
          <StatCard label="Driver Queue" value={fmt(users.pendingDriverApprovals)} color="text-blue-500" />
        </div>
      </section>

      {/* Trips */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Trips</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={fmt(trips.total)} />
          <StatCard label="Active" value={fmt(trips.active)} color="text-green-600" />
          <StatCard label="Completed" value={fmt(trips.completed)} color="text-blue-600" />
          <StatCard label="Cancelled" value={fmt(trips.cancelled)} color="text-red-500" />
        </div>
      </section>

      {/* Bookings */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bookings</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <StatCard label="Total" value={fmt(bookings.total)} />
          <StatCard label="Pending" value={fmt(bookings.pending)} color="text-yellow-600" />
          <StatCard label="Confirmed" value={fmt(bookings.confirmed)} color="text-blue-600" />
          <StatCard label="In Progress" value={fmt(bookings.inProgress)} color="text-purple-600" />
          <StatCard label="Completed" value={fmt(bookings.completed)} color="text-green-600" />
          <StatCard label="Cancelled" value={fmt(bookings.cancelled)} color="text-red-500" />
        </div>
      </section>

      {/* Revenue */}
      <section>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="py-6 text-center bg-green-50 border-green-200">
            <div className="text-3xl font-bold text-green-700">{fmtRs(revenue.gross)}</div>
            <div className="text-sm text-green-600 mt-1">Gross Collected</div>
          </Card>
          <Card className="py-6 text-center bg-orange-50 border-orange-200">
            <div className="text-3xl font-bold text-orange-700">{fmtRs(revenue.platform)}</div>
            <div className="text-sm text-orange-600 mt-1">Platform Revenue (25%)</div>
          </Card>
          <Card className="py-6 text-center bg-blue-50 border-blue-200">
            <div className="text-3xl font-bold text-blue-700">{fmtRs(revenue.drivers)}</div>
            <div className="text-sm text-blue-600 mt-1">Driver Earnings (75%)</div>
          </Card>
        </div>
      </section>

      {/* Monthly & Top drivers */}
      <div className="grid md:grid-cols-2 gap-6">
        {revenue.monthly?.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">Monthly Revenue</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b text-gray-400"><th className="text-left py-1">Month</th><th className="text-right py-1">Platform</th><th className="text-right py-1">Gross</th></tr></thead>
              <tbody>
                {revenue.monthly.map((m) => (
                  <tr key={m.label} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 text-gray-700">{m.label}</td>
                    <td className="py-2 text-right font-semibold text-orange-700">{fmtRs(m.platformRevenue)}</td>
                    <td className="py-2 text-right text-gray-500">{fmtRs(m.grossRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {revenue.topDrivers?.length > 0 && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">Top Drivers</h3>
            <div className="space-y-3">
              {revenue.topDrivers.map((d, i) => (
                <div key={d._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <div>
                      <div className="font-medium text-sm text-gray-800">{d.driverName}</div>
                      <div className="text-xs text-gray-400">{fmt(d.totalRides)} rides</div>
                    </div>
                  </div>
                  <span className="font-semibold text-blue-700 text-sm">{fmtRs(d.totalEarnings)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
  const dispatch = useDispatch()
  const { users, usersMeta, usersLoading } = useSelector((s) => s.admin)

  const [search, setSearch]           = useState('')
  const [roleFilter, setRoleFilter]   = useState('')
  const [pendingOnly, setPendingOnly] = useState(false)
  const [suspendedOnly, setSuspendedOnly] = useState(false)

  const [roleModal, setRoleModal]         = useState(null)
  const [newRole, setNewRole]             = useState('')
  const [suspendModal, setSuspendModal]   = useState(null)
  const [deleteModal, setDeleteModal]     = useState(null)
  const [detailModal, setDetailModal]     = useState(false)
  const [moneyModal, setMoneyModal]       = useState(null)   // user object
  const [driverModal, setDriverModal]     = useState(null)   // { user, approve: bool }
  const [studentModal, setStudentModal]   = useState(null)   // { user, verify: bool }
  const [actionError, setActionError]     = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  const showError   = (msg) => { setActionError(msg);   setTimeout(() => setActionError(''),   5000) }
  const showSuccess = (msg) => { setActionSuccess(msg); setTimeout(() => setActionSuccess(''), 3000) }

  const handleVerifyStudent = async (userId, verified) => {
    try {
      await dispatch(adminVerifyStudent({ userId, verified })).unwrap()
      showSuccess(verified ? 'Student verified successfully' : 'Student verification revoked')
    } catch (e) { showError(typeof e === 'string' ? e : 'Student verification failed — check backend logs') }
  }

  const handleVerifyDriver = async (userId, approved, reason) => {
    try {
      await dispatch(adminVerifyDriver({ userId, approved, reason })).unwrap()
      showSuccess(approved ? 'Driver approved successfully' : 'Driver approval revoked')
    } catch (e) { showError(typeof e === 'string' ? e : 'Driver verification failed — check backend logs') }
  }

  const load = useCallback((page = 1) => {
    const p = { page, limit: 15 }
    if (search) p.search = search
    if (roleFilter) p.role = roleFilter
    if (pendingOnly) p.pending = 'true'
    if (suspendedOnly) p.suspended = 'true'
    dispatch(fetchUsers(p))
  }, [dispatch, search, roleFilter, pendingOnly, suspendedOnly])

  useEffect(() => { load(1) }, [load])

  const openDetail = (id) => {
    setDetailModal(true)
    dispatch(fetchUserDetail(id))
  }

  return (
    <>
      <Card>
        {/* Action feedback banners */}
        {actionSuccess && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center justify-between">
            <span>✓ {actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="ml-3 text-green-400 hover:text-green-600 font-bold">×</button>
          </div>
        )}
        {actionError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError('')} className="ml-3 text-red-400 hover:text-red-600 font-bold">×</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <input type="text" placeholder="Search name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1 min-w-[200px]" />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field w-36">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="DRIVER">Driver</option>
            <option value="ADMIN">Admin</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
            <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} className="w-4 h-4" /> Pending only
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 select-none">
            <input type="checkbox" checked={suspendedOnly} onChange={(e) => setSuspendedOnly(e.target.checked)} className="w-4 h-4" /> Suspended only
          </label>
        </div>

        {usersLoading ? (
          <div className="flex justify-center py-12"><Loader size="lg" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    {['User', 'Role', 'Status', 'Wallet', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="py-3 px-3 font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className={`border-b border-gray-100 hover:bg-gray-50 ${u.isSuspended ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-3">
                        <button className="text-left" onClick={() => openDetail(u._id)}>
                          <div className="font-medium text-primary-600 hover:underline">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                          {u.phone && <div className="text-xs text-gray-400">{u.phone}</div>}
                        </button>
                      </td>
                      <td className="py-3 px-3"><Badge label={u.role} color={ROLE_COLORS[u.role]} /></td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col gap-1">
                          {u.isSuspended && <Badge label="Suspended" color="bg-red-100 text-red-800" />}
                          {u.isStudent && <Badge label={u.isVerified ? 'Student ✓' : 'Student ⏳'} color={u.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} />}
                          {u.role === 'DRIVER' && <Badge label={`Driver: ${u.driverStatus || 'PENDING'}`} color={DRIVER_STATUS_COLORS[u.driverStatus] || DRIVER_STATUS_COLORS.PENDING} />}
                          {!u.isSuspended && !u.isStudent && u.role !== 'DRIVER' && <span className="text-gray-400 text-xs">Active</span>}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-green-700">{fmtRs(u.walletBalance)}</td>
                      <td className="py-3 px-3 text-xs text-gray-400">{fmtDate(u.createdAt)}</td>
                      <td className="py-3 px-3 min-w-[220px]">
                        {/* Row 1: verification actions */}
                        <div className="flex flex-wrap gap-1 mb-1">
                          {u.isStudent && !u.isVerified && (
                            <button
                              onClick={() => setStudentModal({ user: u, verify: true })}
                              className="px-2 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              ✓ Student
                            </button>
                          )}
                          {u.isStudent && u.isVerified && (
                            <button
                              onClick={() => setStudentModal({ user: u, verify: false })}
                              className="px-2 py-1 text-xs font-medium rounded border border-green-400 text-green-700 hover:bg-green-50 transition-colors"
                            >
                              Revoke Student
                            </button>
                          )}
                          {u.role === 'DRIVER' && u.driverStatus !== 'APPROVED' && (
                            <button
                              onClick={() => setDriverModal({ user: u, approve: true })}
                              className="px-2 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                              ✓ Driver
                            </button>
                          )}
                          {u.role === 'DRIVER' && u.driverStatus === 'APPROVED' && (
                            <button
                              onClick={() => setDriverModal({ user: u, approve: false })}
                              className="px-2 py-1 text-xs font-medium rounded border border-blue-400 text-blue-700 hover:bg-blue-50 transition-colors"
                            >
                              Revoke Driver
                            </button>
                          )}
                        </div>
                        {/* Row 2: admin actions */}
                        <div className="flex flex-wrap gap-1">
                          <Button variant="ghost" size="sm" onClick={() => { setRoleModal(u); setNewRole(u.role) }}>Role</Button>
                          <Button variant="ghost" size="sm" onClick={() => setMoneyModal(u)}>+ Money</Button>
                          <Button variant={u.isSuspended ? 'secondary' : 'outline'} size="sm" onClick={() => setSuspendModal(u)}>
                            {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteModal(u)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="text-center text-gray-400 py-8">No users found</p>}
            </div>
            <Pagination meta={usersMeta} onPage={(p) => load(p)} />
          </>
        )}
      </Card>

      {/* Role Modal */}
      <Modal isOpen={!!roleModal} onClose={() => setRoleModal(null)} title="Change Role">
        <div className="space-y-4">
          <p className="text-gray-600">Change role for <strong>{roleModal?.name}</strong></p>
          <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-field w-full">
            <option value="USER">User</option>
            <option value="DRIVER">Driver</option>
            <option value="ADMIN">Admin</option>
          </select>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setRoleModal(null)}>Cancel</Button>
            <Button onClick={() => { dispatch(updateUserRole({ userId: roleModal._id, role: newRole })); setRoleModal(null) }}>Update</Button>
          </div>
        </div>
      </Modal>

      {/* Suspend Modal */}
      <CancelModal
        isOpen={!!suspendModal}
        onClose={() => setSuspendModal(null)}
        title={suspendModal?.isSuspended ? 'Unsuspend User' : 'Suspend User'}
        description={suspendModal?.isSuspended
          ? `Re-activate account for ${suspendModal?.name}?`
          : `Suspend ${suspendModal?.name}? They will be blocked from all API calls immediately.`}
        confirmLabel={suspendModal?.isSuspended ? 'Unsuspend' : 'Suspend'}
        confirmVariant={suspendModal?.isSuspended ? 'secondary' : 'danger'}
        onConfirm={(reason) => { dispatch(toggleSuspendUser({ userId: suspendModal._id, reason })); setSuspendModal(null) }}
      />

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User">
        <div className="space-y-4">
          <p className="text-gray-600">Permanently delete <strong>{deleteModal?.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => { dispatch(deleteUser(deleteModal._id)); setDeleteModal(null) }}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Add Money Modal */}
      <AddMoneyModal
        user={moneyModal}
        isOpen={!!moneyModal}
        onClose={() => setMoneyModal(null)}
      />

      {/* Manual Student Verify Modal */}
      <CancelModal
        isOpen={!!studentModal}
        onClose={() => setStudentModal(null)}
        title={studentModal?.verify ? 'Verify Student' : 'Revoke Student Verification'}
        description={
          studentModal?.verify
            ? `Mark ${studentModal?.user?.name} as a verified student? They will gain access to student-only features.`
            : `Revoke student verification for ${studentModal?.user?.name}? They will lose student-only access.`
        }
        confirmLabel={studentModal?.verify ? '✓ Verify Student' : 'Revoke Verification'}
        confirmVariant={studentModal?.verify ? 'secondary' : 'danger'}
        onConfirm={(reason) => {
          handleVerifyStudent(studentModal.user._id, studentModal.verify)
          setStudentModal(null)
        }}
      />

      {/* Manual Driver Verify Modal */}
      <CancelModal
        isOpen={!!driverModal}
        onClose={() => setDriverModal(null)}
        title={driverModal?.approve ? 'Approve Driver' : 'Revoke Driver Approval'}
        description={
          driverModal?.approve
            ? `Manually approve ${driverModal?.user?.name} as a verified driver? This bypasses the document queue.`
            : `Revoke driver approval for ${driverModal?.user?.name}? They will no longer be able to create trips until re-approved.`
        }
        confirmLabel={driverModal?.approve ? '✓ Approve Driver' : 'Revoke Approval'}
        confirmVariant={driverModal?.approve ? 'secondary' : 'danger'}
        onConfirm={(reason) => {
          handleVerifyDriver(driverModal.user._id, driverModal.approve, reason)
          setDriverModal(null)
        }}
      />

      {/* User Detail Modal */}
      <UserDetailModal isOpen={detailModal} onClose={() => setDetailModal(false)} />
    </>
  )
}

// ─── Tab: Drivers ─────────────────────────────────────────────────────────────

function DriversTab() {
  const dispatch = useDispatch()
  const { pendingDrivers, pendingDriversMeta, driversLoading } = useSelector((s) => s.admin)
  const [rejectModal, setRejectModal] = useState(null)
  const [detailModal, setDetailModal] = useState(false)

  const load = useCallback((page = 1) => dispatch(fetchPendingDrivers({ page, limit: 10 })), [dispatch])
  useEffect(() => { load(1) }, [load])

  const openDetail = (id) => { setDetailModal(true); dispatch(fetchUserDetail(id)) }

  const DOC_LABELS = {
    aadharFront: 'Aadhaar Front', aadharBack: 'Aadhaar Back',
    drivingLicense: 'Driving Licence', vehicleRC: 'Vehicle RC',
    vehicleInsurance: 'Vehicle Insurance',
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Driver Approval Queue</h2>
          <Badge label={`${fmt(pendingDriversMeta.total)} pending`} color="bg-yellow-100 text-yellow-800" />
        </div>

        {driversLoading ? (
          <div className="flex justify-center py-12"><Loader size="lg" /></div>
        ) : (
          <>
            <div className="space-y-4">
              {pendingDrivers.map((d) => (
                <div key={d._id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <button className="text-left" onClick={() => openDetail(d._id)}>
                        <div className="font-semibold text-primary-600 hover:underline">{d.name}</div>
                        <div className="text-sm text-gray-500">{d.email} {d.phone && `· ${d.phone}`}</div>
                        <div className="text-xs text-gray-400 mt-1">Applied: {fmtDate(d.createdAt)}</div>
                      </button>

                      {/* Document checklist */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {Object.entries(DOC_LABELS).map(([key, label]) => {
                          const uploaded = !!d.driverDocuments?.[key]
                          return (
                            <span key={key} className={`text-xs px-2 py-1 rounded-full ${uploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                              {uploaded ? '✓' : '✗'} {label}
                            </span>
                          )
                        })}
                      </div>

                      {d.isStudent && (
                        <div className="mt-2 text-xs text-gray-500">
                          College: {d.collegeEmail} · {d.isVerified ? '✓ Verified Student' : '○ Unverified Student'}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => dispatch(approveDriver(d._id))}>
                        ✓ Approve
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => setRejectModal(d)}>
                        ✗ Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingDrivers.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  <div className="text-4xl mb-3">✓</div>
                  <p>No pending driver applications</p>
                </div>
              )}
            </div>
            <Pagination meta={pendingDriversMeta} onPage={(p) => load(p)} />
          </>
        )}
      </Card>

      <CancelModal
        isOpen={!!rejectModal}
        onClose={() => setRejectModal(null)}
        title="Reject Driver Application"
        description={`Reject application from ${rejectModal?.name}? Please provide a reason.`}
        confirmLabel="Reject Application"
        onConfirm={(reason) => { dispatch(rejectDriver({ driverId: rejectModal._id, reason })); setRejectModal(null) }}
      />

      <UserDetailModal isOpen={detailModal} onClose={() => setDetailModal(false)} />
    </>
  )
}

// ─── Tab: Trips ───────────────────────────────────────────────────────────────

function TripsTab() {
  const dispatch = useDispatch()
  const { trips, tripsMeta, tripsLoading } = useSelector((s) => s.admin)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [cancelModal, setCancelModal] = useState(null)

  const load = useCallback((page = 1) => {
    const p = { page, limit: 15 }
    if (search) p.search = search
    if (statusFilter) p.status = statusFilter
    if (dateFrom) p.dateFrom = dateFrom
    if (dateTo) p.dateTo = dateTo
    dispatch(fetchAllTrips(p))
  }, [dispatch, search, statusFilter, dateFrom, dateTo])

  useEffect(() => { load(1) }, [load])

  return (
    <Card>
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Search from / to city…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1 min-w-[180px]" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-36">
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-36" title="Departure from" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-36" title="Departure to" />
        {(search || statusFilter || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo('') }}>Clear</Button>
        )}
      </div>

      {tripsLoading ? (
        <div className="flex justify-center py-12"><Loader size="lg" /></div>
      ) : (
        <>
          <div className="space-y-3">
            {trips.map((trip) => (
              <div key={trip._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{trip.from} → {trip.to}</span>
                      <Badge label={trip.status} color={TRIP_COLORS[trip.status] || 'bg-gray-100 text-gray-700'} />
                    </div>
                    <div className="text-sm text-gray-500 space-y-0.5">
                      <div>Driver: <span className="font-medium text-gray-700">{trip.driver?.name}</span> · {trip.driver?.email}</div>
                      <div>Departs: {fmtDate(trip.departureTime)} · Price: {fmtRs(trip.pricePerSeat)}/seat</div>
                      <div>Seats: {trip.availableSeats}/{trip.totalSeats} available · {trip.vehicleType} {trip.vehicleName && `(${trip.vehicleName})`}</div>
                    </div>
                  </div>
                  {trip.status === 'ACTIVE' && (
                    <Button variant="danger" size="sm" onClick={() => setCancelModal(trip)}>Cancel Trip</Button>
                  )}
                </div>
              </div>
            ))}
            {trips.length === 0 && <p className="text-center text-gray-400 py-8">No trips found</p>}
          </div>
          <Pagination meta={tripsMeta} onPage={(p) => load(p)} />
        </>
      )}

      <CancelModal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Trip"
        description={`Cancel trip ${cancelModal?.from} → ${cancelModal?.to}? All active passengers will be fully refunded.`}
        onConfirm={(reason) => { dispatch(cancelAdminTrip({ tripId: cancelModal._id, reason })); setCancelModal(null) }}
      />
    </Card>
  )
}

// ─── Tab: Bookings ────────────────────────────────────────────────────────────

function BookingsTab() {
  const dispatch = useDispatch()
  const { bookings, bookingsMeta, bookingsLoading } = useSelector((s) => s.admin)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom]       = useState('')
  const [dateTo, setDateTo]           = useState('')
  const [cancelModal, setCancelModal] = useState(null)

  const load = useCallback((page = 1) => {
    const p = { page, limit: 15 }
    if (search) p.search = search
    if (statusFilter) p.status = statusFilter
    if (dateFrom) p.dateFrom = dateFrom
    if (dateTo) p.dateTo = dateTo
    dispatch(fetchAllBookings(p))
  }, [dispatch, search, statusFilter, dateFrom, dateTo])

  useEffect(() => { load(1) }, [load])

  return (
    <Card>
      <div className="flex flex-wrap gap-3 mb-5">
        <input type="text" placeholder="Search passenger name / email…" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field flex-1 min-w-[180px]" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-44">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-36" title="Booked from" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-36" title="Booked to" />
        {(search || statusFilter || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo('') }}>Clear</Button>
        )}
      </div>

      {bookingsLoading ? (
        <div className="flex justify-center py-12"><Loader size="lg" /></div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  {['Passenger', 'Trip', 'Seats', 'Total', 'Platform (25%)', 'Driver (75%)', 'Status', 'Date', ''].map((h) => (
                    <th key={h} className={`py-3 px-3 font-semibold ${h === 'Platform (25%)' ? 'text-orange-500' : h === 'Driver (75%)' ? 'text-blue-500' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-800">{b.user?.name || '—'}</div>
                      <div className="text-xs text-gray-400">{b.user?.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{b.trip?.from} → {b.trip?.to}</div>
                      <div className="text-xs text-gray-400">{fmtDate(b.trip?.departureTime)}</div>
                    </td>
                    <td className="py-3 px-3 text-center">{b.seatsBooked}</td>
                    <td className="py-3 px-3 font-semibold">{fmtRs(b.totalPrice)}</td>
                    <td className="py-3 px-3 font-semibold text-orange-700">{fmtRs(b.platformFee)}</td>
                    <td className="py-3 px-3 font-semibold text-blue-700">{fmtRs(b.driverEarnings)}</td>
                    <td className="py-3 px-3"><Badge label={b.status} color={BOOKING_COLORS[b.status] || 'bg-gray-100 text-gray-700'} /></td>
                    <td className="py-3 px-3 text-xs text-gray-400">{fmtDate(b.createdAt)}</td>
                    <td className="py-3 px-3">
                      {['PENDING', 'CONFIRMED'].includes(b.status) && (
                        <Button variant="danger" size="sm" onClick={() => setCancelModal(b)}>Cancel</Button>
                      )}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && (
                  <tr><td colSpan={9} className="text-center text-gray-400 py-8">No bookings found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination meta={bookingsMeta} onPage={(p) => load(p)} />
        </>
      )}

      <CancelModal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Booking"
        description={`Cancel booking for ${cancelModal?.user?.name} on ${cancelModal?.trip?.from} → ${cancelModal?.trip?.to}? Full refund of ${fmtRs(cancelModal?.totalPrice)} will be issued.`}
        onConfirm={(reason) => { dispatch(cancelAdminBooking({ bookingId: cancelModal._id, reason })); setCancelModal(null) }}
      />
    </Card>
  )
}

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────

function RevenueTab({ stats }) {
  if (!stats) return <div className="flex justify-center py-20"><Loader size="lg" /></div>
  const { revenue, bookings } = stats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="py-6 text-center border-2 border-orange-200 bg-orange-50">
          <div className="text-4xl font-bold text-orange-700">{fmtRs(revenue.platform)}</div>
          <div className="text-orange-600 font-medium mt-1">Platform Revenue</div>
          <div className="text-sm text-orange-400">25% of every ride</div>
        </Card>
        <Card className="py-6 text-center border-2 border-green-200 bg-green-50">
          <div className="text-4xl font-bold text-green-700">{fmtRs(revenue.gross)}</div>
          <div className="text-green-600 font-medium mt-1">Gross Collected</div>
          <div className="text-sm text-green-400">{fmt(bookings.completed)} completed rides</div>
        </Card>
        <Card className="py-6 text-center border-2 border-blue-200 bg-blue-50">
          <div className="text-4xl font-bold text-blue-700">{fmtRs(revenue.drivers)}</div>
          <div className="text-blue-600 font-medium mt-1">Driver Payouts</div>
          <div className="text-sm text-blue-400">75% credited on trip end</div>
        </Card>
      </div>

      {/* Revenue split bar */}
      <Card>
        <h3 className="font-semibold text-gray-800 mb-4">Revenue Split</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 h-8 rounded-full overflow-hidden bg-blue-200 flex">
            <div className="h-full bg-orange-500 transition-all flex items-center justify-center text-white text-xs font-bold" style={{ width: `${revenue.platformShare}%` }}>
              {revenue.platformShare}%
            </div>
            <div className="flex-1 flex items-center justify-center text-blue-800 text-xs font-bold">
              {100 - revenue.platformShare}%
            </div>
          </div>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500" /><span>Platform: {fmtRs(revenue.platform)}</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-200" /><span>Drivers: {fmtRs(revenue.drivers)}</span></div>
        </div>
      </Card>

      {/* Monthly */}
      {revenue.monthly?.length > 0 ? (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 text-gray-400">Month</th>
                  <th className="text-right py-2 px-3 text-gray-400">Rides</th>
                  <th className="text-right py-2 px-3 text-gray-400">Gross</th>
                  <th className="text-right py-2 px-3 text-orange-500">Platform</th>
                  <th className="text-right py-2 px-3 text-blue-500">Drivers</th>
                </tr>
              </thead>
              <tbody>
                {revenue.monthly.map((m) => (
                  <tr key={m.label} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-3 font-medium">{m.label}</td>
                    <td className="py-3 px-3 text-right text-gray-500">{fmt(m.bookings)}</td>
                    <td className="py-3 px-3 text-right text-gray-600">{fmtRs(m.grossRevenue)}</td>
                    <td className="py-3 px-3 text-right font-semibold text-orange-700">{fmtRs(m.platformRevenue)}</td>
                    <td className="py-3 px-3 text-right text-blue-700">{fmtRs(m.grossRevenue - m.platformRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card><p className="text-center text-gray-400 py-10">Revenue data will appear once rides are completed.</p></Card>
      )}

      {/* Top drivers */}
      {revenue.topDrivers?.length > 0 && (
        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Top Earners</h3>
          <table className="w-full text-sm">
            <thead><tr className="border-b text-gray-400"><th className="text-left py-2">#</th><th className="text-left py-2">Driver</th><th className="text-right py-2">Rides</th><th className="text-right py-2 text-blue-500">Earned (75%)</th><th className="text-right py-2 text-orange-500">Platform (25%)</th></tr></thead>
            <tbody>
              {revenue.topDrivers.map((d, i) => (
                <tr key={d._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 font-bold text-gray-400">{i + 1}</td>
                  <td className="py-3"><div className="font-medium">{d.driverName}</div><div className="text-xs text-gray-400">{d.driverEmail}</div></td>
                  <td className="py-3 text-right text-gray-500">{fmt(d.totalRides)}</td>
                  <td className="py-3 text-right font-semibold text-blue-700">{fmtRs(d.totalEarnings)}</td>
                  <td className="py-3 text-right text-orange-600">{fmtRs(Math.round(d.totalEarnings / 3))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

// ─── Tab: Wallet ──────────────────────────────────────────────────────────────

function WalletTab() {
  const dispatch = useDispatch()
  const { wallet, walletMeta, walletLoading, walletSummary } = useSelector((s) => s.admin)
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')

  const load = useCallback((page = 1) => {
    const p = { page, limit: 20 }
    if (typeFilter) p.type = typeFilter
    if (dateFrom) p.dateFrom = dateFrom
    if (dateTo) p.dateTo = dateTo
    dispatch(fetchWalletTransactions(p))
  }, [dispatch, typeFilter, dateFrom, dateTo])

  useEffect(() => { load(1) }, [load])

  const credits  = walletSummary.find((s) => s._id === 'CREDIT')
  const debits   = walletSummary.find((s) => s._id === 'DEBIT')

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="text-center py-5 bg-green-50">
          <div className="text-2xl font-bold text-green-700">{fmtRs(credits?.total)}</div>
          <div className="text-sm text-green-600">{fmt(credits?.count)} Credits</div>
        </Card>
        <Card className="text-center py-5 bg-red-50">
          <div className="text-2xl font-bold text-red-700">{fmtRs(debits?.total)}</div>
          <div className="text-sm text-red-600">{fmt(debits?.count)} Debits</div>
        </Card>
        <Card className="text-center py-5 bg-gray-50">
          <div className="text-2xl font-bold text-gray-700">{fmt(walletMeta.total)}</div>
          <div className="text-sm text-gray-500">Total Transactions</div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap gap-3 mb-5">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field w-36">
            <option value="">All Types</option>
            <option value="CREDIT">Credits</option>
            <option value="DEBIT">Debits</option>
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field w-36" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field w-36" />
          {(typeFilter || dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" onClick={() => { setTypeFilter(''); setDateFrom(''); setDateTo('') }}>Clear</Button>
          )}
        </div>

        {walletLoading ? (
          <div className="flex justify-center py-12"><Loader size="lg" /></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="py-3 px-3 text-gray-500">User</th>
                    <th className="py-3 px-3 text-gray-500">Type</th>
                    <th className="py-3 px-3 text-gray-500">Amount</th>
                    <th className="py-3 px-3 text-gray-500">Balance After</th>
                    <th className="py-3 px-3 text-gray-500">Description</th>
                    <th className="py-3 px-3 text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {wallet.map((t) => (
                    <tr key={t._id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="font-medium text-gray-800">{t.user?.name || '—'}</div>
                        <div className="text-xs text-gray-400">{t.user?.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge label={t.type} color={t.type === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} />
                      </td>
                      <td className={`py-3 px-3 font-semibold ${t.type === 'CREDIT' ? 'text-green-700' : 'text-red-700'}`}>
                        {t.type === 'CREDIT' ? '+' : '-'}{fmtRs(t.amount)}
                      </td>
                      <td className="py-3 px-3 text-gray-600">{fmtRs(t.balanceAfter)}</td>
                      <td className="py-3 px-3 text-gray-500 max-w-[200px] truncate">{t.description}</td>
                      <td className="py-3 px-3 text-xs text-gray-400">{fmtDate(t.createdAt)}</td>
                    </tr>
                  ))}
                  {wallet.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-8">No transactions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination meta={walletMeta} onPage={(p) => load(p)} />
          </>
        )}
      </Card>
    </div>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id:'overview',  label:'Overview'  },
  { id:'users',     label:'Users'     },
  { id:'drivers',   label:'Drivers'   },
  { id:'trips',     label:'Trips'     },
  { id:'bookings',  label:'Bookings'  },
  { id:'revenue',   label:'Revenue'   },
  { id:'wallet',    label:'Wallet'    },
]

function AdminDashboard() {
  const dispatch = useDispatch()
  const { stats, isLoading } = useSelector((s) => s.admin)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { dispatch(fetchStats()) }, [dispatch])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (['overview', 'revenue'].includes(tab)) dispatch(fetchStats())
  }

  const pendingVerif   = stats?.users?.pendingVerifications   ?? 0
  const pendingDrivers = stats?.users?.pendingDriverApprovals ?? 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-gray-500 text-sm">Full platform control · 25% platform / 75% driver revenue model</p>
        </div>
        <Button variant="outline" onClick={() => dispatch(fetchStats())} disabled={isLoading}>
          {isLoading ? 'Refreshing…' : '↻ Refresh'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 mb-7 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => {
          const badge = tab.id === 'users' ? pendingVerif : tab.id === 'drivers' ? pendingDrivers : 0
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative pb-4 px-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {badge > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold bg-orange-500 text-white rounded-full">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview'  && <OverviewTab  stats={stats} onTabChange={handleTabChange} />}
      {activeTab === 'users'     && <UsersTab />}
      {activeTab === 'drivers'   && <DriversTab />}
      {activeTab === 'trips'     && <TripsTab />}
      {activeTab === 'bookings'  && <BookingsTab />}
      {activeTab === 'revenue'   && <RevenueTab   stats={stats} />}
      {activeTab === 'wallet'    && <WalletTab />}
    </div>
  )
}

export default AdminDashboard
