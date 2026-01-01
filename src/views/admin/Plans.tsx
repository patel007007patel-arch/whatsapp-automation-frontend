import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Textarea } from 'src/components/ui/textarea';
import { Switch } from 'src/components/ui/switch';
import { Badge } from 'src/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'src/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { adminAPI } from 'src/services/api';
import { Icon } from '@iconify/react';
import { Alert, AlertDescription } from 'src/components/ui/alert';

const AdminPlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    currency: 'USD',
    credits: 0,
    duration: 30,
    features: {
      media: false,
      polls: false,
      bulkMessages: false,
      apiAccess: false,
    },
    isPopular: false,
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await adminAPI.getPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const planData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
      };
      await adminAPI.createPlan(planData);
      alert('Plan created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      alert(error.message || 'Failed to create plan');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.updatePlan(editingPlan._id, formData);
      alert('Plan updated successfully!');
      setEditingPlan(null);
      resetForm();
      fetchPlans();
    } catch (error: any) {
      alert(error.message || 'Failed to update plan');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) {
      return;
    }
    try {
      await adminAPI.deletePlan(planId);
      alert('Plan deleted successfully!');
      fetchPlans();
    } catch (error: any) {
      alert(error.message || 'Failed to delete plan');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 0,
      currency: 'INR',
      credits: 0,
      duration: 30,
      features: {
        media: false,
        polls: false,
        bulkMessages: false,
        apiAccess: false,
      },
      isPopular: false,
      isActive: true,
    });
  };

  const openEditDialog = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description || '',
      price: plan.price,
      currency: plan.currency || 'USD',
      credits: plan.credits || 0,
      duration: plan.duration || 30,
      features: plan.features || {
        media: false,
        polls: false,
        bulkMessages: false,
        apiAccess: false,
      },
      isPopular: plan.isPopular || false,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plan Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>Create New Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (!formData.slug) {
                        setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) });
                      }
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days) *</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    required
                  />
                </div>
              </div>

              <Alert>
                <Icon icon="solar:info-circle-linear" className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> 1 Credit = 1 Message. Credits represent the total number of messages allowed.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Credits * (1 credit = 1 message)</Label>
                <Input
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                  required
                  placeholder="e.g., 500 for 500 messages"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the number of credits (messages) included in this plan
                </p>
              </div>

              <div className="space-y-4">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Media Support</Label>
                    <Switch
                      checked={formData.features.media}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, media: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Polls</Label>
                    <Switch
                      checked={formData.features.polls}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, polls: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bulk Messages</Label>
                    <Switch
                      checked={formData.features.bulkMessages}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, bulkMessages: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>API Access</Label>
                    <Switch
                      checked={formData.features.apiAccess}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, apiAccess: checked } })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                  />
                  <Label>Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Plan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>Manage subscription plans for users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No plans found. Create your first plan!
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan._id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{plan.name}</div>
                        <div className="text-sm text-muted-foreground">{plan.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>₹{plan.price}</TableCell>
                    <TableCell>{plan.credits || 0}</TableCell>
                    <TableCell>{plan.duration} days</TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {plan.isPopular && (
                        <Badge variant="outline" className="ml-2">
                          Popular
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(plan)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(plan._id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingPlan && (
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (days) *</Label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                    required
                  />
                </div>
              </div>

              <Alert>
                <Icon icon="solar:info-circle-linear" className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> 1 Credit = 1 Message. Credits represent the total number of messages allowed.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Credits * (1 credit = 1 message)</Label>
                <Input
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })}
                  required
                  placeholder="e.g., 500 for 500 messages"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the number of credits (messages) included in this plan
                </p>
              </div>

              <div className="space-y-4">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Media Support</Label>
                    <Switch
                      checked={formData.features.media}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, media: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Polls</Label>
                    <Switch
                      checked={formData.features.polls}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, polls: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Bulk Messages</Label>
                    <Switch
                      checked={formData.features.bulkMessages}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, bulkMessages: checked } })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>API Access</Label>
                    <Switch
                      checked={formData.features.apiAccess}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, features: { ...formData.features, apiAccess: checked } })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isPopular}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                  />
                  <Label>Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button type="submit">Update Plan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPlans;

