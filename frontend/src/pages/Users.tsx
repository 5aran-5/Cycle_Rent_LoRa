import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/api";
import { toast } from "sonner";

interface UserProfile {
  rfid_tag: string | null;
  registered_date: string;
}

interface User {
  id: number;
  username: string;
  profile: UserProfile;
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});

  // 🔹 Fetch users
  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/");
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Filter users
  const filteredUsers = users.filter((user) => {
    const tag = user.profile?.rfid_tag || "";
    return (
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      tag.toLowerCase().includes(search.toLowerCase())
    );
  });

  // 🔹 Add user (temporary prompt)
  const handleAddUser = async () => {
    const username = prompt("Enter username:");
    const password = prompt("Enter password:");
    const rfid_tag = prompt("Enter RFID Tag (optional):");

    if (!username || !password) {
      toast.error("Username and password are required");
      return;
    }

    try {
      const res = await api.post("/api/users/", {
        username,
        password,
        rfid_tag,
      });
      setUsers((prev) => [...prev, res.data]);
      toast.success(`User '${username}' created successfully`);
    } catch (error) {
      toast.error("Failed to create user");
      console.error(error);
    }
  };

  // 🔹 Start editing
  const startEditing = (user: User) => {
    setEditingUserId(user.id);
    setEditData({
      id: user.id,
      username: user.username,
      profile: { ...user.profile },
    });
  };

  // 🔹 Cancel editing
  const cancelEditing = () => {
    setEditingUserId(null);
    setEditData({});
  };

  // 🔹 Handle input change
  const handleInputChange = (field: string, value: string) => {
    if (field === "rfid_tag") {
      setEditData((prev) => ({
        ...prev,
        profile: { ...prev.profile, rfid_tag: value },
      }));
    } else {
      setEditData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // 🔹 Save updated user
  const handleSave = async (id: number) => {
    try {
      const payload = {
        username: editData.username,
        profile: { rfid_tag: editData.profile?.rfid_tag }, // 👈 nest it properly
      };

      const res = await api.patch(`/api/users/${id}/`, payload);
      const updatedUser = res.data;

      setUsers((prev) => prev.map((u) => (u.id === id ? updatedUser : u)));
      setEditingUserId(null);
      toast.success(`User '${updatedUser.username}' updated successfully`);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  // 🔹 Delete user
  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Delete user '${user.username}'?`)) return;

    try {
      await api.delete(`/api/users/${user.id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`User '${user.username}' deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete user");
      console.error(error);
    }
  };

  if (loading)
    return <div className="p-8 text-muted-foreground">Loading users...</div>;

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage student accounts and RFID assignments
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
          onClick={handleAddUser}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by username or RFID tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/30">
                <TableHead>Username</TableHead>
                <TableHead>RFID Tag</TableHead>
                <TableHead>Registered Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-background/20">
                    <TableCell>
                      {editingUserId === user.id ? (
                        <Input
                          value={editData.username || ""}
                          onChange={(e) =>
                            handleInputChange("username", e.target.value)
                          }
                        />
                      ) : (
                        <span className="font-medium">{user.username}</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {editingUserId === user.id ? (
                        <Input
                          value={editData.profile?.rfid_tag || ""}
                          onChange={(e) =>
                            handleInputChange("rfid_tag", e.target.value)
                          }
                        />
                      ) : (
                        <code className="px-2 py-1 rounded bg-background/50 text-sm font-mono">
                          {user.profile?.rfid_tag || "—"}
                        </code>
                      )}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {new Date(
                        user.profile?.registered_date
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      {editingUserId === user.id ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleSave(user.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={cancelEditing}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => startEditing(user)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-6 text-muted-foreground"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
