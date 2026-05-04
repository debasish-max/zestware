import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    TrendingUp, ShoppingBag, DollarSign, Clock,
    LayoutDashboard, Package, LogOut, ArrowRight, Plus
} from 'lucide-react';
import { startOfDay, startOfWeek, startOfMonth, isAfter, parseISO } from 'date-fns';

export default function AdminDashboard({ setToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ today: 0, week: 0, month: 0, total: 0 });

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
                setTimeout(() => setToast(''), 3000);
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


    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <LayoutDashboard className="text-brand" size={32} />
                            Shop Insights
                        </h1>
                        <p className="text-gray-500 mt-1">Welcome back, Admin</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard 
                        title="Today" 
                        amount={stats.today} 
                        icon={<TrendingUp className="text-green-500" />} 
                        color="bg-green-50"
                    />
                    <StatCard 
                        title="This Week" 
                        amount={stats.week} 
                        icon={<ShoppingBag className="text-brand" />} 
                        color="bg-gray-50"
                    />
                    <StatCard 
                        title="This Month" 
                        amount={stats.month} 
                        icon={<DollarSign className="text-gray-500" />} 
                        color="bg-gray-100"
                    />
                    <StatCard 
                        title="Total Earning" 
                        amount={stats.total} 
                        icon={<TrendingUp className="text-blue-500" />} 
                        color="bg-blue-50"
                    />
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
                        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shrink-0`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-black text-gray-800">₹{amount.toLocaleString()}</p>
            </div>
        </div>
    );
}

