export type UserRole = 'admin' | 'resident' | 'security' | 'maintenance';

export interface ResidentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  flatNumber: string;
  occupancyType: 'Owner' | 'Tenant';
  familyMembers: FamilyMember[];
  vehicles: Vehicle[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface Vehicle {
  id: string;
  type: 'Car' | 'Bike' | 'Other';
  numberPlate: string;
  parkingSlot: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  flatNumber: string;
  residentName: string;
  company?: string; // for delivery
  status: 'Pending Approval' | 'Approved' | 'Declined' | 'Entered' | 'Exited';
  entryTime?: string;
  exitTime?: string;
  createdTime: string;
}

export type ComplaintCategory = 'Electrical' | 'Plumbing' | 'Water Supply' | 'Cleaning' | 'Security' | 'Parking' | 'Lift';
export type ComplaintStatus = 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';

export interface Complaint {
  id: string;
  title: string;
  category: ComplaintCategory;
  description: string;
  flatNumber: string;
  residentName: string;
  status: ComplaintStatus;
  priority: 'Low' | 'Medium' | 'High';
  assignedTo?: string; // staff name
  assignedToId?: string; // staff ID or name
  createdTime: string;
  updatedTime: string;
  imageUrl?: string;
  resolutionNotes?: string;
  residentRating?: number;
}

export interface MaintenanceBill {
  id: string;
  billMonth: string; // e.g., "June 2026"
  dueDate: string;
  flatNumber: string;
  residentName: string;
  amount: number;
  penalty: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export type FacilityType = 'Club House' | 'Gymnasium' | 'Community Hall' | 'Swimming Pool' | 'Sports Court' | 'Garden Area';

export interface FacilityBooking {
  id: string;
  facility: FacilityType;
  flatNumber: string;
  residentName: string;
  bookingDate: string;
  timeSlot: string; // e.g., "10:00 AM - 01:00 PM"
  status: 'Pending' | 'Approved' | 'Cancelled';
  purpose: string;
  createdTime: string;
}

export type NoticeCategory = 'General' | 'Emergency' | 'Event' | 'Meeting' | 'Maintenance';

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: NoticeCategory;
  publishedDate: string;
  sender: string;
  isUrgent: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  votedUserIds: string[]; // Mocked as array of flat numbers
  totalVotes: number;
  createdDate: string;
  expiresDate: string;
  category: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'visitor' | 'complaint' | 'bill' | 'booking' | 'notice';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole; // Optional: show only to specific role
  targetFlat?: string; // Optional: show only to specific resident flat
}
