'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { EyeIcon, EyeOffIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { signInSchema } from '@/modules/auth/schemas'
import { SignInFormData } from '@/modules/auth/types'

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

import { signIn } from '../../server/actions'

const SignInForm = () => {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsPending(true)
    setErrorMessage(null)

    try {
      const formData = new FormData()
      formData.append('email', data.email)
      formData.append('password', data.password)

      const result = await signIn(formData)

      if (!result.success) {
        setErrorMessage(result.error || 'Error al iniciar sesión')
        setIsPending(false)
        return
      }

      if (result.requiresTenantSetup) {
        router.push('/tenant/setup')
        return
      }

      router.push('/')
    } catch {
      setErrorMessage(
        'Ocurrió un error inesperado. Por favor, intenta de nuevo.'
      )
      setIsPending(false)
    }
  }

  return (
    <Card className='w-full sm:max-w-md'>
      <CardHeader className='flex flex-col items-center justify-center'>
        <CardTitle className='text-3xl font-bold'>
          Bienvenido de nuevo!
        </CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder al sistema.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form id='sign-in-form' onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className='gap-4'>
            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                  <FieldLabel htmlFor={field.name}>
                    Correo electrónico
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type='email'
                    placeholder='dumi@example.com'
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
              name='password'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='password'>Contraseña</FieldLabel>
                  <div className='relative'>
                    <Input
                      {...field}
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Ingrese su contraseña'
                      autoComplete='off'
                      aria-invalid={fieldState.invalid}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword
                          ? 'Ocultar contrasena'
                          : 'Mostrar contrasena'
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon className='h-4 w-4' />
                      ) : (
                        <EyeIcon className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  <FieldDescription>
                    La contraseña debe tener al menos 6 caracteres.
                  </FieldDescription>
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
        <Field orientation='horizontal'>
          <Button
            type='submit'
            className='w-full'
            form='sign-in-form'
            disabled={isPending}
          >
            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </Field>
        <p className='text-muted-foreground text-sm'>
          No tienes cuenta?{' '}
          <Link href='/sign-up' className='font-semibold underline'>
            Registrate
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export { SignInForm }
