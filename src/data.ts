import {
  ResidentProfile,
  Visitor,
  Complaint,
  MaintenanceBill,
  FacilityBooking,
  Notice,
  Poll,
  AppNotification
} from './types';

// Pre-seeded residents
export const initialResidents: ResidentProfile[] = [
  {
    id: 'res-1',
    name: 'Sarah Connor',
    email: 'sarah.connor@gmail.com',
    phone: '+1 (555) 019-2834',
    flatNumber: 'B-402',
    occupancyType: 'Owner',
    familyMembers: [
      { id: 'fam-1', name: 'John Connor', relation: 'Son', phone: '+1 (555) 019-2835' }
    ],
    vehicles: [
      { id: 'veh-1', type: 'Car', numberPlate: 'LA-97-T800', parkingSlot: 'B-P42' }
    ]
  },
  {
    id: 'res-2',
    name: 'David Lightman',
    email: 'david.light@wargames.io',
    phone: '+1 (555) 048-1294',
    flatNumber: 'A-101',
    occupancyType: 'Tenant',
    familyMembers: [
      { id: 'fam-2', name: 'Jennifer Mack', relation: 'Partner', phone: '+1 (555) 048-1295' }
    ],
    vehicles: [
      { id: 'veh-2', type: 'Bike', numberPlate: 'CA-WOPR-1', parkingSlot: 'A-P05' }
    ]
  },
  {
    id: 'res-3',
    name: 'Bruce Wayne',
    email: 'bruce@waynecorp.com',
    phone: '+1 (555) 999-0000',
    flatNumber: 'Penthouse-1',
    occupancyType: 'Owner',
    familyMembers: [
      { id: 'fam-3', name: 'Alfred Pennyworth', relation: 'Guardian', phone: '+1 (555) 999-0001' }
    ],
    vehicles: [
      { id: 'veh-3', type: 'Car', numberPlate: 'BAT-1', parkingSlot: 'P-P01' }
    ]
  }
];

export const initialVisitors: Visitor[] = [
  {
    id: 'vis-1',
    name: 'Alice Vance',
    phone: '+1 (555) 123-4567',
    purpose: 'Delivery',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    company: 'FedEx',
    status: 'Entered',
    entryTime: '2026-06-29T10:15:00-07:00',
    createdTime: '2026-06-29T10:10:00-07:00'
  },
  {
    id: 'vis-2',
    name: 'Robert Miles',
    phone: '+1 (555) 987-6543',
    purpose: 'Personal Visit',
    flatNumber: 'A-101',
    residentName: 'David Lightman',
    status: 'Pending Approval',
    createdTime: '2026-06-29T23:05:00-07:00'
  },
  {
    id: 'vis-3',
    name: 'Clark Kent',
    phone: '+1 (555) 777-8888',
    purpose: 'Interview / Guest',
    flatNumber: 'Penthouse-1',
    residentName: 'Bruce Wayne',
    company: 'Daily Planet',
    status: 'Approved',
    entryTime: '2026-06-29T18:30:00-07:00',
    exitTime: '2026-06-29T21:45:00-07:00',
    createdTime: '2026-06-29T18:15:00-07:00'
  },
  {
    id: 'vis-4',
    name: 'Courier Bob',
    phone: '+1 (555) 234-5678',
    purpose: 'Food Delivery',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    company: 'UberEats',
    status: 'Pending Approval',
    createdTime: '2026-06-29T23:15:00-07:00'
  }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'comp-1',
    title: 'Water Leakage in Kitchen Ceiling',
    category: 'Plumbing',
    description: 'There is a continuous drip of water coming from the ceiling in our main kitchen area, right above the dishwasher. It seems to have created a damp patch that is growing larger.',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    status: 'Assigned',
    priority: 'High',
    assignedTo: 'Mike Evans (Plumber)',
    assignedToId: 'staff-mike',
    createdTime: '2026-06-28T09:00:00-07:00',
    updatedTime: '2026-06-28T14:30:00-07:00'
  },
  {
    id: 'comp-2',
    title: 'Flickering Hallway Lights',
    category: 'Electrical',
    description: 'The overhead fluorescent lights in the Block B 4th floor elevator lobby are flickering constantly and sometimes fail to turn on. It is quite dark and unsafe at night.',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    status: 'Resolved',
    priority: 'Medium',
    assignedTo: 'Mike Evans (Electrician)',
    assignedToId: 'staff-mike',
    resolutionNotes: 'Replaced the old ballast and fitted a new LED fluorescent tube. Tested and works perfectly.',
    residentRating: 5,
    createdTime: '2026-06-25T14:00:00-07:00',
    updatedTime: '2026-06-26T11:00:00-07:00'
  },
  {
    id: 'comp-3',
    title: 'Trash not cleared from service stairwell',
    category: 'Cleaning',
    description: 'Someone left bulky moving boxes and waste bags on the fire staircase landings of Block A. It blocks the emergency egress path and emits a foul odor.',
    flatNumber: 'A-101',
    residentName: 'David Lightman',
    status: 'Open',
    priority: 'Medium',
    createdTime: '2026-06-29T16:00:00-07:00',
    updatedTime: '2026-06-29T16:00:00-07:00'
  }
];

export const initialBills: MaintenanceBill[] = [
  {
    id: 'bill-1',
    billMonth: 'June 2026',
    dueDate: '2026-07-05',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    amount: 150.00,
    penalty: 0,
    status: 'Pending'
  },
  {
    id: 'bill-2',
    billMonth: 'May 2026',
    dueDate: '2026-06-05',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    amount: 150.00,
    penalty: 15.00,
    status: 'Overdue'
  },
  {
    id: 'bill-3',
    billMonth: 'June 2026',
    dueDate: '2026-07-05',
    flatNumber: 'A-101',
    residentName: 'David Lightman',
    amount: 120.00,
    penalty: 0,
    status: 'Paid',
    paidDate: '2026-06-20',
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-98402948'
  },
  {
    id: 'bill-4',
    billMonth: 'June 2026',
    dueDate: '2026-07-05',
    flatNumber: 'Penthouse-1',
    residentName: 'Bruce Wayne',
    amount: 450.00,
    penalty: 0,
    status: 'Paid',
    paidDate: '2026-06-15',
    paymentMethod: 'ACH Bank Transfer',
    transactionId: 'TXN-00000007'
  }
];

export const initialBookings: FacilityBooking[] = [
  {
    id: 'book-1',
    facility: 'Community Hall',
    flatNumber: 'B-402',
    residentName: 'Sarah Connor',
    bookingDate: '2026-07-12',
    timeSlot: '04:00 PM - 09:00 PM',
    status: 'Approved',
    purpose: 'John\'s 16th Birthday Celebration',
    createdTime: '2026-06-25T11:20:00-07:00'
  },
  {
    id: 'book-2',
    facility: 'Sports Court',
    flatNumber: 'A-101',
    residentName: 'David Lightman',
    bookingDate: '2026-07-01',
    timeSlot: '06:00 PM - 08:00 PM',
    status: 'Pending',
    purpose: 'Friendly Basketball Match',
    createdTime: '2026-06-29T15:10:00-07:00'
  }
];

export const initialNotices: Notice[] = [
  {
    id: 'not-1',
    title: 'Annual Elevators Maintenance Schedule',
    content: 'Please be informed that Block B elevators will undergo annual preventive inspection and safety load tests on Wednesday, July 2nd, from 09:00 AM to 04:00 PM. Residents are requested to use the service stairs or alternative lifts during this interval. We apologize for the temporary inconvenience.',
    category: 'Maintenance',
    publishedDate: '2026-06-28',
    sender: 'Property Management Office',
    isUrgent: false
  },
  {
    id: 'not-2',
    title: 'URGENT: Water Supply Interruption Block A',
    content: 'Due to an emergency main valve pipe repair near the north gate compound, water supply to Block A will be suspended temporarily on June 30th between 02:00 PM and 04:00 PM. Please store sufficient water for your essential household requirements.',
    category: 'Emergency',
    publishedDate: '2026-06-29',
    sender: 'Technical Engineering Team',
    isUrgent: true
  },
  {
    id: 'not-3',
    title: 'Community Monsoon Barbecue Social',
    content: 'Join your neighbors for our annual Summer barbecue event in the Community Gardens this coming Saturday, July 5th, from 06:00 PM onwards. Live band performance, complimentary drafts, mocktails, and plenty of catering. Bring your family members and join the celebrations!',
    category: 'Event',
    publishedDate: '2026-06-24',
    sender: 'Cultural and Welfare Committee',
    isUrgent: false
  }
];

export const initialPolls: Poll[] = [
  {
    id: 'poll-1',
    question: 'Should we replace the Clubhouse Gymnasium flooring with eco-friendly bamboo wood or industrial rubber matting?',
    options: [
      { id: 'opt-1', text: 'Eco-friendly Premium Bamboo Wood (Warm Aesthetics)', votes: 14 },
      { id: 'opt-2', text: 'Industrial High-density Vulcanized Rubber (Durable for Heavy Weights)', votes: 18 },
      { id: 'opt-3', text: 'Hybrid Luxury Vinyl Tiles (Waterproof & Cost-Effective)', votes: 6 }
    ],
    votedUserIds: ['A-101'], // David voted
    totalVotes: 38,
    createdDate: '2026-06-20',
    expiresDate: '2026-07-10',
    category: 'Budget Approval'
  },
  {
    id: 'poll-2',
    question: 'Approve the draft budget of $12,500 for the installation of compound-wide solar perimeter security lighting system?',
    options: [
      { id: 'opt-1', text: 'Yes, fully approve (Green initiative & low long-term utility bills)', votes: 24 },
      { id: 'opt-2', text: 'No, reject (Too expensive, seek cheaper alternative quotes)', votes: 5 },
      { id: 'opt-3', text: 'Postpone to next AGM (Require more engineering details and ROI study)', votes: 9 }
    ],
    votedUserIds: ['B-402'], // Sarah Connor voted
    totalVotes: 38,
    createdDate: '2026-06-25',
    expiresDate: '2026-07-05',
    category: 'Capital Spending'
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Visitor Request',
    message: 'Courier Bob (UberEats) is requesting entry approval for Flat B-402.',
    type: 'visitor',
    timestamp: '2026-06-29T23:15:00-07:00',
    read: false,
    targetFlat: 'B-402'
  },
  {
    id: 'notif-2',
    title: 'Water Supply Alert',
    message: 'Emergency Water shut-off scheduled for Block A on June 30th, 2pm - 4pm.',
    type: 'notice',
    timestamp: '2026-06-29T18:00:00-07:00',
    read: false,
    targetRole: 'resident'
  },
  {
    id: 'notif-3',
    title: 'Complaint Assigned',
    message: 'Complaint "Water Leakage in Kitchen Ceiling" assigned to Mike Evans (Plumber).',
    type: 'complaint',
    timestamp: '2026-06-28T14:30:00-07:00',
    read: true,
    targetFlat: 'B-402'
  },
  {
    id: 'notif-4',
    title: 'Facility Booking Confirmed',
    message: 'Your booking for Community Hall on 2026-07-12 has been APPROVED.',
    type: 'booking',
    timestamp: '2026-06-25T11:20:00-07:00',
    read: true,
    targetFlat: 'B-402'
  }
];
