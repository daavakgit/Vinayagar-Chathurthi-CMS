import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../context/YearContext';
import { useAuth } from '../context/AuthContext';
import { getSettingsApi, createYearSettingApi, updateSettingApi, clearDataApi } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Toast } from '../components/Toast';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const { selectedYear, refreshSettings } = useYear();
  const { logoutAdmin, adminUser } = useAuth();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [newYearForm, setNewYearForm] = useState({ show: false, year: new Date().getFullYear() + 1, workingDefaultAmount: 2000, studentDefaultAmount: 500, eventName: 'Vinayagar Chathurthi' });
  const [toast, setToast] = useState({ message: '' });
  const [clearConfirm, setClearConfirm] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/portal');
  };

  useEffect(() => {
    loadSettings();
  }, [selectedYear]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettingsApi();
      if (res.success) setSettings(res.data || []);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (s) => {
    setEditId(s._id);
    setEditFormData({
      eventName: s.eventName,
      workingDefaultAmount: s.workingDefaultAmount,
      studentDefaultAmount: s.studentDefaultAmount,
      expenseCategories: (s.expenseCategories || []).join('\n'),
    });
  };

  const handleSaveEdit = async () => {
    try {
      setSubmitting(true);
      const cats = editFormData.expenseCategories.split('\n').map((c) => c.trim()).filter(Boolean);
      await updateSettingApi(editId, {
        eventName: editFormData.eventName,
        workingDefaultAmount: Number(editFormData.workingDefaultAmount),
        studentDefaultAmount: Number(editFormData.studentDefaultAmount),
        expenseCategories: cats,
      });
      setToast({ message: 'Settings updated successfully', type: 'success' });
      setEditId(null);
      loadSettings();
      refreshSettings();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrentYear = async (s) => {
    try {
      await updateSettingApi(s._id, { isCurrentYear: true });
      setToast({ message: `${s.year} set as current active year`, type: 'success' });
      loadSettings();
      refreshSettings();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleCreateYear = async () => {
    try {
      setSubmitting(true);
      await createYearSettingApi({
        year: Number(newYearForm.year),
        workingDefaultAmount: Number(newYearForm.workingDefaultAmount),
        studentDefaultAmount: Number(newYearForm.studentDefaultAmount),
        eventName: newYearForm.eventName,
      });
      setToast({ message: `Settings for ${newYearForm.year} created`, type: 'success' });
      setNewYearForm({ ...newYearForm, show: false });
      loadSettings();
      refreshSettings();
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearData = async () => {
    if (!clearConfirm) return;
    try {
      setSubmitting(true);
      if (clearConfirm === 'all') {
        await clearDataApi({ clearAll: true });
        setToast({ message: 'All system data cleared', type: 'success' });
      } else {
        await clearDataApi({ year: Number(clearConfirm) });
        setToast({ message: `Data for ${clearConfirm} cleared`, type: 'success' });
      }
      setClearConfirm(null);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '' })} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold">Settings</h1>
          <p className="font-body-md text-on-surface-variant">Manage year-wise event configurations and admin session</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-error/40 text-error hover:bg-error hover:text-on-error font-label-md font-bold transition-all active:scale-95 shadow-xs"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout Admin
          </button>
          <button onClick={() => setNewYearForm({ ...newYearForm, show: true })}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">add</span>
            Add New Year
          </button>
        </div>
      </div>

      {/* Year Settings Cards */}
      {loading ? (
        <div className="text-center py-8 text-on-surface-variant">Loading settings...</div>
      ) : settings.length === 0 ? (
        <div className="text-center py-8 text-on-surface-variant">No settings found</div>
      ) : (
        <div className="space-y-4">
          {settings.map((s) => (
            <div key={s._id} className={`bg-surface border rounded-2xl p-5 glass-card ${s.isCurrentYear ? 'border-primary shadow-md' : 'border-outline-variant'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${s.isCurrentYear ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {String(s.year).slice(2)}
                  </div>
                  <div>
                    <div className="font-title-md text-title-md text-on-background font-bold">{s.year} Event</div>
                    <div className="font-label-sm text-[11px] text-on-surface-variant">{s.eventName}</div>
                  </div>
                  {s.isCurrentYear && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-sm text-[11px] border border-primary/30 font-bold">ACTIVE YEAR</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {!s.isCurrentYear && (
                    <button onClick={() => handleSetCurrentYear(s)}
                      className="px-3 py-1.5 rounded-lg border border-primary text-primary font-label-sm text-[11px] hover:bg-primary hover:text-on-primary transition-colors font-bold">
                      Set Active
                    </button>
                  )}
                  <button onClick={() => handleStartEdit(s)}
                    className="p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-base">edit</span>
                  </button>
                </div>
              </div>

              {editId === s._id ? (
                <div className="space-y-4 border-t border-outline-variant/60 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-label-md text-label-md text-on-background font-medium mb-1">Event Name</label>
                      <input type="text" value={editFormData.eventName}
                        onChange={(e) => setEditFormData({ ...editFormData, eventName: e.target.value })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-background font-medium mb-1">Working People Default (₹)</label>
                      <input type="number" value={editFormData.workingDefaultAmount}
                        onChange={(e) => setEditFormData({ ...editFormData, workingDefaultAmount: e.target.value })}
                        className="w-full bg-surface-container-lowest border-2 border-primary rounded-lg px-3 py-2 font-body-md text-primary font-bold focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-background font-medium mb-1">Student Default (₹)</label>
                      <input type="number" value={editFormData.studentDefaultAmount}
                        onChange={(e) => setEditFormData({ ...editFormData, studentDefaultAmount: e.target.value })}
                        className="w-full bg-surface-container-lowest border-2 border-secondary rounded-lg px-3 py-2 font-body-md text-secondary font-bold focus:ring-2 focus:ring-secondary focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-background font-medium mb-1">Expense Categories (one per line)</label>
                      <textarea rows="4" value={editFormData.expenseCategories}
                        onChange={(e) => setEditFormData({ ...editFormData, expenseCategories: e.target.value })}
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setEditId(null)} className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container transition-colors">Cancel</button>
                    <button onClick={handleSaveEdit} disabled={submitting}
                      className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-all disabled:opacity-50 flex items-center gap-2">
                      {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Save Settings
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-surface-container-low rounded-xl p-3 text-center">
                    <div className="font-label-md text-label-md text-primary font-bold">{formatCurrency(s.workingDefaultAmount)}</div>
                    <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Working Default</div>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-3 text-center">
                    <div className="font-label-md text-label-md text-secondary font-bold">{formatCurrency(s.studentDefaultAmount)}</div>
                    <div className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">Student Default</div>
                  </div>
                  <div className="col-span-2 bg-surface-container-low rounded-xl p-3">
                    <div className="font-label-sm text-[11px] text-on-surface-variant mb-1">Expense Categories ({(s.expenseCategories || []).length})</div>
                    <div className="flex flex-wrap gap-1">
                      {(s.expenseCategories || []).slice(0, 6).map((cat) => (
                        <span key={cat} className="px-1.5 py-0.5 bg-secondary-container/20 text-secondary border border-secondary/20 rounded font-label-sm text-[10px]">{cat}</span>
                      ))}
                      {(s.expenseCategories || []).length > 6 && (
                        <span className="font-label-sm text-[10px] text-on-surface-variant">+{(s.expenseCategories || []).length - 6} more</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add new year form */}
      {newYearForm.show && (
        <div className="bg-surface border border-primary/30 rounded-2xl p-5 space-y-4 shadow-md glass-card">
          <h3 className="font-title-md text-title-md text-on-background font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">add_circle</span>
            Configure New Event Year
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-md text-on-background font-medium mb-1">Event Year <span className="text-error">*</span></label>
              <input type="number" min="2020" max="2050" value={newYearForm.year}
                onChange={(e) => setNewYearForm({ ...newYearForm, year: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block font-label-md text-on-background font-medium mb-1">Event Name</label>
              <input type="text" value={newYearForm.eventName}
                onChange={(e) => setNewYearForm({ ...newYearForm, eventName: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block font-label-md text-on-background font-medium mb-1">Working People Default (₹)</label>
              <input type="number" value={newYearForm.workingDefaultAmount}
                onChange={(e) => setNewYearForm({ ...newYearForm, workingDefaultAmount: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="block font-label-md text-on-background font-medium mb-1">Student Default (₹)</label>
              <input type="number" value={newYearForm.studentDefaultAmount}
                onChange={(e) => setNewYearForm({ ...newYearForm, studentDefaultAmount: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-md focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setNewYearForm({ ...newYearForm, show: false })}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container transition-colors">Cancel</button>
            <button onClick={handleCreateYear} disabled={submitting}
              className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-container transition-all disabled:opacity-50 flex items-center gap-2">
              {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Create Year Settings
            </button>
          </div>
        </div>
      )}

      {/* Admin Session & Security */}
      <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm glass-card">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">admin_panel_settings</span>
            <h2 className="font-title-md font-bold text-on-background">Admin Session & Security</h2>
          </div>
          <span className="text-xs bg-secondary-container/40 text-secondary font-bold px-2.5 py-1 rounded-full">
            Active Admin
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs md:text-sm">
          <div>
            <div className="font-bold text-on-background text-base">
              {adminUser?.email || 'daavakjaganathan10@gmail.com'}
            </div>
            <div className="text-on-surface-variant mt-0.5">
              Full Administrator CRUD permissions granted
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="px-5 py-2.5 rounded-xl bg-error text-on-error font-title-sm font-bold hover:bg-error/90 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>Logout Admin Session</span>
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-error-container/10 border border-error/20 rounded-2xl p-5 space-y-4">
        <h2 className="font-title-md text-title-md text-on-background font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-xl">warning</span>
          Data Management (Danger Zone)
        </h2>
        <p className="font-body-md text-on-surface-variant text-sm">These actions are irreversible. Use with extreme caution.</p>
        <div className="flex flex-wrap gap-3">
          {settings.map((s) => (
            <button key={s._id} onClick={() => setClearConfirm(String(s.year))}
              className="px-4 py-2 rounded-lg border border-error/40 text-error hover:bg-error hover:text-on-error font-label-md text-label-md transition-colors font-semibold">
              Clear {s.year} Data
            </button>
          ))}
          <button onClick={() => setClearConfirm('all')}
            className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md font-bold hover:bg-error/80 transition-colors">
            Clear ALL Data
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="Logout Admin Session"
        message="Are you sure you want to log out of the Admin Portal? You will need to enter your admin credentials again to access full organizer tools."
        confirmText="Yes, Logout Now"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmationModal
        isOpen={!!clearConfirm}
        title={clearConfirm === 'all' ? 'Clear ALL System Data' : `Clear ${clearConfirm} Event Data`}
        message={clearConfirm === 'all'
          ? 'This will permanently delete ALL collections, expenses, splits, and recoveries across all years. This action CANNOT be undone.'
          : `This will permanently delete all collections, expenses, splits, and recoveries for the ${clearConfirm} event. This action CANNOT be undone.`}
        confirmText={clearConfirm === 'all' ? 'Yes, Delete Everything' : `Clear ${clearConfirm}`}
        onConfirm={handleClearData}
        onCancel={() => setClearConfirm(null)}
      />
    </div>
  );
};
