import React, { useState } from 'react';
import { Complaint, ComplaintStatus } from '../types';
import { 
  Wrench, 
  Clock, 
  CheckCircle, 
  Play, 
  Send, 
  Sparkles, 
  AlertTriangle,
  ClipboardList
} from 'lucide-react';

interface MaintenanceDashboardProps {
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  onAddNotification: (title: string, message: string, type: 'visitor' | 'complaint' | 'bill' | 'booking' | 'notice') => void;
}

export default function MaintenanceDashboard({
  complaints,
  setComplaints,
  onAddNotification
}: MaintenanceDashboardProps) {
  // Mike Evans' assigned complaints
  const staffId = 'staff-mike';
  const myComplaints = complaints.filter(c => c.assignedToId === staffId);

  // Resolution Notes overlay
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleUpdateStatus = (id: string, newStatus: ComplaintStatus) => {
    setComplaints(complaints.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: newStatus,
          updatedTime: new Date().toISOString()
        };
      }
      return c;
    }));

    const comp = complaints.find(c => c.id === id);
    if (comp) {
      onAddNotification(
        'Work Progress Update',
        `Crew started work on ticket "${comp.title}" (Status: ${newStatus}).`,
        'complaint'
      );
    }
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingId || !resolutionText) return;

    setComplaints(complaints.map(c => {
      if (c.id === resolvingId) {
        return {
          ...c,
          status: 'Resolved',
          resolutionNotes: resolutionText,
          updatedTime: new Date().toISOString()
        };
      }
      return c;
    }));

    const comp = complaints.find(c => c.id === resolvingId);
    if (comp) {
      onAddNotification(
        'Complaint Resolved',
        `Maintenance crew completed repair for Flat ${comp.flatNumber}: "${comp.title}". Awaiting resident rating.`,
        'complaint'
      );
    }

    setResolvingId(null);
    setResolutionText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-7xl mx-auto font-sans">
      
      {/* 1. Profile / Crew card */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white p-6 rounded-[2rem] border border-[#e5e5dc] space-y-4 shadow-xs">
          <div className="flex gap-3">
            <div className="bg-[#d4a373] text-white w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-serif font-bold shadow-xs">
              ME
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#3d4234]">Mike Evans</h2>
              <span className="text-[10px] bg-[#5a634d]/10 text-[#3d4234] px-2.5 py-1 rounded-full font-bold border border-[#5a634d]/20 mt-1 inline-block">
                Senior Helpdesk Crew
              </span>
            </div>
          </div>

          <div className="text-xs text-[#2d3027] space-y-2 border-t border-[#f5f5f0] pt-3 font-medium">
            <p>🔧 <strong className="text-[#3d4234]">Specialty:</strong> Plumbing, Electrical, General Carpentry</p>
            <p>📱 <strong className="text-[#3d4234]">Emergency Radio:</strong> Channel 5-C</p>
            <p>✅ <strong className="text-[#3d4234]">Assigned Tasks:</strong> {myComplaints.length} tickets</p>
          </div>
        </div>

        {/* Dispatch Guidelines */}
        <div className="bg-[#5a634d]/10 border border-[#e5e5dc] p-5 rounded-2xl space-y-2.5">
          <h3 className="font-serif font-bold text-xs text-[#3d4234] flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-[#d4a373]" /> Crew Action Protocol
          </h3>
          <ol className="list-decimal pl-4 text-[11px] text-[#2d3027] space-y-1 font-medium">
            <li>Update ticket to <strong>"In Progress"</strong> as soon as you arrive at the flat.</li>
            <li>Take safety measurements before opening circuit panels.</li>
            <li>Fill detailed diagnostics in <strong>Resolution Notes</strong> upon fixing the issue.</li>
          </ol>
        </div>
      </div>

      {/* 2. Tasks / Complaints list */}
      <div className="lg:col-span-8 space-y-6">
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-[#e5e5dc] space-y-4 shadow-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#3d4234]">Assigned Workorders & Helpdesk Tickets</h2>
            <p className="text-xs text-[#8d917a] font-medium">View diagnostic complaints, initiate repairs, and record outcomes</p>
          </div>

          <div className="space-y-4">
            {myComplaints.length === 0 ? (
              <div className="p-8 text-center text-[#8d917a] border border-dashed border-[#e5e5dc] rounded-2xl">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-35 text-[#5a634d]" />
                <p className="text-xs font-medium">Congratulations! All your assigned helpdesk tickets are settled.</p>
              </div>
            ) : (
              myComplaints.map(comp => {
                const statusColors = {
                  'Open': 'bg-rose-50 text-rose-700 border-rose-100',
                  'Assigned': 'bg-amber-50 text-amber-700 border-amber-100',
                  'In Progress': 'bg-[#5a634d]/10 text-[#3d4234] border-[#5a634d]/20 animate-pulse',
                  'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  'Closed': 'bg-stone-100 text-stone-600 border border-stone-200'
                };

                return (
                  <div key={comp.id} className="bg-[#f5f5f0]/40 p-4.5 rounded-2xl border border-[#e5e5dc] flex flex-col justify-between gap-4">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] uppercase font-mono font-extrabold px-2 py-0.5 rounded border ${statusColors[comp.status]}`}>
                            {comp.status}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            comp.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-[#e5e5dc] text-[#3d4234]'
                          }`}>
                            {comp.priority} Priority
                          </span>
                          <span className="text-[10px] text-[#8d917a] font-mono">#{comp.id.substring(5, 12)}</span>
                        </div>

                        <span className="text-[10px] bg-[#d4a373]/10 text-[#3d4234] font-mono font-bold uppercase tracking-wide border border-[#d4a373]/20 px-2 py-0.5 rounded">
                          {comp.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-[#3d4234] leading-snug font-serif">{comp.title}</h3>
                        <p className="text-xs text-[#8d917a] mt-1 font-semibold">📍 Destination Flat: {comp.flatNumber} ({comp.residentName})</p>
                      </div>

                      <p className="text-xs text-[#2d3027] bg-white p-3.5 rounded-xl border border-[#e5e5dc] leading-relaxed font-sans font-medium">
                        {comp.description}
                      </p>

                      {comp.resolutionNotes && (
                        <div className="bg-emerald-50/40 p-2.5 rounded-lg text-xs text-gray-700 border border-emerald-50">
                          <strong className="text-emerald-800 block mb-0.5">Resolution Diagnostic:</strong>
                          {comp.resolutionNotes}
                        </div>
                      )}
                    </div>

                    {/* Interactive technician commands */}
                    <div className="flex items-center justify-between gap-3 border-t border-[#e5e5dc] pt-3 flex-wrap">
                      <span className="text-[10px] text-[#8d917a] font-mono font-semibold">
                        Assigned: {new Date(comp.createdTime).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {comp.status === 'Assigned' && (
                          <button
                            onClick={() => handleUpdateStatus(comp.id, 'In Progress')}
                            className="bg-[#d4a373] hover:bg-[#c29262] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition"
                          >
                            <Play className="w-3.5 h-3.5" /> Start Repair / In-Progress
                          </button>
                        )}

                        {comp.status === 'In Progress' && (
                          <button
                            onClick={() => {
                              setResolvingId(comp.id);
                              setResolutionText('');
                            }}
                            className="bg-[#5a634d] hover:bg-[#3d4234] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Mark as Fixed
                          </button>
                        )}

                        {comp.status === 'Resolved' && (
                          <span className="text-xs text-[#5a634d] font-bold bg-[#5a634d]/5 border border-[#e5e5dc] px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-[#5a634d]" /> Resolved (Awaiting Resident Approval)
                          </span>
                        )}

                        {comp.status === 'Closed' && (
                          <span className="text-xs text-[#8d917a] font-bold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5 text-[#5a634d]" /> Settled and Closed by Tenant
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Inline resolution diagnostic form */}
                    {resolvingId === comp.id && (
                      <form onSubmit={handleResolveSubmit} className="bg-[#5a634d]/10 p-3.5 rounded-xl border border-[#e5e5dc] space-y-3.5">
                        <label className="block text-xs font-bold text-[#3d4234]">Describe diagnosis & repairs made *</label>
                        <textarea
                          required
                          rows={2}
                          value={resolutionText}
                          onChange={e => setResolutionText(e.target.value)}
                          placeholder="e.g. Replaced the plumbing seal under the sink. Tested water flow, leakage resolved."
                          className="w-full bg-white border border-[#e5e5dc] rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#5a634d] outline-hidden font-sans text-[#2d3027]"
                        ></textarea>
                        
                        <div className="flex justify-end gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setResolvingId(null)}
                            className="text-[#8d917a] hover:bg-white px-3 py-1 rounded-lg cursor-pointer font-bold"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#5a634d] hover:bg-[#3d4234] text-white font-bold px-4 py-1.5 rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Submit Fix
                          </button>
                        </div>
                      </form>
                    )}
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
