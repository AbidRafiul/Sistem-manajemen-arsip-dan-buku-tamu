'use client';

import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';
import RegistrasiForm from './components/display/form';
import VisitorCardModal from './components/display/table';
import { apiEndpointGetPurpose, apiEndpointGetUser, apiEndpointGetBranches } from './components/endpoints';
import { RegistrasiFormData, GeneratedCardData } from './components/interfaces';
import { useSession } from 'next-auth/react';

interface BranchRaw {
    id: number;
    name: string;
    id_induk: number | null;
}

const groupBranches = (list: BranchRaw[]): any[] => {
    const pusat: any[] = [];
    const cabang: any[] = [];
    const unit: any[] = [];

    const sortedList = [...list].sort((a, b) => a.name.localeCompare(b.name));

    for (const item of sortedList) {
        const lowerName = item.name.toLowerCase();
        if (lowerName.includes('kecamatan') || lowerName.includes('unit')) {
            unit.push({ id: item.id, name: item.name });
        } else if (lowerName.includes('pusat')) {
            pusat.push({ id: item.id, name: item.name });
        } else {
            cabang.push({ id: item.id, name: item.name });
        }
    }

    const groups: any[] = [];
    if (pusat.length > 0) {
        groups.push({
            label: 'Kantor Pusat',
            items: pusat
        });
    }
    if (cabang.length > 0) {
        groups.push({
            label: 'Kantor Cabang',
            items: cabang
        });
    }
    if (unit.length > 0) {
        groups.push({
            label: 'Unit / Kecamatan',
            items: unit
        });
    }

    return groups;
};

const initialFormState: RegistrasiFormData = {
    guest_name: '',
    phone_number: '',
    guest_email: '',
    guest_company: '',
    guest_position: '',
    identity_type: null,
    identity_number: '',
    visit_purpose_id: null,
    id_cabang: null,
    host_user_id: null,
    host_name: '',
    visit_notes: '',
    check_in_time: null,
    visit_type: 'personal',
    guest_count: 1,
    signature_data: null,
    group_members: [],
    approval_status: 'approved'
};

export default function RegistrasiKunjunganPage() {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const { data: session } = useSession();
    const roleCode = (session?.user as any)?.roleCode;
    const isSuperadmin = roleCode === 'SUPERADMIN';
    const userBranchId = (session?.user as any)?.id_cabang;
    const disableBranchSelect = !isSuperadmin && !!userBranchId;

    const [loading, setLoading] = useState(false);
    const [showCardDialog, setShowCardDialog] = useState(false);
    const [generatedCard, setGeneratedCard] = useState<GeneratedCardData | null>(null);

    const [visitPurposeOptions, setVisitPurposeOptions] = useState<any[]>([]);
    const [hostUserOptions, setHostUserOptions] = useState<any[]>([]);
    const [branchOptions, setBranchOptions] = useState<any[]>([]);

    const [identityFile, setIdentityFile] = useState<File | null>(null);
    const [selfieFile, setSelfieFile] = useState<File | null>(null);
    const [formData, setFormData] = useState<RegistrasiFormData>(initialFormState);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const resPurpose = await postData(apiEndpointGetPurpose, {});
                if (resPurpose?.data?.status === '00') setVisitPurposeOptions(resPurpose.data.data);

                 const resBranches = await postData(apiEndpointGetBranches, {});
                if (resBranches?.data?.status === '00' && Array.isArray(resBranches.data?.data)) {
                    const formatted = groupBranches(resBranches.data.data);
                    setBranchOptions(formatted);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchMasterData();
    }, []);

    useEffect(() => {
        if (session?.user) {
            const rCode = (session.user as any).roleCode;
            const isSA = rCode === 'SUPERADMIN';
            const bId = (session.user as any).id_cabang;
            console.log("SESSION LOADED:", { rCode, isSA, bId, disableBranchSelect });
            if (!isSA && bId) {
                const branchIdNum = Number(bId);
                setFormData((prev) => ({ ...prev, id_cabang: branchIdNum }));
                fetchHosts(branchIdNum);
            } else if (isSA) {
                if (typeof window !== 'undefined') {
                    try {
                        const saved = localStorage.getItem('globalFilter');
                        if (saved) {
                            const parsed = JSON.parse(saved);
                            if (parsed.id_cabang) {
                                const branchIdNum = Number(parsed.id_cabang);
                                setFormData((prev) => ({ ...prev, id_cabang: branchIdNum }));
                                fetchHosts(branchIdNum);
                            }
                        }
                    } catch (e) {}
                }
            }
        }
    }, [session]);

    const fetchHosts = async (branchId: number | null) => {
        if (!branchId) {
            setHostUserOptions([]);
            return;
        }
        try {
            const response = await axios.post("http://localhost:8000/api/v1/buku_tamu/visit_data/users", { id_cabang: branchId });
            if (response.data?.status === '00' && Array.isArray(response.data?.data)) {
                const mapped = response.data.data.map((h: any) => ({
                    id_pengguna: h.id,
                    nama_lengkap: h.name,
                    id_cabang: h.id_cabang
                }));
                setHostUserOptions(mapped);
            }
        } catch (err) {
            console.error("Gagal memuat daftar pegawai:", err);
        }
    };

    const handleChange = (field: string, value: any) => {
        if (field === 'reset') {
            const defaultBranch = disableBranchSelect ? Number(userBranchId) : null;
            setFormData({
                ...initialFormState,
                id_cabang: defaultBranch
            });
            setIdentityFile(null);
            setSelfieFile(null);
            if (defaultBranch) {
                fetchHosts(defaultBranch);
            } else {
                setHostUserOptions([]);
            }
        } else if (field === 'id_cabang') {
            setFormData((prev: RegistrasiFormData) => ({
                ...prev,
                id_cabang: value,
                host_user_id: null,
                host_name: ''
            }));
            fetchHosts(value);
        } else {
            setFormData((prev: RegistrasiFormData) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.guest_name || !formData.phone_number || !formData.visit_purpose_id || !formData.check_in_time || !formData.id_cabang) {
            showError(toast, 'Nama, No. Telepon, Kantor Tujuan, Tujuan Kunjungan, dan Rencana Kedatangan wajib diisi!');
            return;
        }

        setLoading(true);
        try {
            const submitData = new FormData();

            submitData.append('GuestName', formData.guest_name);
            submitData.append('PhoneNumber', formData.phone_number);
            submitData.append('GuestEmail', formData.guest_email || '');
            submitData.append('GuestCompany', formData.guest_company || '-');
            submitData.append('GuestPosition', formData.guest_position || '');
            submitData.append('IdentityType', formData.identity_type || '');
            submitData.append('IdentityNumber', formData.identity_number || '');
            submitData.append('VisitPurposeId', String(formData.visit_purpose_id));
            submitData.append('BranchId', String(formData.id_cabang));
            submitData.append('id_cabang', String(formData.id_cabang));
            submitData.append('HostUserId', formData.host_user_id ? String(formData.host_user_id) : '');
            submitData.append('HostName', formData.host_name || '');
            submitData.append('VisitNotes', formData.visit_notes || '');
            if (formData.check_in_time instanceof Date) {
                submitData.append('CheckInTime', formData.check_in_time.toISOString());
            }
            submitData.append('VisitType', formData.visit_type || 'personal');
            submitData.append('GuestCount', String(formData.guest_count || 1));
            submitData.append('ApprovalStatus', 'approved');
            if (formData.signature_data) {
                submitData.append('SignatureData', formData.signature_data);
            }

            if (formData.visit_type === 'group' && formData.group_members && formData.group_members.length > 0) {
                const membersToSend = formData.group_members.map((m) => ({
                    name: m.name,
                    phone: m.phone,
                    idNumber: m.idNumber,
                }));
                submitData.append('GroupMembers', JSON.stringify(membersToSend));

                formData.group_members.forEach((member, index) => {
                    if (member.identityFile) {
                        submitData.append(`MemberIdentityFile_${index}`, member.identityFile);
                    }
                });
            }

            if (identityFile) submitData.append('IdentityFile', identityFile);
            if (selfieFile) submitData.append('SelfieFile', selfieFile);

            const tokenSIAB = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token') || '') : '';

            const response = await axios.post(
                "http://localhost:8000/api/v1/buku_tamu/visit_checkin",
                submitData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': tokenSIAB ? `Bearer ${tokenSIAB}` : '',
                        'x-access-token': tokenSIAB
                    }
                }
            );

            if (response?.data?.status === '00') {
                showSuccess(toast, 'Check-In Berhasil!');
                setGeneratedCard(
                    response?.data?.data || {
                        visit_code: 'VIST-' + Math.floor(100000 + Math.random() * 900000),
                        guest_name: formData.guest_name,
                        guest_company: formData.guest_company || '-',
                        qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + formData.guest_name
                    }
                );
                setShowCardDialog(true);
            } else {
                throw new Error(response?.data?.message || 'Gagal meregistrasi kunjungan');
            }
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || error?.message || 'Terjadi kesalahan sistem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />

            <div className="flex justify-content-between align-items-center mb-3">
                <h2 className="m-0 text-900 font-bold text-2xl">Registrasi Kunjungan</h2>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        type="button" 
                        icon="pi pi-external-link" 
                        label="Halaman Visitor (Publik)" 
                        severity="info" 
                        outlined 
                        size="small"
                        onClick={() => window.open('/visitor/booking', '_blank')} 
                    />
                    <Button type="button" label="Kembali ke Monitoring" icon="pi pi-arrow-left" outlined size="small" onClick={() => router.push('/buku_tamu/monitoring')} />
                </div>
            </div>

            <RegistrasiForm
                formData={formData}
                handleChange={handleChange}
                setIdentityFile={setIdentityFile}
                setSelfieFile={setSelfieFile}
                identityFile={identityFile}
                selfieFile={selfieFile}
                visitPurposeOptions={visitPurposeOptions}
                hostUserOptions={hostUserOptions}
                branchOptions={branchOptions}
                loading={loading}
                disableBranchSelect={disableBranchSelect}
                handleSubmit={handleSubmit}
            />

            <VisitorCardModal
                visible={showCardDialog}
                onHide={() => {
                    setShowCardDialog(false);
                    router.push('/buku_tamu/checkout');
                }}
                cardData={generatedCard}
            />
        </>
    );
}
