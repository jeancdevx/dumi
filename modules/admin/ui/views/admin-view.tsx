import { getUser, requireAnyRole } from '@/lib/dal'

import { getEmployees } from '@/modules/admin/server/actions'

import { CreateEmployeeModal } from '../components/create-employee-modal'
import { EmployeeList } from '../components/employee-list'

const AdminView = async () => {
  await requireAnyRole(['owner', 'admin'])
  const [user, employees] = await Promise.all([getUser(), getEmployees()])

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

      {/* Employee table */}
      <main className='flex-1 p-6'>
        <EmployeeList
          employees={employees}
          currentUser={user}
          currentUserRoles={user.roles}
        />
      </main>
    </div>
  )
}

export { AdminView }
