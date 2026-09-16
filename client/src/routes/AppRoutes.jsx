import { Routes, Route } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import CustomerRegisterPage from "../pages/auth/CustomerRegisterPage";
import WriterRegisterPage from "../pages/auth/WriterRegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import RequestDetailPage from "../pages/RequestDetailPage";

import DashboardLayout from "../layouts/DashboardLayout";
import ComingSoonPage from "../components/ComingSoonPage";
import { customerNav, writerNav, adminNav } from "../config/navConfig";

import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import FindWritersPage from "../pages/customer/FindWritersPage";
import NewRequestPage from "../pages/customer/NewRequestPage";
import MyRequestsPage from "../pages/customer/MyRequestsPage";
import ActiveWorkPage from "../pages/customer/ActiveWorkPage";
import PaymentsPage from "../pages/customer/PaymentsPage";
import WriterPublicProfilePage from "../pages/customer/WriterPublicProfilePage";

import WriterDashboardPage from "../pages/writer/WriterDashboardPage";
import WriterNewRequestsPage from "../pages/writer/WriterNewRequestsPage";
import WriterAcceptedJobsPage from "../pages/writer/WriterAcceptedJobsPage";
import WriterInProgressPage from "../pages/writer/WriterInProgressPage";
import WriterCompletedPage from "../pages/writer/WriterCompletedPage";
import WriterCancelledPage from "../pages/writer/WriterCancelledPage";
import EarningsPage from "../pages/writer/EarningsPage";
import WriterProfilePage from "../pages/writer/WriterProfilePage";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import CustomersPage from "../pages/admin/CustomersPage";
import WritersPage from "../pages/admin/WritersPage";
import WriterApprovalsPage from "../pages/admin/WriterApprovalsPage";
import AdminRequestsPage from "../pages/admin/AdminRequestsPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage";
import AdminComplaintsPage from "../pages/admin/AdminComplaintsPage";
import AdminLocationsPage from "../pages/admin/AdminLocationsPage";

import ProfilePage from "../pages/shared/ProfilePage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

// Renders a ComingSoonPage for every nav item that isn't backed by a real
// page yet — keeps the sidebar fully populated (per the brief) while later
// phases swap in the real feature one route at a time.
function comingSoonRoutesFor(navItems, builtPaths) {
  return navItems
    .filter((item) => !builtPaths.includes(item.path))
    .map((item) => (
      <Route
        key={item.path}
        path={item.path}
        element={<ComingSoonPage title={item.label} phase={item.phase} />}
      />
    ));
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<CustomerRegisterPage />} />
      <Route path="/writer/register" element={<WriterRegisterPage />} />

      <Route element={<ProtectedRoute />}>
        {/* Shared route reachable by any authenticated role that has access
            to the specific request (ownership checked server-side). */}
        <Route path="/requests/:id" element={<RequestDetailPage />} />

        <Route element={<RoleRoute allowedRoles={["CUSTOMER"]} />}>
          <Route
            element={
              <DashboardLayout navItems={customerNav} roleLabel="Customer" />
            }
          >
            <Route
              path="/customer/dashboard"
              element={<CustomerDashboardPage />}
            />
            <Route
              path="/customer/find-writers"
              element={<FindWritersPage />}
            />
            <Route
              path="/customer/writers/:id"
              element={<WriterPublicProfilePage />}
            />
            <Route path="/customer/new-request" element={<NewRequestPage />} />
            <Route path="/customer/requests" element={<MyRequestsPage />} />
            <Route path="/customer/active-work" element={<ActiveWorkPage />} />
            <Route path="/customer/payments" element={<PaymentsPage />} />
            <Route path="/customer/profile" element={<ProfilePage />} />
            {comingSoonRoutesFor(customerNav, [
              "/customer/dashboard",
              "/customer/find-writers",
              "/customer/new-request",
              "/customer/requests",
              "/customer/active-work",
              "/customer/payments",
              "/customer/profile",
            ])}
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["WRITER"]} />}>
          <Route
            element={
              <DashboardLayout navItems={writerNav} roleLabel="Writer" />
            }
          >
            <Route path="/writer/dashboard" element={<WriterDashboardPage />} />
            <Route
              path="/writer/new-requests"
              element={<WriterNewRequestsPage />}
            />
            <Route
              path="/writer/accepted"
              element={<WriterAcceptedJobsPage />}
            />
            <Route
              path="/writer/in-progress"
              element={<WriterInProgressPage />}
            />
            <Route path="/writer/completed" element={<WriterCompletedPage />} />
            <Route path="/writer/cancelled" element={<WriterCancelledPage />} />
            <Route path="/writer/earnings" element={<EarningsPage />} />
            <Route path="/writer/profile" element={<WriterProfilePage />} />
            {comingSoonRoutesFor(writerNav, [
              "/writer/dashboard",
              "/writer/new-requests",
              "/writer/accepted",
              "/writer/in-progress",
              "/writer/completed",
              "/writer/cancelled",
              "/writer/earnings",
              "/writer/profile",
            ])}
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
          <Route
            element={<DashboardLayout navItems={adminNav} roleLabel="Admin" />}
          >
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/writers" element={<WritersPage />} />
            <Route
              path="/admin/writer-approvals"
              element={<WriterApprovalsPage />}
            />
            <Route path="/admin/requests" element={<AdminRequestsPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
            <Route path="/admin/reviews" element={<AdminReviewsPage />} />
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="/admin/locations" element={<AdminLocationsPage />} />
            <Route path="/admin/settings" element={<ProfilePage />} />
            {comingSoonRoutesFor(adminNav, [
              "/admin/dashboard",
              "/admin/customers",
              "/admin/writers",
              "/admin/writer-approvals",
              "/admin/requests",
              "/admin/payments",
              "/admin/reviews",
              "/admin/complaints",
              "/admin/locations",
              "/admin/settings",
            ])}
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
