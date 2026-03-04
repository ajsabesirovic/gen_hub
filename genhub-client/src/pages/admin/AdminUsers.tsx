import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  getAdminUsers,
  type AdminUser,
  type AdminListParams,
} from "@/api/admin";
import { getProfileImageUrl } from "@/lib/utils";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

    const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params: AdminListParams = {
        page: currentPage,
        page_size: pageSize,
        is_admin: false,
      };

      if (search) params.search = search;
      if (roleFilter !== "all")
        params.role = roleFilter as "parent" | "babysitter";
      if (activeFilter !== "all") params.is_active = activeFilter === "active";

      const data = await getAdminUsers(params);
      setUsers(data.results);
      setTotalCount(data.count);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, activeFilter]);

    useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getRoleBadge = (user: AdminUser) => {
    if (user.role === "parent") {
      return <Badge variant="secondary">Parent</Badge>;
    }
    if (user.role === "babysitter") {
      return <Badge variant="outline">Babysitter</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const getStatusBadge = (user: AdminUser) => {
    const isActive = user.is_active !== false;
    return (
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getInitials = (user: AdminUser) => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.slice(0, 2).toUpperCase() || "??";
  };

  if (isLoading && users.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View and manage all users</p>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">View and manage all users</p>
          </div>
          <Card>
            <CardContent className="py-10">
              <div className="flex flex-col items-center justify-center text-center">
                <h3 className="text-lg font-semibold text-destructive">
                  {error}
                </h3>
                <Button onClick={fetchUsers} className="mt-4">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all users</p>
        </div>

                <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="parent">Parents</SelectItem>
                    <SelectItem value="babysitter">Babysitters</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

                <Card>
          <CardHeader></CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <TableCell className="text-left">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={getProfileImageUrl(user.profile_image, user.email)}
                              />
                              <AvatarFallback>
                                {getInitials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {user.name || "No name"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-left text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-left">{getRoleBadge(user)}</TableCell>
                        <TableCell className="text-left">{getStatusBadge(user)}</TableCell>
                        <TableCell className="text-left text-muted-foreground">
                          {user.date_joined
                            ? new Date(user.date_joined).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/users/${user.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t pt-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * pageSize + 1} to{" "}
                      {Math.min(currentPage * pageSize, totalCount)} of{" "}
                      {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
