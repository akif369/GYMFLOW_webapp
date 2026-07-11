// Central mock data for the entire GymFlow admin application

export const mockOrg = {
  id: 'org-1',
  name: 'IronZone Fitness',
  logo: null,
  branch: 'Main Branch - Koramangala',
};

export const mockMembers = [
  {
    id: 'mbr-001', memberId: 'GYM001', firstName: 'Rahul', lastName: 'Sharma',
    email: 'rahul.sharma@email.com', phone: '9876543210', photoUrl: null,
    joinDate: '2025-01-15', gender: 'Male', dob: '1995-03-10',
    plan: 'Monthly Pro', startDate: '2026-07-01', expiryDate: '2026-07-31',
    trainer: 'Amit Singh', lastVisit: '2026-07-10', paymentStatus: 'PAID',
    membershipStatus: 'ACTIVE', goal: 'Weight Loss', experience: 'Intermediate',
    branch: 'Koramangala',
    address: '42, 5th Cross, Koramangala, Bangalore',
    emergency: { name: 'Priya Sharma', phone: '9876543211', relation: 'Wife' },
    medicalConditions: 'None', allergies: 'None', injuries: 'Left knee - mild',
  },
  {
    id: 'mbr-002', memberId: 'GYM002', firstName: 'Priya', lastName: 'Mehta',
    email: 'priya.mehta@email.com', phone: '9876543221', photoUrl: null,
    joinDate: '2025-03-20', gender: 'Female', dob: '1998-07-22',
    plan: 'Quarterly Gold', startDate: '2026-05-01', expiryDate: '2026-07-29',
    trainer: 'Neha Gupta', lastVisit: '2026-07-09', paymentStatus: 'PENDING',
    membershipStatus: 'EXPIRING', goal: 'Muscle Gain', experience: 'Beginner',
    branch: 'Koramangala',
    address: '11, 2nd Main, HSR Layout, Bangalore',
    emergency: { name: 'Rajan Mehta', phone: '9876543222', relation: 'Father' },
    medicalConditions: 'Asthma', allergies: 'Peanuts', injuries: 'None',
  },
  {
    id: 'mbr-003', memberId: 'GYM003', firstName: 'Arjun', lastName: 'Verma',
    email: 'arjun.v@email.com', phone: '9876543231', photoUrl: null,
    joinDate: '2024-11-10', gender: 'Male', dob: '1990-12-05',
    plan: 'Yearly Platinum', startDate: '2025-11-10', expiryDate: '2026-11-10',
    trainer: 'Amit Singh', lastVisit: '2026-07-08', paymentStatus: 'PAID',
    membershipStatus: 'ACTIVE', goal: 'Strength', experience: 'Advanced',
    branch: 'Koramangala',
    address: '78, 8th Block, Koramangala, Bangalore',
    emergency: { name: 'Sunita Verma', phone: '9876543232', relation: 'Mother' },
    medicalConditions: 'None', allergies: 'None', injuries: 'None',
  },
  {
    id: 'mbr-004', memberId: 'GYM004', firstName: 'Kavya', lastName: 'Reddy',
    email: 'kavya.r@email.com', phone: '9876543241', photoUrl: null,
    joinDate: '2026-01-05', gender: 'Female', dob: '2000-04-18',
    plan: 'Monthly Basic', startDate: '2026-06-01', expiryDate: '2026-06-30',
    trainer: null, lastVisit: '2026-06-28', paymentStatus: 'PAID',
    membershipStatus: 'EXPIRED', goal: 'Flexibility', experience: 'Beginner',
    branch: 'Koramangala',
    address: '25, 3rd Main, Indiranagar, Bangalore',
    emergency: { name: 'Ravi Reddy', phone: '9876543242', relation: 'Father' },
    medicalConditions: 'None', allergies: 'None', injuries: 'None',
  },
  {
    id: 'mbr-005', memberId: 'GYM005', firstName: 'Vikram', lastName: 'Nair',
    email: 'vikram.n@email.com', phone: '9876543251', photoUrl: null,
    joinDate: '2025-08-15', gender: 'Male', dob: '1988-09-30',
    plan: 'Half-Yearly Elite', startDate: '2026-01-15', expiryDate: '2026-07-14',
    trainer: 'Amit Singh', lastVisit: '2026-07-07', paymentStatus: 'PARTIALLY_PAID',
    membershipStatus: 'EXPIRING', goal: 'Endurance', experience: 'Intermediate',
    branch: 'Koramangala',
    address: '56, 7th Sector, HSR Layout, Bangalore',
    emergency: { name: 'Latha Nair', phone: '9876543252', relation: 'Spouse' },
    medicalConditions: 'Hypertension', allergies: 'Dust', injuries: 'Shoulder - old',
  },
];

export const mockTrainers = [
  {
    id: 'tr-001', name: 'Amit Singh', phone: '9988776655', specialization: 'Strength & Conditioning',
    certifications: 'ACE CPT, ISSA', joiningDate: '2022-06-01', status: 'ACTIVE',
    shift: 'Morning (6AM - 2PM)', membersAssigned: 42, ptClients: 8,
    sessionsThisMonth: 63, sessionsCompleted: 58, sessionsCancelled: 5, photoUrl: null,
  },
  {
    id: 'tr-002', name: 'Neha Gupta', phone: '9988776644', specialization: 'Yoga & Flexibility',
    certifications: 'RYT 500, ACE', joiningDate: '2023-01-15', status: 'ACTIVE',
    shift: 'Evening (2PM - 10PM)', membersAssigned: 28, ptClients: 6,
    sessionsThisMonth: 40, sessionsCompleted: 38, sessionsCancelled: 2, photoUrl: null,
  },
  {
    id: 'tr-003', name: 'Ravi Kumar', phone: '9988776633', specialization: 'CrossFit & Cardio',
    certifications: 'NASM CPT, CF-L1', joiningDate: '2021-09-01', status: 'ON_LEAVE',
    shift: 'Morning (6AM - 2PM)', membersAssigned: 35, ptClients: 4,
    sessionsThisMonth: 20, sessionsCompleted: 18, sessionsCancelled: 2, photoUrl: null,
  },
];

export const mockMembershipPlans = [
  { id: 'plan-1', name: 'Monthly Basic', duration: 30, price: 1500, gst: 18, joiningFee: 500, ptSessions: 0, status: 'ACTIVE' },
  { id: 'plan-2', name: 'Monthly Pro', duration: 30, price: 2500, gst: 18, joiningFee: 500, ptSessions: 2, status: 'ACTIVE' },
  { id: 'plan-3', name: 'Quarterly Gold', duration: 90, price: 6500, gst: 18, joiningFee: 0, ptSessions: 6, status: 'ACTIVE' },
  { id: 'plan-4', name: 'Half-Yearly Elite', duration: 180, price: 11000, gst: 18, joiningFee: 0, ptSessions: 15, status: 'ACTIVE' },
  { id: 'plan-5', name: 'Yearly Platinum', duration: 365, price: 18000, gst: 18, joiningFee: 0, ptSessions: 36, status: 'ACTIVE' },
];

export const mockPayments = [
  { id: 'pay-001', member: 'Rahul Sharma', memberId: 'mbr-001', amount: 2950, method: 'UPI', status: 'PAID', date: '2026-07-01', refId: 'UPI20260701A', plan: 'Monthly Pro' },
  { id: 'pay-002', member: 'Arjun Verma', memberId: 'mbr-003', amount: 21240, method: 'Cash', status: 'PAID', date: '2025-11-10', refId: null, plan: 'Yearly Platinum' },
  { id: 'pay-003', member: 'Priya Mehta', memberId: 'mbr-002', amount: 7670, method: 'Card', status: 'PENDING', date: '2026-07-09', refId: 'CARD20260709B', plan: 'Quarterly Gold' },
  { id: 'pay-004', member: 'Vikram Nair', memberId: 'mbr-005', amount: 6500, method: 'UPI', status: 'PARTIALLY_PAID', date: '2026-01-15', refId: 'UPI20260115C', plan: 'Half-Yearly Elite' },
  { id: 'pay-005', member: 'Kavya Reddy', memberId: 'mbr-004', amount: 1770, method: 'Cash', status: 'PAID', date: '2026-06-01', refId: null, plan: 'Monthly Basic' },
];

export const mockAttendanceLogs = [
  { id: 'att-001', member: 'Rahul Sharma', memberId: 'mbr-001', date: '2026-07-10', checkIn: '06:30', checkOut: '08:00', duration: '1h 30m', method: 'MANUAL', branch: 'Koramangala' },
  { id: 'att-002', member: 'Arjun Verma', memberId: 'mbr-003', date: '2026-07-10', checkIn: '07:00', checkOut: '09:30', duration: '2h 30m', method: 'MANUAL', branch: 'Koramangala' },
  { id: 'att-003', member: 'Vikram Nair', memberId: 'mbr-005', date: '2026-07-10', checkIn: '07:15', checkOut: null, duration: 'Inside', method: 'MANUAL', branch: 'Koramangala' },
  { id: 'att-004', member: 'Priya Mehta', memberId: 'mbr-002', date: '2026-07-09', checkIn: '18:00', checkOut: '19:30', duration: '1h 30m', method: 'MANUAL', branch: 'Koramangala' },
  { id: 'att-005', member: 'Rahul Sharma', memberId: 'mbr-001', date: '2026-07-09', checkIn: '06:45', checkOut: '08:30', duration: '1h 45m', method: 'MANUAL', branch: 'Koramangala' },
];

export const mockPtPackages = [
  { id: 'pt-pkg-1', name: '12 Sessions', sessions: 12, price: 6000, gst: 18 },
  { id: 'pt-pkg-2', name: '24 Sessions', sessions: 24, price: 10000, gst: 18 },
  { id: 'pt-pkg-3', name: '48 Sessions', sessions: 48, price: 18000, gst: 18 },
];

export const mockPtSessions = [
  { id: 'pt-001', member: 'Rahul Sharma', trainer: 'Amit Singh', date: '2026-07-10', time: '07:00', status: 'COMPLETED', notes: 'Good session, focused on chest' },
  { id: 'pt-002', member: 'Vikram Nair', trainer: 'Amit Singh', date: '2026-07-10', time: '08:00', status: 'UPCOMING', notes: '' },
  { id: 'pt-003', member: 'Priya Mehta', trainer: 'Neha Gupta', date: '2026-07-10', time: '18:00', status: 'UPCOMING', notes: '' },
  { id: 'pt-004', member: 'Arjun Verma', trainer: 'Amit Singh', date: '2026-07-09', time: '07:00', status: 'MISSED', notes: '' },
];

export const mockExercises = [
  { id: 'ex-001', name: 'Barbell Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', active: true },
  { id: 'ex-002', name: 'Pull-Up', muscleGroup: 'Back', equipment: 'Pull-up Bar', difficulty: 'Intermediate', active: true },
  { id: 'ex-003', name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell', difficulty: 'Beginner', active: true },
  { id: 'ex-004', name: 'Deadlift', muscleGroup: 'Back', equipment: 'Barbell', difficulty: 'Advanced', active: true },
  { id: 'ex-005', name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Intermediate', active: true },
  { id: 'ex-006', name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', difficulty: 'Beginner', active: true },
];

export const mockWorkoutTemplates = [
  { id: 'wt-001', name: 'Push Day', exercises: 5, trainer: 'Amit Singh', members: 12 },
  { id: 'wt-002', name: 'Pull Day', exercises: 5, trainer: 'Amit Singh', members: 12 },
  { id: 'wt-003', name: 'Leg Day', exercises: 6, trainer: 'Ravi Kumar', members: 8 },
  { id: 'wt-004', name: 'Beginner Fat Loss', exercises: 8, trainer: 'Neha Gupta', members: 15 },
];

export const mockLeads = [
  { id: 'lead-001', name: 'Sanjay Kumar', phone: '9876500001', source: 'Instagram', status: 'Trial Booked', createdAt: '2026-07-08', notes: 'Interested in weight loss program' },
  { id: 'lead-002', name: 'Meena Pillai', phone: '9876500002', source: 'Walk-in', status: 'Contacted', createdAt: '2026-07-09', notes: 'Came in for pricing info' },
  { id: 'lead-003', name: 'Rohan Das', phone: '9876500003', source: 'Google', status: 'Joined', createdAt: '2026-06-25', notes: 'Converted to Quarterly Gold' },
  { id: 'lead-004', name: 'Aisha Khan', phone: '9876500004', source: 'Referral', status: 'Trial Completed', createdAt: '2026-07-05', notes: 'Referred by Arjun Verma' },
  { id: 'lead-005', name: 'Dev Anand', phone: '9876500005', source: 'WhatsApp', status: 'New Lead', createdAt: '2026-07-10', notes: 'Messaged about membership plans' },
];

export const mockMembershipEvents = [
  { id: 'me-1', type: 'CREATED', date: '2025-01-15', notes: 'Monthly Pro membership created', actor: 'Admin' },
  { id: 'me-2', type: 'RENEWED', date: '2025-02-15', notes: 'Renewed for another month', actor: 'Receptionist' },
  { id: 'me-3', type: 'FROZEN', date: '2025-03-01', notes: 'Frozen for 10 days (travel)', actor: 'Admin' },
  { id: 'me-4', type: 'RESUMED', date: '2025-03-11', notes: 'Membership resumed', actor: 'Admin' },
  { id: 'me-5', type: 'RENEWED', date: '2026-07-01', notes: 'Renewed - Monthly Pro', actor: 'Receptionist' },
];

export const mockActivityTimeline = [
  { date: '2026-07-10', event: 'Checked in', icon: 'CheckCircle' },
  { date: '2026-07-09', event: 'Payment ₹2,500 received (UPI)', icon: 'Payment' },
  { date: '2026-07-09', event: 'Membership renewed (Monthly Pro)', icon: 'Autorenew' },
  { date: '2026-07-08', event: 'Weight updated: 96 kg → 95.4 kg', icon: 'FitnessCenter' },
  { date: '2026-07-07', event: 'Trainer changed to Amit Singh', icon: 'SwapHoriz' },
  { date: '2026-07-05', event: 'Checked in', icon: 'CheckCircle' },
];

export const mockMeasurements = [
  { date: '2026-07-08', weight: 95.4, bodyFat: 23.5, chest: 107, waist: 101, arm: 39.5, thigh: 62 },
  { date: '2026-06-08', weight: 96, bodyFat: 24, chest: 108, waist: 102, arm: 39, thigh: 62 },
  { date: '2026-05-08', weight: 97.5, bodyFat: 24.8, chest: 109, waist: 104, arm: 38.5, thigh: 63 },
  { date: '2026-04-08', weight: 99, bodyFat: 25.5, chest: 110, waist: 106, arm: 38, thigh: 64 },
];

export const mockDashboardStats = {
  todaysCheckins: 47,
  currentlyInside: 12,
  todaysRevenue: 8500,
  monthRevenue: 142000,
  pendingAmount: 23750,
  expiringIn7Days: 14,
  expiredMemberships: 8,
  newMembersMonth: 23,
  activeMembers: 248,
  inactiveMembers: 36,
  trainersWorking: 2,
  todaysPtSessions: 8,
};

export const mockRevenueChart = [
  { month: 'Jan', revenue: 98000 }, { month: 'Feb', revenue: 112000 },
  { month: 'Mar', revenue: 125000 }, { month: 'Apr', revenue: 118000 },
  { month: 'May', revenue: 132000 }, { month: 'Jun', revenue: 138000 },
  { month: 'Jul', revenue: 142000 },
];

export const mockAttendanceChart = [
  { day: 'Mon', count: 52 }, { day: 'Tue', count: 48 }, { day: 'Wed', count: 61 },
  { day: 'Thu', count: 44 }, { day: 'Fri', count: 58 }, { day: 'Sat', count: 72 }, { day: 'Sun', count: 35 },
];

export const mockPeakHours = [
  { hour: '6-7AM', count: 28 }, { hour: '7-8AM', count: 45 }, { hour: '8-9AM', count: 38 },
  { hour: '9-10AM', count: 22 }, { hour: '5-6PM', count: 35 }, { hour: '6-7PM', count: 52 },
  { hour: '7-8PM', count: 48 }, { hour: '8-9PM', count: 30 },
];

export const mockStaff = [
  { id: 'stf-001', name: 'Priya Kapoor', email: 'priya.k@ironzone.com', role: 'MANAGER', phone: '9900112233', status: 'ACTIVE', permissions: ['member.create', 'member.update', 'payment.create', 'attendance.create', 'revenue.view'] },
  { id: 'stf-002', name: 'Suresh Babu', email: 'suresh.b@ironzone.com', role: 'RECEPTIONIST', phone: '9900112244', status: 'ACTIVE', permissions: ['member.create', 'payment.create', 'attendance.create'] },
  { id: 'stf-003', name: 'Lakshmi R', email: 'lakshmi.r@ironzone.com', role: 'RECEPTIONIST', phone: '9900112255', status: 'INACTIVE', permissions: ['member.create', 'payment.create', 'attendance.create'] },
];

export const ALL_PERMISSIONS = [
  'member.create', 'member.update', 'member.delete',
  'attendance.create', 'attendance.correct',
  'payment.create', 'payment.refund',
  'revenue.view', 'trainer.manage', 'report.export',
];
