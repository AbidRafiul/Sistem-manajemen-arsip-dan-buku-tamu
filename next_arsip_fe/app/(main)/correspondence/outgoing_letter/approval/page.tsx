'use client'

import getDataRequest from "@/lib/axios/getData";
import { showError } from "@/lib/tools/generalTools";
import { useSession } from "next-auth/react";
import { FilterMatchMode } from "primereact/api";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Table from "./components/display/table";

interface State {
    load: boolean;
    detail: boolean;
    detailLoad: boolean;
    detailData: any;
    data: any[];
    selectedLetters: any[];
    searchVal: string;
    statusFilter: string;
    jenisSuratFilter: number | null;
    filters: any;
    session: any;
}

const Page = () => {
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();

    const [state, setState] = useState<State>({
        load: false,
        detail: false,
        detailLoad: false,
        detailData: null,
        data: [],
        selectedLetters: [],
        searchVal: "",
        statusFilter: "menunggu_approval", // Default filter to waiting approval
        jenisSuratFilter: null,
        filters: { global: { value: null, matchMode: FilterMatchMode.CONTAINS } },
        session: null,
    });

    const getData = async (apiEndpoint: string, payload: Record<string, any> = {}) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const res = await getDataRequest(apiEndpoint, payload);
            setState((p) => ({
                ...p,
                data: res.data?.data || [],
            }));
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Data approval surat keluar gagal diambil");
        } finally {
            setState((p) => ({ ...p, load: false }));
        }
    };

    useEffect(() => {
        if (session) {
            setState((prev) => ({
                ...prev,
                session,
            }));
        }
    }, [session]);

    return (
        <>
            <Toast ref={toast} position="top-right" />
            <Table getData={getData} state={state} setState={setState} toast={toast} />
        </>
    );
};

export default Page;
