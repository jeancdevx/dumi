'use client'

import { ShieldAlertIcon, UserIcon } from 'lucide-react'

import type { EmployeeWithRoles } from '@/modules/admin/types'
import type { User, UserRole } from '@/modules/auth/types'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { EmployeeRoleSwitches } from './employee-role-switches'

interface EmployeeListProps {
  employees: EmployeeWithRoles[]
  currentUser: User
  currentUserRoles: UserRole[]
}

const ROLE_BADGE: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  owner: { label: 'Owner', variant: 'default' },
  admin: { label: 'Admin', variant: 'secondary' },
  seller: { label: 'Seller', variant: 'outline' }
}

const EmployeeList = ({
  employees,
  currentUser,
  currentUserRoles
}: EmployeeListProps) => {
  if (employees.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
        <UserIcon className='text-muted-foreground size-10' />
        <p className='text-muted-foreground text-sm'>
          No hay empleados registrados todavía.
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Empleado</TableHead>
          <TableHead>Correo</TableHead>
          <TableHead>Roles actuales</TableHead>
          <TableHead>Asignar roles</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map(employee => (
          <TableRow
            key={employee.id}
            className={!employee.isActive ? 'opacity-50' : ''}
          >
            {/* Name */}
            <TableCell className='font-medium'>
              <div className='flex items-center gap-2'>
                {employee.roles.includes('owner') && (
                  <ShieldAlertIcon className='text-primary size-4 shrink-0' />
                )}
                {employee.names} {employee.lastNames}
                {employee.sub === currentUser.id && (
                  <span className='text-muted-foreground text-xs'>(tú)</span>
                )}
              </div>
            </TableCell>

            {/* Email */}
            <TableCell className='text-muted-foreground text-sm'>
              {employee.email}
            </TableCell>

            {/* Current roles */}
            <TableCell>
              <div className='flex flex-wrap gap-1'>
                {employee.roles.length === 0 ? (
                  <span className='text-muted-foreground text-xs'>
                    Sin roles
                  </span>
                ) : (
                  employee.roles.map(role => {
                    const badge = ROLE_BADGE[role] ?? {
                      label: role,
                      variant: 'outline' as const
                    }
                    return (
                      <Badge key={role} variant={badge.variant}>
                        {badge.label}
                      </Badge>
                    )
                  })
                )}
              </div>
            </TableCell>

            {/* Role switches (promote) */}
            <TableCell>
              <EmployeeRoleSwitches
                employee={employee}
                currentUserRoles={currentUserRoles}
                currentUserSub={currentUser.superTokensId}
              />
            </TableCell>

            {/* Status */}
            <TableCell>
              <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                {employee.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { EmployeeList }
