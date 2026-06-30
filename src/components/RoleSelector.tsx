import { useState } from 'react';
import { UserRole, AppNotification } from '../types';
import { 
  Building2, 
  ShieldCheck, 
  Wrench, 
  User, 
  Bell, 
  Check, 
  Clock, 
  Smartphone,
  X,
  Sparkles
} from 'lucide-react';

interface RoleSelectorProps {
  currentRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
  onApproveVisitor: (id: string) => void;
}

export default function RoleSelector({
  currentRole,
  onChangeRole,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
  onApproveVisitor
}: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleConfigs = {
    admin: {
      label: 'Society Admin',
      persona: 'John Doe (Admin Office)',
      icon: Building2,
      color: 'bg-[#f5f5f0] text-[#3d4234] border-[#e5e5dc]',
      activeColor: 'bg-[#5a634d] text-white shadow-sm',
      tagline: 'Oversee analytics, resolve complaints, approve bookings, & manage finances.'
    },
    resident: {
      label: 'Resident',
      persona: 'Sarah Connor (B-402, Owner)',
      icon: User,
      color: 'bg-[#f5f5f0] text-[#3d4234] border-[#e5e5dc]',
      activeColor: 'bg-[#5a634d] text-white shadow-sm',
      tagline: 'Book amenities, approve visitors, raise maintenance requests, & settle bills.'
    },
    security: {
      label: 'Security Guard',
      persona: 'Officer Vikram (Main Gate)',
      icon: ShieldCheck,
      color: 'bg-[#f5f5f0] text-[#3d4234] border-[#e5e5dc]',
      activeColor: 'bg-[#5a634d] text-white shadow-sm',
      tagline: 'Register incoming visitors, track cargo deliveries, & verify entries.'
    },
    maintenance: {
      label: 'Maintenance Crew',
      persona: 'Mike Evans (Plumber/Electrician)',
      icon: Wrench,
      color: 'bg-[#f5f5f0] text-[#3d4234] border-[#e5e5dc]',
      activeColor: 'bg-[#5a634d] text-white shadow-sm',
      tagline: 'View assigned helpdesk tickets, update status, and log service resolutions.'
    }
  };

  return (
    <header id="app-header" className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e5e5dc] px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand Logo & Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#d4a373] p-2.5 rounded-xl text-white shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[#3d4234] tracking-tight flex items-center gap-1.5">
                Greenwood Heights
                <span className="text-[10px] bg-[#5a634d]/10 text-[#3d4234] px-2 py-0.5 rounded-full border border-[#5a634d]/20 font-sans font-medium flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-[#d4a373]" /> SMART SYSTEM
                </span>
              </h1>
              <p className="text-xs text-[#8d917a] font-sans font-medium">Premium Gated Community Hub</p>
            </div>
          </div>

          {/* Quick notification on mobile next to brand */}
          <div className="md:hidden flex items-center gap-3">
            <div className="relative">
              <button
                id="mobile-notif-btn"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-[#3d4234] hover:text-[#5a634d] hover:bg-[#f5f5f0] rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[#d4a373] text-white font-sans font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center pulse-indicator">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simulator Persona Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#f5f5f0] p-1.5 rounded-2xl border border-[#e5e5dc] w-full md:w-auto">
          <div className="px-3 py-1 sm:py-0">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8d917a] block sm:inline">Role Simulator:</span>
            <span className="text-xs font-semibold text-[#3d4234] sm:ml-1.5 block sm:inline font-mono">
              Active: {roleConfigs[currentRole].label}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:flex gap-1">
            {(Object.keys(roleConfigs) as UserRole[]).map((roleKey) => {
              const config = roleConfigs[roleKey];
              const IconComp = config.icon;
              const isActive = currentRole === roleKey;

              return (
                <button
                  key={roleKey}
                  id={`role-btn-${roleKey}`}
                  onClick={() => {
                    onChangeRole(roleKey);
                    setIsOpen(false);
                  }}
                  className={`flex flex-col sm:flex-row items-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center sm:text-left ${
                    isActive
                      ? config.activeColor
                      : 'text-[#8d917a] hover:text-[#3d4234] hover:bg-white'
                  }`}
                  title={config.persona}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Notifications and Simulation Status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#3d4234] flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-[#5a634d] animate-pulse"></span>
              {roleConfigs[currentRole].persona}
            </div>
            <div className="text-[10px] text-[#8d917a] font-mono flex items-center gap-1 justify-end">
              <Clock className="w-3.5 h-3.5 text-[#d4a373]" /> June 29, 2026 • 23:22 (Mon)
            </div>
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              id="desktop-notif-btn"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 text-[#3d4234] hover:text-[#5a634d] hover:bg-[#f5f5f0] border border-[#e5e5dc] rounded-xl transition-all relative cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#d4a373] text-white font-sans font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center pulse-indicator">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Card */}
            {isOpen && (
              <div id="notifications-dropdown" className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-[#e5e5dc] rounded-2xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all">
                <div className="p-4 border-b border-[#f5f5f0] bg-[#f5f5f0]/50 flex justify-between items-center">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-[#3d4234]">In-App Live Alerts</h3>
                    <p className="text-[10px] text-[#8d917a]">Real-time simulation across roles</p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={onClearAllNotifications}
                      className="text-xs text-[#5a634d] hover:text-[#3d4234] hover:underline font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#f5f5f0]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[#8d917a]">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-4 transition-colors ${
                          n.read ? 'bg-white opacity-60' : 'bg-[#5a634d]/5'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex gap-2">
                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#d4a373]"></span>
                            <div>
                              <h4 className="font-semibold text-xs text-[#3d4234]">{n.title}</h4>
                              <p className="text-xs text-[#8d917a] mt-1">{n.message}</p>
                              <span className="text-[9px] text-[#8d917a] font-mono mt-1.5 block">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          {!n.read && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="text-[#8d917a] hover:text-[#3d4234] p-0.5 rounded-md hover:bg-[#f5f5f0] transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Interactive direct actions inside notifications */}
                        {n.type === 'visitor' && n.message.includes('approval') && !n.read && (
                          <div className="mt-3 flex items-center gap-2">
                            <button
                              onClick={() => {
                                onApproveVisitor(n.id);
                                onMarkNotificationRead(n.id);
                              }}
                              className="text-[11px] bg-[#5a634d] text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#3d4234] transition-colors cursor-pointer"
                            >
                              Grant Entry
                            </button>
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="text-[11px] border border-[#e5e5dc] text-[#8d917a] px-2.5 py-1 rounded-lg hover:bg-[#f5f5f0] transition-colors cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role specific notification banner */}
      <div className="max-w-7xl mx-auto mt-2 md:mt-3 px-1">
        <div className="bg-[#5a634d]/10 text-[#3d4234] border border-[#e5e5dc] rounded-xl px-3 py-2 flex items-center gap-2.5">
          <Smartphone className="w-4 h-4 text-[#d4a373]" />
          <p className="text-xs font-sans">
            <strong className="text-[#3d4234] font-semibold">Simulating as {roleConfigs[currentRole].label}:</strong> {roleConfigs[currentRole].tagline}
          </p>
        </div>
      </div>
    </header>
  );
}
