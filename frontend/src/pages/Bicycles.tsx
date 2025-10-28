import { useEffect, useState } from "react";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
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
import { toast } from "sonner";
import api from "@/api";

export default function Bicycles() {
  const [search, setSearch] = useState("");
  const [bicycles, setBicycles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all bicycles
  useEffect(() => {
    const fetchBicycles = async () => {
      try {
        const res = await api.get("/api/bicycles/");
        setBicycles(res.data);
      } catch (error) {
        console.error("Error fetching bicycles:", error);
        toast.error("Failed to load bicycles");
      } finally {
        setLoading(false);
      }
    };

    fetchBicycles();
  }, []);

  // Filter bicycles by search term
  const filteredBicycles = bicycles.filter(
    (bike) =>
      bike.device_id.toLowerCase().includes(search.toLowerCase()) ||
      bike.status.toLowerCase().includes(search.toLowerCase())
  );

  // Delete bicycle handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bicycle?"))
      return;
    try {
      await api.delete(`/api/bicycles/${id}/`);
      toast.success("Bicycle deleted successfully");
      setBicycles((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      toast.error("Failed to delete bicycle");
    }
  };

  // Edit bicycle (example: status toggle)
  const handleEdit = async (id, currentStatus) => {
    const bikeToEdit = bicycles.find((b) => b.id === id);
    const newStatus =
      currentStatus === "available"
        ? "offline"
        : currentStatus === "offline"
        ? "in_use"
        : "available";

    try {
      await api.put(`/api/bicycles/${id}/`, {
        ...bikeToEdit, // include all existing fields
        status: newStatus, // update only status
      });
      toast.success(`Bicycle status updated to ${newStatus}`);
      setBicycles((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (error) {
      console.error("Edit failed:", error.response?.data || error);
      toast.error("Failed to update bicycle");
    }
  };

  if (loading) return <div className="p-8">Loading bicycles...</div>;

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bicycle Management
          </h1>
          <p className="text-muted-foreground">
            Manage and monitor all bicycles in the system
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90 shadow-glow"
          onClick={() => toast.info("Add Bicycle feature coming soon")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bicycle
        </Button>
      </div>

      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by device ID or status..."
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
                <TableHead>Device ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBicycles.length > 0 ? (
                filteredBicycles.map((bike) => (
                  <TableRow key={bike.id} className="hover:bg-background/20">
                    <TableCell className="font-medium">
                      {bike.device_id}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={bike.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {bike.latitude?.toFixed(4)}, {bike.longitude?.toFixed(4)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {bike.last_update
                        ? new Date(bike.last_update).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEdit(bike.id, bike.status)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(bike.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No bicycles found
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
