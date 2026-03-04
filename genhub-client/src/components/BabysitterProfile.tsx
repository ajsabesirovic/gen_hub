import { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Pencil, X, AlertCircle, Star } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
  type UpdateBabysitterProfilePayload,
  type UpdateUserPayload,
} from "@/api/user";
import type {
  BabysitterProfile as BabysitterProfileType,
  User,
} from "@/types/user";
import {
  babysitterProfileSchema,
  type BabysitterProfileFormData,
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

export function BabysitterProfile({ user, onRefresh }: Props) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<BabysitterProfileFormData>({
    resolver: zodResolver(babysitterProfileSchema),
    defaultValues: getBabysitterDefaultValues(user),
  });

  const city = form.watch("city");
  const country = form.watch("country");

  useEffect(() => {
    form.reset(getBabysitterDefaultValues(user));
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

  const onSubmit = async (values: BabysitterProfileFormData) => {
    setIsPending(true);
    try {
      const base: UpdateUserPayload = {
        name: values.name,
        age: Number(values.age),
        phone: values.phone,
        city: values.city,
        country: values.country,
      };

      const payload: UpdateBabysitterProfilePayload = {
        ...base,
        description: values.description || undefined,
        experience_years: values.experience_years ?? undefined,
        hourly_rate: values.hourly_rate ?? undefined,
        education: values.education || undefined,
        drivers_license: values.drivers_license ?? undefined,
        car: values.car ?? undefined,
        has_children: values.has_children ?? undefined,
        smoker: values.smoker ?? undefined,
        street: values.street || undefined,
        apartment_number: values.apartment_number || undefined,
                formatted_address: values.formatted_address || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        preferred_babysitting_location:
          values.preferred_babysitting_location || undefined,
        languages: values.languages || undefined,
        experience_with_ages: values.experience_with_ages || undefined,
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
    form.reset(getBabysitterDefaultValues(user));
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

  const profile = (user.profile as BabysitterProfileType | null) || {};

  return (
    <div className="space-y-6">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-left text-2xl font-bold">
                Babysitter Profile
              </CardTitle>
              <CardDescription className="mt-1 text-left">
                Manage your profile information and babysitting preferences
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
                  <div className="space-y-2  text-left">
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
                        <FormLabel>Description / Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            disabled={!isEditMode}
                            placeholder="Tell parents about yourself and your babysitting experience"
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
                            value={field.value || ""}
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
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ProfileMultiSelect
                            label="Languages"
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
                  <div className="space-y-3">
                    <FormLabel className="text-left">
                      Experience With Ages
                    </FormLabel>
                    <div className="space-y-2">
                      {AGE_GROUPS.map((ageGroup) => (
                        <FormField
                          key={ageGroup.value}
                          control={form.control}
                          name="experience_with_ages"
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
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="experience_years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
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
                      name="hourly_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (€)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              disabled={!isEditMode}
                              placeholder="e.g. 15"
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
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditMode}
                              placeholder="e.g., High School, College, childcare training"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div />
                    <FormField
                      control={form.control}
                      name="drivers_license"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Driver's License</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Do you have a valid driver's license?
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
                      name="car"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Car</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Do you have access to a car?
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
                      name="has_children"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Has Children</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Do you have children of your own?
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
                      name="smoker"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>Smoker</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Are you a smoker?
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
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg text-left">
                    Verification Status
                  </CardTitle>
                  <CardDescription className="text-left">
                    Managed by the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-left">Background Check</p>
                      <p className="text-sm text-muted-foreground">
                        Background check verification
                      </p>
                    </div>
                    <Badge
                      variant={
                        profile.background_check_status === "verified"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {profile.background_check_status === "verified"
                        ? "Verified"
                        : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-left">
                        First Aid Certified
                      </p>
                      <p className="text-sm text-muted-foreground">
                        First aid certification status
                      </p>
                    </div>
                    <Badge
                      variant={
                        profile.first_aid_certified === "verified"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {profile.first_aid_certified === "verified"
                        ? "Verified"
                        : "Pending"}
                    </Badge>
                  </div>
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

function getBabysitterDefaultValues(user: User): BabysitterProfileFormData {
  const profile = (user.profile as BabysitterProfileType | null) || {};
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
    const hourlyRate =
    profile.hourly_rate != null
      ? typeof profile.hourly_rate === "string"
        ? parseFloat(profile.hourly_rate)
        : profile.hourly_rate
      : undefined;
    const experienceYears =
    profile.experience_years != null
      ? typeof profile.experience_years === "string"
        ? parseInt(profile.experience_years, 10)
        : profile.experience_years
      : undefined;

  return {
    name: user.name ?? "",
    age: user.age ? String(user.age) : "",
    phone: user.phone ?? "",
    city: user.city ?? "",
    country: user.country ?? "",
    description: profile.description ?? "",
    experience_years: experienceYears,
    hourly_rate: hourlyRate,
    education: profile.education ?? "",
    drivers_license: profile.drivers_license ?? false,
    car: profile.car ?? false,
    has_children: profile.has_children ?? false,
    smoker: profile.smoker ?? false,
    street: profile.street ?? "",
    apartment_number: profile.apartment_number ?? "",
        formatted_address: profile.formatted_address ?? null,
    latitude: latitude,
    longitude: longitude,
    preferred_babysitting_location:
      profile.preferred_babysitting_location || undefined,
    languages: profile.languages ?? [],
    experience_with_ages: profile.experience_with_ages ?? [],
  };
}
