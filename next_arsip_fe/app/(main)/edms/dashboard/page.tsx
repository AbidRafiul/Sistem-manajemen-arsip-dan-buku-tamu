"use client";
import React, { useEffect, useState } from 'react';
import getDataInterceptor from '@/lib/axios/getData';
import { useSession } from 'next-auth/react';
import DashboardView from './components/display/dashboardView';
import { ArchiveDashboardState } from './components/interfaces';
import { apiEndpointArchiveSummary } from './components/endpoints';

const Page = () => {
    const { data: session } = useSession();
    const [state, setState] = useState<ArchiveDashboardState>({
        load: true,
        metrics: {
            pengarsipanDokumen: 0,
            dokumenDipinjam: 0,
            dokumenDariSurat: 0
        },
        chartData: [],
        weeklyTrend: {
            labels: [],
            data: []
        },
        borrowedList: []
    });

    const fetchDashboardData = async () => {
        setState((p) => ({ ...p, load: true }));
        try {
            const res = await getDataInterceptor(apiEndpointArchiveSummary);
            if (res.data?.data) {
                const { metrics, chartData, weeklyTrend, borrowedList } = res.data.data;
                setState((p) => ({
                    ...p,
                    metrics: metrics || p.metrics,
                    chartData: chartData || p.chartData,
                    weeklyTrend: weeklyTrend || p.weeklyTrend,
                    borrowedList: borrowedList || p.borrowedList,
                    load: false
                }));
            } else {
                setState((p) => ({ ...p, load: false }));
            }
        } catch (error) {
            console.error("Gagal mengambil data ringkasan arsip:", error);
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            fetchDashboardData();
        }
    }, [session]);

    return (
        <DashboardView state={state} onRefresh={fetchDashboardData} />
    );
};

export default Page;
