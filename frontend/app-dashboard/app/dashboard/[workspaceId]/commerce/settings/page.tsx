'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, ShoppingBag, ShoppingCart, 
  Store, Link, RefreshCcw, Save,
  CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface Catalog {
  id: string;
  metaCatalogId: string;
  name: string;
  isDefault: boolean;
}

interface Portfolio {
  id: string;
  name: string;
}

export default function CommerceSettingsPage() {
  const params = useParams();
  const workspaceId = params?.workspaceId as string;

  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    catalog_id: '',
    is_catalog_visible: false,
    is_cart_enabled: false
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, portRes] = await Promise.all([
        fetch('/api/v1/commerce/catalogs', { credentials: 'include' }),
        fetch('/api/v1/commerce/settings/portfolios', { credentials: 'include' })
      ]);
      
      const catData = await catRes.json();
      const portData = await portRes.json();

      setCatalogs(catData);
      setPortfolios(portData);

      // Set default catalog in settings if found
      const defaultCat = catData.find((c: Catalog) => c.isDefault);
      if (defaultCat) {
        setSettings(prev => ({ ...prev, catalog_id: defaultCat.metaCatalogId }));
      }
    } catch (err) {
      toast.error("Failed to load commerce data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/commerce/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'include'
      });

      if (!res.ok) throw new Error("Update failed");
      
      toast.success("Commerce settings updated!");
      fetchData();
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Commerce Settings</h1>
        <p className="text-muted-foreground flex items-center">
          <Settings className="w-4 h-4 mr-2" /> 
          Configure how your shop appears to customers on WhatsApp.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              <CardTitle>Catalog Connection</CardTitle>
            </div>
            <CardDescription>
              Link a Meta Product Catalog to your WhatsApp Business Account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="catalog">Active Catalog</Label>
              <select 
                id="catalog"
                value={settings.catalog_id} 
                onChange={(e) => setSettings({...settings, catalog_id: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select a catalog to link</option>
                {catalogs.map((cat) => (
                  <option key={cat.id} value={cat.metaCatalogId}>
                    {cat.name} ({cat.metaCatalogId})
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Only products from this catalog will be visible in your WhatsApp Shop button.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <CardTitle>WhatsApp Shop Visiblity</CardTitle>
            </div>
            <CardDescription>
              Control how the "View Shop" button and Shopping Cart function.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label className="text-base">Shop Button</Label>
                <span className="text-sm text-muted-foreground">
                  Display the "View Shop" button on your WhatsApp profile.
                </span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-primary cursor-pointer"
                checked={settings.is_catalog_visible}
                onChange={(e) => setSettings({...settings, is_catalog_visible: e.target.checked})}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="flex flex-col space-y-1">
                <Label className="text-base">Shopping Cart</Label>
                <span className="text-sm text-muted-foreground">
                  Allow customers to add multiple products to a cart and send as an order.
                </span>
              </div>
              <input 
                type="checkbox"
                className="w-5 h-5 accent-primary cursor-pointer"
                checked={settings.is_cart_enabled}
                onChange={(e) => setSettings({...settings, is_cart_enabled: e.target.checked})}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 border-t py-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4" />
            Changes take up to 24 hours to reflect on all user devices in some regions.
          </CardFooter>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">Status</Badge>
              <CardTitle className="text-lg">Connection Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Linked Catalog</span>
                <span className="font-medium font-mono">
                  {settings.catalog_id || "Not Linked"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sync Capabilities</span>
                <span className="text-green-600 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> items_batch enabled
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={saving || !settings.catalog_id} onClick={handleSave}>
              {saving ? "Updating Meta..." : "Save Commerce Configuration"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
