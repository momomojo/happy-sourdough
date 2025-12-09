import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedToday: number;
  activeOrders: number;
  cancelledOrders: number;
}

async function getOrderStats(): Promise<OrderStats> {
  const supabase = await createClient();

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get all orders count
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Get total revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['delivered', 'ready', 'out_for_delivery']);

  const totalRevenue = (revenueData as { total: number }[])?.reduce(
    (sum, order) => sum + parseFloat(order.total.toString() || '0'),
    0
  ) || 0;

  // Get pending orders (received, confirmed)
  const { count: pendingOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['received', 'confirmed']);

  // Get completed today
  const { count: completedToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'delivered')
    .gte('updated_at', today.toISOString())
    .lt('updated_at', tomorrow.toISOString());

  // Get active orders (in production)
  const { count: activeOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['baking', 'decorating', 'quality_check', 'ready', 'out_for_delivery']);

  // Get cancelled orders
  const { count: cancelledOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['cancelled', 'refunded']);

  return {
    totalOrders: totalOrders || 0,
    totalRevenue,
    pendingOrders: pendingOrders || 0,
    completedToday: completedToday || 0,
    activeOrders: activeOrders || 0,
    cancelledOrders: cancelledOrders || 0,
  };
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  guest_email: string | null;
  user_id: string | null;
}

async function getRecentOrders(): Promise<RecentOrder[]> {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, status, total, created_at, guest_email, user_id')
    .order('created_at', { ascending: false })
    .limit(10);

  return (orders as RecentOrder[]) || [];
}

export default async function AdminDashboardPage() {
  const [stats, recentOrders] = await Promise.all([
    getOrderStats(),
    getRecentOrders(),
  ]);

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      description: 'All time orders',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      description: 'From completed orders',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      description: 'Awaiting confirmation',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: CheckCircle2,
      description: 'Delivered today',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders,
      icon: Package,
      description: 'In production',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Cancelled',
      value: stats.cancelledOrders,
      icon: XCircle,
      description: 'Cancelled/Refunded',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      received: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-cyan-100 text-cyan-800',
      baking: 'bg-orange-100 text-orange-800',
      decorating: 'bg-pink-100 text-pink-800',
      quality_check: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Happy Sourdough admin dashboard
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Latest orders from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders yet
              </p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.guest_email || 'Registered User'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(order.status)}>
                      {formatStatus(order.status)}
                    </Badge>
                    <p className="text-sm font-medium">
                      {formatCurrency(parseFloat(order.total.toString()))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
