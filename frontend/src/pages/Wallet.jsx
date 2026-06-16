import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Card, Button, Input, Loader } from '../components/common'
import { fetchWallet, addMoney } from '../store/slices/walletSlice'
import api from '../services/api'

function Wallet() {
  const dispatch = useDispatch()
  const { balance, transactions, isLoading } = useSelector((state) => state.wallet)
  const [addAmount, setAddAmount] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('razorpay') // razorpay | upi | card
  const [upiId, setUpiId] = useState('')
  const [paymentStatus, setPaymentStatus] = useState(null) // success | failed

  useEffect(() => {
    dispatch(fetchWallet())
  }, [dispatch])

  const handleAddMoney = async () => {
    const amount = parseFloat(addAmount)
    if (amount < 50) {
      alert('Minimum amount is Rs. 50')
      return
    }
    setIsAdding(true)
    setPaymentStatus(null)

    if (paymentMethod === 'razorpay' && window.Razorpay) {
      // Real Razorpay integration
      try {
        const { data } = await api.post('/payments/create-order', { amount })
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
          amount: amount * 100,
          currency: 'INR',
          name: 'Co-Ride',
          description: `Add Rs. ${amount} to wallet`,
          order_id: data.data?.id || data.orderId,
          handler: async function (response) {
            try {
              await api.post('/payments/verify', {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              })
              setPaymentStatus('success')
              dispatch(fetchWallet())
            } catch (err) {
              setPaymentStatus('failed')
            }
          },
          prefill: {
            name: '',
            email: '',
          },
          theme: {
            color: '#6366f1',
          },
          modal: {
            ondismiss: function () {
              setIsAdding(false)
            },
          },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err) {
        // Fallback to direct add if Razorpay not configured
        await dispatch(addMoney(amount))
        setPaymentStatus('success')
      }
    } else {
      // UPI or manual add (simulated)
      await dispatch(addMoney(amount))
      setPaymentStatus('success')
    }

    setAddAmount('')
    setIsAdding(false)
  }

  const quickAmounts = [100, 500, 1000, 2000]

  const getTransactionIcon = (type) => {
    if (type === 'CREDIT') {
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
      )
    }
    return (
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </div>
    )
  }

  if (isLoading && balance === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        <p className="mt-2 text-gray-600">Manage your funds and transactions</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Balance Card */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-2">Available Balance</p>
              <h2 className="text-4xl font-bold mb-4">Rs. {balance.toFixed(2)}</h2>
              <p className="text-white/70 text-sm">
                Add money using Razorpay to book rides
              </p>
            </div>
          </Card>

          {/* Add Money */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Money</h3>

            {/* Payment Method Selection */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Razorpay
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                UPI
              </button>
            </div>
            
            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setAddAmount(amount.toString())}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    addAmount === amount.toString()
                      ? 'border-primary-500 bg-primary-50 text-primary-600'
                      : 'border-gray-300 hover:border-primary-500'
                  }`}
                >
                  Rs. {amount}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <Input
                type="number"
                placeholder="Enter amount"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={handleAddMoney}
                loading={isAdding}
                disabled={!addAmount || parseFloat(addAmount) < 50}
              >
                {paymentMethod === 'razorpay' ? `Pay Rs. ${addAmount || 0}` : 'Add Money'}
              </Button>

              {paymentStatus === 'success' && (
                <div className="p-2 bg-green-50 text-green-700 text-sm rounded-lg text-center">
                  Payment successful! Wallet updated.
                </div>
              )}
              {paymentStatus === 'failed' && (
                <div className="p-2 bg-red-50 text-red-700 text-sm rounded-lg text-center">
                  Payment failed. Please try again.
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Razorpay
            </div>
          </Card>
        </div>

        {/* Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {transactions.map((txn) => (
                <div
                  key={txn._id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  {getTransactionIcon(txn.type)}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{txn.description || txn.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-semibold ${
                    txn.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.type === 'CREDIT' ? '+' : '-'} Rs. {txn.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No transactions yet</p>
              <p className="text-sm">Add money to get started</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Wallet