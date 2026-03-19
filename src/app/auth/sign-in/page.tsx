"use client";
import * as z from "zod";
import { signInSchema } from "@/src/schemas/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { Password } from "@/src/components/password";

const socialMediaButtons = [
  {
    src: "https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1755835725776",
    label: "Continue with Google",
  }
];

type Schema = z.infer<typeof signInSchema>;

function DraftForm() {
  const form = useForm<Schema>({
    resolver: zodResolver(signInSchema as any), //zod schema validation
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {formState: { isSubmitting, isSubmitSuccessful }} = form;

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    try {
      // TODO: implement form submission


      console.log(data);
      form.reset();
    } catch (error) {
      // TODO: handle error
    }
  });

  if (isSubmitSuccessful) {
    return (
      <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
          className="h-full py-6 px-3"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 500,
              damping: 15,
            }}
            className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
          >
            <Check className="size-8" />
          </motion.div>
          <h2 className="text-center text-2xl text-pretty font-bold mb-2">
            Thank you
          </h2>
          <p className="text-center text-lg text-pretty text-muted-foreground">
            Form submitted successfully, we will get back to you soon
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-md mx-auto"
    >
      <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
        <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
          Login
        </h1>
        <p className="tracking-wide text-muted-foreground mb-5 text-wrap text-sm col-span-full">
          Login to create an account
        </p>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="email">Email </FieldLabel>
              <Input
                {...field}
                id="email"
                type="text"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your Email"
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
              className="gap-1 col-span-full"
            >
              <FieldContent className="gap-0.5">
                <FieldLabel htmlFor="password">Password *</FieldLabel>
              </FieldContent>
              <Password
                {...field}
                aria-invalid={fieldState.invalid}
                id="password"
                placeholder="Password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <FieldSeparator className="my-4 col-span-full">OR</FieldSeparator>
        <div className="flex gap-3 justify-center w-full items-center flex-wrap pb-3 col-span-full">
          {socialMediaButtons.map((o) => (
            <Button
              key={o.label}
              variant="outline"
              type="button"
              className="text-sm gap-2 px-2 h-10 grow "
            >
              <div className="place-items-center grid rounded-full bg-white size-6 p-0.5">
                <img src={o.src} width={16} height={16} />
              </div>
              {o.label}
            </Button>
          ))}
        </div>
      </FieldGroup>
      <div className="flex justify-end items-center w-full">
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}

export default DraftForm;
