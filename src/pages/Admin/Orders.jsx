import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import {
    Package, Clock, CheckCircle2, XCircle,
    Search, Filter, MapPin, User, ArrowLeft, Phone,
    Loader2, Image as ImageIcon, X
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { getProductImage, getAllProductImages } from '../../utils/imageUtils';

export default function AdminOrders({ setToast }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [previewImages, setPreviewImages] = useState(null);

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
        'out for delivery': { label: 'Out for Delivery', color: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
        delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
        // Fallbacks for legacy statuses
        confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', bar: 'bg-red-500' }
    };

    useEffect(() => {
        const init = async () => {
            await cleanupOldOrders();
            await fetchOrders();
        };
        init();

        // Real-time subscription
        const channel = supabase
            .channel('admin_orders_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setOrders(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setOrders(prev => prev.map(order =>
                            order.id === payload.new.id ? payload.new : order
                        ));
                    } else if (payload.eventType === 'DELETE') {
                        setOrders(prev => prev.filter(order => order.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const cleanupOldOrders = async () => {
        try {
            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

            // Delete orders that are confirmed/rejected AND older than 30 days
            const { error, count } = await supabase
                .from('orders')
                .delete({ count: 'exact' })
                .in('status', ['delivered', 'cancelled', 'rejected'])
                .lt('created_at', thirtyDaysAgo);

            if (error) throw error;

            if (count > 0) {
                console.log(`[Auto-Cleanup] Deleted ${count} orders older than 30 days.`);
            }
        } catch (error) {
            console.error('Error during auto-cleanup:', error.message);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .not('user_id', 'is', null) // Only show authenticated orders
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            // Optimistic update already handled by subscription or state, 
            // but we keep this for redundancy and feedback
            setOrders(prev => prev.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            setToast(`Order updated to ${newStatus.toUpperCase()}!`);
            setTimeout(() => setToast(''), 3000);
        } catch (error) {
            console.error('Error updating order:', error.message);
            setToast('Failed to update order status');
            setTimeout(() => setToast(''), 3000);
        }
    };

    const filteredOrders = (orders || []).filter(order => {
        if (!order) return false;
        const name = String(order.customer_name || '').toLowerCase();
        const address = String(order.address || '').toLowerCase();
        const search = (searchTerm || '').toLowerCase();

        const matchesSearch = name.includes(search) || address.includes(search);
        const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesFilter;
    });


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                            <Package className="text-brand" size={32} />
                            Order Management
                        </h1>
                        <p className="text-gray-500 mt-1">Manage and track your customer orders</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl w-full sm:w-64 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm font-semibold text-gray-600 capitalize"
                        >
                            <option value="all">All Status</option>
                            {Object.keys(statusConfig).map(status => (
                                <option key={status} value={status}>{statusConfig[status].label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 overflow-hidden group">
                            {/* Card Header */}
                            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${(statusConfig[order.status] || statusConfig.pending).bar} animate-pulse`} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</p>
                                        <p className="text-sm font-bold text-gray-800">#{String(order.id || '').slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block" />
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Placed On</p>
                                        <p className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                                            <Clock size={14} className="text-gray-400" />
                                            {order.created_at ? format(parseISO(order.created_at), 'MMM dd, yyyy • p') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Amount</p>
                                        <p className="text-xl font-black text-brand leading-none">₹{order.total_amount}</p>
                                    </div>
                                    <div className="min-w-[160px]">
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                            className={`w-full py-2.5 px-4 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm outline-none border-2 transition-all cursor-pointer ${(statusConfig[order.status] || statusConfig.pending).color
                                                } border-transparent focus:border-brand/20`}
                                        >
                                            {Object.keys(statusConfig).filter(s => !['confirmed', 'rejected'].includes(s)).map(status => (
                                                <option key={status} value={status} className="bg-white text-gray-800">
                                                    {statusConfig[status].label}
                                                </option>
                                            ))}
                                            {['confirmed', 'rejected'].includes(order.status) && (
                                                <option value={order.status} className="bg-white text-gray-800">
                                                    {statusConfig[order.status].label}
                                                </option>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Customer Info */}
                                    <div className="lg:col-span-5 space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 pl-1">Customer Details</h4>
                                            <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-4 shadow-sm group-hover:border-brand/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Full Name</p>
                                                        <p className="text-base font-bold text-gray-800">{order.customer_name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand">
                                                        <Phone size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Phone Number</p>
                                                        <p className="text-base font-bold text-gray-800">{order.contact_number || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-brand/5 flex items-center justify-center text-brand shrink-0">
                                                        <MapPin size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Delivery Address</p>
                                                        <p className="text-sm font-semibold text-gray-600 leading-relaxed">{order.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Ordered */}
                                    <div className="lg:col-span-7">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 pl-1">Items Ordered</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                                                <div key={idx} className="bg-gray-50/50 border border-gray-100 p-3 rounded-2xl flex items-center gap-4 hover:bg-white hover:border-brand/20 transition-all group/item shadow-sm">
                                                    {/* Product Image */}
                                                    <div
                                                        className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-white cursor-zoom-in relative group/img-link"
                                                        onClick={() => setPreviewImages(getAllProductImages(item.img))}
                                                    >
                                                        <img
                                                            src={getProductImage(item.img)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                                        />
                                                        {getAllProductImages(item.img).length > 1 && (
                                                            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black px-1 py-0.5 rounded-md flex items-center gap-1">
                                                                <ImageIcon size={8} />
                                                                {getAllProductImages(item.img).length}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover/img-link:bg-black/10 transition-colors" />
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-gray-800 truncate mb-1">{item.name}</p>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[10px] font-black bg-brand text-white px-2 py-0.5 rounded-lg shadow-sm shadow-brand/20">
                                                                QTY: {item.qty}
                                                            </span>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">₹{item.price}</p>
                                                            {item.selectedSize && (
                                                                <span className="text-[9px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md border border-gray-200">
                                                                    SIZE: {item.selectedSize}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <Package className="mx-auto mb-4 text-gray-200" size={64} />
                            <h3 className="text-xl font-bold text-gray-400">No orders found</h3>
                            <p className="text-gray-400">Try adjusting your filters or search terms</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImages && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={() => setPreviewImages(null)}
                >
                    <button
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90 z-[101]"
                        onClick={() => setPreviewImages(null)}
                    >
                        <X size={24} />
                    </button>

                    <div className="max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center gap-8" onClick={e => e.stopPropagation()}>
                        <div className="w-full overflow-y-auto custom-scrollbar p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {previewImages.map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl group/img relative">
                                        <img
                                            src={img}
                                            alt={`Preview ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
