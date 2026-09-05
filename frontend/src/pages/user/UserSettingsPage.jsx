import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettingsApi } from '../../services/api';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export const UserSettingsPage = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSettingsApi();
        if (res?.success) setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings for User Settings page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const s = settings || {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-background">
            Portal Settings & Event Information
          </h1>
          <p className="font-body-md text-xs md:text-sm text-on-surface-variant">
            Vinayagar Chathurthi 2026 · Information & Preferences (View Only)
          </p>
        </div>
        <button
          onClick={() => navigate('/portal')}
          className="px-4 py-2 rounded-xl bg-surface border border-outline-variant text-on-surface hover:text-error hover:border-error text-xs font-label-md transition-colors flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Logout Portal</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading event information..." />
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: 2026 EVENT DETAILS (VIEW ONLY) */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3">
              <span className="material-symbols-outlined text-primary text-xl">event</span>
              <h2 className="font-title-md font-bold text-on-background">2026 Event Details</h2>
              <span className="ml-auto text-[10px] bg-primary-container/30 text-primary font-bold px-2 py-0.5 rounded-full">
                View Only
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
              <div className="space-y-1">
                <span className="text-on-surface-variant font-semibold">Event Name</span>
                <div className="p-3 rounded-xl bg-surface-container font-bold text-on-background">
                  {s.eventTitle || 'Vinayagar Chathurthi Grand Celebration'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-on-surface-variant font-semibold">Event Year</span>
                <div className="p-3 rounded-xl bg-surface-container font-bold text-on-background">
                  {s.year || 2026}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-on-surface-variant font-semibold">Venue / Location</span>
                <div className="p-3 rounded-xl bg-surface-container font-bold text-on-background">
                  {s.venue || 'Main Street Temple Ground, Community Center'}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-on-surface-variant font-semibold">Organizer Committee</span>
                <div className="p-3 rounded-xl bg-surface-container font-bold text-on-background">
                  {s.organizerName || 'Vinayagar Chathurthi Youth Committee'}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-on-surface-variant font-semibold">Contact Information</span>
                <div className="p-3 rounded-xl bg-surface-container font-bold text-on-background">
                  {s.organizerContact || '+91 98765 43210'} · support@vcms.org
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-on-surface-variant font-semibold">Important Announcements & Updates</span>
                <div className="p-3 rounded-xl bg-surface-container text-on-background leading-relaxed">
                  {s.announcements || 'May Lord Ganesha bless our community with health, wealth, and joy! All devotees are invited for morning and evening Aaradhana.'}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: USER ACCOUNT INFORMATION (Future Authentication Ready) */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3">
              <span className="material-symbols-outlined text-secondary text-xl">person</span>
              <h2 className="font-title-md font-bold text-on-background">Account Information</h2>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
                <div>
                  <div className="font-bold text-on-background">Role Profile</div>
                  <div className="text-on-surface-variant text-xs">Public Community Member</div>
                </div>
                <span className="text-xs font-semibold text-tertiary bg-tertiary-container/30 px-2.5 py-1 rounded-full">
                  Anonymous Guest
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs text-on-surface-variant space-y-1">
                <div className="font-bold text-on-background">Password & Security</div>
                <p>
                  Individual user accounts and password management can be activated by the event administrator in future updates. Currently enjoying open public view access.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: NOTIFICATION PREFERENCES */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3">
              <span className="material-symbols-outlined text-tertiary text-xl">notifications</span>
              <h2 className="font-title-md font-bold text-on-background">Notifications & Updates</h2>
            </div>

            <div className="space-y-3 text-xs md:text-sm">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
                <div>
                  <div className="font-bold text-on-background">Event Announcements</div>
                  <div className="text-on-surface-variant text-xs">Show banner alerts for new festival notices</div>
                </div>
                <span className="text-xs font-bold text-tertiary">Active</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: ABOUT PPP-VCMS */}
          <div className="bg-surface border border-outline-variant rounded-2xl p-5 space-y-3 shadow-sm text-xs md:text-sm">
            <div className="flex items-center gap-2 border-b border-outline-variant/60 pb-3">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <h2 className="font-title-md font-bold text-on-background">About PPP-VCMS</h2>
            </div>

            <p className="text-on-surface-variant leading-relaxed">
              PPP-VCMS (Vinayagar Chathurthi Collection & Expense Management System) version 1.0.0. Designed for complete financial transparency, community trust, and auditability.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
