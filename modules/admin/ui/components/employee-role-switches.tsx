'use client'

import { useState } from 'react'

import { toast } from 'sonner'

import { promoteEmployee, revokeEmployee } from '@/modules/admin/server/actions'
import type { EmployeeWithRoles } from '@/modules/admin/types'
import type { UserRole } from '@/modules/auth/types'

import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'

interface EmployeeRoleSwitchesProps {
  employee: EmployeeWithRoles
  currentUserRoles: UserRole[]
  currentUserSub: string
}

const DISPLAYABLE_ROLES = ['seller', 'admin'] as const
type DisplayableRole = (typeof DISPLAYABLE_ROLES)[number]

const ROLE_LABELS: Record<DisplayableRole, string> = {
  seller: 'Seller',
  admin: 'Admin'
}

const EmployeeRoleSwitches = ({
  employee,
  currentUserRoles,
  currentUserSub
}: EmployeeRoleSwitchesProps) => {
  const isOwner = currentUserRoles.includes('owner')
  const isOwnAccount = employee.sub === currentUserSub
  const targetIsOwner = employee.roles.includes('owner')

  const [roles, setRoles] = useState<string[]>(employee.roles)
  const [loadingRole, setLoadingRole] = useState<string | null>(null)

  const handlePromote = async (role: DisplayableRole) => {
    if (loadingRole) return
    setLoadingRole(role)

    const result = await promoteEmployee(
      employee.email,
      role.toUpperCase() as 'SELLER' | 'ADMIN'
    )

    if (result.success) {
      setRoles(prev => (prev.includes(role) ? prev : [...prev, role]))
      toast.success('Rol asignado', {
        description:
          result.message ??
          `Rol ${ROLE_LABELS[role]} asignado a ${employee.names}.`
      })
    } else {
      toast.error('Error al asignar rol', { description: result.error })
    }

    setLoadingRole(null)
  }

  const handleRevoke = async (role: DisplayableRole) => {
    if (loadingRole) return
    setLoadingRole(role)

    const result = await revokeEmployee(
      employee.email,
      role.toUpperCase() as 'SELLER' | 'ADMIN'
    )

    if (result.success) {
      setRoles(prev => prev.filter(r => r !== role))
      toast.success('Rol revocado', {
        description:
          result.message ??
          `Rol ${ROLE_LABELS[role]} removido de ${employee.names}.`
      })
    } else {
      toast.error('Error al revocar rol', { description: result.error })
    }

    setLoadingRole(null)
  }

  const isSwitchDisabled = (role: DisplayableRole): boolean => {
    if (targetIsOwner) return true
    if (isOwnAccount) return true
    if (role === 'admin' && !isOwner) return true
    if (loadingRole === role) return true
    return false
  }

  const getTooltipMessage = (role: DisplayableRole): string | null => {
    if (targetIsOwner)
      return 'No se pueden modificar los roles del propietario.'
    if (isOwnAccount) return 'No puedes modificar tus propios roles.'
    if (role === 'admin' && !isOwner)
      return 'Solo el propietario puede gestionar el rol Admin.'
    return null
  }

  return (
    <div className='flex items-center gap-4'>
      {DISPLAYABLE_ROLES.map(role => {
        const hasRole = roles.includes(role)
        const disabled = isSwitchDisabled(role)
        const tooltip = getTooltipMessage(role)
        const isLoading = loadingRole === role

        const switchEl = (
          <div key={role} className='flex items-center gap-1.5'>
            <Switch
              id={`role-${employee.id}-${role}`}
              checked={hasRole}
              disabled={disabled}
              aria-label={`${hasRole ? 'Revocar' : 'Asignar'} rol ${ROLE_LABELS[role]} a ${employee.names}`}
              onCheckedChange={checked => {
                if (checked && !hasRole) handlePromote(role)
                else if (!checked && hasRole) handleRevoke(role)
              }}
              className={isLoading ? 'opacity-50' : ''}
            />
            <label
              htmlFor={`role-${employee.id}-${role}`}
              className={`text-sm select-none ${disabled ? 'text-muted-foreground' : 'cursor-pointer'}`}
            >
              {ROLE_LABELS[role]}
            </label>
          </div>
        )

        if (tooltip) {
          return (
            <Tooltip key={role}>
              <TooltipTrigger asChild>
                <span className='flex items-center gap-1.5'>{switchEl}</span>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          )
        }

        return switchEl
      })}
    </div>
  )
}

export { EmployeeRoleSwitches }
