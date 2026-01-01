import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog';
import { Label } from 'src/components/ui/label';
import { Icon } from '@iconify/react';
import { adminAPI } from 'src/services/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [creditsValue, setCreditsValue] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [search, status, page]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await adminAPI.getPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (search && search.trim()) {
        params.search = search.trim();
      }
      if (status !== 'all') {
        params.status = status;
      }
      const data = await adminAPI.getUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await adminAPI.suspendUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await adminAPI.activateUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const handleEditCredits = (user: any) => {
    setEditingUser(user._id);
    setCreditsValue(user.credits || 0);
    setIsDialogOpen(true);
  };

  const handleUpdateCredits = async () => {
    if (!editingUser) return;
    
    try {
      await adminAPI.updateUserCredits(editingUser, creditsValue, 'Admin credit update');
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Failed to update credits');
    }
  };

  const handleIncreaseCredits = (user: any, amount: number) => {
    setEditingUser(user._id);
    setCreditsValue((user.credits || 0) + amount);
    setIsDialogOpen(true);
  };

  const handleDecreaseCredits = (user: any, amount: number) => {
    setEditingUser(user._id);
    const newValue = Math.max(0, (user.credits || 0) - amount);
    setCreditsValue(newValue);
    setIsDialogOpen(true);
  };

  const handleAssignPlan = (user: any) => {
    setAssigningUserId(user._id);
    setSelectedPlanId(user.plan?._id || user.plan || '');
    setIsPlanDialogOpen(true);
  };

  const handleAssignPlanSubmit = async () => {
    if (!assigningUserId || !selectedPlanId) {
      alert('Please select a plan');
      return;
    }

    try {
      await adminAPI.assignPlanToUser(assigningUserId, selectedPlanId);
      alert('Plan assigned successfully!');
      setIsPlanDialogOpen(false);
      setAssigningUserId(null);
      setSelectedPlanId('');
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Failed to assign plan');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-4 items-center">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.plan?.name || 'No Plan'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{user.credits || 0}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleIncreaseCredits(user, 10)}
                            title="Add 10 credits"
                          >
                            <Icon icon="solar:add-circle-bold" className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDecreaseCredits(user, 10)}
                            title="Remove 10 credits"
                          >
                            <Icon icon="solar:minus-circle-bold" className="h-4 w-4 text-red-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2"
                            onClick={() => handleEditCredits(user)}
                            title="Edit credits"
                          >
                            <Icon icon="solar:pen-bold" className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.whatsapp?.isConnected ? 'default' : 'secondary'}>
                        {user.whatsapp?.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.apiKey?.isActive ? 'default' : 'secondary'}>
                        {user.apiKey?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Suspended'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAssignPlan(user)}
                          title="Assign Plan"
                        >
                          <Icon icon="solar:tag-price-linear" className="h-4 w-4 mr-1" />
                          Plan
                        </Button>
                        {user.isActive ? (
                          <Button size="sm" variant="destructive" onClick={() => handleSuspend(user._id)}>
                            Suspend
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleActivate(user._id)}>
                            Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} users
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update User Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="credits">Credits (1 Credit = 1 Message)</Label>
              <Input
                id="credits"
                type="number"
                min="0"
                value={creditsValue}
                onChange={(e) => setCreditsValue(parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground">
                Current user: {users.find(u => u._id === editingUser)?.email}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCredits}>
                Update Credits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Plan Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Plan to User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Select Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan._id} value={plan._id}>
                      {plan.name} - ₹{plan.price} ({plan.credits} credits, {plan.duration} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPlanId && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  {(() => {
                    const plan = plans.find(p => p._id === selectedPlanId);
                    if (!plan) return null;
                    return (
                      <div className="text-sm space-y-1">
                        <p><strong>Credits:</strong> {plan.credits}</p>
                        <p><strong>Duration:</strong> {plan.duration} days</p>
                        <p><strong>Price:</strong> ₹{plan.price}</p>
                        <p><strong>Features:</strong> {plan.features?.media && 'Media'} {plan.features?.apiAccess && 'API Access'} {plan.features?.bulkMessages && 'Bulk Messages'}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                Current user: {users.find(u => u._id === assigningUserId)?.email}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignPlanSubmit} disabled={!selectedPlanId}>
                Assign Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;

