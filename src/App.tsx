import { useState, useEffect } from 'react';
import { UserRole, ResidentProfile, Visitor, Complaint, MaintenanceBill, FacilityBooking, Notice, Poll, AppNotification } from './types';
import { 
  initialResidents, 
  initialVisitors, 
  initialComplaints, 
  initialBills, 
  initialBookings, 
  initialNotices, 
  initialPolls, 
  initialNotifications 
} from './data';
import RoleSelector from './components/RoleSelector';
import AdminDashboard from './components/AdminDashboard';
import ResidentDashboard from './components/ResidentDashboard';
import SecurityDashboard from './components/SecurityDashboard';
import MaintenanceDashboard from './components/MaintenanceDashboard';
import { Building2, Sparkles, LogOut, CheckSquare } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole>('resident');

  // Load state from localStorage or fallback to pre-seeded datasets
  const [residents, setResidents] = useState<ResidentProfile[]>(() => {
    const saved = localStorage.getItem('society_residents');
    return saved ? JSON.parse(saved) : initialResidents;
  });

  const [visitors, setVisitors] = useState<Visitor[]>(() => {
    const saved = localStorage.getItem('society_visitors');
    return saved ? JSON.parse(saved) : initialVisitors;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('society_complaints');
    return saved ? JSON.parse(saved) : initialComplaints;
  });

  const [bills, setBills] = useState<MaintenanceBill[]>(() => {
    const saved = localStorage.getItem('society_bills');
    return saved ? JSON.parse(saved) : initialBills;
  });

  const [bookings, setBookings] = useState<FacilityBooking[]>(() => {
    const saved = localStorage.getItem('society_bookings');
    return saved ? JSON.parse(saved) : initialBookings;
  });

  const [notices, setNotices] = useState<Notice[]>(() => {
    const saved = localStorage.getItem('society_notices');
    return saved ? JSON.parse(saved) : initialNotices;
  });

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('society_polls');
    return saved ? JSON.parse(saved) : initialPolls;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('society_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  // Save changes to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('society_residents', JSON.stringify(residents));
  }, [residents]);

  useEffect(() => {
    localStorage.setItem('society_visitors', JSON.stringify(visitors));
  }, [visitors]);

  useEffect(() => {
    localStorage.setItem('society_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('society_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('society_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('society_notices', JSON.stringify(notices));
  }, [notices]);

  useEffect(() => {
    localStorage.setItem('society_polls', JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem('society_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Helper to append a notification
  const handleAddNotification = (
    title: string, 
    message: string, 
    type: 'visitor' | 'complaint' | 'bill' | 'booking' | 'notice',
    targetFlat?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      targetFlat
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Direct Quick Approval action on notification dropdown
  const handleApproveVisitorFromNotif = (notifId: string) => {
    const notif = notifications.find(n => n.id === notifId);
    if (!notif) return;

    // Find a pending visitor for that flat
    const pendingVisForFlat = visitors.find(v => v.flatNumber === notif.targetFlat && v.status === 'Pending Approval');
    if (pendingVisForFlat) {
      setVisitors(visitors.map(v => v.id === pendingVisForFlat.id ? {
        ...v,
        status: 'Approved',
        entryTime: new Date().toISOString()
      } : v));

      handleAddNotification(
        'Visitor Entry Approved',
        `Sarah Connor approved entrance for ${pendingVisForFlat.name} via quick alert action.`,
        'visitor'
      );
    }
  };

  // For resident dashboard, we use Sarah Connor (B-402) as the active resident persona
  const sarahConnorProfile = residents.find(r => r.flatNumber === 'B-402') || residents[0];

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#2d3027] flex flex-col font-sans transition-all duration-300 antialiased selection:bg-[#5a634d]/10 selection:text-[#3d4234]">
      
      {/* Simulation System Toolbar */}
      <RoleSelector
        currentRole={role}
        onChangeRole={setRole}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onClearAllNotifications={handleClearAllNotifications}
        onApproveVisitor={handleApproveVisitorFromNotif}
      />

      {/* Main Container */}
      <main id="app-main" className="flex-1 pb-16">
        {role === 'admin' && (
          <AdminDashboard
            residents={residents}
            setResidents={setResidents}
            visitors={visitors}
            complaints={complaints}
            setComplaints={setComplaints}
            bills={bills}
            setBills={setBills}
            bookings={bookings}
            setBookings={setBookings}
            notices={notices}
            setNotices={setNotices}
            polls={polls}
            setPolls={setPolls}
            onAddNotification={handleAddNotification}
          />
        )}

        {role === 'resident' && (
          <ResidentDashboard
            profile={sarahConnorProfile}
            setResidents={setResidents}
            residents={residents}
            visitors={visitors}
            setVisitors={setVisitors}
            complaints={complaints}
            setComplaints={setComplaints}
            bills={bills}
            setBills={setBills}
            bookings={bookings}
            setBookings={setBookings}
            notices={notices}
            polls={polls}
            setPolls={setPolls}
            onAddNotification={handleAddNotification}
          />
        )}

        {role === 'security' && (
          <SecurityDashboard
            visitors={visitors}
            setVisitors={setVisitors}
            residents={residents}
            onAddNotification={handleAddNotification}
          />
        )}

        {role === 'maintenance' && (
          <MaintenanceDashboard
            complaints={complaints}
            setComplaints={setComplaints}
            onAddNotification={handleAddNotification}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-[#e5e5dc] py-6 text-center text-xs text-[#8d917a] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Greenwood Heights Smart Society Gated Compound. All records are stored locally for simulation purposes.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#5a634d] transition-colors cursor-help font-semibold" title="Local storage active font-semibold">Local Ledger: Connected</span>
            <span className="hover:text-[#5a634d] transition-colors cursor-help font-semibold" title="No network latency font-semibold">RFID System: Operational</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
