import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedToday: number;
  activeOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

interface LowStockItem {
  id: string;
  product_name: string;
  variant_name: string;
  inventory_count: number;
  track_inventory: boolean;
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
    .in('status', ['delivered', 'ready', 'out_for_delivery', 'picked_up']);

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
    .in('status', ['delivered', 'picked_up'])
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

  // Get today's orders count
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  // Get today's revenue
  const { data: todayRevenueData } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['delivered', 'ready', 'out_for_delivery', 'picked_up', 'baking', 'decorating', 'quality_check', 'confirmed'])
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  const todayRevenue = (todayRevenueData as { total: number }[])?.reduce(
    (sum, order) => sum + parseFloat(order.total.toString() || '0'),
    0
  ) || 0;

  return {
    totalOrders: totalOrders || 0,
    totalRevenue,
    pendingOrders: pendingOrders || 0,
    completedToday: completedToday || 0,
    activeOrders: activeOrders || 0,
    cancelledOrders: cancelledOrders || 0,
    todayOrders: todayOrders || 0,
    todayRevenue,
  };
}

async function getLowStockItems(): Promise<LowStockItem[]> {
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      id,
      name,
      inventory_count,
      track_inventory,
      products!inner (
        id,
        name
      )
    `)
    .eq('track_inventory', true)
    .not('inventory_count', 'is', null)
    .lte('inventory_count', 5)
    .eq('is_available', true)
    .order('inventory_count', { ascending: true })
    .limit(10);

  return (variants || []).map((v: Record<string, unknown>) => ({
    id: v.id as string,
    product_name: ((v.products as Record<string, unknown>)?.name as string) || 'Unknown',
    variant_name: v.name as string,
    inventory_count: v.inventory_count as number,
    track_inventory: v.track_inventory as boolean,
  }));
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
  const [stats, recentOrders, lowStockItems] = await Promise.all([
    getOrderStats(),
    getRecentOrders(),
    getLowStockItems(),
  ]);

  const statCards = [
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: ShoppingBag,
      description: 'Orders placed today',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: DollarSign,
      description: 'Expected revenue today',
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
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: TrendingUp,
      description: 'All time completed',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common admin tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/orders?status=received">
                <Clock className="mr-2 h-4 w-4" />
                New Orders ({stats.pendingOrders})
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/production">
                <Package className="mr-2 h-4 w-4" />
                Production List
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/orders?status=ready">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Ready for Pickup
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/admin/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest orders from customers</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/orders">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No orders yet
                </p>
              ) : (
                recentOrders.slice(0, 5).map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between border-b pb-4 last:border-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-md transition-colors"
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
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>
                  Products running low on inventory
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/products">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <p>All products are well stocked</p>
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.variant_name}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        item.inventory_count === 0
                          ? 'destructive'
                          : item.inventory_count <= 2
                          ? 'default'
                          : 'secondary'
                      }
                      className={
                        item.inventory_count === 0
                          ? ''
                          : item.inventory_count <= 2
                          ? 'bg-orange-500'
                          : ''
                      }
                    >
                      {item.inventory_count} left
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
