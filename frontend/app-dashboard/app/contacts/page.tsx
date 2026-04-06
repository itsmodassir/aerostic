'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Upload, Download, Plus, MoreVertical,
    Phone, Tag, Calendar, CheckCircle2, XCircle, Users2, Filter, Trash2
} from 'lucide-react';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Contact {
    id: string;
    name: string;
    phone: string;
    email?: string;
    tags?: string[];
    isActive: boolean;
    hasWhatsapp?: boolean;
    createdAt: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/contacts');
            setContacts(res.data?.contacts || res.data || []);
        } catch {
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchContacts(); }, []);

    const filtered = contacts.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Users2 className="h-8 w-8 text-blue-500" />
                        Contacts
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your WhatsApp contacts and segments.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl">
                        <Upload className="h-4 w-4 mr-2" /> Import
                    </Button>
                    <Button variant="outline" className="rounded-xl">
                        <Download className="h-4 w-4 mr-2" /> Export
                    </Button>
                    <Button className="rounded-xl">
                        <Plus className="h-4 w-4 mr-2" /> Add Contact
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-2xl border-gray-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl"><Users2 className="h-6 w-6 text-blue-500" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Total Contacts</p>
                            <p className="text-2xl font-bold">{contacts.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-gray-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl"><CheckCircle2 className="h-6 w-6 text-green-500" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Active</p>
                            <p className="text-2xl font-bold">{contacts.filter(c => c.isActive).length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-gray-100 shadow-sm">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-red-50 rounded-xl"><XCircle className="h-6 w-6 text-red-400" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Inactive</p>
                            <p className="text-2xl font-bold">{contacts.filter(c => !c.isActive).length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-100 overflow-hidden">
                <CardHeader className="border-b border-gray-50 bg-gray-50/50">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl">All Contacts</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search contacts..."
                                    className="pl-10 w-64 bg-white"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead><Phone className="inline h-3.5 w-3.5 mr-1" />Phone</TableHead>
                                <TableHead><Tag className="inline h-3.5 w-3.5 mr-1" />Tags</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead><Calendar className="inline h-3.5 w-3.5 mr-1" />Added</TableHead>
                                <TableHead className="text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-64 text-center text-gray-400">Loading contacts...</TableCell></TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="h-64 text-center text-gray-400">
                                    {search ? 'No contacts match your search.' : 'No contacts yet. Import or add your first contact!'}
                                </TableCell></TableRow>
                            ) : filtered.map(c => (
                                <TableRow key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="pl-6 py-4 font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                                                {c.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{c.name || 'Unknown'}</p>
                                                {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{c.phone}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1 flex-wrap">
                                            {c.tags?.slice(0, 3).map(t => (
                                                <Badge key={t} variant="secondary" className="text-xs rounded-full">{t}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`rounded-full text-xs ${c.isActive ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                                            {c.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {c.createdAt ? format(new Date(c.createdAt), 'MMM dd, yyyy') : '—'}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-4 w-4" /></Button>
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
