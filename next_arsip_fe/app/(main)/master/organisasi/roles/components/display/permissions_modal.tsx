import React from 'react';
import { Dialog } from 'primereact/dialog';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

interface PermissionsModalProps {
    state: any;
    setState: any;
    toast: any;
    handleSavePermissions: () => void;
}

const PermissionsModal = ({ state, setState, toast, handleSavePermissions }: PermissionsModalProps) => {

    const handleHide = () => {
        setState((prev: any) => ({ ...prev, permissionsVisible: false, activeRoleForPermissions: null }));
    };

    const onCheckboxChange = (node: any, field: string, checked: boolean) => {
        // Deep copy the array to ensure React detects the state change properly
        let newNodes = JSON.parse(JSON.stringify(state.permissionsNodes || []));
        
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
        
        setState((prev: any) => ({ ...prev, permissionsNodes: newNodes }));
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
            <Button label="Simpan" icon="pi pi-check" onClick={handleSavePermissions} autoFocus loading={state.permissionsSaving} disabled={state.permissionsLoading} />
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
            <TreeTable value={state.permissionsNodes || []} loading={state.permissionsLoading} emptyMessage="Tidak ada data menu" className="p-treetable-sm">
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
