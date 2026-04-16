'use client'

import { useState } from 'react'

import { OctagonAlertIcon, PlusIcon, UserPlusIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { createEmployeeSchema } from '@/modules/admin/schemas'
import { createEmployee } from '@/modules/admin/server/actions'
import type { CreateEmployeeFormData } from '@/modules/admin/types'
import type { UserRole } from '@/modules/auth/types'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface CreateEmployeeModalProps {
  currentUserRoles: UserRole[]
  onSuccess?: () => void
}

const CreateEmployeeModal = ({
  currentUserRoles,
  onSuccess
}: CreateEmployeeModalProps) => {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isOwner = currentUserRoles.includes('owner')

  const form = useForm<CreateEmployeeFormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      names: '',
      lastNames: '',
      email: '',
      role: 'SELLER'
    }
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      form.reset()
      setErrorMessage(null)
    }
    setOpen(nextOpen)
  }

  const onSubmit = async (data: CreateEmployeeFormData) => {
    setIsPending(true)
    setErrorMessage(null)

    try {
      const result = await createEmployee(data)

      if (!result.success) {
        setErrorMessage(result.error || 'Error al crear el empleado.')
        setIsPending(false)
        return
      }

      toast.success('Empleado creado exitosamente', {
        description: `Se ha enviado una invitación temporal a ${data.email}.`
      })

      handleOpenChange(false)
      onSuccess?.()
    } catch {
      setErrorMessage(
        'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button id='create-employee-trigger' className='gap-2'>
          <PlusIcon className='size-4' />
          Nuevo Empleado
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-center gap-3'>
            <div className='bg-primary/10 flex size-10 items-center justify-center rounded-full'>
              <UserPlusIcon className='text-primary size-5' />
            </div>
            <div>
              <DialogTitle>Crear Nuevo Empleado</DialogTitle>
              <DialogDescription>
                Se registrará en la base de datos y en AWS Cognito. Se enviará
                un correo con credenciales temporales.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form id='create-employee-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='gap-4'>
            {/* Names */}
            <Controller
              name='names'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor='employee-names'>Nombres</FieldLabel>
                  <Input
                    {...field}
                    id='employee-names'
                    type='text'
                    placeholder='Ej: Marta'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Last Names */}
            <Controller
              name='lastNames'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor='employee-last-names'>
                    Apellidos
                  </FieldLabel>
                  <Input
                    {...field}
                    id='employee-last-names'
                    type='text'
                    placeholder='Ej: Gomez'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email */}
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor='employee-email'>
                    Correo electrónico
                  </FieldLabel>
                  <Input
                    {...field}
                    id='employee-email'
                    type='email'
                    placeholder='marta@empresa.com'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Role */}
            <Controller
              name='role'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor='employee-role'>Rol</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id='employee-role'
                      className='w-full'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecciona un rol' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='SELLER'>Vendedor (Seller)</SelectItem>
                      {isOwner && (
                        <SelectItem value='ADMIN'>
                          Administrador (Admin)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {!isOwner && (
                    <p className='text-muted-foreground text-xs'>
                      Solo el propietario puede crear administradores.
                    </p>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        {errorMessage && (
          <Alert
            variant='destructive'
            className='flex items-center gap-x-2 bg-red-100'
          >
            <div className='flex'>
              <OctagonAlertIcon className='size-5' />
            </div>
            <AlertDescription className='flex-1 font-semibold'>
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            id='create-employee-submit'
            type='submit'
            form='create-employee-form'
            disabled={isPending}
          >
            {isPending ? 'Creando...' : 'Crear Empleado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { CreateEmployeeModal }
