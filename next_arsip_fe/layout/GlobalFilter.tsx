'use client';
import React, { useState, useEffect, useContext } from "react";
import { Dropdown } from "primereact/dropdown";
import { LayoutContext } from "./context/layoutcontext";
import postData from "@/lib/axios/postData";
import { useSession } from "next-auth/react";

const GlobalFilter = () => {
    const { data: session } = useSession();
    const activeRole = (session?.user as any)?.roleCode || (session?.user as any)?.role || 'Role belum terbaca';
    const { layoutState, setLayoutState } = useContext(LayoutContext);

    const [loading, setLoading] = useState(false);

    const [cabangList, setCabangList] = useState<any[]>([]);
    const [deptList, setDeptList] = useState<any[]>([]);
    const [divList, setDivList] = useState<any[]>([]);
    const [unitList, setUnitList] = useState<any[]>([]);

    const [allCabangsList, setAllCabangsList] = useState<any[]>([]);

    useEffect(() => {
        const role = activeRole?.toUpperCase() || '';
        if (role === 'SUPERADMIN' || role === 'SUPER ADMIN' || role === 'ADMINISTRATOR' || role === 'ADM' || session?.user?.name === 'Super Admin') {
            fetchAllMasterData();
        }
    }, [activeRole]);

    const fetchAllMasterData = async () => {
        setLoading(true);
        try {
            const reqPayload = { limit: 1000, page: 1, keyword: '' };
            // Bypass global filters so the dropdowns always fetch the full list of options
            const bypassFilters = { 
                'x-filter-cabang': '', 
                'x-filter-departemen': '', 
                'x-filter-divisi': '', 
                'x-filter-unit-kerja': '' 
            };
            const [cabangRes, deptRes, divRes, unitRes] = await Promise.all([
                postData('/master/organisasi/branches/get_data', reqPayload, bypassFilters),
                postData('/master/organisasi/department/get_data', reqPayload, bypassFilters),
                postData('/master/organisasi/divisions/get_data', reqPayload, bypassFilters),
                postData('/master/organisasi/work_unit/get_data', reqPayload, bypassFilters)
            ]);

            const rawCabangs = cabangRes.data?.data || [];
            setAllCabangsList(rawCabangs);
            
            let fetchedCabangs = [...rawCabangs];
            const role = activeRole?.toUpperCase() || '';
            if (role === 'SUPERADMIN' || role === 'SUPER ADMIN' || session?.user?.name === 'Super Admin') {
                fetchedCabangs = fetchedCabangs.filter((c: any) => (c.id_induk === null || c.id_induk === 1) && c.id_cabang !== 1);
            }

            setCabangList(fetchedCabangs);
            setDeptList(deptRes.data?.data || []);
            setDivList(divRes.data?.data || []);
            setUnitList(unitRes.data?.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key: string, value: any) => {
        setLayoutState(prev => ({
            ...prev,
            globalFilter: {
                ...(prev.globalFilter || {}),
                [key]: value
            } as any
        }));
    };

    const triggerReload = () => {
        setTimeout(() => window.location.reload(), 300);
    };

    const role = activeRole?.toUpperCase() || '';
    const isSA = role === 'SUPERADMIN' || role === 'SUPER ADMIN' || session?.user?.name === 'Super Admin';
    
    if (role !== 'SUPERADMIN' && role !== 'SUPER ADMIN' && role !== 'ADMINISTRATOR' && role !== 'ADM' && session?.user?.name !== 'Super Admin') {
        return null;
    }

    const selectedCabang = layoutState.globalFilter?.id_cabang;

    let currentPusatId = null;
    let currentDaerahId = null;

    if (isSA && selectedCabang) {
        const currentBranch = allCabangsList.find(c => c.id_cabang === selectedCabang);
        if (currentBranch) {
            if (currentBranch.id_induk === null || currentBranch.id_induk === 1) {
                currentPusatId = currentBranch.id_cabang;
            } else {
                const parent = allCabangsList.find(c => c.id_cabang === currentBranch.id_induk);
                if (parent && (parent.id_induk === null || parent.id_induk === 1)) {
                    currentPusatId = parent.id_cabang;
                    currentDaerahId = currentBranch.id_cabang;
                }
            }
        }
    }

    const daerahCabangs = currentPusatId ? allCabangsList.filter(c => c.id_induk === currentPusatId) : [];

    return (
        <div className="flex flex-wrap align-items-center gap-2">
            <Dropdown
                value={isSA ? (currentPusatId || null) : selectedCabang}
                onChange={(e) => {
                    const selected = allCabangsList.find(c => c.id_cabang === e.value);
                    updateFilter('id_cabang', e.value);
                    updateFilter('nama_cabang', selected ? selected.nama_cabang : null);
                    updateFilter('id_departemen', null);
                    updateFilter('id_divisi', null);
                    updateFilter('id_unit_kerja', null);
                    triggerReload();
                }}
                options={cabangList}
                optionLabel="nama_cabang"
                optionValue="id_cabang"
                placeholder={isSA ? "Pilih Pusat Cabang" : "Semua Cabang"}
                showClear filter
                className="p-dropdown-sm w-full md:w-12rem"
                disabled={loading}
            />
            {isSA && currentPusatId && (
                <Dropdown
                    value={currentDaerahId || null}
                    onChange={(e) => {
                        const selectedId = e.value || currentPusatId;
                        const selected = allCabangsList.find(c => c.id_cabang === selectedId);
                        updateFilter('id_cabang', selectedId);
                        updateFilter('nama_cabang', selected ? selected.nama_cabang : null);
                        updateFilter('id_departemen', null);
                        updateFilter('id_divisi', null);
                        updateFilter('id_unit_kerja', null);
                        triggerReload();
                    }}
                    options={daerahCabangs}
                    optionLabel="nama_cabang"
                    optionValue="id_cabang"
                    placeholder="Pilih Cabang Daerah"
                    showClear filter
                    className="p-dropdown-sm w-full md:w-12rem"
                    disabled={loading}
                />
            )}
        </div>
    );
};

export default GlobalFilter;
