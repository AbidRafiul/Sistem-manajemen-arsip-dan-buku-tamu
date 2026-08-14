'use client'

import postData from "@/lib/axios/postData";
import { showError } from "@/lib/tools/generalTools";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { apiEndpointGet } from "./components/endpoints";
import { TableData } from "./components/interfaces";
import { mapIncomingLetterRow } from "./components/mappers";
import DashboardView, { FilterKey } from "./components/display/dashboardView";

const dispositionEndpoint = "/correspondence/letter-disposition-data";

const Page = () => {
    const toast = useRef<Toast>(null);
    const [letters, setLetters] = useState<TableData[]>([]);
    const [dispositions, setDispositions] = useState<Record<string, any>[]>([]);
    const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        setLoading(true);

        try {
            const [letterRes, dispositionRes] = await Promise.all([
                postData(apiEndpointGet, { keyword: "" }),
                postData(dispositionEndpoint, { keyword: "" }),
            ]);

            setLetters((letterRes.data?.data || []).map(mapIncomingLetterRow));
            setDispositions(dispositionRes.data?.data || []);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data dashboard surat masuk gagal diambil");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return (
        <div>
            <Toast ref={toast} position="top-right" />
            <DashboardView
                letters={letters}
                dispositions={dispositions}
                activeFilter={activeFilter}
                loading={loading}
                onFilterChange={setActiveFilter}
                onRefresh={fetchDashboard} />
        </div>
    );
};

export default Page;
