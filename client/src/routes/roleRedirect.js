export function dashboardPathForRole(role) {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'WRITER':
      return '/writer/dashboard';
    case 'CUSTOMER':
    default:
      return '/customer/dashboard';
  }
}

export default dashboardPathForRole;
