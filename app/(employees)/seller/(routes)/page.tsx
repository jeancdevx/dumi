import { Suspense } from 'react'

import { SellerView } from '@/modules/seller/ui/views'

export default async function SellerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SellerView />
    </Suspense>
  )
}
