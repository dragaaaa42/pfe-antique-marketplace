export function getDashboardPathForRole(role?: string | null) {
  if (role === 'buyer') return '/collector'
  if (role === 'seller') return '/seller'
  if (role === 'admin') return '/admin'
  return '/'
}

export function getWorkspaceLabelForRole(role?: string | null) {
  if (role === 'buyer') return 'Collector workspace'
  if (role === 'seller') return 'Seller workspace'
  if (role === 'admin') return 'Admin workspace'
  return 'Marketplace'
}
