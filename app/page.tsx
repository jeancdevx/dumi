import Link from 'next/link'

export default function Home() {
  return (
    <main className='from-background to-muted/30 flex min-h-svh items-center justify-center bg-gradient-to-b px-6'>
      <section className='w-full max-w-3xl rounded-2xl border bg-white/80 p-8 shadow-sm backdrop-blur sm:p-12'>
        <p className='text-muted-foreground text-sm tracking-[0.2em] uppercase'>
          Dumi
        </p>
        <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>
          Plataforma textil para tu operacion diaria
        </h1>
        <p className='text-muted-foreground mt-4 max-w-2xl text-base sm:text-lg'>
          Gestiona tu tienda, empleados y procesos con una sola cuenta. Empieza
          creando usuario o ingresando con tus credenciales.
        </p>

        <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
          <Link
            href='/sign-up'
            className='inline-flex h-11 items-center justify-center rounded-md bg-black px-6 text-sm font-semibold text-white transition hover:opacity-90'
          >
            Crear cuenta
          </Link>
          <Link
            href='/sign-in'
            className='inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-semibold transition hover:bg-zinc-100'
          >
            Iniciar sesion
          </Link>
        </div>
      </section>
    </main>
  )
}
