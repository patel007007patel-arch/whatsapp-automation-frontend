import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { adminAPI } from 'src/services/api';
import { Icon } from '@iconify/react';
import Chart from 'react-apexcharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'today' | '7days' | '30days'>('7days');
  const [revenueTimePeriod, setRevenueTimePeriod] = useState<'today' | '7days' | '30days'>('7days');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const data = await adminAPI.getDashboard();
      setDashboard(data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      </div>

      <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Icon icon="solar:users-group-rounded-linear" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Icon icon="solar:qr-code-linear" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.activeConnections || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <Icon icon="solar:chat-round-linear" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.messagesToday || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <Icon icon="solar:wallet-money-linear" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboard?.revenue || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Messages Sent</CardTitle>
            <Select value={timePeriod} onValueChange={(value: 'today' | '7days' | '30days') => setTimePeriod(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {(() => {
              let chartData: any[] = [];
              let categories: string[] = [];
              let chartType: 'line' | 'bar' = 'line';

              if (timePeriod === 'today' && dashboard?.charts?.today) {
                chartData = dashboard.charts.today.map((item: any) => item.count);
                categories = dashboard.charts.today.map((item: any) => item.label);
                chartType = 'bar';
              } else if (timePeriod === '7days' && dashboard?.charts?.last7Days) {
                chartData = dashboard.charts.last7Days.map((item: any) => item.count);
                categories = dashboard.charts.last7Days.map((item: any) => {
                  const date = new Date(item.date);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                chartType = 'line';
              } else if (timePeriod === '30days' && dashboard?.charts?.last30Days) {
                chartData = dashboard.charts.last30Days.map((item: any) => item.count);
                categories = dashboard.charts.last30Days.map((item: any, index: number) => {
                  if (index % 5 === 0) {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                  return '';
                });
                chartType = 'bar';
              }

              if (chartData.length === 0) {
                return <div className="text-center py-8 text-muted-foreground">No data available</div>;
              }

              const chartOptions: any = {
                chart: {
                  type: chartType,
                  toolbar: { show: false },
                },
                xaxis: {
                  categories,
                },
                colors: chartType === 'line' ? ['#3b82f6'] : ['#10b981'],
                tooltip: {
                  theme: 'dark',
                },
              };

              if (chartType === 'line') {
                chartOptions.stroke = {
                  curve: 'smooth',
                  width: 3,
                };
              } else {
                chartOptions.plotOptions = {
                  bar: {
                    borderRadius: 4,
                    columnWidth: timePeriod === 'today' ? '80%' : '60%',
                  },
                };
              }

              return (
                <Chart
                  type={chartType}
                  height={300}
                  series={[
                    {
                      name: 'Messages',
                      data: chartData,
                    },
                  ]}
                  options={chartOptions}
                />
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.charts?.messageTypes && dashboard.charts.messageTypes.length > 0 ? (
              <Chart
                type="donut"
                height={300}
                series={dashboard.charts.messageTypes.map((item: any) => item.count)}
                options={{
                  labels: dashboard.charts.messageTypes.map((item: any) => {
                    const typeLabels: { [key: string]: string } = {
                      text: 'Text',
                      image: 'Image',
                      document: 'Document',
                      bulk: 'Bulk',
                      multiple: 'Multiple',
                    };
                    return typeLabels[item.type] || item.type.charAt(0).toUpperCase() + item.type.slice(1);
                  }),
                  legend: {
                    position: 'bottom',
                  },
                  colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'],
                  dataLabels: {
                    enabled: true,
                    formatter: (val: number) => {
                      return val.toFixed(1) + '%';
                    },
                  },
                  tooltip: {
                    y: {
                      formatter: (value: number) => {
                        return `${value} messages`;
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue</CardTitle>
            <Select value={revenueTimePeriod} onValueChange={(value: 'today' | '7days' | '30days') => setRevenueTimePeriod(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {(() => {
              let chartData: any[] = [];
              let categories: string[] = [];
              let chartType: 'area' | 'bar' = 'area';

              if (revenueTimePeriod === 'today' && dashboard?.charts?.revenueToday) {
                chartData = dashboard.charts.revenueToday.map((item: any) => item.amount);
                categories = dashboard.charts.revenueToday.map((item: any) => item.label);
                chartType = 'bar';
              } else if (revenueTimePeriod === '7days' && dashboard?.charts?.revenueLast7Days) {
                chartData = dashboard.charts.revenueLast7Days.map((item: any) => item.amount);
                categories = dashboard.charts.revenueLast7Days.map((item: any) => {
                  const date = new Date(item.date);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                });
                chartType = 'area';
              } else if (revenueTimePeriod === '30days' && dashboard?.charts?.revenueLast30Days) {
                chartData = dashboard.charts.revenueLast30Days.map((item: any) => item.amount);
                categories = dashboard.charts.revenueLast30Days.map((item: any, index: number) => {
                  if (index % 5 === 0) {
                    const date = new Date(item.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }
                  return '';
                });
                chartType = 'bar';
              }

              if (chartData.length === 0) {
                return <div className="text-center py-8 text-muted-foreground">No data available</div>;
              }

              const chartOptions: any = {
                chart: {
                  type: chartType,
                  toolbar: { show: false },
                },
                xaxis: {
                  categories,
                },
                colors: ['#10b981'],
                tooltip: {
                  theme: 'dark',
                  y: {
                    formatter: (value: number) => `₹${value.toFixed(2)}`,
                  },
                },
              };

              if (chartType === 'area') {
                chartOptions.stroke = {
                  curve: 'smooth',
                  width: 3,
                };
                chartOptions.fill = {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                  },
                };
              } else {
                chartOptions.plotOptions = {
                  bar: {
                    borderRadius: 4,
                    columnWidth: revenueTimePeriod === 'today' ? '80%' : '60%',
                  },
                };
              }

              return (
                <Chart
                  type={chartType}
                  height={300}
                  series={[
                    {
                      name: 'Revenue',
                      data: chartData,
                    },
                  ]}
                  options={chartOptions}
                />
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

