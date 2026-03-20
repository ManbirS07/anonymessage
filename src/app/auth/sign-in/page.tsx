"use client";
import * as z from "zod";
import { signInSchema } from "@/src/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {signIn} from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { Password } from "@/src/components/password"; 

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
      >
        <FieldGroup className="flex flex-col gap-4">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-extrabold text-black mb-2">
              Login
            </h1>
            <p className="text-gray-600 text-sm">
              Login to start your mysterious adventure
            </p>
          </div>

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1"
              >
                <FieldLabel htmlFor="email" className="text-gray-800 text-sm font-medium">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  type="email"
                  autoComplete="off"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your Email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="gap-1"
              >
                <FieldLabel htmlFor="password" className="text-gray-800 text-sm font-medium">Password *</FieldLabel>
                <Password
                  {...field}
                  aria-invalid={fieldState.invalid}
                  id="password"
                  placeholder="Password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400"
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white hover:bg-gray-900 active:bg-black mt-4 font-semibold py-1 px-3 rounded-lg transition-colors duration-200 text-sm h-9"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="text-gray-500 font-medium text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div className="flex gap-3 justify-center w-full items-center flex-wrap">
            {socialMediaButtons.map((o) => (
              <button
                key={o.label}
                type="button"
                className="text-sm gap-2 px-4 h-10 border border-gray-300 hover:bg-gray-50 w-full flex items-center justify-center font-medium bg-white text-gray-800 rounded-md transition"
                onClick={() => handleOAuth(o.label.split(" ")[2].toLowerCase())}
              >
                <div className="place-items-center grid rounded-full bg-white size-5 p-0.5 flex-shrink-0">
                  <img src={o.src} width={16} height={16} alt="Google" />
                </div>
                <span>{o.label}</span>
              </button>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <a
                href="/auth/sign-up"
                className="text-black font-semibold hover:underline"
              >
                Sign up
              </a>
            </p>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}

