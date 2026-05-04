'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Transaction {
    _id: string;
    type: 'tip' | 'withdrawal' | 'refund' | 'bonus';
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    from: { _id: string; username: string };
    to: { _id: string; username: string };
    video?: { title: string };
    createdAt: string;
}

interface WalletData {
    userId: string;
    username: string;
    wallet: {
        balance: number;
        pendingBalance: number;
        totalEarnings: number;
        currency: string;
    };
}

export const CreatorBalance: React.FC<{ userId: string }> = ({ userId }) => {
    const { user } = useAuth();
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'tip'>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [balanceRes, historyRes] = await Promise.all([
                    api.get(`/payments/balance/${userId}`),
                    api.get(`/payments/history?type=${filter}`).catch(() => ({ data: { transactions: [] } }))
                ]);

                setWalletData(balanceRes.data);
                setTransactions(historyRes.data.transactions || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load balance data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, filter]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (error || !walletData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-red-500">{error || 'Failed to load wallet'}</div>
            </div>
        );
    }

    const isOwnWallet = user?._id === userId;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {isOwnWallet ? 'My Earnings' : `${walletData.username}'s Earnings`}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Track your tips and earnings
                    </p>
                </div>

                {/* Wallet Cards */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    {/* Total Earnings Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                            Total Earnings
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            ${walletData.wallet.totalEarnings.toFixed(2)}
                        </p>
                    </div>

                    {/* Available Balance Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                            Available Balance
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            ${walletData.wallet.balance.toFixed(2)}
                        </p>
                    </div>

                    {/* Pending Balance Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                        <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                            Pending Balance
                        </h3>
                        <p className="text-3xl font-bold text-amber-600">
                            ${walletData.wallet.pendingBalance.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Withdraw Button */}
                {isOwnWallet && walletData.wallet.balance > 0 && (
                    <div className="mb-8">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all">
                            Withdraw Earnings
                        </button>
                    </div>
                )}

                {/* Transactions Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {/* Filter Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setFilter('all')}
                                className={`pb-2 px-4 font-medium transition-all ${
                                    filter === 'all'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                All Transactions
                            </button>
                            <button
                                onClick={() => setFilter('tip')}
                                className={`pb-2 px-4 font-medium transition-all ${
                                    filter === 'tip'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                            >
                                Tips
                            </button>
                        </div>
                    </div>

                    {/* Table Content */}
                    {transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            From/To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Video
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                {user?._id === tx.to._id ? `From ${tx.from.username}` : `To ${tx.to.username}`}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {tx.video?.title || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                ${tx.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    tx.status === 'completed'
                                                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                        : tx.status === 'pending'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            No transactions yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
