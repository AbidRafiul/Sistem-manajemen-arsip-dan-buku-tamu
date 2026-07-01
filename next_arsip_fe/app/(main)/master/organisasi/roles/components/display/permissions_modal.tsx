import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { apiEndpointPermissionsGet, apiEndpointPermissionsUpdate } from '../endpoints';
import postData from '@/lib/axios/postData';
import { showError, showSuccess } from '@/lib/tools/generalTools';

interface PermissionsModalProps {
    state: any;
    setState: any;
    toast: any;
}

const PermissionsModal = ({ state, setState, toast }: PermissionsModalProps) => {
    const [nodes, setNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (state.permissionsVisible && state.activeRoleForPermissions) {
            loadPermissions();
        } else {
            setNodes([]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.permissionsVisible, state.activeRoleForPermissions]);

    const loadPermissions = async () => {
        setLoading(true);
        try {
            const res = await postData(apiEndpointPermissionsGet, { id_peran: state.activeRoleForPermissions.id_peran });
            setNodes(res.data.data || []);
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Gagal memuat hak akses');
        } finally {
            setLoading(false);
        }
    };

    const handleHide = () => {
        setState((prev: any) => ({ ...prev, permissionsVisible: false, activeRoleForPermissions: null }));
    };

    const collectPermissions = (nodesList: any[], flatList: any[] = []) => {
        nodesList.forEach(node => {
            flatList.push(node.data);
            if (node.children && node.children.length > 0) {
                collectPermissions(node.children, flatList);
            }
        });
        return flatList;
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const allPermissions = collectPermissions(nodes);
            await postData(apiEndpointPermissionsUpdate, { 
                id_peran: state.activeRoleForPermissions.id_peran,
                permissions: allPermissions
            });
            showSuccess(toast, 'Hak akses berhasil disimpan');
            handleHide();
        } catch (error: any) {
            showError(toast, error?.response?.data?.message || 'Gagal menyimpan hak akses');
        } finally {
            setSaving(false);
        }
    };

    const onCheckboxChange = (node: any, field: string, checked: boolean) => {
        let newNodes = [...nodes];
        
        const updateNode = (n: any) => {
            if (n.key === node.key) {
                n.data[field] = checked;
                return true;
            }
            if (n.children) {
                for (let child of n.children) {
                    if (updateNode(child)) return true;
                }
            }
            return false;
        };
        
        for (let n of newNodes) {
            if (updateNode(n)) break;
        }
        
        setNodes(newNodes);
    };

    const checkboxTemplate = (rowData: any, field: string) => {
        return (
            <div className="flex justify-content-center">
                <Checkbox 
                    checked={rowData.data[field]} 
                    onChange={(e) => onCheckboxChange(rowData, field, e.checked || false)} 
                />
            </div>
        );
    };

    const footer = (
        <div>
            <Button label="Batal" icon="pi pi-times" onClick={handleHide} className="p-button-text" />
            <Button label="Simpan" icon="pi pi-check" onClick={handleSave} autoFocus loading={saving} disabled={loading} />
        </div>
    );

    return (
        <Dialog 
            header={`Konfigurasi Hak Akses: ${state.activeRoleForPermissions?.nama_peran || ''}`} 
            visible={state.permissionsVisible} 
            style={{ width: '80vw' }} 
            footer={footer} 
            onHide={handleHide}
            maximizable
        >
            <TreeTable value={nodes} loading={loading} emptyMessage="Tidak ada data menu" className="p-treetable-sm">
                <Column field="nama_menu" header="Nama Menu" expander style={{ minWidth: '200px' }}></Column>
                <Column body={(data) => checkboxTemplate(data, 'hak_lihat')} header="Lihat" style={{ width: '100px', textAlign: 'center' }}></Column>
                <Column body={(data) => checkboxTemplate(data, 'hak_buat')} header="Tambah" style={{ width: '100px', textAlign: 'center' }}></Column>
                <Column body={(data) => checkboxTemplate(data, 'hak_ubah')} header="Ubah" style={{ width: '100px', textAlign: 'center' }}></Column>
                <Column body={(data) => checkboxTemplate(data, 'hak_hapus')} header="Hapus" style={{ width: '100px', textAlign: 'center' }}></Column>
                <Column body={(data) => checkboxTemplate(data, 'hak_setuju')} header="Setuju" style={{ width: '100px', textAlign: 'center' }}></Column>
            </TreeTable>
        </Dialog>
    );
};

export default PermissionsModal;
