"use client";
import React, { useRef, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import ExpiredTable from './components/expiredTable';
import ProposalTable from './components/proposalTable';

export default function DestructionPage() {
    const toast = useRef<Toast>(null);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const handleProposalCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />
            
            <div className="mb-3">
                <h2 className="m-0 text-900 font-bold text-2xl mb-1">Pemusnahan & Retensi Arsip</h2>
                <p className="m-0 text-color-secondary text-sm">Pantau arsip yang telah habis masa retensinya, ajukan usulan pemusnahan, dan tinjau berkas berita acara pemusnahan.</p>
            </div>

            <Card className="border-none shadow-1 border-round-2xl overflow-hidden" pt={{ body: { className: 'p-0' }, content: { className: 'p-0' } }}>
                <TabView className="custom-tabview">
                    <TabPanel header="Arsip Kedaluwarsa" leftIcon="pi pi-exclamation-triangle mr-2">
                        <div className="p-3">
                            <ExpiredTable toast={toast} onProposalCreated={handleProposalCreated} />
                        </div>
                    </TabPanel>
                    <TabPanel header="Usulan Pemusnahan" leftIcon="pi pi-file-export mr-2">
                        <div className="p-3">
                            <ProposalTable toast={toast} refreshTrigger={refreshTrigger} />
                        </div>
                    </TabPanel>
                </TabView>
            </Card>
        </>
    );
}
