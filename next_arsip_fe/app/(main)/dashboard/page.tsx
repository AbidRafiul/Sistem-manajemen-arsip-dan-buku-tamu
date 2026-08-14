'use client';

import React, { useEffect, useRef, useState } from 'react';
import getData from '@/lib/axios/getData';
import { Toast } from 'primereact/toast';
import { showError } from '@/lib/tools/generalTools';
import { DashboardState } from './components/interfaces';
import { apiEndpointDashboardSummary } from './components/endpoints';
import DashboardView from './components/display/dashboardView';

const Page = () => {
    const toast = useRef<Toast>(null);

    const [state, setState] = useState<DashboardState>({
        load: false,
        summary: {
            arsipAktif: 0,
            tamuHariIni: 0,
            menungguDisposisi: 0,
            retensiExpired: 0
        },
        chartData: {
            labels: [],
            data: []
        },
        auditLogs: []
    });

    const fetchDashboardData = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getData(apiEndpointDashboardSummary);
            const oData = res.data.data;
            setState((p) => ({
                ...p,
                summary: oData.summary,
                chartData: oData.chartMingguan,
                auditLogs: oData.auditLogs
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal memuat data dashboard');
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <DashboardView
                data={state.summary}
                chartData={state.chartData}
                auditLogs={state.auditLogs}
                isLoading={state.load} />
        </>
    );
};

export default Page;
