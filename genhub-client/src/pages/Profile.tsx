import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Pencil, Lock, Shield, Mail, KeyRound } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile } from '@/api/user';
import { 
  profileSchema, 
  type ProfileFormData,
  countries,
  countryCityMap 
} from '@/lib/validation';
import ChangePassword from './settings/ChangePassword';
import PasswordResetRequest from './settings/PasswordResetRequest';
import { cn } from '@/lib/utils';

type PasswordSection = 'change-password' | 'reset-password' | null;

interface SidebarItem {
  id: PasswordSection;
  label: string;
  icon: typeof Shield;
}

const sidebarItems: SidebarItem[] = [
  { id: 'change-password', label: 'Change Password', icon: KeyRound },
  { id: 'reset-password', label: 'Reset Password', icon: Mail },
];

export default function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const [activePasswordSection, setActivePasswordSection] = useState<PasswordSection>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      age: user?.age?.toString() ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      street: user?.street ?? '',
      house_number: user?.house_number ?? '',
      city: user?.city ?? '',
      country: user?.country ?? '',
    },
  });

  const {
    formState: { isDirty },
  } = form;

  const isFirstTimeUser = !user?.name || !user?.phone || !user?.age || 
    !user?.street || !user?.house_number || !user?.city || !user?.country;

  const city = form.watch('city');
  const country = form.watch('country');

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name ?? '',
        age: user.age?.toString() ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
        street: user.street ?? '',
        house_number: user.house_number ?? '',
        city: user.city ?? '',
        country: user.country ?? '',
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (city) {
      const matchedCountry = countries.find((c) =>
        countryCityMap[c]?.includes(city)
      );
      if (matchedCountry && matchedCountry !== country) {
        form.setValue('country', matchedCountry);
      }
    }
  }, [city, country, form]);

  useEffect(() => {
    if (country && city && !countryCityMap[country]?.includes(city)) {
      form.setValue('city', '');
    }
  }, [country, city, form]);

  const filteredCities = useMemo(() => {
    if (country && countryCityMap[country]) {
      return countryCityMap[country];
    }
    return countries.flatMap((c) => countryCityMap[c]);
  }, [country]);

  const onSubmit = async (values: ProfileFormData) => {
    setIsPending(true);

    try {
      const updatedUser = await updateUserProfile({
        name: values.name,
        age: Number(values.age),
        phone: values.phone,
        street: values.street,
        house_number: values.house_number,
        city: values.city,
        country: values.country,
      });

      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
      form.reset(values); 
      
      if (isFirstTimeUser && updatedUser.profileCompleted) {
        setTimeout(() => {
        }, 1000);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; message?: string } } };
      const errorData = error.response?.data;
      const errorMessage = errorData?.detail || errorData?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsPending(false);
    }
  };

  const handlePasswordSectionChange = (section: PasswordSection) => {
    setActivePasswordSection(activePasswordSection === section ? null : section);
  };

  const renderPasswordContent = () => {
    switch (activePasswordSection) {
      case 'change-password':
        return <ChangePassword noCard />;
      case 'reset-password':
        return <PasswordResetRequest noCard />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <aside className="w-full md:w-96 flex-shrink-0">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl">Password Settings</CardTitle>
              <CardDescription>
                Manage your account password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePasswordSectionChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        "hover:bg-accent hover:text-accent-foreground border",
                        activePasswordSection === item.id
                          ? "bg-accent text-accent-foreground border-primary"
                          : "text-muted-foreground border-border"
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {activePasswordSection && (
                <div className="pt-4 border-t">
                  {renderPasswordContent()}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription className="text-md">
                This page is intended to collect basic information about you
                so that we can connect you with older people who need help,
                support and warm human words. By filling out the profile, you help us find activities that best match your skills,
                interests and available time. Please carefully enter the data, all inputs are stored securely and used exclusively for the purpose of organizing volunteer work.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Name
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your name" 
                            className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            {...field} 
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
                        <FormLabel className="flex items-center gap-1">
                          Age
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="Enter your age" 
                            className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Email
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    readOnly
                                    className="cursor-not-allowed bg-gray-50 dark:bg-black text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                                  />
                                </div>
                              </FormControl>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              Email cannot be changed
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          Phone
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number" 
                            className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            Street
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your street" 
                              className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="house_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1">
                            House number
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your house number" 
                              className="placeholder:text-gray-400 dark:placeholder:text-gray-500"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="flex items-center gap-1">
                            City
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full placeholder:text-gray-400 dark:placeholder:text-gray-500">
                                <SelectValue placeholder="Select your city" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredCities.map((city) => (
                                <SelectItem key={city} value={city}>
                                  {city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel className="flex items-center gap-1">
                            Country
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full placeholder:text-gray-400 dark:placeholder:text-gray-500">
                                <SelectValue placeholder="Select your country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending || !isDirty}
                    className="w-full"
                  >
                    {isPending ? (
                      <>
                        Saving...
                        <Loader2 className="animate-spin ml-1" />
                      </>
                    ) : (
                      <>
                        Edit profile <Pencil size={16} className="ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </main>
      </div>
    </DashboardLayout>
  );
}
