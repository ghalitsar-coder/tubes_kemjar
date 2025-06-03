"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the form schema using zod
const formSchema = z.object({
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  bloodType: z.string().optional(),
  height: z.coerce
    .number()
    .positive({ message: "Height must be positive" })
    .max(300, { message: "Height must be between 0 and 300 cm" })
    .optional(),
  weight: z.coerce
    .number()
    .positive({ message: "Weight must be positive" })
    .max(1000, { message: "Weight must be between 0 and 1000 kg" })
    .optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z
    .string()
    .min(1, { message: "Emergency contact is required" }),
});

// Define types for API validation errors
interface ValidationError {
  code: string;
  message: string;
  path: string[];
}

interface ApiErrorResponse {
  error: string;
  details?: ValidationError[];
}

// Define the form values type from the schema
type FormValues = z.infer<typeof formSchema>;

export default function EditPatientProfile() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateOfBirth: "",
      gender: "",
      bloodType: "",
      height: undefined,
      weight: undefined,
      allergies: "",
      medicalHistory: "",
      emergencyContact: "",
    },
  });

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
      return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/patient/profile");

        if (response.ok) {
          const data = await response.json();
          // Format date to YYYY-MM-DD for the input field
          const formattedDate = data.dateOfBirth
            ? new Date(data.dateOfBirth).toISOString().split("T")[0]
            : "";          // Reset the form with fetched data
          form.reset({
            ...data,
            dateOfBirth: formattedDate,
            // Make sure height and weight are numbers or undefined
            height: typeof data.height === "number" ? data.height : undefined,
            weight: typeof data.weight === "number" ? data.weight : undefined,
            // Ensure string values aren't null
            allergies: data.allergies || "",
            medicalHistory: data.medicalHistory || "",
          });
        } else if (response.status !== 404) {
          // 404 is expected for new users, only throw for other errors
          throw new Error("Failed to fetch profile");
        }
      } catch (err) {
        console.error("Error fetching patient profile:", err);
        setError("Failed to load your profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, isLoaded, router, form]);
  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    // Clear any previous form errors
    form.clearErrors();

    try {
      const response = await fetch("/api/patient/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
          // Check if we have detailed validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          // Set specific field errors from the API response
          errorData.details.forEach((detail: ValidationError) => {
            if (detail.path && detail.path.length > 0) {
              const fieldName = detail.path[0] as keyof FormValues;
              form.setError(fieldName, {
                type: "manual",
                message: detail.message || "Invalid value"
              });
            }
          });
            // If we have field-specific errors, don't show the general error
          if (errorData.details.length > 0) {
            setIsSaving(false);
            return;
          }
        }
        
        // Fallback to general error if no specific field errors
        throw new Error(errorData.error || "Failed to save profile");
      }

      setSuccess("Profile saved successfully!");

      // Redirect to appointments after a brief delay
      setTimeout(() => {
        router.push("/appointments");
      }, 2000);
    } catch (err) {
      console.error("Error saving patient profile:", err);
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Complete Your Patient Profile
          </h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Birth Field */}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Date of Birth*</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender Field */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Gender*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer not to say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Blood Type Field */}
                <FormField
                  control={form.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Blood Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Blood Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Height Field */}
                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (                    <FormItem className="col-span-1">
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Height in cm (0-300)"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          min="0"
                          max="300"
                          step="0.1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weight Field */}
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (                    <FormItem className="col-span-1">
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Weight in kg (0-1000)"
                          {...field}
                          value={field.value === undefined ? "" : field.value}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          min="0"
                          max="1000"
                          step="0.1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Emergency Contact Field */}
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem className="col-span-1">
                      <FormLabel>Emergency Contact*</FormLabel>
                      <FormControl>
                        <Input placeholder="Name and phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />                {/* Allergies Field */}
                <FormField
                  control={form.control}
                  name="allergies"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Allergies</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="List any allergies you have"
                          rows={3}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />                {/* Medical History Field */}
                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Medical History</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Relevant medical history, chronic conditions, surgeries, etc."
                          rows={4}
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                <Button
                  type="button"
                  onClick={() => router.push("/appointments")}
                  variant="outline"
                  className="order-2 sm:order-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !!success}
                  className="order-1 sm:order-2"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
