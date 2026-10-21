import {
  LayoutDashboard,
  ClipboardList,
  HandCoins,
  Users,
  Bell,
  Building2,
  Settings,
} from "lucide-react";

export const DEFAULT_PROFILE = {
  name: "",
  type: "Children's Home / CCI",
  address: "",
  contact: "",
  email: "",
  registrationNumber: "",
  pan: "",
  cciJj: "",
  authorizedPerson: "",
  verificationStatus: "Pending",
  photoPreview: null,
  documents: [],
};

export const navItems = [
  { id: "dashboard", label: "Dashboard", emoji: "\u{1F3E0}", icon: LayoutDashboard },
  { id: "requirements", label: "Requirements", emoji: "\u{1F4CB}", icon: ClipboardList },
  { id: "donations", label: "Donations", emoji: "\u{1F4B0}", icon: HandCoins },
  { id: "volunteers", label: "Volunteers", emoji: "\u{1F91D}", icon: Users },
  { id: "notifications", label: "Notifications", emoji: "\u{1F514}", icon: Bell },
  { id: "profile", label: "Profile", emoji: "\u{1F3E2}", icon: Building2 },
  { id: "settings", label: "Settings", emoji: "\u2699\uFE0F", icon: Settings },
];

export const initialRequirements = [];
export const initialDonations = [];
export const initialVolunteers = [];
export const initialVolunteerRoles = [];
export const upcomingActivities = [];
export const initialNotifications = [];
export const recentActivities = [];
