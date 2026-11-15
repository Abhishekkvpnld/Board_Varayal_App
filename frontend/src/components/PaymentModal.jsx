import React, { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle2, Clock, Copy, AlertCircle, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function PaymentModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const [tab, setTab] = useState('deposit'); // 'deposit' or 'history'
  const [amount, setAmount] = useState(100);
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [payments, setPayments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const UPI_ID = 'varayal.games@upi';
  const PRESET_AMOUNTS = [50, 100, 200, 500, 1000];

  useEffect(() => {
    if (isOpen && tab === 'history') {
      fetchPaymentHistory();
    }
  }, [isOpen, tab]);

  useEffect(() => {
    if (!socket) return;
    const handlePaymentVerified = (data) => {
      refreshUser();
      if (tab === 'history') fetchPaymentHistory();
    };
    socket.on('PAYMENT_VERIFIED', handlePaymentVerified);
    return () => socket.off('PAYMENT_VERIFIED', handlePaymentVerified);
  }, [socket, tab]);

  const fetchPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/payments/my');
      setPayments(res.payments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.trim().length < 8) {
      setMessage({ type: 'error', text: 'Please enter a valid 12-digit Banking UTR reference.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const res = await api.post('/payments/submit', {
        amount: Number(amount),
        utrNumber: utrNumber.trim().toUpperCase(),
        payerUpiId: payerUpiId.trim(),
        paymentMethod: 'UPI',
        purpose: 'WALLET_RECHARGE'
      });

      setMessage({
        type: 'success',
        text: 'Payment request submitted! Admin will verify against banking logs and credit your wallet shortly.'
      });
      setUtrNumber('');
      setPayerUpiId('');
      fetchPaymentHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Payment submission failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-dark-850 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700/80 bg-dark-900/50">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="p-1.5 bg-brand-500/20 text-brand-400 rounded-lg">
                <Shield className="w-5 h-5" />
              </span>
              Wallet & UPI Recharge
            </h2>
            <p className="text-xs text-slate-400">Current Balance: <strong className="text-emerald-400">₹{user?.walletBalance || 0}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-dark-700 text-xs font-semibold">
          <button
            onClick={() => setTab('deposit')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              tab === 'deposit'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Deposit via UPI
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-3 text-center transition border-b-2 ${
              tab === 'history'
                ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Verification History
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {message && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                message.type === 'success'
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {tab === 'deposit' ? (
            <>
              {/* UPI Card */}
              <div className="bg-dark-900 border border-dark-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Official UPI Address</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Merchant
                  </span>
                </div>
                <div className="flex items-center justify-between bg-dark-800 px-3.5 py-2.5 rounded-lg border border-dark-700">
                  <span className="font-mono text-sm text-brand-300 font-bold tracking-wider">{UPI_ID}</span>
                  <button
                    onClick={handleCopyUpi}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 rounded font-medium transition"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Pay via Google Pay, PhonePe, Paytm, BHIM, or any UPI app to the address above, then paste the 12-digit UTR below.
                </p>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Select Recharge Amount</label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt)}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        amount === amt
                          ? 'border-brand-500 bg-brand-500/20 text-brand-400 shadow-sm'
                          : 'border-dark-700 bg-dark-900 text-slate-300 hover:border-dark-600'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="pt-1">
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    placeholder="Custom amount (₹)"
                  />
                </div>
              </div>

              {/* UTR Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>12-Digit Banking UTR / Ref Number <span className="text-brand-400">*</span></span>
                    <span className="text-[11px] text-slate-500">Found on receipt</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="20"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 431289123456"
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Your UPI ID (Optional)</label>
                  <input
                    type="text"
                    value={payerUpiId}
                    onChange={(e) => setPayerUpiId(e.target.value)}
                    placeholder="e.g. user@okaxis"
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Admin Verification <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Recent Deposit Submissions</span>
                <button
                  onClick={fetchPaymentHistory}
                  className="flex items-center gap-1 text-brand-400 hover:text-brand-300"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {historyLoading ? (
                <div className="py-8 text-center text-xs text-slate-500">Loading transactions...</div>
              ) : payments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-dark-700 rounded-xl">
                  No payment verification requests submitted yet.
                </div>
              ) : (
                payments.map((p) => (
                  <div
                    key={p._id}
                    className="bg-dark-900 border border-dark-700/80 rounded-xl p-3.5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">₹{p.amount}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            p.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="font-mono text-slate-400 text-[11px]">UTR: {p.utrNumber}</p>
                      <p className="text-[10px] text-slate-500">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="text-right">
                      {p.status === 'approved' && (
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Credited</span>
                        </div>
                      )}
                      {p.status === 'pending' && (
                        <div className="flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="w-4 h-4 animate-pulse" />
                          <span>Reviewing</span>
                        </div>
                      )}
                      {p.status === 'rejected' && (
                        <span className="text-rose-400 text-[11px] block max-w-[120px] truncate" title={p.adminNotes}>
                          {p.adminNotes || 'Declined'}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

