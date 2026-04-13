'use client'

import { useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { EyeIcon, EyeOffIcon, OctagonAlertIcon } from 'lucide-react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import { confirmCodeSchema, registerSchema } from '@/modules/auth/schemas'
import { RegisterFormData } from '@/modules/auth/types'

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

import { confirmEmail, register, resendCode } from '../../server/actions'

type FlowStep = 'register' | 'confirm'

const SignUpFlow = () => {
  const router = useRouter()
  const [step, setStep] = useState<FlowStep>('register')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [isRegisterPending, setIsRegisterPending] = useState(false)
  const [isConfirmPending, setIsConfirmPending] = useState(false)
  const [isResendPending, setIsResendPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      password: ''
    }
  })

  const onRegisterSubmit = async (data: RegisterFormData) => {
    if (isRegisterPending) return

    setIsRegisterPending(true)
    setRegisterError(null)
    setConfirmError(null)
    setResendMessage(null)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('lastName', data.lastName)
      formData.append('email', data.email)
      formData.append('password', data.password)

      const result = await register(formData)

      if (!result.success) {
        if (result.code === 'REGISTER_PARTIAL') {
          setRegisteredEmail(data.email)
          setVerificationCode('')
          setStep('confirm')
          setConfirmError(null)
          setResendMessage(
            result.error ||
              'Revisa tu correo. Si recibiste el codigo, ingresalo para confirmar tu cuenta.'
          )
          return
        }

        setRegisterError(result.error || 'No fue posible crear la cuenta.')
        return
      }

      setRegisteredEmail(result.email || data.email)
      setVerificationCode('')
      setStep('confirm')
      setResendMessage(
        'Te enviamos un codigo de verificacion al correo. Revisalo para completar el registro.'
      )
    } catch {
      setRegisterError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setIsRegisterPending(false)
    }
  }

  const onConfirmSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!registeredEmail) {
      setConfirmError(
        'No encontramos el correo para confirmar. Vuelve a completar el registro.'
      )
      return
    }

    const parsedCode = confirmCodeSchema.safeParse({ code: verificationCode })

    if (!parsedCode.success) {
      setConfirmError('Ingresa un codigo valido de 6 digitos.')
      return
    }

    setIsConfirmPending(true)
    setConfirmError(null)
    setResendMessage(null)

    try {
      const formData = new FormData()
      formData.append('email', registeredEmail)
      formData.append('code', parsedCode.data.code)

      const result = await confirmEmail(formData)

      if (!result.success) {
        setConfirmError(
          result.error || 'No fue posible confirmar el correo electrónico.'
        )
        return
      }

      router.push('/sign-in')
    } catch {
      setConfirmError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setIsConfirmPending(false)
    }
  }

  const onResendCode = async () => {
    if (!registeredEmail) {
      setConfirmError(
        'No encontramos el correo para reenviar el codigo. Vuelve a registrarte.'
      )
      return
    }

    setIsResendPending(true)
    setConfirmError(null)
    setResendMessage(null)

    try {
      const formData = new FormData()
      formData.append('email', registeredEmail)

      const result = await resendCode(formData)

      if (!result.success) {
        setConfirmError(result.error || 'No fue posible reenviar el código.')
        setIsResendPending(false)
        return
      }

      setResendMessage(
        'Te enviamos un nuevo código de verificación por correo.'
      )
    } catch {
      setConfirmError('Ocurrió un error inesperado. Intenta nuevamente.')
    } finally {
      setIsResendPending(false)
    }
  }

  return (
    <Card className='w-full sm:max-w-md'>
      <CardHeader className='flex flex-col items-center justify-center'>
        <CardTitle className='text-3xl font-bold'>
          {step === 'register' ? 'Crear cuenta' : 'Confirmar correo'}
        </CardTitle>
        <CardDescription>
          {step === 'register'
            ? 'Completa tus datos para registrar tu usuario.'
            : `Ingresa el codigo de 6 digitos enviado a ${registeredEmail}.`}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {step === 'register' ? (
          <form
            id='sign-up-form'
            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
          >
            <FieldGroup className='gap-4'>
              <Controller
                name='name'
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                    <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder='Juan'
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
                name='lastName'
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                    <FieldLabel htmlFor={field.name}>Apellido</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder='Perez'
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
                name='email'
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                    <FieldLabel htmlFor={field.name}>Correo</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type='email'
                      placeholder='correo@empresa.com'
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
                name='password'
                control={registerForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className='gap-1.5'>
                    <FieldLabel htmlFor={field.name}>Contrasena</FieldLabel>
                    <div className='relative'>
                      <Input
                        {...field}
                        id={field.name}
                        type={showPassword ? 'text' : 'password'}
                        placeholder='@xxxx#Az123...'
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
                      La contrasena debe tener al menos 12 caracteres, e incluir
                      mayusculas, minusculas, numeros y simbolos.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        ) : (
          <form id='confirm-email-form' onSubmit={onConfirmSubmit}>
            <FieldGroup className='gap-4'>
              <Field data-invalid={!!confirmError} className='gap-1.5'>
                <FieldLabel htmlFor='verification-code'>
                  Codigo de verificacion
                </FieldLabel>
                <Input
                  id='verification-code'
                  name='verification-code'
                  type='text'
                  value={verificationCode}
                  onChange={event =>
                    setVerificationCode(
                      event.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  onPaste={event => {
                    event.preventDefault()
                    const pastedValue = event.clipboardData
                      .getData('text')
                      .replace(/\D/g, '')
                      .slice(0, 6)
                    setVerificationCode(pastedValue)
                  }}
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={6}
                  placeholder='495650'
                  autoComplete='one-time-code'
                  aria-invalid={!!confirmError}
                />
                <FieldDescription>
                  Ingresa solo numeros. Deben ser exactamente 6 digitos.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>

      <CardFooter className='flex flex-col gap-4'>
        {registerError && step === 'register' && (
          <Alert
            variant='destructive'
            className='flex items-center gap-x-2 bg-red-100'
          >
            <div className='flex'>
              <OctagonAlertIcon className='size-5' />
            </div>
            <AlertDescription className='flex-1 font-semibold'>
              {registerError}
            </AlertDescription>
          </Alert>
        )}

        {confirmError && step === 'confirm' && (
          <Alert
            variant='destructive'
            className='flex items-center gap-x-2 bg-red-100'
          >
            <div className='flex'>
              <OctagonAlertIcon className='size-5' />
            </div>
            <AlertDescription className='flex-1 font-semibold'>
              {confirmError}
            </AlertDescription>
          </Alert>
        )}

        {resendMessage && step === 'confirm' && (
          <Alert className='flex items-center gap-x-2 bg-emerald-100'>
            <AlertDescription className='flex-1 font-semibold'>
              {resendMessage}
            </AlertDescription>
          </Alert>
        )}

        {step === 'register' ? (
          <>
            <Field orientation='horizontal'>
              <Button
                type='submit'
                className='w-full'
                form='sign-up-form'
                disabled={isRegisterPending}
              >
                {isRegisterPending ? 'Creando cuenta...' : 'Registrarme'}
              </Button>
            </Field>
            <p className='text-muted-foreground text-sm'>
              Ya tienes una cuenta?{' '}
              <Link href='/sign-in' className='font-semibold underline'>
                Iniciar sesion
              </Link>
            </p>
          </>
        ) : (
          <>
            <Field orientation='horizontal'>
              <Button
                type='submit'
                className='w-full'
                form='confirm-email-form'
                disabled={isConfirmPending || verificationCode.length !== 6}
              >
                {isConfirmPending ? 'Confirmando...' : 'Confirmar correo'}
              </Button>
            </Field>
            <Field orientation='horizontal'>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={onResendCode}
                disabled={isResendPending || !registeredEmail}
              >
                {isResendPending
                  ? 'Reenviando...'
                  : 'Reenviar codigo al correo'}
              </Button>
            </Field>
          </>
        )}
      </CardFooter>
    </Card>
  )
}

export { SignUpFlow }
