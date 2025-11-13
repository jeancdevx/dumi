import Link from 'next/link'

import { ShieldAlertIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export default function UnauthorizedPage() {
  return (
    <main className='mx-auto flex min-h-svh max-w-5xl items-center justify-center'>
      <Card className='w-full sm:max-w-md'>
        <CardHeader className='flex flex-col items-center justify-center gap-4'>
          <ShieldAlertIcon className='text-destructive size-16' />
          <CardTitle className='text-3xl font-bold'>Acceso Denegado</CardTitle>
          <CardDescription className='text-center'>
            No tienes permisos para acceder a esta página.
          </CardDescription>
        </CardHeader>

        <CardContent className='text-muted-foreground text-center text-sm'>
          <p>
            Si crees que esto es un error, por favor contacta con el
            administrador del sistema.
          </p>
        </CardContent>

        <CardFooter className='flex flex-col gap-2'>
          <Button asChild className='w-full'>
            <Link href='/'>Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
