import { z } from "zod";

export const countries = [
  "Serbia",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Austria",
  "Germany",
  "Switzerland",
] as const;

export const countryCityMap: Record<string, string[]> = {
  Serbia: [
    "Beograd",
    "Novi Sad",
    "Niš",
    "Kragujevac",
    "Subotica",
    "Novi Pazar",
  ],
  France: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"],
  Italy: ["Rome", "Milan", "Naples", "Turin", "Florence"],
  Spain: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
  Austria: ["Vienna", "Salzburg", "Innsbruck", "Graz", "Linz"],
  Germany: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt"],
  Switzerland: ["Zurich", "Geneva", "Basel", "Bern", "Lausanne"],
};

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  age: z
    .string()
    .min(1, "Age is required")
    .refine((val) => !isNaN(Number(val)), "Age must be a number")
    .refine(
      (val) => Number(val) >= 18 && Number(val) <= 120,
      "Age must be between 18 and 120"
    ),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number is too long")
    .regex(/^[+]?[\d\s()-]+$/, "Invalid phone number format"),
  street: z
    .string()
    .min(2, "Street is required")
    .max(100, "Street name is too long"),
  house_number: z
    .string()
    .min(1, "House number is required")
    .max(10, "House number is too long"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password1: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    new_password2: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password1 === data.new_password2, {
    message: "Passwords don't match",
    path: ["new_password2"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const resetPasswordConfirmSchema = z
  .object({
    new_password1: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    new_password2: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.new_password1 === data.new_password2, {
    message: "Passwords don't match",
    path: ["new_password2"],
  });

export type ResetPasswordConfirmFormData = z.infer<
  typeof resetPasswordConfirmSchema
>;

const baseProfileFields = {
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  age: z
    .string()
    .min(1, "Age is required")
    .refine((val) => !isNaN(Number(val)), "Age must be a number")
    .refine(
      (val) => Number(val) >= 18 && Number(val) <= 120,
      "Age must be between 18 and 120"
    ),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number is too long")
    .regex(/^[+]?[\d\s()-]+$/, "Invalid phone number format"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
};

export const parentProfileSchema = z.object({
  ...baseProfileFields,
  street: z
    .string()
    .min(2, "Street is required")
    .max(100, "Street name is too long"),
  apartment_number: z
    .string()
    .max(20, "Apartment number is too long")
    .optional(),
    formatted_address: z.string().max(500).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  number_of_children: z.number().min(0).max(20).optional(),
  children_ages: z
    .string()
    .max(200, "Children ages must be less than 200 characters")
    .optional(),
  has_special_needs: z.boolean().optional(),
  special_needs_description: z
    .string()
    .max(1000, "Special needs description must be less than 1000 characters")
    .optional(),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  preferred_babysitting_location: z
    .enum(["parents_home", "babysitters_home", "flexible"])
    .optional(),
  preferred_languages: z.array(z.string()).optional(),
  preferred_experience_years: z.number().min(0).max(50).optional(),
  preferred_experience_with_ages: z.array(z.string()).optional(),
  smoking_allowed: z.boolean().optional(),
  pets_in_home: z.boolean().optional(),
  home_rules_notes: z
    .string()
    .max(1000, "Home rules notes must be less than 1000 characters")
    .optional(),
  additional_notes: z
    .string()
    .max(1000, "Additional notes must be less than 1000 characters")
    .optional(),
});

export const babysitterProfileSchema = z.object({
  ...baseProfileFields,
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  characteristics: z.array(z.string()).optional(),
  experience_years: z.number().min(0).max(50).optional(),
  hourly_rate: z
    .number()
    .min(0, "Hourly rate must be at least 0")
    .max(1000, "Hourly rate must be less than 1000")
    .optional(),
  education: z
    .string()
    .max(200, "Education must be less than 200 characters")
    .optional(),
  drivers_license: z.boolean().optional(),
  car: z.boolean().optional(),
  has_children: z.boolean().optional(),
  smoker: z.boolean().optional(),
  street: z
    .string()
    .min(2, "Street is required")
    .max(100, "Street name is too long")
    .optional(),
  apartment_number: z
    .string()
    .max(20, "Apartment number is too long")
    .optional(),
    formatted_address: z.string().max(500).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  preferred_babysitting_location: z
    .enum(["parents_home", "babysitters_home", "flexible"])
    .optional(),
  languages: z.array(z.string()).optional(),
  experience_with_ages: z.array(z.string()).optional(),
});

export type ParentProfileFormData = z.infer<typeof parentProfileSchema>;
export type BabysitterProfileFormData = z.infer<typeof babysitterProfileSchema>;
