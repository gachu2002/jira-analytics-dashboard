import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLogin } from '@/features/auth/hooks/use-login'
import {
  loginSchema,
  type LoginFormValues,
} from '@/features/auth/schemas/auth.schema'

export function LoginForm() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      await loginMutation.mutateAsync(values)
      navigate('/bugs')
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.detail
          ? String(error.response.data.detail)
          : 'Unable to sign in.'

      setError('root', { message })
    }
  }

  return (
    <Card className="ops-auth-panel gap-0 overflow-hidden rounded-[22px] py-0">
      <CardHeader className="border-border/80 gap-4 border-b px-6 py-6 sm:px-7">
        <div className="flex items-start gap-3">
          <div className="bg-accent text-accent-foreground flex size-10 items-center justify-center rounded-xl">
            <LogIn className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="ops-kicker">Access</p>
            <CardTitle className="mt-2 text-[1.75rem] tracking-[-0.04em]">
              Sign in
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-6">
              Enter your credentials.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-6 sm:px-7 sm:py-7">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="username"
              >
                Username
              </label>
              <Input
                id="username"
                className="ops-auth-field h-11 rounded-xl"
                aria-invalid={Boolean(errors.username)}
                autoComplete="username"
                placeholder="Enter username"
                {...register('username')}
              />
              {errors.username?.message ? (
                <p className="text-sm text-[var(--status-danger)]">
                  {errors.username.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <label
                className="text-foreground text-sm font-medium"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                id="password"
                className="ops-auth-field h-11 rounded-xl"
                aria-invalid={Boolean(errors.password)}
                autoComplete="current-password"
                placeholder="Enter password"
                type="password"
                {...register('password')}
              />
              {errors.password?.message ? (
                <p className="text-sm text-[var(--status-danger)]">
                  {errors.password.message}
                </p>
              ) : null}
            </div>

            {errors.root?.message ? (
              <div className="rounded-xl border border-[color:var(--status-danger)]/20 bg-[color:var(--status-danger)]/8 px-3.5 py-3 text-sm text-[var(--status-danger)]">
                {errors.root.message}
              </div>
            ) : null}
          </div>

          <div className="border-border/80 mt-1 border-t pt-5">
            <Button
              className="h-11 w-full rounded-xl"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
