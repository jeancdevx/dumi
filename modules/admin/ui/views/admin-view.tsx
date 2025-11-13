import { getUser, requireRole } from '@/lib/dal'

const AdminView = async () => {
  await requireRole('admin')
  const user = await getUser()

  return (
    <div>
      <h1>AdminPage</h1>
      <p>Bienvenido, {user.names}!</p>
    </div>
  )
}

export { AdminView }
