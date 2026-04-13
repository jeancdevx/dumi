'use client'

import { useState } from 'react'

import { OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { createTenantSchema, type CreateTenantFormData } from '../../schemas'
import { createTenant } from '../../server/actions'

const TenantSetupForm = () => {
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<CreateTenantFormData>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      name: '',
      ruc: '',
      address: ''
    }
  })

  const onSubmit = async (data: CreateTenantFormData) => {
    setIsPending(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('ruc', data.ruc || '')
      formData.append('address', data.address || '')

      const result = await createTenant(formData)

      if (!result.success) {
        setErrorMessage(result.error || 'No se pudo crear la empresa.')
        setIsPending(false)
        return
      }

      setSuccessMessage('Empresa creada correctamente.')
      setIsPending(false)
    } catch {
      setErrorMessage('Ocurrió un error inesperado. Intenta nuevamente.')
      setIsPending(false)
    }
  }

  return (
    <Card className='w-full sm:max-w-lg'>
      <CardHeader>
        <CardTitle className='text-3xl font-bold'>Crea tu empresa</CardTitle>
        <CardDescription>
          Completa los datos para inicializar tu espacio de trabajo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id='tenant-setup-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='gap-4'>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor={field.name}>
                    Nombre de empresa
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder='Dumi S.A.C.'
                    autoComplete='off'
                    autoFocus
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='ruc'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor={field.name}>RUC (opcional)</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    inputMode='numeric'
                    placeholder='20123456789'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name='address'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor={field.name}>
                    Dirección (opcional)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder='Calle Zepita 23'
                    autoComplete='off'
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className='flex flex-col gap-4'>
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

        {successMessage && (
          <Alert className='border-green-200 bg-green-50 text-green-800'>
            <AlertDescription className='font-semibold'>
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <Field orientation='horizontal'>
          <Button
            type='submit'
            className='w-full'
            form='tenant-setup-form'
            disabled={isPending}
          >
            {isPending ? 'Creando empresa...' : 'Crear empresa'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}

export { TenantSetupForm }
