import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { 
    Package, Clock, Search, MapPin, Inbox, X, Image as ImageIcon
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getProductImage, getAllProductImages } from '../utils/imageUtils';

export default function Orders({ setToast }) {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewImages, setPreviewImages] = useState(null);

    const statusConfig = {
        pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500' },
        cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
        'out for delivery': { label: 'Out for Delivery', color: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
        delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
        // Legacy
        confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
        rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', bar: 'bg-red-500' }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();

            // Real-time subscription for this user's orders
            const channel = supabase
                .channel(`user_orders_${user.id}`)
                .on(
                    'postgres_changes',
                    { 
                        event: '*', 
                        schema: 'public', 
                        table: 'orders',
                        filter: `user_id=eq.${user.id}`
                    },
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
        }
    }, [user]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#fffcf7] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <Package className="text-brand" size={32} />
                        My Orders
                    </h1>
                    <p className="text-gray-500 mt-1">Track and view your past orders</p>
                </div>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${(statusConfig[order.status] || statusConfig.pending).bar}`} />

                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${(statusConfig[order.status] || statusConfig.pending).color}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                                            <Clock size={12} />
                                            {format(parseISO(order.created_at), 'MMM dd, yyyy')}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 group/item">
                                                    {/* Product Image */}
                                                        <div 
                                                            className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 cursor-zoom-in group-hover/item:border-brand/30 transition-all shadow-sm relative"
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
                                                        </div>

                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-base md:text-lg font-black text-gray-800 leading-tight mb-1 truncate">
                                                            {item.name}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                                QTY: {item.qty}
                                                            </span>
                                                            {item.selectedSize && (
                                                                <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md border border-gray-200 uppercase">
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

                                <div className="md:text-right flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Paid</p>
                                        <p className="text-2xl font-black text-brand">₹{order.total_amount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-100 flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                <Inbox size={40} className="text-brand/50" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">No orders yet</h3>
                            <p className="text-gray-500 mt-2 max-w-xs">Once you place an order, it will appear here for you to track.</p>
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
