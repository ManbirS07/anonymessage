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
  <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden">
    {/* Background blobs */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
    </div>

    <form
      onSubmit={handleSubmit}
      className="relative z-10 w-full max-w-md bg-slate-800/60 border border-slate-700/50 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
    >
      <FieldGroup className="flex flex-col gap-4">
        <div className="text-center mb-2">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-3">
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
                className="font-body bg-slate-900/60 border border-slate-700 text-white placeholder-slate-500 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
          className="font-body w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm mt-2 flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
          ) : 'Sign in'}
        </button>

        <div className="flex items-center gap-4 my-1">
          <div className="flex-grow border-t border-slate-700" />
          <span className="font-body text-slate-500 text-xs">OR</span>
          <div className="flex-grow border-t border-slate-700" />
        </div>

        <div className="flex gap-3 justify-center w-full items-center flex-wrap">
          {socialMediaButtons.map((o) => (
            <button
              key={o.label}
              type="button"
              className="font-body text-sm gap-2 px-4 h-10 border border-slate-700 hover:bg-slate-700/60 w-full flex items-center justify-center font-medium bg-slate-800/60 text-slate-200 rounded-xl transition-all duration-200"
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
            <a href="/auth/sign-up" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
              Sign up
            </a>
          </p>
        </div>
      </FieldGroup>
    </form>
  </div>
)}