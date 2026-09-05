export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

export const formatPdfCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
};

export const formatCompactCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const val = Number(amount);
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)}L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
  }
  return `₹${val}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getCategoryLabel = (category) => {
  switch (category) {
    case 'working':
      return 'Working People';
    case 'student':
      return 'School / College';
    case 'general_public':
      return 'General Public';
    default:
      return category || 'General';
  }
};
