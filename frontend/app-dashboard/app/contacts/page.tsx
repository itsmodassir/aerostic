'use client';

import React, { useState } from 'react';
import ContactTable from '../../components/contacts/ContactTable';
import AddEditContactModal from '../../components/contacts/AddEditContactModal';
import ImportExportModals from '../../components/contacts/ImportExportModals';

export default function ContactsPage() {
    const [isAddEditOpen, setIsAddEditOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [activeModal, setActiveModal] = useState<'import'|'export'|null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAdd = () => {
        setSelectedContact(null);
        setIsAddEditOpen(true);
    };

    const handleEdit = (contact: any) => {
        setSelectedContact(contact);
        setIsAddEditOpen(true);
    };

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="pt-8 pb-12 px-8 space-y-12 max-w-7xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter">CRM Ecosystem</h1>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Lifecycle Management & Audience Analytics</p>
            </div>

            <ContactTable 
                key={refreshKey}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onImport={() => setActiveModal('import')}
                onExport={() => setActiveModal('export')}
            />

            <AddEditContactModal 
                isOpen={isAddEditOpen}
                contact={selectedContact}
                onClose={() => setIsAddEditOpen(false)}
                onSuccess={handleSuccess}
            />

            <ImportExportModals 
                type={activeModal}
                onClose={() => setActiveModal(null)}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
