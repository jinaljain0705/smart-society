import React, { useState } from 'react';
import { 
  ResidentProfile, 
  Visitor, 
  Complaint, 
  MaintenanceBill, 
  FacilityBooking, 
  Notice, 
  Poll,
  ComplaintCategory,
  FacilityType
} from '../types';
import { 
  User, 
  Car, 
  Wrench, 
  CreditCard, 
  Calendar, 
  Megaphone, 
  Vote, 
  ShieldAlert,
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Star, 
  ChevronRight, 
  Receipt,
  ThumbsUp,
  Trash2,
  Lock,
  Flame,
  X,
  QrCode,
  Key,
  UserCheck
} from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';

interface ResidentDashboardProps {
  profile: ResidentProfile;
  setResidents: React.Dispatch<React.SetStateAction<ResidentProfile[]>>;
  residents: ResidentProfile[];
  visitors: Visitor[];
  setVisitors: React.Dispatch<React.SetStateAction<Visitor[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  bills: MaintenanceBill[];
  setBills: React.Dispatch<React.SetStateAction<MaintenanceBill[]>>;
  bookings: FacilityBooking[];
  setBookings: React.Dispatch<React.SetStateAction<FacilityBooking[]>>;
  notices: Notice[];
  polls: Poll[];
  setPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
  onAddNotification: (title: string, message: string, type: 'visitor' | 'complaint' | 'bill' | 'booking' | 'notice') => void;
}

export default function ResidentDashboard({
  profile,
  setResidents,
  residents,
  visitors,
  setVisitors,
  complaints,
  setComplaints,
  bills,
  setBills,
  bookings,
  setBookings,
  notices,
  polls,
  setPolls,
  onAddNotification
}: ResidentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'complaints' | 'bills' | 'booking' | 'family_vehicles' | 'visitors'>('home');

  // Form States
  const [showAddFamily, setShowAddFamily] = useState(false);
  const [newFamily, setNewFamily] = useState({ name: '', relation: '', phone: '' });

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ type: 'Car' as 'Car' | 'Bike', plate: '', slot: '' });

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'Electrical' as ComplaintCategory,
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const [bookingForm, setBookingForm] = useState({
    facility: 'Club House' as FacilityType,
    bookingDate: '2026-07-15',
    timeSlot: '09:00 AM - 12:00 PM',
    purpose: ''
  });

  // Credit Card checkout simulation
  const [payingBill, setPayingBill] = useState<MaintenanceBill | null>(null);
  const [cardForm, setCardForm] = useState({
    number: '4111 2222 3333 4444',
    expiry: '08/29',
    cvv: '123',
    name: profile.name
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<MaintenanceBill | null>(null);

  // Pre-register guest pass states
  const [preRegisterForm, setPreRegisterForm] = useState({
    name: '',
    phone: '',
    purpose: 'Guest',
    company: ''
  });
  const [selectedPassVisitor, setSelectedPassVisitor] = useState<Visitor | null>(null);

  // Filters for current resident Sarah Connor (Flat B-402)
  const myFlat = profile.flatNumber;
  const myVisitors = visitors.filter(v => v.flatNumber === myFlat);
  const pendingVisitorApprovals = myVisitors.filter(v => v.status === 'Pending Approval');
  const myComplaints = complaints.filter(c => c.flatNumber === myFlat);
  const myBills = bills.filter(b => b.flatNumber === myFlat);
  const myBookings = bookings.filter(b => b.flatNumber === myFlat);

  // Handlers
  const handleApproveVisitor = (visitorId: string, approved: boolean) => {
    setVisitors(visitors.map(v => {
      if (v.id === visitorId) {
        return {
          ...v,
          status: approved ? 'Approved' : 'Declined',
          entryTime: approved ? new Date().toISOString() : undefined
        };
      }
      return v;
    }));
    
    const vis = visitors.find(v => v.id === visitorId);
    if (vis) {
      onAddNotification(
        `Visitor ${approved ? 'Approved' : 'Declined'}`,
        `Sarah Connor has ${approved ? 'approved' : 'declined'} entry for ${vis.name}.`,
        'visitor'
      );
    }
  };

  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamily.name || !newFamily.relation) return;

    const updatedFamily = [
      ...profile.familyMembers,
      {
        id: `fam-${Date.now()}`,
        name: newFamily.name,
        relation: newFamily.relation,
        phone: newFamily.phone || '+1 (555) 000-0000'
      }
    ];

    setResidents(residents.map(r => r.flatNumber === myFlat ? { ...r, familyMembers: updatedFamily } : r));
    setShowAddFamily(false);
    setNewFamily({ name: '', relation: '', phone: '' });
  };

  const handleDeleteFamilyMember = (id: string) => {
    const updatedFamily = profile.familyMembers.filter(f => f.id !== id);
    setResidents(residents.map(r => r.flatNumber === myFlat ? { ...r, familyMembers: updatedFamily } : r));
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.plate) return;

    const updatedVehicles = [
      ...profile.vehicles,
      {
        id: `veh-${Date.now()}`,
        type: newVehicle.type,
        numberPlate: newVehicle.plate,
        parkingSlot: newVehicle.slot || `${myFlat}-P`
      }
    ];

    setResidents(residents.map(r => r.flatNumber === myFlat ? { ...r, vehicles: updatedVehicles } : r));
    setShowAddVehicle(false);
    setNewVehicle({ type: 'Car', plate: '', slot: '' });
  };

  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = profile.vehicles.filter(v => v.id !== id);
    setResidents(residents.map(r => r.flatNumber === myFlat ? { ...r, vehicles: updatedVehicles } : r));
  };

  const handleRaiseComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;

    const complaintItem: Complaint = {
      id: `comp-${Date.now()}`,
      title: newComplaint.title,
      category: newComplaint.category,
      description: newComplaint.description,
      flatNumber: myFlat,
      residentName: profile.name,
      status: 'Open',
      priority: newComplaint.priority,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString()
    };

    setComplaints([complaintItem, ...complaints]);
    onAddNotification(
      'Complaint Submitted',
      `New plumbing/electrical ticket logged for ${myFlat}: "${newComplaint.title}"`,
      'complaint'
    );
    setNewComplaint({ title: '', category: 'Electrical', description: '', priority: 'Medium' });
    setActiveTab('complaints');
  };

  const handleCloseComplaint = (id: string, rating: number) => {
    setComplaints(complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Closed',
          residentRating: rating,
          updatedTime: new Date().toISOString()
        };
      }
      return c;
    }));
    onAddNotification('Ticket Closed', `Resident rated ticket #${id.substring(0, 5)} ${rating} Stars.`, 'complaint');
  };

  const handlePayBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBill) return;

    setIsProcessingPayment(true);
    // Simulate API authorization latency
    setTimeout(() => {
      const paidDate = new Date().toISOString().split('T')[0];
      const transactionId = `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`;
      const updatedBill = {
        ...payingBill,
        status: 'Paid' as const,
        paidDate,
        paymentMethod: 'Credit Card',
        transactionId
      };

      setBills(bills.map(b => b.id === payingBill.id ? updatedBill : b));
      onAddNotification(
        'Payment Confirmed',
        `Settle bill successfully for ${payingBill.billMonth}: $${(payingBill.amount + payingBill.penalty).toFixed(2)}`,
        'bill'
      );
      setIsProcessingPayment(false);
      setPayingBill(null);
      setSelectedReceiptBill(updatedBill);
    }, 1500);
  };

  const handleDownloadReceipt = (bill: MaintenanceBill) => {
    const totalPayable = bill.amount + bill.penalty;
    const receiptText = `--------------------------------------------------
          GREENWOOD HEIGHTS SMART SOCIETY
                 PAYMENT RECEIPT
--------------------------------------------------
Receipt No:      REC-${bill.transactionId || bill.id.substring(0, 10).toUpperCase()}
Transaction ID:  ${bill.transactionId || 'N/A'}
Date of Payment: ${bill.paidDate || new Date().toISOString().split('T')[0]}
Payment Method:  ${bill.paymentMethod || 'Online Credit Card'}
Payment Status:  ${bill.status.toUpperCase()}

RESIDENT INFORMATION:
---------------------
Resident Name:   ${bill.residentName}
Flat Number:     Flat ${bill.flatNumber}
Society Compound: Greenwood Heights Gated Compound

BILL CYCLE DETAILS:
-------------------
Billing Cycle:   ${bill.billMonth}
Base Invoice:    $${bill.amount.toFixed(2)}
Late Penalty:    $${bill.penalty.toFixed(2)}
--------------------------------------------------
TOTAL PAID:      $${totalPayable.toFixed(2)}
--------------------------------------------------
Thank you for contributing to Greenwood Heights's
impeccable standard of communal preservation.

Issued by Greenwood Heights Smart Society Management.
🔐 Authenticated Local Ledger Record.
--------------------------------------------------`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${bill.billMonth.replace(/\s+/g, '_')}_Flat_${bill.flatNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePreRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preRegisterForm.name || !preRegisterForm.phone) return;

    const newPreVisitor: Visitor = {
      id: `vis-pre-${Date.now()}`,
      name: preRegisterForm.name,
      phone: preRegisterForm.phone,
      purpose: preRegisterForm.purpose,
      flatNumber: myFlat,
      residentName: profile.name,
      company: preRegisterForm.purpose === 'Delivery' ? (preRegisterForm.company || 'Courier') : undefined,
      status: 'Approved',
      createdTime: new Date().toISOString()
    };

    setVisitors([newPreVisitor, ...visitors]);
    onAddNotification(
      'Pre-Approved Guest Pass Generated',
      `You pre-approved a gate pass for ${newPreVisitor.name}. Send them the pass QR code.`,
      'visitor'
    );

    setPreRegisterForm({
      name: '',
      phone: '',
      purpose: 'Guest',
      company: ''
    });

    setSelectedPassVisitor(newPreVisitor);
  };

  const handleDownloadPass = (v: Visitor) => {
    const passText = `--------------------------------------------------
          GREENWOOD HEIGHTS SMART SOCIETY
              DIGITAL VISITOR GATE PASS
--------------------------------------------------
Pass Code:      GHS-PASS-${v.id.substring(4, 12).toUpperCase()}
Visitor Name:   ${v.name}
Phone Contact:  ${v.phone}
Purpose:        ${v.purpose} ${v.company ? `(${v.company})` : ''}

DESTINATION UNIT:
-----------------
Flat Number:     Flat ${v.flatNumber}
Resident Host:   ${v.residentName}

STATUS:         PRE-APPROVED BY RESIDENT
Security Rule:   Present this pass QR code or Pass Code at the compound
                 entrance gate for immediate scanning and check-in.

Generated on:    ${new Date(v.createdTime).toLocaleString()}
🔐 Cryptographically Signed Local Access Pass.
--------------------------------------------------`;

    const blob = new Blob([passText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Gate_Pass_${v.name.replace(/\s+/g, '_')}_Flat_${v.flatNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleBookFacility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.purpose) return;

    const newBooking: FacilityBooking = {
      id: `book-${Date.now()}`,
      facility: bookingForm.facility,
      flatNumber: myFlat,
      residentName: profile.name,
      bookingDate: bookingForm.bookingDate,
      timeSlot: bookingForm.timeSlot,
      status: 'Pending',
      purpose: bookingForm.purpose,
      createdTime: new Date().toISOString()
    };

    setBookings([newBooking, ...bookings]);
    onAddNotification(
      'Amenity Requested',
      `${profile.name} requested to reserve the ${bookingForm.facility} for ${bookingForm.bookingDate}.`,
      'booking'
    );
    setBookingForm({ ...bookingForm, purpose: '' });
    setActiveTab('booking');
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(p => {
      if (p.id === pollId) {
        if (p.votedUserIds.includes(myFlat)) return p; // Already voted guard
        
        return {
          ...p,
          options: p.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1 } : o),
          votedUserIds: [...p.votedUserIds, myFlat],
          totalVotes: p.totalVotes + 1
        };
      }
      return p;
    }));
    onAddNotification('Vote Registered', 'Your ballot choice has been logged in the secure poll.', 'notice');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      
      {/* Tab navigation sidebar */}
      <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-[#e5e5dc] lg:pr-4">
        {[
          { key: 'home', label: 'Resident Dashboard', icon: User },
          { key: 'complaints', label: 'Helpdesk & Complaints', icon: Wrench },
          { key: 'bills', label: 'Bills & Payments', icon: CreditCard },
          { key: 'booking', label: 'Reserve Amenities', icon: Calendar },
          { key: 'visitors', label: 'Visitor Passes', icon: QrCode },
          { key: 'family_vehicles', label: 'Family & Vehicles', icon: Car }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#5a634d] text-white shadow-xs'
                  : 'text-[#8d917a] hover:bg-[#5a634d]/10 hover:text-[#3d4234]'
              }`}
            >
              <TabIcon className="w-4 h-4 flex-shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel */}
      <div className="lg:col-span-9 space-y-6">

        {/* 1. RESIDENT HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Real-time Visitor Entry Requests */}
            {pendingVisitorApprovals.length > 0 && (
              <div className="bg-[#d4a373]/15 border border-[#d4a373]/40 rounded-[2rem] p-6 space-y-3.5 shadow-xs">
                <div className="flex items-center gap-2 text-[#3d4234]">
                  <ShieldAlert className="w-5 h-5 pulse-indicator text-[#d4a373]" />
                  <h3 className="font-serif font-bold text-base">Visitor Requesting Entry Approval</h3>
                </div>
                
                <div className="space-y-3">
                  {pendingVisitorApprovals.map(v => (
                    <div key={v.id} className="bg-white p-4.5 rounded-2xl border border-[#e5e5dc] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <span className="text-[9px] bg-[#d4a373]/10 text-[#3d4234] px-2 py-0.5 rounded-md font-extrabold font-mono uppercase">
                          {v.company || 'Personal Guest'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#3d4234] mt-1">{v.name}</h4>
                        <p className="text-xs text-[#8d917a] font-medium">Contact: {v.phone} • Purpose: {v.purpose}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApproveVisitor(v.id, true)}
                          className="flex-1 sm:flex-initial bg-[#5a634d] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#3d4234] transition cursor-pointer"
                        >
                          Approve entry
                        </button>
                        <button
                          onClick={() => handleApproveVisitor(v.id, false)}
                          className="flex-1 sm:flex-initial border border-[#e5e5dc] text-[#8d917a] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#f5f5f0] transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resident Greetings banner */}
            <div className="flex justify-between items-center bg-[#5a634d]/10 p-6 rounded-[2rem] border border-[#e5e5dc] shadow-xs">
              <div>
                <h2 className="font-serif font-bold text-xl text-[#3d4234]">Welcome Home, Sarah Connor!</h2>
                <p className="text-xs text-[#8d917a] font-semibold mt-0.5">Apartment B-402 • 4th Floor, Block B</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-[#5a634d] font-mono tracking-wider block">Occupancy Status</span>
                <span className="text-xs bg-white border border-[#e5e5dc] px-3 py-0.5 rounded-full font-bold text-[#5a634d] mt-1 inline-block uppercase tracking-wide">Owner</span>
              </div>
            </div>

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Poll Ballot Box */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-1.5">
                    <Vote className="w-4 h-4 text-blue-600" /> Active Society Ballots
                  </h3>
                  <span className="text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">LIVE POLL</span>
                </div>

                <div className="space-y-4">
                  {polls.slice(0, 2).map(poll => {
                    const hasVoted = poll.votedUserIds.includes(myFlat);
                    return (
                      <div key={poll.id} className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-700 leading-normal">{poll.question}</h4>
                        {hasVoted ? (
                          <div className="space-y-1.5">
                            {poll.options.map(opt => {
                              const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                              return (
                                <div key={opt.id} className="relative bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                  <div className="absolute top-0 left-0 bg-blue-500/10 h-full rounded-r" style={{ width: `${pct}%` }}></div>
                                  <div className="relative flex justify-between text-[11px] text-gray-600">
                                    <span>{opt.text}</span>
                                    <strong className="font-mono">{pct}%</strong>
                                  </div>
                                </div>
                              );
                            })}
                            <p className="text-[9px] text-emerald-600 font-medium flex items-center gap-0.5 justify-end">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Your vote has been recorded
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-1.5 pt-1">
                            {poll.options.map(opt => (
                              <button
                                key={opt.id}
                                onClick={() => handleVote(poll.id, opt.id)}
                                className="w-full text-left text-xs bg-gray-50 border border-gray-200 hover:bg-blue-50/40 hover:border-blue-200 p-2.5 rounded-xl transition cursor-pointer"
                              >
                                {opt.text}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notice Board */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <h3 className="font-display font-bold text-sm text-gray-800 flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-blue-600" /> Recent Notices
                  </h3>
                  <span className="text-[9px] text-gray-400 font-mono">JUNE 2026</span>
                </div>

                <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                  {notices.slice(0, 3).map(not => (
                    <div key={not.id} className={`p-3 rounded-xl border text-xs ${
                      not.isUrgent ? 'bg-rose-50/40 border-rose-100' : 'bg-gray-50/50 border-gray-100'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                          not.isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {not.category}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">{not.publishedDate}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1 leading-snug">{not.title}</h4>
                      <p className="text-gray-500 leading-relaxed truncate">{not.content}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Pre-register & QR Passes section */}
            <div className="bg-white p-6 rounded-[2rem] border border-[#e5e5dc] space-y-6 shadow-xs">
              <div className="flex justify-between items-center border-b border-[#e5e5dc] pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#3d4234] flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#d4a373]" /> Pre-Approved Visitor Passkeys
                  </h3>
                  <p className="text-xs text-[#8d917a] font-medium mt-0.5">Pre-register your guests & generate instant QR gate passes for effortless entry</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Pre-registration Form */}
                <form onSubmit={handlePreRegisterVisitor} className="lg:col-span-5 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-[#3d4234] border-b border-[#f5f5f0] pb-1">Register New Guest</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-[#5a634d] uppercase tracking-wider mb-1">Guest Name</label>
                      <input
                        type="text"
                        required
                        value={preRegisterForm.name}
                        onChange={e => setPreRegisterForm({ ...preRegisterForm, name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#f5f5f0]/50 border border-[#e5e5dc] rounded-xl px-3.5 py-2.5 text-xs text-[#3d4234] placeholder-[#8d917a]/60 focus:ring-1 focus:ring-[#5a634d] outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-[#5a634d] uppercase tracking-wider mb-1">Guest Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={preRegisterForm.phone}
                        onChange={e => setPreRegisterForm({ ...preRegisterForm, phone: e.target.value })}
                        placeholder="+1 (555) 019-2834"
                        className="w-full bg-[#f5f5f0]/50 border border-[#e5e5dc] rounded-xl px-3.5 py-2.5 text-xs text-[#3d4234] placeholder-[#8d917a]/60 focus:ring-1 focus:ring-[#5a634d] outline-hidden font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-[#5a634d] uppercase tracking-wider mb-1">Purpose</label>
                        <select
                          value={preRegisterForm.purpose}
                          onChange={e => setPreRegisterForm({ ...preRegisterForm, purpose: e.target.value })}
                          className="w-full bg-white border border-[#e5e5dc] rounded-xl px-3 py-2.5 text-xs text-[#3d4234] focus:ring-1 focus:ring-[#5a634d] outline-hidden font-semibold"
                        >
                          <option value="Guest">Social Guest</option>
                          <option value="Delivery">Delivery / Courier</option>
                          <option value="Contractor">Service Contractor</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {preRegisterForm.purpose === 'Delivery' && (
                        <div>
                          <label className="block text-[10px] font-extrabold text-[#5a634d] uppercase tracking-wider mb-1">Company</label>
                          <input
                            type="text"
                            required
                            value={preRegisterForm.company}
                            onChange={e => setPreRegisterForm({ ...preRegisterForm, company: e.target.value })}
                            placeholder="e.g. FedEx, Amazon"
                            className="w-full bg-[#f5f5f0]/50 border border-[#e5e5dc] rounded-xl px-3 py-2.5 text-xs text-[#3d4234] placeholder-[#8d917a]/60 focus:ring-1 focus:ring-[#5a634d] outline-hidden font-semibold"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5a634d] hover:bg-[#3d4234] text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4" /> Issue Gate Pass
                  </button>
                </form>

                {/* Pre-registered & Approved Passes list */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="font-serif font-bold text-sm text-[#3d4234] border-b border-[#f5f5f0] pb-1 flex justify-between items-center">
                    <span>Approved & Pre-Registered Passes</span>
                    <span className="text-[10px] text-[#8d917a] font-sans font-medium">{myVisitors.length} total</span>
                  </h4>

                  <div className="space-y-2.5 max-h-[19.5rem] overflow-y-auto pr-1">
                    {myVisitors.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-[#e5e5dc] rounded-2xl bg-[#f5f5f0]/20 space-y-2">
                        <QrCode className="w-8 h-8 text-[#8d917a]/40 mx-auto" />
                        <p className="text-xs text-[#8d917a] font-medium">No visitor records found for Unit {myFlat}.</p>
                      </div>
                    ) : (
                      myVisitors.map(v => {
                        const isPreRegistered = v.id.startsWith('vis-pre-');
                        return (
                          <div key={v.id} className="bg-[#f5f5f0]/30 border border-[#e5e5dc] p-3.5 rounded-xl flex items-center justify-between gap-3 hover:bg-white hover:border-[#5a634d]/40 transition-all">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="font-serif font-extrabold text-xs text-[#3d4234]">{v.name}</h5>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                  v.status === 'Approved' ? 'bg-[#5a634d]/10 text-[#3d4234]' :
                                  v.status === 'Entered' ? 'bg-emerald-50 text-emerald-700' :
                                  v.status === 'Exited' ? 'bg-gray-100 text-gray-500' :
                                  'bg-rose-50 text-rose-700'
                                }`}>
                                  {v.status}
                                </span>
                                {isPreRegistered && (
                                  <span className="text-[8px] bg-[#d4a373]/10 text-[#d4a373] border border-[#d4a373]/20 px-1.5 py-0.2 rounded-md font-bold uppercase">Pre-Approved</span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#8d917a] font-medium">
                                Contact: {v.phone} • {v.purpose} {v.company ? `(${v.company})` : ''}
                              </p>
                              <p className="text-[9px] text-[#8d917a]/80 font-mono">
                                Registered: {new Date(v.createdTime).toLocaleDateString()} at {new Date(v.createdTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setSelectedPassVisitor(v)}
                              className="bg-white hover:bg-[#5a634d]/10 text-[#3d4234] hover:text-[#5a634d] border border-[#e5e5dc] p-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer font-bold text-[10px] uppercase tracking-wider"
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#d4a373]" /> View Pass
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. HELP DESK & COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">Apartment Maintenance Helpdesk</h2>
                <p className="text-xs text-gray-500">Raise maintenance tickets and track progress in real-time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Form to submit complaint */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 space-y-4 h-fit">
                <h3 className="font-display font-bold text-sm text-gray-800 border-b border-gray-50 pb-2">Log Helpdesk Ticket</h3>
                
                <form onSubmit={handleRaiseComplaint} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Service category</label>
                    <select
                      value={newComplaint.category}
                      onChange={e => setNewComplaint({ ...newComplaint, category: e.target.value as ComplaintCategory })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Electrical">Electrical Issues</option>
                      <option value="Plumbing">Plumbing Problems</option>
                      <option value="Water Supply">Water Supply Issues</option>
                      <option value="Cleaning">Cleaning Services</option>
                      <option value="Security">Security Concerns</option>
                      <option value="Parking">Parking Issues</option>
                      <option value="Lift">Lift Maintenance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Complaint Title *</label>
                    <input
                      type="text"
                      required
                      value={newComplaint.title}
                      onChange={e => setNewComplaint({ ...newComplaint, title: e.target.value })}
                      placeholder="Brief headline description"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Severity / Priority</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Low', 'Medium', 'High'].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewComplaint({ ...newComplaint, priority: p as any })}
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            newComplaint.priority === p
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Detailed Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={newComplaint.description}
                      onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}
                      placeholder="Describe water pressure, electrical sparks, or locations..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> File Maintenance Ticket
                  </button>
                </form>
              </div>

              {/* Complaints History & Track status */}
              <div className="md:col-span-3 space-y-4">
                <h3 className="font-display font-bold text-sm text-gray-800">Your Tickets Status</h3>

                {myComplaints.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                    <p className="text-xs">All clean! No active complaints recorded.</p>
                  </div>
                ) : (
                  myComplaints.map(comp => {
                    const statusConfig = {
                      'Open': { bg: 'bg-rose-50 text-rose-700 border-rose-100', icon: AlertCircle },
                      'Assigned': { bg: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
                      'In Progress': { bg: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
                      'Resolved': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
                      'Closed': { bg: 'bg-gray-50 text-gray-600 border-gray-100', icon: CheckCircle2 }
                    };

                    const Config = statusConfig[comp.status];
                    const IconComp = Config.icon;

                    return (
                      <div key={comp.id} className="bg-white p-4.5 rounded-2xl border border-gray-100 space-y-3.5">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-gray-400">Ticket ID: #{comp.id.substring(5, 12)}</span>
                            <h4 className="font-bold text-xs text-gray-800 leading-snug">{comp.title}</h4>
                          </div>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${Config.bg}`}>
                            {comp.status}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 leading-normal">{comp.description}</p>

                        {/* Interactive status bar */}
                        <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                          <span className={comp.status !== 'Open' ? 'text-blue-600 font-semibold' : ''}>Open</span>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                          <span className={(comp.status === 'Assigned' || comp.status === 'In Progress' || comp.status === 'Resolved' || comp.status === 'Closed') ? 'text-blue-600 font-semibold' : ''}>Assigned</span>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                          <span className={(comp.status === 'Resolved' || comp.status === 'Closed') ? 'text-emerald-600 font-semibold' : ''}>Resolved</span>
                        </div>

                        {comp.assignedTo && (
                          <p className="text-[11px] text-gray-600 font-medium">
                            🧑‍🔧 <strong className="text-gray-700">Service Staff:</strong> {comp.assignedTo}
                          </p>
                        )}

                        {comp.status === 'Resolved' && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 space-y-3">
                            <div>
                              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Crew reported issue fixed!
                              </p>
                              {comp.resolutionNotes && (
                                <p className="text-xs text-emerald-700 italic mt-1 bg-white/70 p-2 rounded-lg border border-emerald-50">
                                  Notes: "{comp.resolutionNotes}"
                                </p>
                              )}
                            </div>

                            <div className="border-t border-emerald-100 pt-2 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <span className="text-[10px] text-emerald-800 font-medium">Close ticket and rate the experience:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    onClick={() => handleCloseComplaint(comp.id, star)}
                                    className="p-0.5 text-amber-400 hover:text-amber-500 cursor-pointer"
                                    title={`Rate ${star} Stars and Close`}
                                  >
                                    <Star className="w-4 h-4 fill-amber-100 hover:fill-amber-400" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {comp.status === 'Closed' && comp.residentRating && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium pt-1 border-t border-gray-50">
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Your Rating:</span>
                            <div className="flex text-amber-400">
                              {Array.from({ length: comp.residentRating }).map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          </div>
        )}

        {/* 3. MAINTENANCE BILLS TAB */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900">Maintenance & Utility Billings</h2>
              <p className="text-xs text-gray-500">View and settle your society maintenance dues securely</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Dues List */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="font-display font-bold text-sm text-gray-800">Your Ledger Invoice History</h3>

                {myBills.map(bill => (
                  <div key={bill.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{bill.billMonth}</span>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          bill.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : bill.status === 'Pending'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                        }`}>
                          {bill.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono">Invoice: #{bill.id.substring(0, 10)} • Due Date: {bill.dueDate}</p>
                      
                      {bill.status === 'Overdue' && (
                        <p className="text-[10px] text-rose-600 font-semibold flex items-center gap-0.5">
                          ⚠️ Penalty of $15.00 added due to late payment.
                        </p>
                      )}
                    </div>

                    <div className="text-left sm:text-right space-y-2.5 w-full sm:w-auto">
                      <div className="font-mono font-bold text-lg text-gray-900">${(bill.amount + bill.penalty).toFixed(2)}</div>
                      {bill.status !== 'Paid' ? (
                        <button
                          onClick={() => setPayingBill(bill)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" /> Pay securely
                        </button>
                      ) : (
                        <div className="flex flex-col items-stretch sm:items-end gap-1.5 w-full sm:w-auto">
                          <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Settled
                          </div>
                          <button
                            onClick={() => setSelectedReceiptBill(bill)}
                            className="w-full sm:w-auto bg-[#5a634d]/10 hover:bg-[#5a634d]/20 text-[#3d4234] text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer border border-[#5a634d]/20 uppercase tracking-wider"
                          >
                            <Receipt className="w-3.5 h-3.5 text-[#d4a373]" /> View Receipt
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settle Bill Drawer/Popup */}
              <div className="md:col-span-5">
                {payingBill ? (
                  <form onSubmit={handlePayBillSubmit} className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-xl space-y-5">
                    <div className="flex justify-between items-center">
                      <h4 className="font-display font-semibold text-sm text-slate-300">Settle invoice securely</h4>
                      <button 
                        type="button" 
                        onClick={() => setPayingBill(null)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-linear-to-tr from-slate-800 to-indigo-950 p-4.5 rounded-2xl border border-indigo-900/30 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] text-indigo-400 font-mono tracking-widest block font-bold">GREENWOOD HEIGHTS CO-OP</span>
                          <span className="text-sm font-semibold text-slate-100">{payingBill.billMonth} Maintenance</span>
                        </div>
                        <CreditCard className="w-6 h-6 text-indigo-400" />
                      </div>

                      <div className="font-mono text-xl tracking-wider pt-1">{cardForm.number}</div>

                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <span className="text-[8px] text-slate-400 block">CARDHOLDER</span>
                          <span className="text-xs font-semibold text-slate-200 uppercase">{cardForm.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 block">EXPIRES</span>
                          <span className="text-xs font-mono text-slate-200">{cardForm.expiry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span>Invoice Amount</span>
                        <span className="font-mono text-white">${payingBill.amount.toFixed(2)}</span>
                      </div>
                      {payingBill.penalty > 0 && (
                        <div className="flex justify-between text-amber-400">
                          <span>Late Surcharge Penalty</span>
                          <span className="font-mono">+${payingBill.penalty.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-200 border-t border-slate-800 pt-2 font-semibold">
                        <span>Total Payable Amount</span>
                        <span className="font-mono text-emerald-400">${(payingBill.amount + payingBill.penalty).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 text-xs text-slate-300">
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">Expiry Date</label>
                        <input
                          type="text"
                          required
                          value={cardForm.expiry}
                          onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 uppercase mb-1">CVV Security</label>
                        <input
                          type="password"
                          required
                          maxLength={3}
                          value={cardForm.cvv}
                          onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-hidden focus:ring-1 focus:ring-indigo-500 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessingPayment ? (
                        <>Simulating secure gateway...</>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Authorize Bill Payment
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-slate-500 text-center">🔐 SSL Encrypted bank routing channel</p>
                  </form>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-gray-500 h-full flex flex-col justify-center items-center">
                    <Receipt className="w-10 h-10 text-slate-300 mb-2.5" />
                    <p className="text-xs font-medium text-slate-700">Payment Gateway Panel</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Select any pending/overdue maintenance invoice on the left to initiate the secure payment checkout module.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* 4. FACILITY BOOKING TAB */}
        {activeTab === 'booking' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900">Amenities & Shared Facilities Reservation</h2>
              <p className="text-xs text-gray-500">Rent complex features for gatherings, sports, or fitness</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Booking Request Form */}
              <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-gray-100 space-y-4 h-fit">
                <h3 className="font-display font-bold text-sm text-gray-800 border-b border-gray-50 pb-2">Request Facility Hire</h3>

                <form onSubmit={handleBookFacility} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Select Facility Asset</label>
                    <select
                      value={bookingForm.facility}
                      onChange={e => setBookingForm({ ...bookingForm, facility: e.target.value as FacilityType })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="Club House">Club House (Indoor Leisure)</option>
                      <option value="Gymnasium">Gymnasium (Fitness & Weights)</option>
                      <option value="Community Hall">Community Hall (Private Functions)</option>
                      <option value="Swimming Pool">Swimming Pool (Coached Laps)</option>
                      <option value="Sports Court">Sports Court (Tennis/Basketball)</option>
                      <option value="Garden Area">Garden Area (Outdoor Barbecue)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Reservation Date</label>
                    <input
                      type="date"
                      required
                      value={bookingForm.bookingDate}
                      onChange={e => setBookingForm({ ...bookingForm, bookingDate: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Preferred Time Interval</label>
                    <select
                      value={bookingForm.timeSlot}
                      onChange={e => setBookingForm({ ...bookingForm, timeSlot: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="06:00 AM - 09:00 AM">06:00 AM - 09:00 AM (Early Sunrise)</option>
                      <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning Slot)</option>
                      <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Afternoon Lunch)</option>
                      <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Late Noon)</option>
                      <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM (Prime Evening)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Purpose of Booking *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.purpose}
                      onChange={e => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                      placeholder="e.g. John's graduation family party"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" /> Request Booking Approval
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">📌 Society admin will review and verify availability</p>
                </form>
              </div>

              {/* Booking History */}
              <div className="md:col-span-3 space-y-4">
                <h3 className="font-display font-bold text-sm text-gray-800">Your Booking History</h3>

                {myBookings.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-35" />
                    <p className="text-xs">No reservations scheduled.</p>
                  </div>
                ) : (
                  myBookings.map(book => (
                    <div key={book.id} className="bg-white p-4.5 rounded-2xl border border-gray-100 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-blue-600 font-mono bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100/50">
                            {book.facility}
                          </span>
                          <h4 className="font-semibold text-xs text-gray-500 mt-2">Purpose: "{book.purpose}"</h4>
                        </div>
                        <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          book.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : book.status === 'Pending'
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {book.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-mono">
                        <div>
                          <strong className="text-gray-400 font-sans uppercase text-[9px] block">Date</strong>
                          <span className="font-semibold text-gray-800">{book.bookingDate}</span>
                        </div>
                        <div>
                          <strong className="text-gray-400 font-sans uppercase text-[9px] block">Time Slot</strong>
                          <span className="text-gray-700">{book.timeSlot}</span>
                        </div>
                      </div>

                      {book.status === 'Pending' && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setBookings(bookings.map(b => b.id === book.id ? { ...b, status: 'Cancelled' } : b));
                            }}
                            className="text-[10px] text-gray-400 hover:text-rose-600 hover:underline font-semibold cursor-pointer"
                          >
                            Cancel Request
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* 5. FAMILY & VEHICLES TAB */}
        {activeTab === 'family_vehicles' && (
          <div className="space-y-6">
            
            {/* Family Members Manager */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900">Co-Occupants & Family Register</h3>
                  <p className="text-xs text-gray-500">Maintain records of your household members residing with you</p>
                </div>
                <button
                  id="add-family-btn"
                  onClick={() => setShowAddFamily(!showAddFamily)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Family Member
                </button>
              </div>

              {/* Family Add Form */}
              {showAddFamily && (
                <form onSubmit={handleAddFamilyMember} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                  <h4 className="font-semibold text-xs text-gray-700">Add Household Member</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newFamily.name}
                        onChange={e => setNewFamily({ ...newFamily, name: e.target.value })}
                        placeholder="John Connor"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Relation</label>
                      <input
                        type="text"
                        required
                        value={newFamily.relation}
                        onChange={e => setNewFamily({ ...newFamily, relation: e.target.value })}
                        placeholder="e.g. Son / Daughter / Parent"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Emergency Phone</label>
                      <input
                        type="text"
                        value={newFamily.phone}
                        onChange={e => setNewFamily({ ...newFamily, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setShowAddFamily(false)} className="text-xs text-gray-500 hover:bg-white border border-gray-200 px-3 py-1 rounded-lg cursor-pointer">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white text-xs px-4 py-1 rounded-lg hover:bg-blue-700 cursor-pointer">Save occupant</button>
                  </div>
                </form>
              )}

              {/* Family List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.familyMembers.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No family members registered yet.</p>
                ) : (
                  profile.familyMembers.map(fam => (
                    <div key={fam.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-xs text-gray-900">{fam.name}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5">Relation: {fam.relation}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">📞 {fam.phone}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteFamilyMember(fam.id)}
                        className="text-gray-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove co-occupant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vehicles Manager */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900">Registered Gated Vehicles</h3>
                  <p className="text-xs text-gray-500">Register vehicles with license plate details to access automated RFIDs</p>
                </div>
                <button
                  id="add-vehicle-btn"
                  onClick={() => setShowAddVehicle(!showAddVehicle)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Register Vehicle
                </button>
              </div>

              {/* Vehicle Add Form */}
              {showAddVehicle && (
                <form onSubmit={handleAddVehicle} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3.5">
                  <h4 className="font-semibold text-xs text-gray-700">Configure Vehicle Record</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Vehicle Type</label>
                      <select
                        value={newVehicle.type}
                        onChange={e => setNewVehicle({ ...newVehicle, type: e.target.value as any })}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Car">Sedan / SUV / Hatchback (Car)</option>
                        <option value="Bike">Motorcycle / Scooter (Bike)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">License Plate Number *</label>
                      <input
                        type="text"
                        required
                        value={newVehicle.plate}
                        onChange={e => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                        placeholder="e.g. LA-97-T800"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Assigned Parking Bay</label>
                      <input
                        type="text"
                        value={newVehicle.slot}
                        onChange={e => setNewVehicle({ ...newVehicle, slot: e.target.value })}
                        placeholder="e.g. B-P42"
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <button type="button" onClick={() => setShowAddVehicle(false)} className="text-xs text-gray-500 hover:bg-white border border-gray-200 px-3 py-1 rounded-lg cursor-pointer">Cancel</button>
                    <button type="submit" className="bg-blue-600 text-white text-xs px-4 py-1 rounded-lg hover:bg-blue-700 cursor-pointer">Save vehicle</button>
                  </div>
                </form>
              )}

              {/* Vehicle List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.vehicles.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No vehicles registered yet.</p>
                ) : (
                  profile.vehicles.map(v => (
                    <div key={v.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-50 w-9 h-9 rounded-lg flex items-center justify-center text-lg">
                          {v.type === 'Car' ? '🚗' : '🏍️'}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400">Gated Permit</span>
                          <h4 className="font-mono font-bold text-sm text-gray-900">{v.numberPlate}</h4>
                          <p className="text-[10px] text-gray-500">Reserved Slot: {v.parkingSlot}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteVehicle(v.id)}
                        className="text-gray-300 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Deregister vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* 6. VISITOR ACCESS PASSES TAB */}
        {activeTab === 'visitors' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#3d4234]">Visitor Access Passes & QR Codes</h2>
              <p className="text-xs text-[#8d917a] font-medium">Pre-approve guests and delivery couriers to generate automatic digital passes with scannable gate QR codes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Pre-Register Guest Form */}
              <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-[#e5e5dc] space-y-4 h-fit shadow-xs">
                <h3 className="font-serif font-bold text-base text-[#3d4234] border-b border-[#e5e5dc] pb-2 flex items-center gap-1.5">
                  <UserCheck className="w-5 h-5 text-[#d4a373]" /> Pre-Approve Guest
                </h3>

                <form onSubmit={handlePreRegisterVisitor} className="space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8d917a] uppercase tracking-wider mb-1">Guest's Full Name *</label>
                    <input
                      type="text"
                      required
                      value={preRegisterForm.name}
                      onChange={e => setPreRegisterForm({ ...preRegisterForm, name: e.target.value })}
                      placeholder="e.g. John Connor"
                      className="w-full bg-white border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden text-[#3d4234] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8d917a] uppercase tracking-wider mb-1">Mobile Contact No. *</label>
                    <input
                      type="tel"
                      required
                      value={preRegisterForm.phone}
                      onChange={e => setPreRegisterForm({ ...preRegisterForm, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 902-1010"
                      className="w-full bg-white border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden text-[#3d4234] font-medium font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8d917a] uppercase tracking-wider mb-1">Purpose of Visit</label>
                    <select
                      value={preRegisterForm.purpose}
                      onChange={e => setPreRegisterForm({ ...preRegisterForm, purpose: e.target.value })}
                      className="w-full bg-white border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden text-[#3d4234] font-semibold"
                    >
                      <option value="Guest">Personal Guest / Family</option>
                      <option value="Delivery">Courier Delivery</option>
                      <option value="Maintenance">Maintenance Contractor</option>
                      <option value="Home Services">Home Services / Housekeeper</option>
                      <option value="Other">Other / Utility</option>
                    </select>
                  </div>

                  {preRegisterForm.purpose === 'Delivery' && (
                    <div>
                      <label className="block text-[10px] font-bold text-[#8d917a] uppercase tracking-wider mb-1">Delivery Agency / Company</label>
                      <input
                        type="text"
                        value={preRegisterForm.company}
                        onChange={e => setPreRegisterForm({ ...preRegisterForm, company: e.target.value })}
                        placeholder="e.g. Amazon, FedEx, DHL"
                        className="w-full bg-white border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden text-[#3d4234] font-medium"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-[#5a634d] hover:bg-[#3d4234] text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs uppercase tracking-wider"
                  >
                    <QrCode className="w-4 h-4 text-[#d4a373]" /> Generate Entry Pass
                  </button>
                </form>
              </div>

              {/* Passes List Panel */}
              <div className="md:col-span-8 space-y-4">
                <h3 className="font-serif font-bold text-lg text-[#3d4234] border-b border-[#e5e5dc] pb-2">Active & Historic Passes</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                  {myVisitors.length === 0 ? (
                    <div className="col-span-2 bg-white p-8 rounded-2xl border border-dashed border-[#e5e5dc] text-center text-[#8d917a]">
                      <QrCode className="w-12 h-12 text-[#d4a373]/50 mx-auto mb-2.5" />
                      <p className="text-xs font-bold text-[#3d4234]">No visitor passes generated yet.</p>
                      <p className="text-[11px] text-[#8d917a] mt-1">Pre-register a guest in the form on the left to instantly issue an active security gate pass with a scannable QR code.</p>
                    </div>
                  ) : (
                    myVisitors.map(v => (
                      <div key={v.id} className="bg-white p-4.5 rounded-2xl border border-[#e5e5dc] flex flex-col justify-between space-y-3.5 shadow-xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] bg-[#d4a373]/10 text-[#3d4234] px-2 py-0.5 rounded-md font-extrabold font-mono uppercase tracking-wide">
                              {v.company || v.purpose}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#3d4234] mt-1.5">{v.name}</h4>
                            <p className="text-[10px] text-[#8d917a] font-mono mt-0.5">{v.phone}</p>
                          </div>

                          {/* Status Badge */}
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
                            v.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            v.status === 'Entered' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            v.status === 'Exited' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            v.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            {v.status}
                          </span>
                        </div>

                        {/* Timing Details */}
                        <div className="text-[10px] text-[#8d917a] space-y-1 font-medium border-t border-[#f5f5f0] pt-2">
                          <div className="flex justify-between">
                            <span>Created At:</span>
                            <span className="font-mono text-[#3d4234]">{new Date(v.createdTime).toLocaleDateString()} {new Date(v.createdTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {v.entryTime && (
                            <div className="flex justify-between text-emerald-700">
                              <span>Entry Logged:</span>
                              <span className="font-mono font-bold">{new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                          {v.exitTime && (
                            <div className="flex justify-between text-gray-500">
                              <span>Exit Logged:</span>
                              <span className="font-mono font-bold">{new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex gap-2 border-t border-[#f5f5f0] pt-2">
                          {v.status === 'Pending Approval' ? (
                            <>
                              <button
                                onClick={() => handleApproveVisitor(v.id, true)}
                                className="flex-1 bg-[#5a634d] text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-[#3d4234] transition cursor-pointer text-center uppercase tracking-wider"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveVisitor(v.id, false)}
                                className="flex-1 border border-[#e5e5dc] text-[#8d917a] text-[10px] font-bold py-1.5 rounded-lg hover:bg-[#f5f5f0] transition cursor-pointer text-center uppercase tracking-wider"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedPassVisitor(v)}
                              className="w-full bg-[#5a634d]/10 hover:bg-[#5a634d]/20 text-[#3d4234] text-[10px] font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-[#5a634d]/20 uppercase tracking-wider"
                            >
                              <QrCode className="w-3.5 h-3.5 text-[#d4a373]" /> View Gate Pass QR
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 5. PAYMENT RECEIPT MODAL */}
      {selectedReceiptBill && (
        <div className="fixed inset-0 bg-[#2d3027]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#f5f5f0] border border-[#e5e5dc] rounded-[2.5rem] w-full max-w-md shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            
            {/* Header branding */}
            <div className="text-center space-y-2 border-b border-[#e5e5dc] pb-5">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-[#5a634d] flex items-center justify-center text-white shadow-md">
                <Receipt className="w-6 h-6 text-[#d4a373]" />
              </div>
              <h3 className="font-serif font-extrabold text-lg text-[#3d4234] tracking-tight">Greenwood Heights Co-op</h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8d917a]">Official Ledger Receipt</p>
            </div>

            {/* Receipt body details */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e5e5dc] space-y-3 shadow-xs">
                
                {/* ID and Date Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-[#f5f5f0] pb-3">
                  <div>
                    <span className="text-[9px] font-semibold text-[#8d917a] uppercase tracking-wider block">Receipt ID</span>
                    <span className="font-mono font-bold text-[#3d4234]">REC-{selectedReceiptBill.transactionId?.substring(4, 12) || selectedReceiptBill.id.substring(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-semibold text-[#8d917a] uppercase tracking-wider block">Payment Date</span>
                    <span className="font-mono font-bold text-[#3d4234]">{selectedReceiptBill.paidDate || new Date().toISOString().split('T')[0]}</span>
                  </div>
                </div>

                {/* Resident Details */}
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-[#f5f5f0] pb-3">
                  <div>
                    <span className="text-[9px] font-semibold text-[#8d917a] uppercase tracking-wider block">Resident</span>
                    <span className="font-bold text-[#3d4234]">{selectedReceiptBill.residentName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-semibold text-[#8d917a] uppercase tracking-wider block">Flat Unit</span>
                    <span className="font-bold text-[#5a634d]">Flat {selectedReceiptBill.flatNumber}</span>
                  </div>
                </div>

                {/* Billing Cycle & Method */}
                <div className="grid grid-cols-2 gap-3 text-xs border-b border-[#f5f5f0] pb-3">
                  <div>
                    <span className="text-[9px] font-semibold text-[#8d917a] uppercase tracking-wider block">Billing Period</span>
                    <span className="font-bold text-[#3d4234]">{selectedReceiptBill.billMonth}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-semibold text-[#8d917a] uppercase tracking-wider block">Method</span>
                    <span className="font-bold text-[#3d4234]">{selectedReceiptBill.paymentMethod || 'Online Credit Card'}</span>
                  </div>
                </div>

                {/* Ledger Calculations */}
                <div className="space-y-1.5 pt-1.5 text-xs">
                  <div className="flex justify-between text-[#8d917a]">
                    <span>Standard Maintenance Dues</span>
                    <span className="font-mono text-[#3d4234] font-medium">${selectedReceiptBill.amount.toFixed(2)}</span>
                  </div>
                  
                  {selectedReceiptBill.penalty > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Late Payment Penalty</span>
                      <span className="font-mono font-medium">+${selectedReceiptBill.penalty.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[#3d4234] font-extrabold text-sm border-t border-[#f5f5f0] pt-2 mt-2">
                    <span className="font-serif">Total Amount Paid</span>
                    <span className="font-mono text-emerald-700">${(selectedReceiptBill.amount + selectedReceiptBill.penalty).toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Status Ribbon */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settled successfully
                </span>
                <span className="text-[10px] font-mono font-bold text-[#8d917a]">REF: {selectedReceiptBill.transactionId || 'TXN-000000'}</span>
              </div>
            </div>

            {/* Micro details message */}
            <p className="text-[10px] text-center text-[#8d917a] leading-relaxed max-w-xs mx-auto font-medium">
              Thank you for contributing to Greenwood Heights's impeccable standard of communal preservation. This ledger record is cryptographically signed and stored locally.
            </p>

            {/* Actions Footer */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReceiptBill(null)}
                className="w-full bg-[#e5e5dc] hover:bg-[#d4d4c5] text-[#3d4234] text-xs font-bold py-2.5 rounded-xl transition cursor-pointer text-center"
              >
                Close Receipt
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReceipt(selectedReceiptBill)}
                className="w-full bg-[#5a634d] hover:bg-[#3d4234] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Download (.TXT)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. DIGITAL VISITOR PASS / QR CODE MODAL */}
      {selectedPassVisitor && (
        <div className="fixed inset-0 bg-[#2d3027]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#f5f5f0] border border-[#e5e5dc] rounded-[2.5rem] w-full max-w-sm shadow-2xl p-6 space-y-5 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            
            {/* Header / Brand */}
            <div className="text-center space-y-1.5 border-b border-[#e5e5dc] pb-4">
              <div className="mx-auto w-11 h-11 rounded-2xl bg-[#5a634d] flex items-center justify-center text-white shadow-md">
                <QrCode className="w-5.5 h-5.5 text-[#d4a373]" />
              </div>
              <h3 className="font-serif font-extrabold text-base text-[#3d4234] tracking-tight">Gate Entry Passkey</h3>
              <p className="text-[9px] font-bold uppercase tracking-wider text-[#8d917a]">Greenwood Heights Smart Security</p>
            </div>

            {/* QR Code Canvas Generator */}
            <div className="flex justify-center py-2">
              <QRCodeGenerator 
                value={`GHS-PASS-${selectedPassVisitor.id}`} 
                size={180} 
              />
            </div>

            {/* Pass details */}
            <div className="bg-white p-4.5 rounded-2xl border border-[#e5e5dc] space-y-2 text-xs shadow-xs">
              <div className="flex justify-between items-center border-b border-[#f5f5f0] pb-2">
                <span className="text-[#8d917a] font-medium">Visitor Name</span>
                <span className="font-bold text-[#3d4234]">{selectedPassVisitor.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#f5f5f0] pb-2">
                <span className="text-[#8d917a] font-medium">Contact Phone</span>
                <span className="font-mono text-[#3d4234]">{selectedPassVisitor.phone}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#f5f5f0] pb-2">
                <span className="text-[#8d917a] font-medium">Purpose / Unit</span>
                <span className="font-bold text-[#3d4234]">{selectedPassVisitor.purpose} (Flat {selectedPassVisitor.flatNumber})</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#8d917a] font-medium">Pass Status</span>
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  {selectedPassVisitor.status}
                </span>
              </div>
            </div>

            {/* Micro instruction */}
            <p className="text-[9.5px] text-center text-[#8d917a] leading-relaxed max-w-xs mx-auto font-medium">
              Present this code at the gate entrance. Security guard will scan this to verify authorization and instantly process check-in.
            </p>

            {/* Actions footer */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedPassVisitor(null)}
                className="w-full bg-[#e5e5dc] hover:bg-[#d4d4c5] text-[#3d4234] text-xs font-bold py-2.5 rounded-xl transition cursor-pointer text-center"
              >
                Close Pass
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPass(selectedPassVisitor)}
                className="w-full bg-[#5a634d] hover:bg-[#3d4234] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Download (.TXT)
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
