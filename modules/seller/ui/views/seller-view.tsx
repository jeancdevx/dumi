import { getUser, requireRole } from '@/lib/dal'

const SellerView = async () => {
  await requireRole('seller')
  const user = await getUser()

  return (
    <div>
      <h1>AdminPage</h1>
      <p>Bienvenido, {user.names}!</p>
    </div>
  )
}

export { SellerView }
