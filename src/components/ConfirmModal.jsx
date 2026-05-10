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
                        className="relative w-full max-w-[400px] bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 overflow-hidden"
                    >
                        <div className="relative z-10 text-center">
                            <div className="mx-auto w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-8">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center">
                                    <Trash2 className="text-red-500" size={24} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">
                                {title}
                            </h2>
                            <p className="text-gray-500 font-medium leading-relaxed mb-10 px-4">
                                {message}
                            </p>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                    className="w-full bg-[#FF4B2B] text-white py-5 rounded-[2rem] font-black text-lg shadow-[0_10px_20px_rgba(255,75,43,0.3)] hover:bg-[#E03E1E] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
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
                                    className="w-full bg-gray-50/50 text-gray-500 py-4 rounded-[2rem] font-bold hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
