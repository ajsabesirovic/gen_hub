import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  FilterSheet,
  FilterSection,
  FilterDivider,
} from "@/components/ui/filter-sheet";
import { getBabysitters } from "@/api/user";
import type { User, BabysitterProfile } from "@/types/user";
import {
  Star,
  Search,
  MapPin,
  Briefcase,
  Shield,
  Users,
  ChevronRight,
  X,
  Filter,
  Loader2,
} from "lucide-react";

const AGE_GROUPS = [
  { value: "baby", label: "Baby (0-1)" },
  { value: "toddler", label: "Toddler (1-3)" },
  { value: "preschool", label: "Preschool (3-5)" },
  { value: "school-age", label: "School-Age (5-12)" },
  { value: "teen", label: "Teen (12+)" },
] as const;

export default function FindBabysitter() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [minExperience, setMinExperience] = useState<number | null>(null);
  const [rateRange, setRateRange] = useState<[number, number]>([0, 50]);
  const [cityFilter, setCityFilter] = useState<string | "all">("all");
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [babysitters, setBabysitters] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBabysitters() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getBabysitters();
        setBabysitters(data);
      } catch (err) {
        console.error("Failed to fetch babysitters:", err);
        setError("Failed to load babysitters. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchBabysitters();
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    babysitters.forEach((b) => {
      if (b.city) set.add(b.city);
    });
    return Array.from(set).sort();
  }, [babysitters]);

  const filteredBabysitters = useMemo(() => {
    return babysitters.filter((b) => {
      const profile = b.profile as BabysitterProfile | undefined;
      const name = (b.name || "").toLowerCase();
      const city = (b.city || "").toLowerCase();
      const description = (profile?.description || "").toLowerCase();
      const term = search.toLowerCase();

      if (
        term &&
        !name.includes(term) &&
        !city.includes(term) &&
        !description.includes(term)
      ) {
        return false;
      }

      if (cityFilter !== "all" && b.city !== cityFilter) {
        return false;
      }

      const experience = profile?.experience_years ?? 0;
      if (minExperience !== null && experience < minExperience) {
        return false;
      }

      const rate = profile?.hourly_rate ?? 0;
      if (rate < rateRange[0] || rate > rateRange[1]) {
        return false;
      }

      if (selectedAges.length > 0) {
        const experienceWithAges = profile?.experience_with_ages || [];
        const hasMatchingAge = selectedAges.some((age) =>
          experienceWithAges.includes(age),
        );
        if (!hasMatchingAge) {
          return false;
        }
      }

      if (verifiedOnly) {
        const isVerified = profile?.background_check_status === "verified";
        if (!isVerified) {
          return false;
        }
      }

      return true;
    });
  }, [
    search,
    cityFilter,
    minExperience,
    rateRange,
    selectedAges,
    verifiedOnly,
    babysitters,
  ]);

  const handleAgeToggle = (ageValue: string) => {
    setSelectedAges((prev) =>
      prev.includes(ageValue)
        ? prev.filter((a) => a !== ageValue)
        : [...prev, ageValue],
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCityFilter("all");
    setMinExperience(null);
    setRateRange([0, 50]);
    setSelectedAges([]);
    setVerifiedOnly(false);
  };

  const hasActiveFilters =
    search ||
    cityFilter !== "all" ||
    minExperience !== null ||
    rateRange[0] > 0 ||
    rateRange[1] < 50 ||
    selectedAges.length > 0 ||
    verifiedOnly;

  const activeFilterCount = [
    search ? 1 : 0,
    cityFilter !== "all" ? 1 : 0,
    minExperience !== null ? 1 : 0,
    rateRange[0] > 0 || rateRange[1] < 50 ? 1 : 0,
    selectedAges.length > 0 ? 1 : 0,
    verifiedOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const filterContent = (
    <>
      <FilterSection title="Search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, city..."
            className="pl-9"
          />
        </div>
      </FilterSection>

      <FilterDivider />

      <FilterSection title="City">
        <Select
          value={cityFilter}
          onValueChange={(value) => setCityFilter(value as typeof cityFilter)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Min Experience">
        <Select
          value={minExperience !== null ? String(minExperience) : "any"}
          onValueChange={(value) =>
            setMinExperience(value === "any" ? null : Number(value))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1+ years</SelectItem>
            <SelectItem value="3">3+ years</SelectItem>
            <SelectItem value="5">5+ years</SelectItem>
            <SelectItem value="10">10+ years</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterDivider />

      <FilterSection title="Hourly Rate">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>€{rateRange[0]}</span>
            <span>€{rateRange[1]}</span>
          </div>
          <Slider
            min={0}
            max={50}
            step={1}
            value={rateRange}
            onValueChange={(value) =>
              setRateRange([value[0], value[1] ?? value[0]])
            }
          />
        </div>
      </FilterSection>

      <FilterDivider />

      <FilterSection title="Experience with Ages">
        <div className="space-y-2">
          {AGE_GROUPS.map((ageGroup) => (
            <div key={ageGroup.value} className="flex items-center gap-2">
              <Checkbox
                id={`age-${ageGroup.value}`}
                checked={selectedAges.includes(ageGroup.value)}
                onCheckedChange={() => handleAgeToggle(ageGroup.value)}
              />
              <label
                htmlFor={`age-${ageGroup.value}`}
                className="cursor-pointer text-sm leading-none"
              >
                {ageGroup.label}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      <FilterDivider />

      <div className="flex items-center gap-2">
        <Checkbox
          id="verified-only"
          checked={verifiedOnly}
          onCheckedChange={(checked) => setVerifiedOnly(checked === true)}
        />
        <label
          htmlFor="verified-only"
          className="cursor-pointer text-sm leading-none flex items-center gap-2"
        >
          <Shield className="h-4 w-4 text-primary" />
          Verified only
        </label>
      </div>
    </>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Find a Babysitter</h1>
            {!isLoading && (
              <Badge variant="secondary" className="font-normal">
                {filteredBabysitters.length} result
                {filteredBabysitters.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <FilterSheet
            title="Filters"
            activeFilterCount={activeFilterCount}
            onClearFilters={clearFilters}
          >
            {filterContent}
          </FilterSheet>
        </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-6">
              <Card className="overflow-hidden">
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Filters</span>
                    </div>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-auto px-2 py-1 text-xs"
                      >
                        Clear
                        <X className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {activeFilterCount} active
                    </p>
                  )}
                </div>
                <CardContent className="p-4 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {filterContent}
                </CardContent>
              </Card>
            </div>
          </aside>

                    <main className="flex-1 min-w-0">
                        {hasActiveFilters && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-4">
                {search && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    "{search}"
                    <button
                      onClick={() => setSearch("")}
                      className="ml-1 hover:text-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {cityFilter !== "all" && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {cityFilter}
                    <button
                      onClick={() => setCityFilter("all")}
                      className="ml-1 hover:text-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {minExperience !== null && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    {minExperience}+ years
                    <button
                      onClick={() => setMinExperience(null)}
                      className="ml-1 hover:text-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(rateRange[0] > 0 || rateRange[1] < 50) && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    €{rateRange[0]}-€{rateRange[1]}
                    <button
                      onClick={() => setRateRange([0, 50])}
                      className="ml-1 hover:text-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedAges.map((age) => (
                  <Badge key={age} variant="secondary" className="gap-1 pr-1">
                    {
                      AGE_GROUPS.find((a) => a.value === age)?.label.split(
                        " ",
                      )[0]
                    }
                    <button
                      onClick={() => handleAgeToggle(age)}
                      className="ml-1 hover:text-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {verifiedOnly && (
                  <Badge variant="secondary" className="gap-1 pr-1">
                    Verified
                    <button
                      onClick={() => setVerifiedOnly(false)}
                      className="ml-1 hover:text-foreground rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}

                        {isLoading ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="mb-4 h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Loading babysitters...
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Users className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="font-semibold">Error loading babysitters</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {error}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      className="mt-4"
                    >
                      Try again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : filteredBabysitters.length === 0 ? (
              <Card className="rounded-xl">
                <CardContent className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <Users className="mb-4 h-10 w-10 text-muted-foreground/50" />
                    <h3 className="font-semibold">No babysitters found</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try adjusting your filters.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="link"
                        onClick={clearFilters}
                        className="mt-2"
                      >
                        Clear all filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredBabysitters.map((babysitter) => (
                  <BabysitterCard
                    key={babysitter.id}
                    babysitter={babysitter}
                    onViewProfile={() =>
                      navigate(`/babysitters/${babysitter.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}

interface BabysitterCardProps {
  babysitter: User;
  onViewProfile: () => void;
}

function BabysitterCard({ babysitter, onViewProfile }: BabysitterCardProps) {
  const profile = babysitter.profile as BabysitterProfile | undefined;
  const initials =
    babysitter.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ||
    babysitter.email?.[0]?.toUpperCase() ||
    "U";

  const experience = profile?.experience_years ?? null;
  const rate = profile?.hourly_rate ?? null;
  const city = babysitter.city || "Unknown city";
  const description = profile?.description || "No bio provided yet.";
  const isVerified = profile?.background_check_status === "verified";

  const rating = Number(profile?.average_rating ?? 0);
  const totalReviews = profile?.total_reviews ?? 0;

  return (
    <Card
      className="rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={onViewProfile}
    >
      <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 shrink-0">
            {babysitter.profile_image ? (
              <AvatarImage
                src={babysitter.profile_image}
                alt={babysitter.name || "Babysitter"}
              />
            ) : (
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base truncate">
                {babysitter.name || babysitter.email}
              </h3>
              {isVerified && (
                <Shield className="h-4 w-4 text-primary shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {Number(rating).toFixed(1)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">New</span>
            )}
            {rate !== null && (
              <Badge variant="outline" className="font-semibold text-primary">
                €{rate}/h
              </Badge>
            )}
          </div>
        </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3 text-left">
          {description}
        </p>

                <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            {experience !== null && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Briefcase className="h-3 w-3" />
                {experience} {experience === 1 ? "year" : "years"}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-8">
            View Profile
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
