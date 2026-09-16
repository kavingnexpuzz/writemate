import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import PendingActionsOutlinedIcon from "@mui/icons-material/PendingActionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import DoneAllOutlinedIcon from "@mui/icons-material/DoneAllOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

// `phase` marks items not built yet — DashboardLayout renders those
// pages with ComingSoonPage instead of a real feature. No `phase` = built.

export const customerNav = [
  {
    label: "Dashboard",
    path: "/customer/dashboard",
    icon: DashboardOutlinedIcon,
  },
  {
    label: "Find Writers",
    path: "/customer/find-writers",
    icon: SearchOutlinedIcon,
  },
  {
    label: "New Request",
    path: "/customer/new-request",
    icon: AddCircleOutlineIcon,
  },
  {
    label: "My Requests",
    path: "/customer/requests",
    icon: ListAltOutlinedIcon,
  },
  {
    label: "Active Work",
    path: "/customer/active-work",
    icon: PendingActionsOutlinedIcon,
  },
  {
    label: "Completed Work",
    path: "/customer/completed-work",
    icon: TaskAltOutlinedIcon,
    phase: 8,
  },
  { label: "Payments", path: "/customer/payments", icon: PaymentsOutlinedIcon },
  {
    label: "Notifications",
    path: "/customer/notifications",
    icon: NotificationsNoneOutlinedIcon,
    phase: 7,
  },
  {
    label: "Profile",
    path: "/customer/profile",
    icon: PersonOutlineOutlinedIcon,
  },
];

export const writerNav = [
  {
    label: "Dashboard",
    path: "/writer/dashboard",
    icon: DashboardOutlinedIcon,
  },
  {
    label: "New Requests",
    path: "/writer/new-requests",
    icon: InboxOutlinedIcon,
  },
  {
    label: "Accepted Jobs",
    path: "/writer/accepted",
    icon: HourglassEmptyOutlinedIcon,
  },
  {
    label: "In Progress",
    path: "/writer/in-progress",
    icon: PendingActionsOutlinedIcon,
  },
  { label: "Completed", path: "/writer/completed", icon: DoneAllOutlinedIcon },
  { label: "Cancelled", path: "/writer/cancelled", icon: CancelOutlinedIcon },
  {
    label: "Earnings",
    path: "/writer/earnings",
    icon: AccountBalanceWalletOutlinedIcon,
  },
  {
    label: "Reviews",
    path: "/writer/reviews",
    icon: StarBorderOutlinedIcon,
    phase: 8,
  },
  {
    label: "Profile",
    path: "/writer/profile",
    icon: PersonOutlineOutlinedIcon,
  },
];

export const adminNav = [
  { label: "Dashboard", path: "/admin/dashboard", icon: DashboardOutlinedIcon },
  { label: "Customers", path: "/admin/customers", icon: GroupOutlinedIcon },
  { label: "Writers", path: "/admin/writers", icon: EditNoteOutlinedIcon },
  {
    label: "Writer Approvals",
    path: "/admin/writer-approvals",
    icon: HowToRegOutlinedIcon,
  },
  { label: "Requests", path: "/admin/requests", icon: ListAltOutlinedIcon },
  { label: "Payments", path: "/admin/payments", icon: PaymentsOutlinedIcon },
  { label: "Reviews", path: "/admin/reviews", icon: StarBorderOutlinedIcon },
  {
    label: "Complaints",
    path: "/admin/complaints",
    icon: ReportProblemOutlinedIcon,
  },
  {
    label: "Notifications",
    path: "/admin/notifications",
    icon: NotificationsNoneOutlinedIcon,
    phase: 7,
  },
  { label: "Locations", path: "/admin/locations", icon: PlaceOutlinedIcon },
  { label: "Settings", path: "/admin/settings", icon: SettingsOutlinedIcon },
];

export default { customerNav, writerNav, adminNav };
