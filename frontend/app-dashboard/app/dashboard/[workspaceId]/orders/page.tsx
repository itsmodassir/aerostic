'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Filter, 
  ExternalLink, CheckCircle, Clock, 
  CreditCard, Package 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useParams } from 'next/navigation';

interface Order {
  id: string;
  contact: { name: string; phoneNumber: string };
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  source: string;
}

export default function OrdersPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch orders from API with proper credentials and prefix
    fetch('/api/v1/commerce/orders', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders', err);
        setLoading(false);
      });
  }, [workspaceId]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'new') return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> New</Badge>;
    if (s === 'confirmed') return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
    if (s === 'paid') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CreditCard className="w-3 h-3 mr-1" /> Paid</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.contact?.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage your WhatsApp Shopping orders and payments for workspace {workspaceId}.</p>
        </div>
        <Button variant="outline">
          <Package className="w-4 h-4 mr-2" /> Sync Catalog
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'NEW').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                ₹{orders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading orders...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              ) : filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-xs font-mono">{order.id.split('-')[0]}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.contact?.name || 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">{order.contact?.phoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {order.currency} {Number(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
