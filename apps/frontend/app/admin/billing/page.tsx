import { useEffect, useState } from 'react';
import {
    CreditCard, TrendingUp, ArrowUpRight, Download, Filter, Search,
    DollarSign, Users, Calendar, ChevronDown, MoreVertical, Loader2
} from 'lucide-react';

export default function AdminBillingPage() {
    const [dateRange, setDateRange] = useState('This Month');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/billing/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch billing stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch billing data', error);
        } finally {
            setLoading(false);
        }
    };

    const revenueStats = stats?.revenueStats || [
        { label: 'Total Revenue', value: '₹0L', change: '0%', period: 'vs last month' },
        { label: 'Active Subscriptions', value: '0', change: '0%', period: 'vs last month' },
        { label: 'Avg Revenue/User', value: '₹0', change: '0%', period: 'vs last month' },
        { label: 'Churn Rate', value: '0%', change: '0%', period: 'vs last month' },
    ];

    const planDistribution = stats?.planDistribution || [
        { plan: 'Enterprise', count: 0, revenue: '₹0L', percentage: 0 },
        { plan: 'Growth', count: 0, revenue: '₹0L', percentage: 0 },
        { plan: 'Starter', count: 0, revenue: '₹0L', percentage: 0 },
    ];

    const recentTransactions = stats?.recentTransactions || [];

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Billing & Revenue</h1>
                    <p className="text-gray-500">Track subscriptions, payments, and revenue metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Calendar className="w-4 h-4" />
                        {dateRange}
                        <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-4 gap-6">
                {revenueStats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') || stat.change.startsWith('-0') ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                            </span>
                            <span className="text-xs text-gray-400">{stat.period}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Plan Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue by Plan</h2>
                <div className="space-y-4">
                    {planDistribution.map((plan, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-24 text-sm font-medium text-gray-900">{plan.plan}</div>
                            <div className="flex-1">
                                <div className="h-8 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${plan.plan === 'Enterprise' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                                            plan.plan === 'Growth' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                'bg-gradient-to-r from-gray-400 to-gray-500'
                                            }`}
                                        style={{ width: `${plan.percentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="w-32 text-right">
                                <p className="text-sm font-medium text-gray-900">{plan.revenue}</p>
                                <p className="text-xs text-gray-500">{plan.count} customers</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-100">
                            <th className="pb-4">Transaction ID</th>
                            <th className="pb-4">Tenant</th>
                            <th className="pb-4">Plan</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4">Date</th>
                            <th className="pb-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {recentTransactions.map((txn, i) => (
                            <tr key={i} className="text-sm">
                                <td className="py-4 font-mono text-gray-600">{txn.id}</td>
                                <td className="py-4 font-medium text-gray-900">{txn.tenant}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.plan === 'Enterprise' ? 'bg-purple-100 text-purple-700' :
                                        txn.plan === 'Growth' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {txn.plan}
                                    </span>
                                </td>
                                <td className="py-4 font-medium text-gray-900">{txn.amount}</td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${txn.status === 'success' ? 'bg-green-100 text-green-700' :
                                        txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {txn.status}
                                    </span>
                                </td>
                                <td className="py-4 text-gray-500">{txn.date}</td>
                                <td className="py-4">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
