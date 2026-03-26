// / verify-code/[username] to get dynamic data from url in nextjs
'use client'
import { Button } from "@/src/app/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/src/app/components/ui/form";
import { Input } from "@/src/app/components/ui/input";
import { verifyCodeSchema } from "@/src/schemas/verifyCodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

type Schema = z.infer<typeof verifyCodeSchema>;

const VerifyCode = () => {
    const router = useRouter()
    const param = useParams<{username: string}>() //get the username from the url
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [isResendingCode, setIsResendingCode] = useState<boolean>(false)

    //zod resolver expects an object so we need to wrap all our schema fields in an object
    const form = useForm<Schema>({
        resolver: zodResolver(verifyCodeSchema),
        defaultValues: {
            code: '',
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            const response = await axios.post("/api/verify-code", {
                username: param.username,
                verifyCode: data.code
            })

            if(response.data.success) {
                toast.success(response.data.responseMessage)
                setErrorMessage("")
                router.replace("/auth/sign-in")
            } else {
                toast.error(response.data.responseMessage)
                setErrorMessage(response.data.responseMessage)
                //otp-resend feature: if the code is expired, redirect to the resend code page
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.responseMessage || "An error occurred while verifying the code"
            setErrorMessage(errorMsg)
            toast.error(errorMsg)
        }
    })

    const handleResendCode = async (username: string) => {
        setIsResendingCode(true);
        try {
          const response = await axios.post("/api/resend-code", { username });
          if (response.data.success) {
            toast.success(response.data.responseMessage);
          } else {
            toast.error(response.data.responseMessage);
          }
        } catch (error: any) {
          toast.error("An error occurred while resending the verification code");
        } finally {
          setIsResendingCode(false);
        }
    }

    return (
  <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_90%_16%,rgba(59,130,246,0.2),transparent_38%),radial-gradient(circle_at_45%_90%,rgba(6,182,212,0.14),transparent_35%),linear-gradient(160deg,#041025_0%,#071330_48%,#020617_100%)]">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute -top-24 right-0 h-[360px] w-[360px] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="absolute -bottom-20 left-0 h-[340px] w-[340px] rounded-full bg-sky-600/20 blur-[120px]" />
    </div>

    <div className="relative z-10 w-full max-w-md rounded-3xl border border-cyan-200/20 bg-slate-900/65 backdrop-blur-xl p-8 shadow-[0_20px_55px_rgba(2,6,23,0.55)]">
      <div className="text-center mb-8">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-cyan-200/70 mb-3">AnonyMessage</p>
        <h1 className="font-display text-4xl leading-tight font-bold text-white mb-3">
          Verify Your Account
        </h1>
        <p className="font-body text-sm text-slate-300">
          Enter the verification code sent to your email
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            name="code"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-body text-sm font-medium text-slate-200">
                  Verification Code
                </FormLabel>
                <Input
                  {...field}
                  placeholder="Enter your code"
                  className="h-11 rounded-xl border border-slate-700 bg-slate-950/50 px-4 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-400/40 focus-visible:border-cyan-300"
                />
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full rounded-xl bg-cyan-200 text-slate-950 hover:bg-cyan-100 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {form.formState.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit
          </Button>
        </form>
      </Form>

      {errorMessage && (
        (errorMessage.toLowerCase().includes("expired") ||
         errorMessage.toLowerCase().includes("code is wrong") ||
         errorMessage.toLowerCase().includes("invalid") ||
         errorMessage.toLowerCase().includes("incorrect")) && (
          <div className="mt-6 rounded-2xl border border-slate-700/70 bg-slate-950/40 p-4 text-center">
            <p className="font-body text-sm text-slate-300 mb-3">
              Need a new code?
            </p>
            <button
              onClick={() => handleResendCode(param.username)}
              disabled={isResendingCode}
              className="font-body inline-flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResendingCode ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        )
      )}

    </div>
  </div>
);
}

export default VerifyCode;