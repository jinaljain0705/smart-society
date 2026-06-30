import React, { useState } from 'react';
import { Visitor, ResidentProfile } from '../types';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Clock, 
  ArrowRightLeft, 
  Sparkles, 
  UserCheck, 
  CheckCircle, 
  AlertTriangle, 
  Navigation,
  LogOut,
  X,
  Truck,
  QrCode,
  Camera,
  Check,
  ShieldAlert
} from 'lucide-react';

interface SecurityDashboardProps {
  visitors: Visitor[];
  setVisitors: React.Dispatch<React.SetStateAction<Visitor[]>>;
  residents: ResidentProfile[];
  onAddNotification: (title: string, message: string, type: 'visitor' | 'complaint' | 'bill' | 'booking' | 'notice', targetFlat?: string) => void;
}

export default function SecurityDashboard({
  visitors,
  setVisitors,
  residents,
  onAddNotification
}: SecurityDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Scanner & Pass Verification States
  const [manualPassId, setManualPassId] = useState('');
  const [scannedVisitor, setScannedVisitor] = useState<Visitor | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Form state
  const [newVisitor, setNewVisitor] = useState({
    name: '',
    phone: '',
    purpose: 'Delivery',
    flatNumber: 'B-402',
    company: ''
  });

  const handleRegisterVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitor.name || !newVisitor.phone || !newVisitor.flatNumber) return;

    // Resolve target resident name
    const targetRes = residents.find(r => r.flatNumber === newVisitor.flatNumber);
    const resName = targetRes ? targetRes.name : 'Resident Office';

    const visitorItem: Visitor = {
      id: `vis-${Date.now()}`,
      name: newVisitor.name,
      phone: newVisitor.phone,
      purpose: newVisitor.purpose,
      flatNumber: newVisitor.flatNumber,
      residentName: resName,
      company: newVisitor.purpose === 'Delivery' ? (newVisitor.company || 'Courier') : undefined,
      status: 'Pending Approval',
      createdTime: new Date().toISOString()
    };

    setVisitors([visitorItem, ...visitors]);

    // Send high priority interactive in-app notification to the targeting flat
    onAddNotification(
      'Visitor Security Alert',
      `${visitorItem.name}${newVisitor.company ? ` (${newVisitor.company})` : ''} is at the main gate requesting entry approval for Flat ${newVisitor.flatNumber}.`,
      'visitor',
      newVisitor.flatNumber
    );

    // Reset Form
    setNewVisitor({
      name: '',
      phone: '',
      purpose: 'Delivery',
      flatNumber: 'B-402',
      company: ''
    });
  };

  const handleVerifyPassId = (passId: string) => {
    let targetId = passId.trim();
    if (targetId.startsWith('GHS-PASS-')) {
      targetId = targetId.replace('GHS-PASS-', '');
    }

    const foundVisitor = visitors.find(v => v.id === targetId);
    if (!foundVisitor) {
      setScanError('Invalid Passkey: No matching pre-registered or approved visitor record found.');
      setScannedVisitor(null);
      setVerificationSuccess(false);
      return;
    }

    if (foundVisitor.status === 'Declined') {
      setScanError('Access Denied: This visitor pass was DECLINED by the resident.');
      setScannedVisitor(null);
      setVerificationSuccess(false);
      return;
    }

    if (foundVisitor.status === 'Exited') {
      setScanError('Expired Passkey: Visitor has already entered and exited the compound.');
      setScannedVisitor(null);
      setVerificationSuccess(false);
      return;
    }

    setScannedVisitor(foundVisitor);
    setScanError(null);
    setVerificationSuccess(false);
  };

  const handleSimulateQRScan = (visitorId: string) => {
    setIsScanningActive(true);
    setScanError(null);
    setScannedVisitor(null);
    
    setTimeout(() => {
      setIsScanningActive(false);
      handleVerifyPassId(visitorId);
    }, 1200);
  };

  const handleCheckInScannedVisitor = () => {
    if (!scannedVisitor) return;

    setVisitors(visitors.map(v => {
      if (v.id === scannedVisitor.id) {
        return {
          ...v,
          status: 'Entered',
          entryTime: new Date().toISOString()
        };
      }
      return v;
    }));

    onAddNotification(
      'Gate Pass Verified',
      `Pre-approved guest ${scannedVisitor.name} checked in successfully via digital QR pass scan (Flat ${scannedVisitor.flatNumber}).`,
      'visitor',
      scannedVisitor.flatNumber
    );

    setVerificationSuccess(true);
    setTimeout(() => {
      setScannedVisitor(null);
      setManualPassId('');
      setVerificationSuccess(false);
    }, 2500);
  };

  const handleMarkEntry = (id: string) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Entered',
          entryTime: new Date().toISOString()
        };
      }
      return v;
    }));
  };

  const handleMarkExit = (id: string) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Exited',
          exitTime: new Date().toISOString()
        };
      }
      return v;
    }));
  };

  const handleSimulateAutoApproval = (id: string) => {
    setVisitors(visitors.map(v => {
      if (v.id === id) {
        return {
          ...v,
          status: 'Approved'
        };
      }
      return v;
    }));
    
    const v = visitors.find(item => item.id === id);
    if (v) {
      onAddNotification(
        'Visitor Approved (Auto)',
        `${v.name} has been pre-approved by Resident (${v.flatNumber}).`,
        'visitor'
      );
    }
  };

  // Filtering
  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          v.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (v.company && v.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      
      {/* 1. Left hand: Visitor entry log form */}
      <div className="lg:col-span-4 space-y-6">
        
        <div className="bg-white p-6 rounded-[2rem] border border-[#e5e5dc] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#3d4234] pb-2 border-b border-[#f5f5f0]">
            <ShieldCheck className="w-5 h-5 text-[#d4a373]" />
            <h2 className="font-serif font-bold text-base">Gate Entry Registry</h2>
          </div>

          <form onSubmit={handleRegisterVisitor} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-semibold text-[#8d917a] uppercase tracking-wider mb-1">Visitor Full Name *</label>
              <input
                type="text"
                required
                value={newVisitor.name}
                onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })}
                placeholder="e.g. Richard Hendricks"
                className="w-full bg-[#f5f5f0] border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden focus:bg-white transition text-[#2d3027]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-semibold text-[#8d917a] uppercase tracking-wider mb-1">Purpose of Visit</label>
                <select
                  value={newVisitor.purpose}
                  onChange={e => setNewVisitor({ ...newVisitor, purpose: e.target.value })}
                  className="w-full bg-[#f5f5f0] border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden text-[#2d3027]"
                >
                  <option value="Delivery">Delivery / Courier</option>
                  <option value="Guest">Personal Guest</option>
                  <option value="Maintenance">Service Vendor</option>
                  <option value="Other">Other Duty</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8d917a] uppercase tracking-wider mb-1">Target Residence *</label>
                <select
                  value={newVisitor.flatNumber}
                  onChange={e => setNewVisitor({ ...newVisitor, flatNumber: e.target.value })}
                  className="w-full bg-[#f5f5f0] border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden text-[#2d3027]"
                >
                  {residents.map(r => (
                    <option key={r.id} value={r.flatNumber}>Flat {r.flatNumber} ({r.name})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#8d917a] uppercase tracking-wider mb-1">Visitor Contact Phone *</label>
              <input
                type="text"
                required
                value={newVisitor.phone}
                onChange={e => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                placeholder="+1 (555) 432-1092"
                className="w-full bg-[#f5f5f0] border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden focus:bg-white transition text-[#2d3027]"
              />
            </div>

            {newVisitor.purpose === 'Delivery' && (
              <div>
                <label className="block text-[10px] font-semibold text-[#8d917a] uppercase tracking-wider mb-1">Delivery Company Name *</label>
                <input
                  type="text"
                  required
                  value={newVisitor.company}
                  onChange={e => setNewVisitor({ ...newVisitor, company: e.target.value })}
                  placeholder="e.g. FedEx, Amazon, DHL, DoorDash"
                  className="w-full bg-[#f5f5f0] border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden focus:bg-white transition text-[#2d3027]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#5a634d] hover:bg-[#3d4234] text-white text-xs font-bold py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Request Entry Approval
            </button>
            <p className="text-[10px] text-[#8d917a] text-center font-medium">🔐 Initiates a real-time smart in-app notification to the targeting resident's dashboard.</p>
          </form>
        </div>

        {/* 2. Digital QR Pass Verifier */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#e5e5dc] space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#3d4234] pb-2 border-b border-[#f5f5f0]">
            <QrCode className="w-5 h-5 text-[#d4a373]" />
            <h2 className="font-serif font-bold text-base">QR Pass Verifier</h2>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Camera Viewfinder Mock / Scanner Area */}
            <div className="relative bg-[#2d3027] rounded-2xl h-44 flex flex-col items-center justify-center overflow-hidden border border-[#e5e5dc]/20 shadow-inner">
              
              {/* Scan grid and laser line */}
              {!scannedVisitor && !isScanningActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-white/50 space-y-2">
                  <Camera className="w-8 h-8 text-[#d4a373] animate-pulse" />
                  <p className="text-[10px] font-medium max-w-[15rem]">Ready for visitor pass. Scan QR code or enter code below.</p>
                </div>
              )}

              {/* Laser Line Animation */}
              {isScanningActive && (
                <>
                  <div className="absolute left-0 right-0 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981] animate-bounce top-0 bottom-0 z-10" style={{ animationDuration: '2.5s' }} />
                  <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[0.5px]" />
                  <div className="text-center text-white space-y-2 z-20">
                    <div className="w-10 h-10 border-t-2 border-l-2 border-emerald-400 absolute top-4 left-4" />
                    <div className="w-10 h-10 border-t-2 border-r-2 border-emerald-400 absolute top-4 right-4" />
                    <div className="w-10 h-10 border-b-2 border-l-2 border-emerald-400 absolute bottom-4 left-4" />
                    <div className="w-10 h-10 border-b-2 border-r-2 border-emerald-400 absolute bottom-4 right-4" />
                    
                    <QrCode className="w-10 h-10 mx-auto text-emerald-400 animate-pulse" />
                    <p className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-400">Scanning Pass QR...</p>
                  </div>
                </>
              )}

              {/* Scanned/Decoded Info Display */}
              {scannedVisitor && (
                <div className="absolute inset-0 bg-white p-4 flex flex-col justify-between animate-in fade-in duration-300">
                  {verificationSuccess ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-600 stroke-[3]" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-[#3d4234] text-xs">ENTRY GRANTED</h4>
                        <p className="text-[10px] text-[#8d917a] font-medium">Logged entry record successfully.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 w-full h-full flex flex-col justify-between">
                      <div className="border-b border-[#f5f5f0] pb-1.5 flex justify-between items-start">
                        <div>
                          <span className="text-[8px] bg-[#5a634d]/10 text-[#3d4234] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">Decoded Pass</span>
                          <h4 className="font-serif font-extrabold text-xs text-[#3d4234] mt-1">{scannedVisitor.name}</h4>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase font-mono">
                          {scannedVisitor.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8d917a] font-medium">
                        <div>
                          <span className="text-[8px] uppercase tracking-wider block text-[#8d917a]/70">Destination</span>
                          <strong className="text-[#3d4234]">Flat {scannedVisitor.flatNumber}</strong>
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-wider block text-[#8d917a]/70">Contact Host</span>
                          <strong className="text-[#3d4234]">{scannedVisitor.residentName}</strong>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckInScannedVisitor}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve entry & Check-in
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error handling */}
            {scanError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-[11px] text-rose-800 animate-in fade-in duration-150">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p className="font-medium leading-relaxed">{scanError}</p>
              </div>
            )}

            {/* Manual Entry or Simulation Controls */}
            <div className="space-y-3">
              
              {/* Simulation select */}
              <div>
                <label className="block text-[9px] font-extrabold text-[#5a634d] uppercase tracking-wider mb-1 flex justify-between items-center font-mono">
                  <span>Simulate QR Scan (Local Live Mode)</span>
                  <span className="text-[8px] text-[#8d917a] font-normal font-sans">Pick approved pass to test</span>
                </label>
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) handleSimulateQRScan(e.target.value);
                  }}
                  className="w-full bg-white border border-[#e5e5dc] rounded-xl px-2.5 py-2 text-[11px] text-[#3d4234] focus:ring-1 focus:ring-[#5a634d] outline-hidden font-semibold cursor-pointer"
                >
                  <option value="">-- Select Active Visitor Pass to Scan --</option>
                  {visitors.filter(v => v.status === 'Approved' || v.status === 'Pending Approval').map(v => (
                    <option key={v.id} value={v.id}>
                      [{v.status}] {v.name} (Flat {v.flatNumber} - {v.purpose})
                    </option>
                  ))}
                </select>
              </div>

              {/* Manual Pass ID verifier */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={manualPassId}
                  onChange={e => setManualPassId(e.target.value)}
                  placeholder="Enter Pass Code (e.g. GHS-PASS-vis-...)"
                  className="flex-1 bg-[#f5f5f0]/50 border border-[#e5e5dc] rounded-xl px-3 py-2 text-[10px] text-[#3d4234] placeholder-[#8d917a]/50 focus:ring-1 focus:ring-[#5a634d] outline-hidden focus:bg-white font-semibold"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyPassId(manualPassId)}
                  className="bg-[#5a634d]/10 hover:bg-[#5a634d]/20 text-[#3d4234] border border-[#5a634d]/20 font-bold px-3 py-2 rounded-xl transition cursor-pointer text-[10px] uppercase tracking-wider"
                >
                  Verify
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Security instructions */}
        <div className="bg-[#5a634d]/10 border border-[#e5e5dc] p-5 rounded-2xl space-y-3">
          <h3 className="font-serif font-bold text-xs text-[#3d4234] flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-[#d4a373]" /> Active Delivery Protocols
          </h3>
          <ul className="list-disc pl-4 text-[11px] text-[#2d3027] space-y-1 font-medium">
            <li>Verify delivery driver credentials before processing.</li>
            <li>All bulk couriers must register vehicles details.</li>
            <li>Confirm the flat owner approves entry before unlocking the parking boom gates.</li>
          </ul>
        </div>
      </div>

      {/* 2. Right hand: Live visitor logs */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Logs controls */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-[#e5e5dc] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="font-serif font-bold text-xl text-[#3d4234]">Compound Access Logs</h2>
              <p className="text-xs text-[#8d917a] font-medium">Log entries, exit timestamps, and residency responses</p>
            </div>

            {/* Quick Filter Controls */}
            <div className="flex gap-2.5">
              {['all', 'Pending Approval', 'Entered', 'Exited'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full border cursor-pointer transition uppercase tracking-wider ${
                    filterStatus === status
                      ? 'bg-[#5a634d] text-white border-[#5a634d] shadow-xs'
                      : 'bg-white text-[#8d917a] border-[#e5e5dc] hover:bg-[#f5f5f0] hover:text-[#3d4234]'
                  }`}
                >
                  {status === 'all' ? 'All Logs' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#8d917a]" />
            <input
              type="text"
              placeholder="Search by Visitor Name, Flat ID, company, or Resident..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#f5f5f0]/60 border border-[#e5e5dc] rounded-full pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden transition text-[#2d3027]"
            />
          </div>

          {/* Table logs list */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredVisitors.length === 0 ? (
              <div className="p-8 text-center text-[#8d917a] border border-dashed border-[#e5e5dc] rounded-2xl">
                <ArrowRightLeft className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#8d917a]" />
                <p className="text-xs font-medium">No matching gate logs recorded.</p>
              </div>
            ) : (
              filteredVisitors.map(v => {
                const statusColors = {
                  'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse',
                  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  'Declined': 'bg-rose-50 text-rose-700 border-rose-100',
                  'Entered': 'bg-stone-50 text-stone-700 border-stone-100',
                  'Exited': 'bg-stone-100 text-stone-600 border-stone-200'
                };

                return (
                  <div key={v.id} className="bg-[#f5f5f0]/40 p-4 rounded-2xl border border-[#e5e5dc] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded border ${statusColors[v.status]}`}>
                          {v.status}
                        </span>
                        {v.company && (
                          <span className="text-[10px] bg-[#e5e5dc] text-[#3d4234] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            🚚 {v.company}
                          </span>
                        )}
                        <span className="text-[10px] text-[#8d917a] font-mono">#{v.id.substring(4, 11)}</span>
                      </div>

                      <h3 className="font-bold text-sm text-[#3d4234] font-serif">{v.name}</h3>
                      
                      <div className="text-[11px] text-[#8d917a] font-medium flex flex-wrap gap-x-3 gap-y-1">
                        <span>📱 Contact: <strong className="text-[#3d4234]">{v.phone}</strong></span>
                        <span>🎯 Destination: <strong className="text-[#5a634d]">Flat {v.flatNumber} ({v.residentName})</strong></span>
                      </div>

                      <div className="text-[10px] text-[#8d917a] flex gap-3 font-mono font-medium">
                        {v.entryTime && (
                          <span>In: {new Date(v.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {v.exitTime && (
                          <span>Out: {new Date(v.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>

                    {/* Interactive security actions */}
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {v.status === 'Pending Approval' && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#d4a373] font-semibold animate-pulse flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Awaiting Resident response...
                          </span>
                          <button
                            onClick={() => handleSimulateAutoApproval(v.id)}
                            className="bg-white text-[#3d4234] border border-[#e5e5dc] text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-[#f5f5f0] transition cursor-pointer"
                            title="Simulate resident approval via automated intercom"
                          >
                            Intercom Bypass
                          </button>
                        </div>
                      )}

                      {v.status === 'Approved' && (
                        <button
                          onClick={() => handleMarkEntry(v.id)}
                          className="w-full sm:w-auto bg-[#d4a373] hover:bg-[#c29262] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Unlock gate & Check-In
                        </button>
                      )}

                      {v.status === 'Entered' && (
                        <button
                          onClick={() => handleMarkExit(v.id)}
                          className="w-full sm:w-auto bg-[#5a634d] hover:bg-[#3d4234] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Settle Check-Out
                        </button>
                      )}

                      {v.status === 'Exited' && (
                        <span className="text-xs text-[#8d917a] flex items-center gap-0.5 font-bold">
                          <CheckCircle className="w-4 h-4 text-[#5a634d]" /> Settled Out
                        </span>
                      )}

                      {v.status === 'Declined' && (
                        <span className="text-xs text-rose-600 flex items-center gap-0.5 font-bold">
                          <X className="w-4 h-4 text-rose-500" /> Banned Entrance
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
