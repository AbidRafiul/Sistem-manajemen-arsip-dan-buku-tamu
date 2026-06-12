'use client'

import { FilterMatchMode } from "primereact/api";
import { FormikProps } from "formik";
import { RefObject } from "react";
import { Toast } from "primereact/toast";

export interface initValue {
    VisitationId: number | null;
    GuestName: string;
    PhoneNumber: string;
    GuestEmail: string;
    GuestCompany: string;
    GuestPosition: string;
    VisitPurposeId: number | null;
    HostUserId: string;
    HostName: string;
    IdentityType: string;
    IdentityNumber: string;
    VisitNotes: string;
    CheckInTime: string;
    Status: string;
    ApprovalStatus: string;
}

export interface TableData {
    VisitationId: number;
    VisitCode: string;
    GuestName: string;
    PhoneNumber: string;
    GuestCompany: string;
    GuestPosition: string;
    VisitPurposeName: string;
    HostName: string;
    CheckInTime: string;
    CheckOutTime: string;
    Status: string;
    ApprovalStatus: string;
    PhotoFace: string;
    PhotoFaceUrl?: string;
    CreatedAt: string;
    VisitNotes: string;
}

export interface StatData {
    today_total: number;
    today_in: number;
    today_out: number;
    pending_approval: number;
    chart_per_hour: Array<{ hour: number; count: number }>;
    chart_per_purpose: Array<{ purpose: string; count: number }>;
    recent_10: TableData[];
}

export interface State {
    load: boolean;
    data: TableData[];
    add: boolean;
    edit: boolean;
    delete: boolean;
    selectedUsers: TableData[];
    searchVal: string;
    filters: {
        global: {
            value: string | null;
            matchMode: FilterMatchMode;
        };
    };
    session: any;
    submittedData: initValue | null;
    visitPurposeData: any[];
    hostUserData: any[];
    statData: StatData | null;
    autoRefresh: boolean;
    statusFilter: string;
    showCheckoutDialog: boolean;
    checkoutToken: string;
    checkoutNotes: string;
    detailRecord: TableData | null;
}

export interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
    toast: RefObject<Toast>;
    onOpenCheckin: () => void;
    onCheckout: (row: TableData) => void;
    onApprove: (row: TableData) => void;
    onReject: (row: TableData) => void;
    onDetail: (row: TableData) => void;
    onFilterStatus: (value: string) => void;
    onRefresh: () => void;
}

export interface FormProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
    toast: RefObject<Toast>;
    getData: (apiEndpoint: string, payload?: Record<string, any>) => Promise<void>;
}
