"use client";
import * as z from "zod";
import { signInSchema } from "@/src/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {signIn, useSession} from "next-auth/react";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {Password} from "@/components/password";

const socialMediaButtons = [
  {
    src: "https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1755835725776",
    label: "Continue with Google",
  }
];

type Schema = z.infer<typeof signInSchema>;

export default function SignIn() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOAuth = (provider: string) => {
      signIn(provider, {
        callbackUrl: "/dashboard",
      });
  }

  const form = useForm<Schema>({
    resolver: zodResolver(signInSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    setIsSubmitting(true);
    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // prevent next-auth from automatically redirecting so we can handle it manually based on the response
      });

      if (res?.error) {
        toast.error(res.error);
      }

      if (res?.url) {
        toast.success("Logged in successfully!");
        router.replace("/dashboard");
      }

    } catch (error: any) {
      toast.error("An error occurred during login");
    } finally {
      setIsSubmitting(false);
    }
  });

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
            Welcome back
          </h1>
          <p className="font-body text-slate-400 text-sm">
            Login to start your mysterious adventure
          </p>
        </div>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="email" className="font-body text-slate-300 text-sm font-medium">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                autoComplete="off"
                onChange={(e) => field.onChange(e.target.value)}
                aria-invalid={fieldState.invalid}
                placeholder="you@example.com"
                className="font-body bg-slate-950/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-cyan-300 focus:ring-1 focus:ring-cyan-300/40"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="gap-1">
              <FieldLabel htmlFor="password" className="font-body text-slate-300 text-sm font-medium">
                Password
              </FieldLabel>
              <Password
                {...field}
                aria-invalid={fieldState.invalid}
                id="password"
                placeholder="••••••••"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="font-body w-full bg-cyan-200 text-slate-950 hover:bg-cyan-100 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm mt-2 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
          ) : 'Sign in'}
        </button>

        <div className="flex items-center gap-4 my-1">
          <div className="flex-grow border-t border-slate-700/70" />
          <span className="font-body text-slate-400 text-xs">OR</span>
          <div className="flex-grow border-t border-slate-700/70" />
        </div>

        <div className="flex gap-3 justify-center w-full items-center flex-wrap">
          {socialMediaButtons.map((o) => (
            <button
              key={o.label}
              type="button"
              className="font-body text-sm gap-2 px-4 h-10 border border-slate-700 hover:bg-slate-700/60 w-full flex items-center justify-center font-medium bg-slate-950/50 text-slate-200 rounded-xl transition-all duration-200"
              onClick={() => handleOAuth(o.label.split(' ')[2].toLowerCase())}
            >
              <div className="grid place-items-center rounded-full bg-white size-5 p-0.5 flex-shrink-0">
                <img src={o.src} width={16} height={16} alt="OAuth" />
              </div>
              <span>{o.label}</span>
            </button>
          ))}
        </div>

        <div className="text-center pt-3 border-t border-slate-700/50">
          <p className="font-body text-slate-400 text-sm">
            Don't have an account?{' '}
            <a href="/auth/sign-up" className="text-cyan-300 font-semibold hover:text-cyan-200 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </FieldGroup>
    </form>
  </div>
)}