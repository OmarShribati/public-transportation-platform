import React, { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { MerchantsAPI } from './api';

export const Details = () => {
  const { id } = useParams({ strict: false });
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const merchantId = id || 7;
    fetchCardDetails(merchantId);
  }, [id]);

  const fetchCardDetails = async (merchantId: string | number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await MerchantsAPI.view(merchantId);
      setData(response);
    } catch (err: any) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#08090a]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-400 text-base">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#08090a] px-6">
        <p className="text-red-400 text-lg font-bold text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen bg-[#08090a] text-white">
      <div className="bg-[#111214] p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            {data?.merchant_name || 'Merchant Name'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Merchant ID: <span className="text-emerald-400 font-mono">#{data?.merchant_id}</span></p>
        </div>
        <div className="bg-emerald-500/10 px-5 py-3 rounded-2xl border border-emerald-500/20 text-left w-full sm:w-auto">
          <span className="text-xs text-emerald-400 block font-medium uppercase tracking-wider">Total Transactions</span>
          <span className="text-2xl font-black text-emerald-400">{data?.total_transactions ?? 0}</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-300 mb-6">Transaction History</h2>

      <div className="space-y-4">
        {data?.transactions && data.transactions.length > 0 ? (
          data.transactions.map((tx: any) => (
            <div 
              key={tx.transaction_id} 
              className="bg-[#111214] p-6 rounded-3xl border border-white/5 shadow-xl hover:border-emerald-500/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/20 uppercase tracking-wide">
                    {tx.type}
                  </span>
                  <span className="text-gray-500 text-xs font-mono">Tx #{tx.transaction_id}</span>
                </div>
                <p className="text-white font-bold text-lg mt-2">
                  Card Number: <span className="font-mono text-emerald-400">{tx.card_number}</span>
                </p>
                <p className="text-gray-300 text-sm">
                  Passenger: <span className="font-semibold text-white">{tx.passenger_name}</span> <span className="text-gray-500">({tx.passenger_email})</span>
                </p>
                <p className="text-gray-500 text-xs">
                  Date: {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>

              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 w-full md:w-auto min-w-[220px] text-left space-y-2">
                <div className="flex justify-between md:justify-between gap-6">
                  <span className="text-gray-400 text-sm">Amount Added:</span>
                  <span className="font-black text-emerald-400">+{tx.amount}</span>
                </div>
                <div className="flex justify-between md:justify-between gap-6 text-xs text-gray-400">
                  <span>Balance Before:</span>
                  <span>{tx.balance_before}</span>
                </div>
                <div className="flex justify-between md:justify-between gap-6 text-xs text-gray-400">
                  <span>Balance After:</span>
                  <span className="font-semibold text-gray-200">{tx.balance_after}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#111214] p-12 rounded-3xl border border-white/5 text-center text-gray-500 shadow-xl">
            No transactions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};