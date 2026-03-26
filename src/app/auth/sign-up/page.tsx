"use client";
import * as z from "zod";
import { registerSchema } from "@/src/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/src/app/components/ui/field";
import { Input } from "@/src/app/components/ui/input";
import {useDebounceCallback} from "usehooks-ts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
type Schema = z.infer<typeof registerSchema>;

export default function Signup() {
  const form = useForm<Schema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const [username, setUsername] = useState('')
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const debounced = useDebounceCallback((value: string) => setUsername(value), 500) //debounce the username input to avoid making too many requests while the user is typing
  const router = useRouter()

  useEffect(() => {
    const checkUsername = async () => {
      if (!username) {
        setUsernameMessage(null)
        return
      }
      setIsCheckingUsername(true)
      try {
        const res = await axios.get(`/api/check-username-unique?username=${username}`)
        setUsernameMessage(res.data.responseMessage)
      } catch (error: any) { 
        // Handle axios error - 400 status code is caught here
        if (error.response?.data?.responseMessage) {
          setUsernameMessage(error.response.data.responseMessage)
        } else {
          setUsernameMessage("An error occurred while checking username availability")
        }
      } finally {
        setIsCheckingUsername(false)
      }
    };

    checkUsername();
  }, [username]);

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
      // TODO: implement form submission
      setSubmitting(true)
      try {
        const res = await axios.post("/api/signup", data)
        if (res.data.success) {
          toast.success(res.data.responseMessage)
          router.replace(`/auth/verify-code/${data.username}`) //redirect to verify email after successful signup
        } else {          
          toast.error(res.data.responseMessage)
        }
      } catch (error: any) {
        if (error.response?.data?.responseMessage) {
          setUsernameMessage(error.response.data.responseMessage)
        } else {
          setUsernameMessage("An error occurred while checking username availability")
        }
      } finally {
        setSubmitting(false)
      }
      form.reset();
    }, (errors) => {
      // Log validation errors to help debug
      console.log("Form validation errors:", errors)
      Object.values(errors).forEach(error => {
        if (error?.message) {
          toast.error(error.message)
        }
      })
    })

return (
  <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_90%_16%,rgba(59,130,246,0.2),transparent_38%),radial-gradient(circle_at_45%_90%,rgba(6,182,212,0.14),transparent_35%),linear-gradient(160deg,#041025_0%,#071330_48%,#020617_100%)]">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 right-0 h-[360px] w-[360px] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="absolute -bottom-20 left-0 h-[340px] w-[340px] rounded-full bg-sky-600/20 blur-[120px]" />
    </div>

    <form
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-md rounded-3xl border border-cyan-200/20 bg-slate-900/65 backdrop-blur-xl p-8 shadow-[0_20px_55px_rgba(2,6,23,0.55)]"
    >
      <FieldGroup className="flex flex-col gap-4">
        <div className="text-center mb-2">
          <p className="font-body text-xs uppercase tracking-[0.2em] text-cyan-200/70 mb-3">
            AnonyMessage
          </p>
          <h1 className="font-display text-4xl font-bold text-white mb-2">
            Join AnonyMessage
          </h1>
          <p className="font-body text-slate-400 text-sm">
            Sign up to start your anonymous adventure
          </p>
        </div>

        <Controller name="username" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="username" className="font-body text-slate-300 text-sm font-medium">Username</FieldLabel>
              <div className="relative">
                <Input {...field} id="username" type="text"
                  onChange={(e) => { field.onChange(e); debounced(e.target.value); }}
                  aria-invalid={fieldState.invalid} placeholder="username"
                  className="font-body bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-cyan-300 pr-10"
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin h-4 w-4 text-slate-400" />
                  </div>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {usernameMessage && !isCheckingUsername && (
                <p className={`font-body text-xs ${usernameMessage.toLowerCase().includes('available') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {usernameMessage}
                </p>
              )}
            </Field>
          )}
        />

        <Controller name="email" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="email" className="font-body text-slate-300 text-sm font-medium">Email</FieldLabel>
              <Input {...field} id="email" type="email" autoComplete="off"
                onChange={(e) => field.onChange(e.target.value)}
                aria-invalid={fieldState.invalid} placeholder="you@example.com"
                className="font-body bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-cyan-300"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="password" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="password" className="font-body text-slate-300 text-sm font-medium">Password</FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} id="password" type="password"
                placeholder="••••••••"
                className="font-body bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-cyan-300"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller name="confirmPassword" control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="confirmPassword" className="font-body text-slate-300 text-sm font-medium">Confirm Password</FieldLabel>
              <Input {...field} aria-invalid={fieldState.invalid} id="confirmPassword" type="password"
                placeholder="••••••••"
                className="font-body bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-cyan-300"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <button
          type="submit" disabled={submitting}
          className="font-body w-full bg-cyan-200 text-slate-950 hover:bg-cyan-100 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm mt-2 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
        >
          {submitting ? (<><Loader2 className="h-4 w-4 animate-spin mr-1" />Signing up...</>) : 'Sign up'}
        </button>

        <div className="text-center pt-3 border-t border-slate-700/50">
          <p className="font-body text-slate-400 text-sm">
            Already a member?{' '}
            <a href="/auth/sign-in" className="text-cyan-300 font-semibold hover:text-cyan-200 transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </FieldGroup>
    </form>
  </div>
)};