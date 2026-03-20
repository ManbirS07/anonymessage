"use client";
import * as z from "zod";
import { registerSchema } from "@/src/schemas/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import {useDebounceCallback} from "usehooks-ts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

const socialMediaButtons = [
  {
    src: "https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1755835725776",
    label: "Continue with Google",
  }
];

type Schema = z.infer<typeof registerSchema>;

function DraftForm() {
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
      } catch (error) {
        toast.error("An error occurred during signup")
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white rounded-lg shadow-lg p-8"
    >
      <FieldGroup className="flex flex-col gap-6">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold text-black mb-2">
            Join AnonyMessage
          </h1>
          <p className="text-gray-600 text-sm">
            Sign up to start your anonymous adventure
          </p>
        </div>

        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1"
            >
              <FieldLabel htmlFor="username" className="text-gray-800 text-sm font-medium">Username</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="username"
                  type="text"
                  onChange={(e) => {
                    field.onChange(e);
                    debounced(e.target.value)
                  }}
                  aria-invalid={fieldState.invalid}
                  placeholder="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black pr-10"
                />
                {isCheckingUsername && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="animate-spin h-5 w-5 text-gray-500"/>
                  </div>
                )}
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              {usernameMessage && !isCheckingUsername && (
                <p className={`text-xs ${usernameMessage.toLowerCase().includes('available') ? 'text-green-600' : 'text-red-600'}`}>
                  {usernameMessage}
                </p>
              )}
            </Field>
          )}
        />

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
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black"
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
              <FieldLabel htmlFor="password" className="text-gray-800 text-sm font-medium">Password</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="password"
                type="password"
                placeholder="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1"
            >
              <FieldLabel htmlFor="confirmPassword" className="text-gray-800 text-sm font-medium">
                Confirm Password
              </FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                id="confirmPassword"
                type="password"
                placeholder="confirm password"
                className="bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-black"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button 
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white hover:bg-gray-800 mt-2 font-medium"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing up...
            </>
          ) : (
            "Submit"
          )}
        </Button>

        <div className="flex items-center gap-4 my-4">
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
            Already a member?{" "}
            <a
              href="/auth/sign-in"
              className="text-black font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
        </div>
      </FieldGroup>
    </form>
    </div>
  );
}


export default DraftForm;
