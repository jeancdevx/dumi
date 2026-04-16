import { getUser, requireAnyRole } from '@/lib/dal'

import { CreateEmployeeModal } from '../components/create-employee-modal'

const AdminView = async () => {
  await requireAnyRole(['owner', 'admin'])
  const user = await getUser()

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <header className='border-b px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Panel de Administración
            </h1>
            <p className='text-muted-foreground text-sm'>
              Bienvenido, {user.names} {user.lastNames}
            </p>
          </div>
          <CreateEmployeeModal currentUserRoles={user.roles} />
        </div>
      </header>

      {/* Content placeholder */}
      <main className='flex-1 p-6'>
        <p className='text-muted-foreground text-sm'>
          Gestiona los empleados de tu organización desde aquí.
        </p>
      </main>
    </div>
  )
}

export { AdminView }
