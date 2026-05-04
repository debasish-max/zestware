import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';

export default function ConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Delete", 
    cancelText = "Cancel",
    isDeleting = false 
}) {
    // Prevent interaction with underlying page when modal is open
    if (typeof document !== 'undefined') {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 overflow-hidden"
                    >
                        {/* Decorative Background Element */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand/5 rounded-full blur-2xl" />
                        
                        <div className="relative z-10 text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                                <Trash2 className="text-red-500" size={32} />
                            </div>

                            <h2 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
                                {title}
                            </h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-200 hover:bg-red-600 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                                
                                <button
                                    onClick={onClose}
                                    disabled={isDeleting}
                                    className="w-full bg-gray-50 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>

                        {/* Success/Error messages can be integrated here, but using toasts is better */}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
