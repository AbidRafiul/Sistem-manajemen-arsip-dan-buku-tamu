import { FormikProps } from "formik";
import { Session } from "next-auth";
import { Toast } from "primereact/toast";
import { RefObject } from "react";

export interface initValue {
    DocumentId: number | null;
    BorrowerName: string;
    ExpectedReturnDate: string;
    Purpose: string;
}

export interface LoanData {
    LoanId: number;
    DocumentId: number;
    DocumentName?: string;
    DocumentNumber?: string;
    BorrowerName: string;
    LoanDate: string;
    ExpectedReturnDate?: string | null;
    ReturnDate?: string | null;
    Purpose: string;
    Status: string;
    ApprovedBy?: string | null;
    ApprovedAt?: string | null;
    ApprovalNotes?: string | null;
    IsOverdue?: number;
    CreatedAt: string;
    UpdatedAt: string;
}

export interface DocumentSelectData {
    DocumentId: number;
    DocumentName: string;
    DocumentNumber: string;
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
