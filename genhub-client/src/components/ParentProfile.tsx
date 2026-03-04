import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, X, AlertCircle } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileMultiSelect } from "@/components/ProfileMultiSelect";
import {
  PlacesAutocomplete,
  type PlaceResult,
} from "@/components/PlacesAutocomplete";
import {
  updateUserMeProfile,
  type UpdateParentProfilePayload,
  type UpdateUserPayload,
} from "@/api/user";
import type { ParentProfile as ParentProfileType, User } from "@/types/user";
import {
  parentProfileSchema,
  type ParentProfileFormData,
  countries,
  countryCityMap,
} from "@/lib/validation";

const BABYSITTING_LOCATIONS = [
  { value: "parents_home", label: "Parent's Home" },
  { value: "babysitters_home", label: "Babysitter's Home" },
  { value: "flexible", label: "Flexible" },
] as const;

const LANGUAGE_OPTIONS = [
  "English",
  "German",
  "French",
  "Spanish",
  "Italian",
  "Other",
];

const AGE_GROUPS = [
  { value: "baby", label: "Baby (0-1 year)" },
  { value: "toddler", label: "Toddler (1-3 years)" },
  { value: "preschool", label: "Preschool (3-5 years)" },
  { value: "school-age", label: "School-Age (5-12 years)" },
  { value: "teen", label: "Teen (12+ years)" },
] as const;

type Props = {
  user: User;
  onRefresh: () => Promise<void>;
};

export function ParentProfile({ user, onRefresh }: Props) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ParentProfileFormData>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: getParentDefaultValues(user),
  });

  const city = form.watch("city");
  const country = form.watch("country");
  const hasSpecialNeeds = form.watch("has_special_needs") as
    | boolean
    | undefined;

  useEffect(() => {
    form.reset(getParentDefaultValues(user));
  }, [user, form]);

  useEffect(() => {
    if (city) {
      const matchedCountry = countries.find((c) =>
        countryCityMap[c]?.includes(city),
      );
      if (matchedCountry && matchedCountry !== country) {
        form.setValue("country", matchedCountry);
      }
    }
  }, [city, country, form]);

  useEffect(() => {
    if (country && city && !countryCityMap[country]?.includes(city)) {
      form.setValue("city", "");
    }
  }, [country, city, form]);

  const filteredCities = useMemo(() => {
    if (country && countryCityMap[country]) {
      return countryCityMap[country];
    }
    return countries.flatMap((c) => countryCityMap[c]);
  }, [country]);

  const {
    formState: { isDirty },
  } = form;

    const handlePlaceSelect = useCallback(
    (place: PlaceResult) => {
      form.setValue("formatted_address", place.formattedAddress, {
        shouldDirty: true,
      });
      form.setValue("latitude", place.latitude, { shouldDirty: true });
      form.setValue("longitude", place.longitude, { shouldDirty: true });
    },
    [form],
  );

  const onSubmit = async (values: ParentProfileFormData) => {
    setIsPending(true);
    try {
      const base: UpdateUserPayload = {
        name: values.name,
        age: Number(values.age),
        phone: values.phone,
        city: values.city,
        country: values.country,
      };

      const payload: UpdateParentProfilePayload = {
        ...base,
        street: values.street,
        apartment_number: values.apartment_number || undefined,
                formatted_address: values.formatted_address || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        number_of_children: values.number_of_children || undefined,
        children_ages: values.children_ages
          ? values.children_ages
              .split(",")
              .map((age) => age.trim())
              .filter((age) => age)
          : undefined,
        has_special_needs: values.has_special_needs ?? undefined,
        special_needs_description:
          values.special_needs_description || undefined,
        description: values.description || undefined,
        preferred_babysitting_location:
          values.preferred_babysitting_location || undefined,
        preferred_languages: values.preferred_languages || undefined,
        preferred_experience_years:
          values.preferred_experience_years || undefined,
        preferred_experience_with_ages:
          values.preferred_experience_with_ages || undefined,
        smoking_allowed: values.smoking_allowed ?? undefined,
        pets_in_home: values.pets_in_home ?? undefined,
        additional_notes: values.additional_notes || undefined,
      };

      await updateUserMeProfile(payload);
      await onRefresh();
      toast.success("Profile updated successfully");
      setIsEditMode(false);
    } catch (error: any) {
      const data = error?.response?.data;
      const message =
        data?.detail || data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    form.reset(getParentDefaultValues(user));
    setIsEditMode(false);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              Please log in to view your profile
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-left text-2xl font-bold">
                Parent Profile
              </CardTitle>
              <CardDescription className="mt-1 text-left">
                Manage your profile information and childcare preferences
              </CardDescription>
            </div>
            {!isEditMode && (
              <Button variant="outline" onClick={() => setIsEditMode(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-left">
                    Basic Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditMode}
                              placeholder="Enter your name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              disabled={!isEditMode}
                              placeholder="Enter your age"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditMode}
                            placeholder="Enter your phone number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={user.email}
                      disabled
                      className="cursor-not-allowed bg-muted"
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!isEditMode}
                            placeholder="Describe your family and childcare needs"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-left">Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditMode}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select your city" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredCities.map((cityOption) => (
                                  <SelectItem
                                    key={cityOption}
                                    value={cityOption}
                                  >
                                    {cityOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!isEditMode}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((countryOption) => (
                                  <SelectItem
                                    key={countryOption}
                                    value={countryOption}
                                  >
                                    {countryOption}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <PlacesAutocomplete
                            value={field.value}
                            onChange={field.onChange}
                            onPlaceSelect={handlePlaceSelect}
                            placeholder="Enter your street address"
                            disabled={!isEditMode}
                            cityBias={city}
                            countryBias={country}
                            hint={
                              city
                                ? `Showing addresses near ${city}`
                                : "Select a city first for better results"
                            }
                            showOutsideCityWarning={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="apartment_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apartment Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditMode}
                            placeholder="e.g., Apt 4B, Suite 100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-left">Children</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="number_of_children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Children</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              disabled={!isEditMode}
                              placeholder="0"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="children_ages"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Children Ages</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditMode}
                              placeholder="e.g., 3, 5, 8"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="has_special_needs"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Has Special Needs</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Do your children have any special needs?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {hasSpecialNeeds && (
                    <FormField
                      control={form.control}
                      name="special_needs_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Needs Description</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={!isEditMode}
                              placeholder="Describe any special needs or requirements"
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-left">
                    Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="preferred_babysitting_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-left">
                          Preferred Babysitting Location
                        </FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || ""}
                            onValueChange={field.onChange}
                            disabled={!isEditMode}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select preferred location" />
                            </SelectTrigger>
                            <SelectContent>
                              {BABYSITTING_LOCATIONS.map((loc) => (
                                <SelectItem key={loc.value} value={loc.value}>
                                  {loc.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ProfileMultiSelect
                            label="Preferred Languages"
                            options={LANGUAGE_OPTIONS}
                            selected={field.value || []}
                            onChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_experience_years"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Experience Years</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            disabled={!isEditMode}
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-3">
                    <FormLabel className="text-left">
                      Preferred Experience With Ages
                    </FormLabel>
                    <div className="space-y-2">
                      {AGE_GROUPS.map((ageGroup) => (
                        <FormField
                          key={ageGroup.value}
                          control={form.control}
                          name="preferred_experience_with_ages"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={(field.value || []).includes(
                                    ageGroup.value,
                                  )}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([
                                        ...current,
                                        ageGroup.value,
                                      ]);
                                    } else {
                                      field.onChange(
                                        current.filter(
                                          (v: string) => v !== ageGroup.value,
                                        ),
                                      );
                                    }
                                  }}
                                  disabled={!isEditMode}
                                />
                              </FormControl>
                              <FormLabel className="cursor-pointer font-normal text-left">
                                {ageGroup.label}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-left">
                    Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="smoking_allowed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Smoking Allowed</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Is smoking allowed in your home?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pets_in_home"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel>Pets in Home</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Do you have pets in your home?
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            disabled={!isEditMode}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additional_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!isEditMode}
                            placeholder="Any additional home rules or important information"
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {isEditMode && (
                <div className="mx-auto flex max-w-md gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isPending || !isDirty}
                    className="min-w-[160px] w-2/3"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                    className="min-w-[100px] w-1/3"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function getParentDefaultValues(user: User): ParentProfileFormData {
  const profile = (user.profile as ParentProfileType | null) || {};
    const latitude =
    profile.latitude != null
      ? typeof profile.latitude === "string"
        ? parseFloat(profile.latitude)
        : profile.latitude
      : null;
  const longitude =
    profile.longitude != null
      ? typeof profile.longitude === "string"
        ? parseFloat(profile.longitude)
        : profile.longitude
      : null;
    const numberOfChildren =
    profile.number_of_children != null
      ? typeof profile.number_of_children === "string"
        ? parseInt(profile.number_of_children, 10)
        : profile.number_of_children
      : undefined;
  const preferredExperienceYears =
    profile.preferred_experience_years != null
      ? typeof profile.preferred_experience_years === "string"
        ? parseInt(profile.preferred_experience_years, 10)
        : profile.preferred_experience_years
      : undefined;

  return {
    name: user.name ?? "",
    age: user.age ? String(user.age) : "",
    phone: user.phone ?? "",
    city: user.city ?? "",
    country: user.country ?? "",
    street: profile.street ?? "",
    apartment_number: profile.apartment_number ?? "",
        formatted_address: profile.formatted_address ?? null,
    latitude: latitude,
    longitude: longitude,
    number_of_children: numberOfChildren,
    children_ages: Array.isArray(profile.children_ages)
      ? profile.children_ages.join(", ")
      : (profile.children_ages ?? ""),
    has_special_needs: profile.has_special_needs ?? false,
    special_needs_description: profile.special_needs_description ?? "",
    description: profile.description ?? "",
    preferred_babysitting_location:
      profile.preferred_babysitting_location || undefined,
    preferred_languages: profile.preferred_languages ?? [],
    preferred_experience_years: preferredExperienceYears,
    preferred_experience_with_ages:
      profile.preferred_experience_with_ages ?? [],
    smoking_allowed: profile.smoking_allowed ?? false,
    pets_in_home: profile.pets_in_home ?? false,
    additional_notes: profile.additional_notes ?? "",
  };
}
