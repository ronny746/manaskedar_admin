import { X, AlertTriangle, ShieldCheck } from 'lucide-react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger', confirmText = 'Confirm' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
            
            <div className="bg-white w-full max-w-sm p-8 relative z-10 rounded-3xl shadow-2xl">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                        type === 'danger' ? 'bg-rose-50 text-rose-500' : type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                        {type === 'danger' ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-xs text-slate-400 mb-8 leading-relaxed">{message}</p>

                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={onCancel}
                            className="flex-1 py-3.5 bg-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm}
                            className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all shadow-lg ${
                                type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' 
                                : type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                            }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <button onClick={onCancel} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmDialog;
