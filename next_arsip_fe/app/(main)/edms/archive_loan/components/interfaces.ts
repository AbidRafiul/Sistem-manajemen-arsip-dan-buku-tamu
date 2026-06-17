import { FormikProps } from "formik";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface initValue {
    document_id: number | null;
    borrower_name: string;
    expected_return_date: string;
    purpose: string;
}

export interface LoanData {
    loan_id: number;
    document_id: number;
    document_name?: string;
    document_number?: string;
    borrower_name: string;
    loan_date: string;
    expected_return_date?: string | null;
    return_date?: string | null;
    purpose: string;
    status: string;
    approved_by?: string | null;
    approved_at?: string | null;
    approval_notes?: string | null;
    is_overdue?: number;
    created_at: string;
    updated_at: string;
}

export interface DocumentSelectData {
    document_id: number;
    document_name: string;
    document_number: string;
}

export interface State {
    load: boolean;
    data: LoanData[];
    documents: DocumentSelectData[];
    add: boolean;
    approveDialog: boolean;
    returnDialog: boolean;
    selectedLoan: LoanData | null;
    approvalStatus: 'approved' | 'rejected' | '';
    approvalNotes: string;
    session: Session | null;
    submittedData: initValue | null;
    searchVal: string;
    activeTab: 'all' | 'pending' | 'borrowed' | 'returned' | 'overdue';
}

export interface TableProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
    getLoans: () => Promise<void>;
    handleApproveReject: (loanId: number, status: 'approved' | 'rejected', notes: string) => Promise<void>;
    handleReturn: (loanId: number) => Promise<void>;
    toast: RefObject<Toast>;
}

export interface FormProps {
    state: State;
    setState: React.Dispatch<React.SetStateAction<State>>;
    formik: FormikProps<initValue>;
    toast: RefObject<Toast>;
}
