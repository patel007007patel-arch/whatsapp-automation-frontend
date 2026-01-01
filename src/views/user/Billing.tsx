import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Progress } from 'src/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { Button } from 'src/components/ui/button';
import { userAPI } from 'src/services/api';
import { useNavigate } from 'react-router';
import { Badge } from 'src/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

const Billing = () => {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setPage(1);
  }, [status, type]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBilling();
    }, 300); // Debounce filters by 300ms

    return () => clearTimeout(timeoutId);
  }, [status, type, page]);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit };
      if (status !== 'all') params.status = status;
      if (type !== 'all') params.type = type;
      const data = await userAPI.getBilling(params);
      setBilling(data);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to fetch billing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const credits = billing?.credits || 0;
  const subscription = billing?.subscription;
  const plan = billing?.plan || subscription?.planId;
  // Use actual messages sent count from backend
  const used = billing?.messagesSent || 0;
  // Total available credits = current credits + messages sent (includes plan credits + any extra credits added by admin)
  const totalAvailable = credits + used;
  const percentage = totalAvailable > 0 ? Math.min(100, (used / totalAvailable) * 100) : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Billing & Usage</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Messages Used</span>
                <span className="text-sm font-semibold">
                  {used} / {totalAvailable}
                </span>
              </div>
              <Progress value={percentage} />
            </div>
            <div>
              <div className="text-2xl font-bold">{credits}</div>
              <p className="text-sm text-muted-foreground">Credits Remaining</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{plan?.name || 'No Plan'}</div>
              <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'}>
                {subscription?.status || 'expired'}
              </Badge>
              {subscription?.endDate && (
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              )}
              {plan && (
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <p>Credits: {plan.credits || 0}</p>
                  <p>Duration: {plan.duration || 0} days</p>
                </div>
              )}
              <Button onClick={() => navigate('/user/plans')} className="mt-4">
                {plan ? 'Change Plan' : 'Upgrade Plan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <div className="flex gap-4 items-center">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing?.transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                billing?.transactions?.map((transaction: any) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{new Date(transaction.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>₹{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        {(() => {
          const totalPages = Math.ceil(total / limit);
          if (totalPages <= 1) return null;
          
          return (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} transactions
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
          );
        })()}
      </Card>
    </div>
  );
};

export default Billing;

