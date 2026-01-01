export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', { minimumFractionDigits: 2 }).format(amount);
};

export const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

export const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        'ACTIVE': 'bg-emerald-100 text-emerald-700',
        'DRAFT': 'bg-slate-100 text-slate-600',
        'PAUSED': 'bg-amber-100 text-amber-700',
        'COMPLETED': 'bg-blue-100 text-blue-700',
        'CANCELLED': 'bg-rose-100 text-rose-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-600';
};
