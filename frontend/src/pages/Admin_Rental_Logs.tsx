import { useEffect, useState } from 'react';
import { Search, Filter, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import api from '@/api';

// ===================== Types =====================

interface Bicycle {
  id: number;
  device_id: string;
  status: string;
  latitude: number;
  longitude: number;
  last_update: string;
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
}

interface RentalLog {
  id: number;
  user: UserInfo;
  bicycle: Bicycle;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  distance_km: number | null;
  status: 'ongoing' | 'completed';
}

// ===================== Component =====================

export default function Admin_Rental_Logs() {
  const [logs, setLogs] = useState<RentalLog[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ Helper function to format duration
  const formatDuration = (minutes: number | null): string => {
    if (!minutes || minutes <= 0) return '-';

    const totalMinutes = Math.floor(minutes);
    const days = Math.floor(totalMinutes / 1440); // 24 * 60
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const mins = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Fetch all rental logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get<RentalLog[]>('/api/admin/rentals/');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching rental logs:', error);
      toast?.({ title: 'Error fetching logs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Update rental status
  const handleStatusUpdate = async (id: number, newStatus: string) => {
    try {
      const response = await api.patch('/api/admin/rentals/', { id, status: newStatus });
      toast?.({ title: response.data.message || 'Status updated successfully' });
      fetchLogs();
    } catch (error) {
      console.error('Error updating rental status:', error);
      toast?.({ title: 'Failed to update status', variant: 'destructive' });
    }
  };

  // Delete rental log
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      const response = await api.delete('/api/admin/rentals/', { data: { id } });
      toast?.({ title: response.data.message || 'Rental log deleted' });
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (error) {
      console.error('Error deleting rental log:', error);
      toast?.({ title: 'Failed to delete log', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      log.bicycle?.device_id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Rental Logs</h1>
        <p className="text-muted-foreground">
          View and manage all bicycle rental activities
        </p>
      </div>

      <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border/50 shadow-card">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by user or device ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background/50 border-border/50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/30">
                <TableHead>User</TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
                    Loading rental logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-background/20 transition">
                    <TableCell className="font-medium">{log.user?.username || '-'}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 rounded bg-background/50 text-sm font-mono">
                        {log.bicycle?.device_id || '-'}
                      </code>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.start_time).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.end_time ? new Date(log.end_time).toLocaleString() : '-'}
                    </TableCell>
                    {/* ✅ Formatted duration */}
                    <TableCell className="font-medium">
                      {formatDuration(log.duration_minutes)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                    <TableCell className="flex items-center gap-3 justify-center">
                      {log.status !== 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(log.id, 'completed')}
                          className="hover:bg-green-600 hover:text-white transition"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(log.id)}
                        className="hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    No rental logs found.
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
