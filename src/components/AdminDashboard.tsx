import React, { useState } from 'react';
import { 
  ResidentProfile, 
  Visitor, 
  Complaint, 
  MaintenanceBill, 
  FacilityBooking, 
  Notice, 
  Poll,
  NoticeCategory
} from '../types';
import { 
  Users, 
  UserPlus, 
  Wrench, 
  FileText, 
  Calendar, 
  BarChart3, 
  Sparkles, 
  Megaphone, 
  Vote, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Plus, 
  User, 
  Car, 
  Send,
  Building,
  Check,
  X,
  Trash2,
  TrendingUp,
  Percent
} from 'lucide-react';

interface AdminDashboardProps {
  residents: ResidentProfile[];
  setResidents: React.Dispatch<React.SetStateAction<ResidentProfile[]>>;
  visitors: Visitor[];
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  bills: MaintenanceBill[];
  setBills: React.Dispatch<React.SetStateAction<MaintenanceBill[]>>;
  bookings: FacilityBooking[];
  setBookings: React.Dispatch<React.SetStateAction<FacilityBooking[]>>;
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  polls: Poll[];
  setPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
  onAddNotification: (title: string, message: string, type: 'visitor' | 'complaint' | 'bill' | 'booking' | 'notice') => void;
}

export default function AdminDashboard({
  residents,
  setResidents,
  visitors,
  complaints,
  setComplaints,
  bills,
  setBills,
  bookings,
  setBookings,
  notices,
  setNotices,
  polls,
  setPolls,
  onAddNotification
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'residents' | 'complaints' | 'billing' | 'bookings' | 'notices_polls'>('overview');

  // Modal / Form States
  const [showAddResident, setShowAddResident] = useState(false);
  const [newRes, setNewRes] = useState({
    name: '',
    email: '',
    phone: '',
    flatNumber: '',
    occupancyType: 'Owner' as 'Owner' | 'Tenant',
    familyMemberName: '',
    familyRelation: '',
    familyPhone: '',
    vehicleType: 'Car' as 'Car' | 'Bike',
    vehiclePlate: '',
    parkingSlot: ''
  });

  const [showGenerateBill, setShowGenerateBill] = useState(false);
  const [newBill, setNewBill] = useState({
    billMonth: 'July 2026',
    dueDate: '2026-08-05',
    amount: '150.00',
    flatOption: 'all' // 'all' or specific flat
  });

  const [showCreateNotice, setShowCreateNotice] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    content: '',
    category: 'General' as NoticeCategory,
    isUrgent: false
  });

  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [newPoll, setNewPoll] = useState({
    question: '',
    category: 'Community Decisions',
    option1: '',
    option2: '',
    option3: ''
  });

  // Analytics helper variables
  const totalResidents = residents.length + residents.reduce((acc, curr) => acc + curr.familyMembers.length, 0);
  const occupiedFlats = residents.length;
  const pendingBillsCount = bills.filter(b => b.status === 'Pending').length;
  const overdueBillsCount = bills.filter(b => b.status === 'Overdue').length;
  
  const totalRevenueGenerated = bills.reduce((acc, curr) => acc + curr.amount, 0);
  const totalRevenueCollected = bills.filter(b => b.status === 'Paid').reduce((acc, curr) => acc + curr.amount, 0);
  const outstandingBillsTotal = bills.filter(b => b.status !== 'Paid').reduce((acc, curr) => acc + curr.amount + curr.penalty, 0);

  const openComplaintsCount = complaints.filter(c => c.status === 'Open').length;
  const activeComplaintsCount = complaints.filter(c => c.status !== 'Closed' && c.status !== 'Resolved').length;
  const resolvedComplaintsCount = complaints.filter(c => c.status === 'Resolved').length;

  const activeVisitorsToday = visitors.filter(v => v.status === 'Entered').length;

  // Handlers
  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRes.name || !newRes.flatNumber) return;

    const resId = `res-${Date.now()}`;
    const newProfile: ResidentProfile = {
      id: resId,
      name: newRes.name,
      email: newRes.email || `${newRes.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      phone: newRes.phone || '+1 (555) 000-0000',
      flatNumber: newRes.flatNumber,
      occupancyType: newRes.occupancyType,
      familyMembers: newRes.familyMemberName ? [{
        id: `fam-${Date.now()}`,
        name: newRes.familyMemberName,
        relation: newRes.familyRelation || 'Family',
        phone: newRes.familyPhone || '+1 (555) 000-0000'
      }] : [],
      vehicles: newRes.vehiclePlate ? [{
        id: `veh-${Date.now()}`,
        type: newRes.vehicleType,
        numberPlate: newRes.vehiclePlate,
        parkingSlot: newRes.parkingSlot || `${newRes.flatNumber}-P`
      }] : []
    };

    setResidents([...residents, newProfile]);
    onAddNotification('Resident Registered', `Flat ${newRes.flatNumber} has been allocated to ${newRes.name}.`, 'notice');

    // Reset Form
    setNewRes({
      name: '',
      email: '',
      phone: '',
      flatNumber: '',
      occupancyType: 'Owner',
      familyMemberName: '',
      familyRelation: '',
      familyPhone: '',
      vehicleType: 'Car',
      vehiclePlate: '',
      parkingSlot: ''
    });
    setShowAddResident(false);
  };

  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newBill.amount);
    if (isNaN(amt) || amt <= 0) return;

    let targetResidents = [...residents];
    if (newBill.flatOption !== 'all') {
      targetResidents = residents.filter(r => r.flatNumber === newBill.flatOption);
    }

    const generatedBills: MaintenanceBill[] = targetResidents.map(r => ({
      id: `bill-${Date.now()}-${r.id}`,
      billMonth: newBill.billMonth,
      dueDate: newBill.dueDate,
      flatNumber: r.flatNumber,
      residentName: r.name,
      amount: amt,
      penalty: 0,
      status: 'Pending'
    }));

    setBills([...bills, ...generatedBills]);
    onAddNotification('Billing Generated', `${newBill.billMonth} invoice generated for society residences.`, 'bill');
    setShowGenerateBill(false);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;

    const noticeItem: Notice = {
      id: `not-${Date.now()}`,
      title: newNotice.title,
      content: newNotice.content,
      category: newNotice.category,
      publishedDate: new Date().toISOString().split('T')[0],
      sender: 'Property Management Board',
      isUrgent: newNotice.isUrgent
    };

    setNotices([noticeItem, ...notices]);
    onAddNotification('New Announcement', `${newNotice.isUrgent ? 'URGENT: ' : ''}${newNotice.title}`, 'notice');
    setShowCreateNotice(false);
    setNewNotice({ title: '', content: '', category: 'General', isUrgent: false });
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoll.question || !newPoll.option1 || !newPoll.option2) return;

    const options = [
      { id: 'opt-1', text: newPoll.option1, votes: 0 },
      { id: 'opt-2', text: newPoll.option2, votes: 0 }
    ];
    if (newPoll.option3) {
      options.push({ id: 'opt-3', text: newPoll.option3, votes: 0 });
    }

    const pollItem: Poll = {
      id: `poll-${Date.now()}`,
      question: newPoll.question,
      options,
      votedUserIds: [],
      totalVotes: 0,
      createdDate: new Date().toISOString().split('T')[0],
      expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days later
      category: newPoll.category
    };

    setPolls([pollItem, ...polls]);
    onAddNotification('Society Poll Published', `Voters required: "${newPoll.question}"`, 'notice');
    setShowCreatePoll(false);
    setNewPoll({ question: '', category: 'Community Decisions', option1: '', option2: '', option3: '' });
  };

  const handleAssignComplaint = (id: string) => {
    setComplaints(complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Assigned',
          assignedTo: 'Mike Evans (Helpdesk Staff)',
          assignedToId: 'staff-mike',
          updatedTime: new Date().toISOString()
        };
      }
      return c;
    }));
    onAddNotification('Ticket Dispatched', 'Service technician assigned to resolve complaint.', 'complaint');
  };

  const handleApproveBooking = (id: string, approve: boolean) => {
    setBookings(bookings.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: approve ? 'Approved' : 'Cancelled'
        };
      }
      return b;
    }));
    const bDetails = bookings.find(b => b.id === id);
    if (bDetails) {
      onAddNotification(
        `Booking ${approve ? 'Approved' : 'Cancelled'}`,
        `${bDetails.facility} reservation for ${bDetails.residentName} (${bDetails.flatNumber}) is ${approve ? 'CONFIRMED' : 'DECLINED'}.`,
        'booking'
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      
      {/* Sidebar navigation inside Admin Dashboard */}
      <div className="lg:col-span-3 flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-[#e5e5dc] lg:pr-4">
        {[
          { key: 'overview', label: 'Overview & Statistics', icon: BarChart3 },
          { key: 'residents', label: 'Resident Directory', icon: Users },
          { key: 'complaints', label: 'Complaints & Workorders', icon: Wrench },
          { key: 'billing', label: 'Finances & Ledger', icon: DollarSign },
          { key: 'bookings', label: 'Club Facility Booking', icon: Calendar },
          { key: 'notices_polls', label: 'Notices, Alerts & Polls', icon: Megaphone }
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

        {/* 1. OVERVIEW & STATISTICS TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-serif font-bold text-2xl text-[#3d4234]">Society Command Center</h2>
                <p className="text-xs text-[#8d917a] font-medium">Live operational intelligence summary</p>
              </div>
              <div className="bg-[#5a634d]/10 text-[#3d4234] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#5a634d]/20 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#5a634d]" /> All operations active
              </div>
            </div>

            {/* Metrics Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Residents Profile</span>
                  <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display font-bold text-2xl text-gray-900">{totalResidents}</div>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">{occupiedFlats} Occupied Flats</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Live Visitors</span>
                  <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display font-bold text-2xl text-gray-900">{activeVisitorsToday}</div>
                <p className="text-[10px] text-gray-500 mt-1">Currently inside gated compound</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Helpdesk Tickets</span>
                  <div className="bg-rose-50 p-1.5 rounded-lg text-rose-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display font-bold text-2xl text-rose-600">{activeComplaintsCount}</div>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">{openComplaintsCount} Unassigned Open</p>
              </div>

              <div className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ledger Collection</span>
                  <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-display font-bold text-2xl text-emerald-600">
                  {Math.round((totalRevenueCollected / (totalRevenueGenerated || 1)) * 100)}%
                </div>
                <p className="text-[10px] text-gray-500 mt-1 font-mono">${totalRevenueCollected} of ${totalRevenueGenerated} Paid</p>
              </div>
            </div>

            {/* Financial Ledger Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-sm text-gray-800">Financial Performance Overview</h3>
                    <p className="text-[10px] text-gray-400">Analysis of collected fees & outstanding receivables</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                
                <div className="space-y-3.5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-600 mb-1.5">
                      <span>Total Invoice Billing</span>
                      <span>${totalRevenueGenerated.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-emerald-700 mb-1.5">
                      <span>Received & Settle Account</span>
                      <span>${totalRevenueCollected.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(totalRevenueCollected / (totalRevenueGenerated || 1)) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-rose-700 mb-1.5">
                      <span>Receivables Outstanding (with penalties)</span>
                      <span>${outstandingBillsTotal.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(outstandingBillsTotal / (totalRevenueGenerated + 100)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-gray-600 font-medium">Overdue Accounts: {overdueBillsCount} Flats</span>
                  </div>
                  <span className="text-xs font-mono text-amber-600 font-bold">10% Penalty added monthly</span>
                </div>
              </div>

              {/* Quick Facility Calendar summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="border-b border-gray-50 pb-3">
                  <h3 className="font-display font-bold text-sm text-gray-800">Amenities Booking Status</h3>
                  <p className="text-[10px] text-gray-400">Approval pipeline</p>
                </div>

                <div className="space-y-3">
                  {bookings.filter(b => b.status === 'Pending').length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <CheckCircle className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                      <p className="text-xs">All bookings resolved</p>
                    </div>
                  ) : (
                    bookings.filter(b => b.status === 'Pending').map(booking => (
                      <div key={booking.id} className="p-3 bg-indigo-50/30 rounded-xl border border-indigo-50/50 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider font-mono">{booking.facility}</span>
                            <h4 className="font-medium text-xs text-gray-800 mt-0.5">{booking.residentName} ({booking.flatNumber})</h4>
                            <p className="text-[10px] text-gray-500">Date: {booking.bookingDate} • {booking.timeSlot}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleApproveBooking(booking.id, true)}
                            className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-indigo-700 transition cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveBooking(booking.id, false)}
                            className="border border-gray-200 text-gray-500 text-[10px] font-bold px-2.5 py-1 rounded-md hover:bg-gray-50 transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. RESIDENT DIRECTORY TAB */}
        {activeTab === 'residents' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">Residences & Occupancy Directory</h2>
                <p className="text-xs text-gray-500">Manage flats, occupants, family members, & registered vehicles</p>
              </div>
              <button
                id="add-resident-btn"
                onClick={() => setShowAddResident(!showAddResident)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Add Flat Allocation
              </button>
            </div>

            {/* Allocation Form Modal */}
            {showAddResident && (
              <form onSubmit={handleAddResident} className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-display font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" /> Allocate Flat & Resident Profile
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Primary Occupant Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thomas Anderson"
                      value={newRes.name}
                      onChange={e => setNewRes({ ...newRes, name: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Flat Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. C-104 or B-202"
                      value={newRes.flatNumber}
                      onChange={e => setNewRes({ ...newRes, flatNumber: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Occupancy Status</label>
                    <select
                      value={newRes.occupancyType}
                      onChange={e => setNewRes({ ...newRes, occupancyType: e.target.value as any })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                    >
                      <option value="Owner">Owner (Permanent)</option>
                      <option value="Tenant">Tenant (Leaseholder)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="thomas@matrix.io"
                      value={newRes.email}
                      onChange={e => setNewRes({ ...newRes, email: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={newRes.phone}
                      onChange={e => setNewRes({ ...newRes, phone: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Parking Bay Assignment</label>
                    <input
                      type="text"
                      placeholder="e.g. C-P20"
                      value={newRes.parkingSlot}
                      onChange={e => setNewRes({ ...newRes, parkingSlot: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200/60 pt-4 mt-2">
                  <h4 className="font-semibold text-xs text-gray-700 mb-3">Optional: Family and Vehicle Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Family Member Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Morpheus"
                        value={newRes.familyMemberName}
                        onChange={e => setNewRes({ ...newRes, familyMemberName: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Relation</label>
                      <input
                        type="text"
                        placeholder="e.g. Brother / Spouse"
                        value={newRes.familyRelation}
                        onChange={e => setNewRes({ ...newRes, familyRelation: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Vehicle Type</label>
                      <select
                        value={newRes.vehicleType}
                        onChange={e => setNewRes({ ...newRes, vehicleType: e.target.value as any })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                      >
                        <option value="Car">Car</option>
                        <option value="Bike">Motorbike</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase mb-1">Vehicle License Plate</label>
                      <input
                        type="text"
                        placeholder="e.g. NEO-77"
                        value={newRes.vehiclePlate}
                        onChange={e => setNewRes({ ...newRes, vehiclePlate: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddResident(false)}
                    className="border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  >
                    Save Allocation
                  </button>
                </div>
              </form>
            )}

            {/* Directory Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {residents.map(res => (
                <div key={res.id} className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <div className="bg-indigo-50 text-indigo-700 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm">
                        {res.flatNumber}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-gray-900">{res.name}</h3>
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-medium mt-1 ${
                          res.occupancyType === 'Owner'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {res.occupancyType}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setResidents(residents.filter(r => r.id !== res.id));
                      }}
                      className="text-gray-300 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                      title="Deallocate resident"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 font-sans">
                    <p>📧 <strong className="text-gray-800">Email:</strong> {res.email}</p>
                    <p>📞 <strong className="text-gray-800">Phone:</strong> {res.phone}</p>
                  </div>

                  {/* Family breakdown */}
                  {res.familyMembers.length > 0 && (
                    <div className="border-t border-gray-50 pt-3">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-gray-400" /> Co-Occupants / Family
                      </h4>
                      <div className="space-y-1">
                        {res.familyMembers.map(f => (
                          <div key={f.id} className="text-xs text-gray-600 flex justify-between">
                            <span>{f.name} <span className="text-gray-400 font-normal">({f.relation})</span></span>
                            <span className="font-mono text-[10px] text-gray-500">{f.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicles breakdown */}
                  {res.vehicles.length > 0 && (
                    <div className="border-t border-gray-50 pt-3">
                      <h4 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-gray-400" /> Registered Vehicles
                      </h4>
                      <div className="space-y-1">
                        {res.vehicles.map(v => (
                          <div key={v.id} className="text-xs text-gray-600 flex justify-between items-center bg-gray-50 p-1.5 rounded-lg border border-gray-100/50">
                            <span className="font-medium">{v.type === 'Car' ? '🚗 Car' : '🏍️ Bike'}</span>
                            <span className="font-mono bg-white border border-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-[10px] font-semibold">{v.numberPlate}</span>
                            <span className="text-[10px] text-gray-400">Bay: {v.parkingSlot}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. COMPLAINTS & HELPDESK TAB */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900">Society Maintenance & Service Tickets</h2>
              <p className="text-xs text-gray-500">Track and assign complaints to service crews</p>
            </div>

            <div className="space-y-4">
              {complaints.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400">
                  <Wrench className="w-10 h-10 mx-auto mb-2 opacity-35" />
                  <p className="text-xs">No active maintenance complaints reported!</p>
                </div>
              ) : (
                complaints.map(comp => {
                  const statusColors = {
                    'Open': 'bg-rose-50 text-rose-700 border-rose-200',
                    'Assigned': 'bg-blue-50 text-blue-700 border-blue-200',
                    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
                    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    'Closed': 'bg-gray-50 text-gray-700 border-gray-200'
                  };

                  return (
                    <div key={comp.id} className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2.5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${statusColors[comp.status]}`}>
                              {comp.status}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              comp.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {comp.priority} Priority
                            </span>
                            <span className="text-xs text-gray-400 font-mono">#{comp.id}</span>
                          </div>
                          <h3 className="font-display font-bold text-sm text-gray-900">{comp.title}</h3>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] font-medium text-indigo-600 uppercase tracking-wide font-mono bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-50">{comp.category}</span>
                          <p className="text-xs text-gray-500 mt-1">{comp.residentName} • Flat {comp.flatNumber}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/50">
                        {comp.description}
                      </p>

                      {comp.resolutionNotes && (
                        <div className="bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/30 text-xs text-gray-700">
                          <strong className="text-emerald-700 block mb-1">🔧 Resolution Notes:</strong>
                          {comp.resolutionNotes}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-50 pt-3.5">
                        <span className="text-[10px] text-gray-400 font-mono">
                          Raised: {new Date(comp.createdTime).toLocaleString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {comp.status === 'Open' && (
                            <button
                              onClick={() => handleAssignComplaint(comp.id)}
                              className="bg-indigo-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer"
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Assign Mike Evans
                            </button>
                          )}
                          {comp.status === 'Assigned' && (
                            <span className="text-xs text-blue-600 font-semibold bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Assigned: Mike Evans
                            </span>
                          )}
                          {comp.status === 'Resolved' && (
                            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> Resolved (Awaiting Resident Close)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 4. BILLING & FINANCE TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="font-display font-bold text-xl text-gray-900">Maintenance Billings Ledger</h2>
                <p className="text-xs text-gray-500">Generate monthly invoices and track flat-wise collections</p>
              </div>
              <button
                id="gen-invoice-btn"
                onClick={() => setShowGenerateBill(!showGenerateBill)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Generate New Invoices
              </button>
            </div>

            {/* Bill Generator Form */}
            {showGenerateBill && (
              <form onSubmit={handleGenerateBill} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-display font-semibold text-sm text-gray-800">Generate Maintenance Cycle Billing</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Billing Month</label>
                    <input
                      type="text"
                      required
                      value={newBill.billMonth}
                      onChange={e => setNewBill({ ...newBill, billMonth: e.target.value })}
                      placeholder="e.g. July 2026"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      value={newBill.amount}
                      onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={newBill.dueDate}
                      onChange={e => setNewBill({ ...newBill, dueDate: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Target Flats</label>
                    <select
                      value={newBill.flatOption}
                      onChange={e => setNewBill({ ...newBill, flatOption: e.target.value })}
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                    >
                      <option value="all">All Residences (Global Run)</option>
                      {residents.map(r => (
                        <option key={r.id} value={r.flatNumber}>Flat {r.flatNumber} ({r.name})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowGenerateBill(false)}
                    className="border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                  >
                    Generate Billing run
                  </button>
                </div>
              </form>
            )}

            {/* Invoices List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                      <th className="px-6 py-4">Bill Cycle / ID</th>
                      <th className="px-6 py-4">Resident / Flat</th>
                      <th className="px-6 py-4">Amount Due</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Settlement Status</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                    {bills.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50/40">
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">{b.billMonth}</span>
                          <span className="block text-[10px] text-gray-400 font-mono">#{b.id.substring(0, 12)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-900">{b.residentName}</span>
                          <span className="block text-[10px] text-gray-400 font-mono">Flat {b.flatNumber}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-900">
                          ${(b.amount + b.penalty).toFixed(2)}
                          {b.penalty > 0 && (
                            <span className="block text-[9px] text-amber-600 font-medium">+${b.penalty.toFixed(2)} Penalty</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono">{b.dueDate}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            b.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : b.status === 'Pending'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {b.status !== 'Paid' ? (
                            <button
                              onClick={() => {
                                setBills(bills.map(item => item.id === b.id ? { 
                                  ...item, 
                                  status: 'Paid',
                                  paidDate: new Date().toISOString().split('T')[0],
                                  paymentMethod: 'Cash Office',
                                  transactionId: `CSH-${Date.now().toString().substring(5)}`
                                } : item));
                                onAddNotification('Bill Settled', `Settle cash payment of $${b.amount} for Flat ${b.flatNumber}.`, 'bill');
                              }}
                              className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-800 border border-emerald-200 hover:bg-emerald-50 px-2 py-1 rounded-md transition cursor-pointer"
                            >
                              Settle Cash
                            </button>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-mono flex items-center gap-0.5">
                              <Check className="w-3.5 h-3.5 text-emerald-500" /> Settled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. FACILITY BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display font-bold text-xl text-gray-900">Amenity & Facility Reservations</h2>
              <p className="text-xs text-gray-500">Review, approve, or cancel resident bookings for community assets</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map(book => (
                <div key={book.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-md font-mono">
                        {book.facility}
                      </span>
                      <span className={`inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        book.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : book.status === 'Pending'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {book.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-semibold text-xs text-gray-500">Applicant</h3>
                      <p className="font-semibold text-sm text-gray-900 mt-0.5">{book.residentName} <span className="font-normal text-gray-500">(Flat {book.flatNumber})</span></p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <div>
                        <strong className="text-gray-400 uppercase text-[9px] tracking-wider block">Booking Date</strong>
                        <span className="font-mono text-gray-800 font-semibold">{book.bookingDate}</span>
                      </div>
                      <div>
                        <strong className="text-gray-400 uppercase text-[9px] tracking-wider block">Time Slot</strong>
                        <span className="font-mono text-gray-800">{book.timeSlot}</span>
                      </div>
                    </div>

                    {book.purpose && (
                      <p className="text-xs text-gray-500 italic mt-1 bg-slate-50/50 px-3 py-1.5 rounded-lg border border-dashed border-slate-100">
                        Purpose: "{book.purpose}"
                      </p>
                    )}
                  </div>

                  {book.status === 'Pending' && (
                    <div className="flex gap-2 border-t border-gray-50 pt-3">
                      <button
                        onClick={() => handleApproveBooking(book.id, true)}
                        className="flex-1 bg-emerald-600 text-white font-bold text-xs py-2 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleApproveBooking(book.id, false)}
                        className="flex-1 border border-gray-200 text-gray-500 font-bold text-xs py-2 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. NOTICES & POLLS TAB */}
        {activeTab === 'notices_polls' && (
          <div className="space-y-6">
            
            {/* Notices Sub-Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900">Broadcast Boards & Notice Announcements</h3>
                  <p className="text-xs text-gray-500">Publish alerts, schedules, or events directly to resident dashboards</p>
                </div>
                <button
                  id="publish-notice-btn"
                  onClick={() => setShowCreateNotice(!showCreateNotice)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Publish Notice
                </button>
              </div>

              {/* Notice Form */}
              {showCreateNotice && (
                <form onSubmit={handleCreateNotice} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h4 className="font-semibold text-xs text-gray-800 uppercase tracking-wider">Create Digital Notice</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notice Title *</label>
                      <input
                        type="text"
                        required
                        value={newNotice.title}
                        onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                        placeholder="e.g. Annual General Body Meeting Notice"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notice Category</label>
                      <select
                        value={newNotice.category}
                        onChange={e => setNewNotice({ ...newNotice, category: e.target.value as any })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      >
                        <option value="General">General Notice</option>
                        <option value="Emergency">Emergency Alert</option>
                        <option value="Event">Event Announcements</option>
                        <option value="Meeting">Meeting Notifications</option>
                        <option value="Maintenance">Maintenance Schedule</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Notice Content Body *</label>
                    <textarea
                      required
                      rows={3}
                      value={newNotice.content}
                      onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                      placeholder="Type the full body contents of the announcement..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                    ></textarea>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isUrgent"
                      checked={newNotice.isUrgent}
                      onChange={e => setNewNotice({ ...newNotice, isUrgent: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isUrgent" className="text-xs text-rose-600 font-semibold flex items-center gap-1 cursor-pointer">
                      <AlertTriangle className="w-3.5 h-3.5" /> High priority / Urgent broadcast?
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCreateNotice(false)}
                      className="border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                    >
                      Publish Announcement
                    </button>
                  </div>
                </form>
              )}

              {/* Current Notices List */}
              <div className="space-y-3.5">
                {notices.map(not => (
                  <div key={not.id} className={`p-4 rounded-2xl border ${
                    not.isUrgent 
                      ? 'bg-rose-50/40 border-rose-200/60' 
                      : 'bg-white border-gray-100'
                  }`}>
                    <div className="flex justify-between items-start gap-2.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                            not.isUrgent ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {not.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">{not.publishedDate}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-gray-900 mt-1.5">{not.title}</h4>
                      </div>
                      
                      <button
                        onClick={() => setNotices(notices.filter(n => n.id !== not.id))}
                        className="text-gray-300 hover:text-rose-600 p-1 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2.5 leading-relaxed font-sans">{not.content}</p>
                    <p className="text-[9px] text-gray-400 mt-3 italic">Broadcasted by: {not.sender}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Polls Sub-Section */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-display font-bold text-base text-gray-900">Online Community Voting & Polls</h3>
                  <p className="text-xs text-gray-500">Collect opinions on capital budgets or contractor choices</p>
                </div>
                <button
                  id="create-poll-btn"
                  onClick={() => setShowCreatePoll(!showCreatePoll)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Poll
                </button>
              </div>

              {/* Poll Form */}
              {showCreatePoll && (
                <form onSubmit={handleCreatePoll} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h4 className="font-semibold text-xs text-gray-800 uppercase tracking-wider">Configure New Voting Ballot</h4>
                  
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Voting Question *</label>
                    <input
                      type="text"
                      required
                      value={newPoll.question}
                      onChange={e => setNewPoll({ ...newPoll, question: e.target.value })}
                      placeholder="e.g. Approve the budget of $2000 for landscaping gardens?"
                      className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Option 1 *</label>
                      <input
                        type="text"
                        required
                        value={newPoll.option1}
                        onChange={e => setNewPoll({ ...newPoll, option1: e.target.value })}
                        placeholder="Yes, approve"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Option 2 *</label>
                      <input
                        type="text"
                        required
                        value={newPoll.option2}
                        onChange={e => setNewPoll({ ...newPoll, option2: e.target.value })}
                        placeholder="No, reject"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">Option 3 (Optional)</label>
                      <input
                        type="text"
                        value={newPoll.option3}
                        onChange={e => setNewPoll({ ...newPoll, option3: e.target.value })}
                        placeholder="Postpone / Study options"
                        className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowCreatePoll(false)}
                      className="border border-gray-200 px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-xs cursor-pointer"
                    >
                      Launch Ballot
                    </button>
                  </div>
                </form>
              )}

              {/* Polls List & Live Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {polls.map(poll => (
                  <div key={poll.id} className="bg-white p-5 rounded-2xl border border-gray-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] uppercase font-bold text-gray-400 font-mono tracking-wider">{poll.category}</span>
                      <span className="text-[10px] font-medium text-indigo-600 font-mono">Votes cast: {poll.totalVotes}</span>
                    </div>

                    <h4 className="font-semibold text-xs text-gray-800 leading-normal">{poll.question}</h4>

                    <div className="space-y-2 pt-2">
                      {poll.options.map(opt => {
                        const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                        return (
                          <div key={opt.id} className="relative bg-gray-50 border border-gray-100 p-2.5 rounded-xl overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 bg-indigo-500/10 h-full rounded-r-lg transition-all duration-500" 
                              style={{ width: `${pct}%` }}
                            ></div>
                            <div className="relative flex justify-between items-center text-xs text-gray-700">
                              <span className="font-medium truncate pr-4">{opt.text}</span>
                              <span className="font-semibold font-mono">{pct}% <span className="text-gray-400 text-[10px]">({opt.votes})</span></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono border-t border-gray-50 pt-3">
                      <span>Expires: {poll.expiresDate}</span>
                      <button
                        onClick={() => setPolls(polls.filter(p => p.id !== poll.id))}
                        className="text-gray-300 hover:text-rose-500 transition-colors flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
