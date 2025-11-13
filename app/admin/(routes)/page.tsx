import { Suspense } from 'react'

import { AdminView } from '@/modules/admin/ui/views'

export default async function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminView />
    </Suspense>
  )
}
