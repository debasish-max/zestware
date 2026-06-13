import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    TrendingUp, ShoppingBag, DollarSign,
    LayoutDashboard, Package, ArrowRight, Plus
} from 'lucide-react';
import { startOfDay, startOfWeek, startOfMonth, isAfter, parseISO } from 'date-fns';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard({ setToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });
    const [chartTimeframe, setChartTimeframe] = useState('7days'); // '7days', '30days'
    const [chartMetric, setChartMetric] = useState('earnings'); // 'earnings', 'orders'

    useEffect(() => {
        fetchOrders();

        // Subscribe to all order changes
        const channel = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new, ...prev]);
                    setToast('New Order Received!');
                } else if (payload.eventType === 'UPDATE') {
                    setOrders(prev => prev.map(order => 
                        order.id === payload.new.id ? payload.new : order
                    ));
                    setToast('Order Status Updated');
                } else if (payload.eventType === 'DELETE') {
                    setOrders(prev => prev.filter(order => order.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    useEffect(() => {
        calculateStats();
    }, [orders]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .not('user_id', 'is', null)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const now = new Date();
        const today = startOfDay(now);
        const week = startOfWeek(now);
        const month = startOfMonth(now);

        let t = 0, w = 0, m = 0, tot = 0;

        orders.filter(order => ['confirmed', 'delivered', 'out for delivery'].includes(order.status)).forEach(order => {
            const date = parseISO(order.created_at);
            const amount = parseFloat(order.total_amount);

            tot += amount;
            if (isAfter(date, today)) t += amount;
            if (isAfter(date, week)) w += amount;
            if (isAfter(date, month)) m += amount;
        });

        setStats({ today: t, week: w, month: m, total: tot });
    };

    const getChartData = () => {
        const now = new Date();
        const daysToFetch = chartTimeframe === '7days' ? 7 : 30;
        
        // Initialize an object with the last N days with 0 value
        const dailyData = {};
        for (let i = daysToFetch - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyData[dateString] = {
                date: dateString,
                earnings: 0,
                orders: 0
            };
        }

        // Fill with order data
        orders
            .filter(order => ['confirmed', 'delivered', 'out for delivery'].includes(order.status))
            .forEach(order => {
                const orderDate = parseISO(order.created_at);
                const dateString = orderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (dailyData[dateString]) {
                    dailyData[dateString].earnings += parseFloat(order.total_amount) || 0;
                    dailyData[dateString].orders += 1;
                }
            });

        return Object.values(dailyData);
    };

    const getStatusData = () => {
        const counts = {
            pending: 0,
            confirmed: 0,
            'out for delivery': 0,
            delivered: 0,
            cancelled: 0
        };

        orders.forEach(order => {
            const status = order.status || 'pending';
            if (counts[status] !== undefined) {
                counts[status] += 1;
            }
        });

        const statusConfig = {
            pending: { name: 'Pending', color: '#f59e0b' },
            confirmed: { name: 'Confirmed', color: '#10b981' },
            'out for delivery': { name: 'Out for Delivery', color: '#3b82f6' },
            delivered: { name: 'Delivered', color: '#10b981' },
            cancelled: { name: 'Cancelled', color: '#ef4444' }
        };

        return Object.keys(counts)
            .map(key => ({
                name: statusConfig[key].name,
                value: counts[key],
                color: statusConfig[key].color
            }))
            .filter(item => item.value > 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold animate-pulse text-sm uppercase tracking-widest">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa] p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            <LayoutDashboard className="text-brand" size={32} />
                            Shop Insights
                        </h1>
                        <p className="text-gray-500 mt-1 font-semibold">Welcome back, Admin</p>
                    </div>
                </div>

                {/* Stats Grid - Increased Height & Premium Design */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Today" 
                        amount={stats.today} 
                        icon={<TrendingUp className="text-green-500" size={26} />} 
                        color="bg-green-50"
                    />
                    <StatCard 
                        title="This Week" 
                        amount={stats.week} 
                        icon={<ShoppingBag className="text-brand" size={26} />} 
                        color="bg-gray-100"
                    />
                    <StatCard 
                        title="This Month" 
                        amount={stats.month} 
                        icon={<DollarSign className="text-gray-600" size={26} />} 
                        color="bg-gray-200"
                    />
                    <StatCard 
                        title="Total Earning" 
                        amount={stats.total} 
                        icon={<TrendingUp className="text-blue-500" size={26} />} 
                        color="bg-blue-50"
                    />
                </div>

                {/* Analytics Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Performance Trends Chart (2/3 width) */}
                    <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Performance Analytics</h3>
                                <p className="text-sm text-gray-400 mt-1 font-semibold">
                                    {chartMetric === 'earnings' ? 'Store revenue trends' : 'Store order volume trends'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-center">
                                {/* Metric Selector */}
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setChartMetric('earnings')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            chartMetric === 'earnings'
                                                ? 'bg-white text-gray-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Revenue
                                    </button>
                                    <button
                                        onClick={() => setChartMetric('orders')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            chartMetric === 'orders'
                                                ? 'bg-white text-gray-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        Orders
                                    </button>
                                </div>

                                {/* Timeframe Selector */}
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button
                                        onClick={() => setChartTimeframe('7days')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            chartTimeframe === '7days'
                                                ? 'bg-white text-gray-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        7D
                                    </button>
                                    <button
                                        onClick={() => setChartTimeframe('30days')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            chartTimeframe === '30days'
                                                ? 'bg-white text-gray-800 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                    >
                                        30D
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }}
                                        tickFormatter={(val) => chartMetric === 'earnings' ? `₹${val}` : val}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#ffffff',
                                            border: '1px solid #f3f4f6',
                                            borderRadius: '16px',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}
                                        formatter={(value) => [
                                            chartMetric === 'earnings' ? `₹${value.toLocaleString()}` : `${value} orders`,
                                            chartMetric === 'earnings' ? 'Revenue' : 'Orders'
                                        ]}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey={chartMetric} 
                                        stroke="#000000" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#chartGradient)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Order Status Breakdown (1/3 width) */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Order Status</h3>
                            <p className="text-sm text-gray-400 mt-1 font-semibold">Real-time status breakdown</p>
                        </div>

                        {getStatusData().length > 0 ? (
                            <div className="relative h-56 w-full flex items-center justify-center my-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getStatusData()}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {getStatusData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{
                                                background: '#ffffff',
                                                border: '1px solid #f3f4f6',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-gray-800">{orders.length}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Orders</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-56 text-gray-400 my-4">
                                <Package size={40} className="mb-2 stroke-1" />
                                <p className="text-xs font-semibold">No order data available</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {getStatusData().map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs font-bold text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="bg-gray-50 px-2 py-0.5 rounded-md text-gray-800 font-extrabold">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-12 hover:shadow-xl hover:shadow-brand/5 transition-all">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Package size={40} className="text-brand" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Management</h2>
                        <p className="text-gray-500 max-w-sm">View, confirm, and track all customer orders in one place.</p>
                        <Link to="/admin/orders" className="mt-8 px-8 py-3 bg-brand text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-900 transition-all shadow-lg shadow-brand/20 active:scale-95">
                            Go to Orders
                            <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center py-12 hover:shadow-xl hover:shadow-brand/5 transition-all">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ShoppingBag size={40} className="text-brand" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product Management</h2>
                        <p className="text-gray-500 max-w-sm">Add new items, update prices, and manage your clothing collection.</p>
                        <Link to="/admin/products" className="mt-8 px-8 py-3 bg-brand text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-900 transition-all shadow-lg shadow-brand/20 active:scale-95">
                            Add Products
                            <Plus size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, amount, icon, color }) {
    return (
        <div className="bg-white p-8 h-40 rounded-[2.2rem] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-xl hover:shadow-brand/5 transition-all duration-300">
            <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-[1.2rem] ${color} flex items-center justify-center shrink-0 shadow-inner`}>
                    {icon}
                </div>
                <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">{title}</p>
                    <p className="text-3xl font-black text-gray-950 leading-none">₹{amount.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}

