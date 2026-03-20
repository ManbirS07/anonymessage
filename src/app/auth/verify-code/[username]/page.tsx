// / verify-code/[username] to get dynamic data from url in nextjs
'use client'
import * as z from "zod";
import { verifyCodeSchema } from "@/src/schemas/verifyCodeSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";

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
  <div className="flex justify-center items-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-md text-black">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold leading-tight mb-4">
          Verify Your Account
        </h1>
        <p className="text-sm text-gray-600">
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
                <FormLabel className="text-sm font-medium text-gray-700">
                  Verification Code
                </FormLabel>
                <Input
                  {...field}
                  placeholder="code"
                  className="w-full border border-gray-300 rounded-lg h-11 px-4 text-sm focus:outline-none"
                />
                <FormMessage />
              </FormItem>
            )}
          />
<Button
  type="submit"
  disabled={form.formState.isSubmitting}
  className="bg-black text-white hover:bg-gray-900 rounded-lg w-24 py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Need a new code?
            </p>
            <button
              onClick={() => handleResendCode(param.username)}
              disabled={isResendingCode}
              className="bg-black text-white hover:bg-gray-900 rounded-lg w-30 py-2 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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