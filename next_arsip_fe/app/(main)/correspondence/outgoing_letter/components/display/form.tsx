'use client'

import postData from "@/lib/axios/postData";
import putData from "@/lib/axios/putData";
import { showError, showSuccess } from "@/lib/tools/generalTools";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useEffect, useState } from "react";
import {
    apiEndpointCreate,
    apiEndpointGet,
    apiEndpointLetterTypeData,
    apiEndpointUpdate,
} from "../endpoints";
import { FormProps, initValue } from "../interfaces";
import { mapOutgoingLetterPayload } from "../mappers";

const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Menunggu Approval", value: "menunggu_approval" },
    { label: "Disetujui", value: "disetujui" },
    { label: "Ditolak", value: "ditolak" },
    { label: "Terkirim", value: "terkirim" },
    { label: "Selesai", value: "selesai" },
];

const mediaPengirimanOptions = [
    { label: "Ekspedisi", value: "Ekspedisi" },
    { label: "Email", value: "Email" },
    { label: "Kurir", value: "Kurir" },
    { label: "Pos", value: "Pos" },
    { label: "Langsung", value: "Langsung" },
];

interface LetterTypeOption {
    jenis_surat_id: number;
    kode_jenis_surat: string;
    nama_jenis_surat: string;
    arah_surat: string;
}

const getUserId = (state: FormProps["state"]) =>
    state.session?.user?.IdPengguna || state.session?.user?.id || null;

const toDateValue = (value: string) => (value ? new Date(value) : null);
const toDateString = (value: Date | Date[] | null | undefined) =>
    value instanceof Date ? value.toISOString().slice(0, 10) : "";

const Form = ({ state, setState, formik, toast, getData }: FormProps) => {
    const [letterTypeOptions, setLetterTypeOptions] = useState<LetterTypeOption[]>([]);

    const getLetterTypeOptions = async () => {
        try {
            const res = await postData(apiEndpointLetterTypeData, {});
            setLetterTypeOptions(res.data?.data || []);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Jenis surat gagal diambil");
        }
    };

    const handleSave = async (input: initValue) => {
        setState((p) => ({ ...p, load: true }));

        try {
            const isEdit = Boolean(state.edit);
            const payload = mapOutgoingLetterPayload(
                {
                    ...input,
                    created_by: input.created_by || getUserId(state) as number | null,
                    updated_by: getUserId(state) as number | null,
                },
                isEdit
            );

            const response = isEdit
                ? await putData(`${apiEndpointUpdate}/${input.id_surat_keluar}`, payload)
                : await postData(apiEndpointCreate, payload);

            showSuccess(toast, response.data?.message || "Surat keluar berhasil disimpan");
            formik.resetForm();
            setState((p) => ({
                ...p,
                add: false,
                edit: false,
                detail: false,
                detailData: null,
                selectedLetters: [],
            }));
            await getData(apiEndpointGet);
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || "Surat keluar gagal disimpan");
        } finally {
            setState((p) => ({ ...p, load: false, submittedData: null }));
        }
    };

    const isFormFieldInvalid = (name: keyof initValue) =>
        Boolean(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name: keyof initValue) =>
        isFormFieldInvalid(name) ? (
            <small className="p-error flex align-items-center gap-1 mt-1">
                <i className="pi pi-exclamation-circle text-xs" />
                {formik.errors[name] as string}
            </small>
        ) : (
            <small className="p-error">&nbsp;</small>
        );

    useEffect(() => {
        if (state.submittedData) handleSave(state.submittedData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.submittedData]);

    useEffect(() => {
        getLetterTypeOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Dialog
            visible={state.add || state.edit}
            header={
                <div className="flex align-items-center gap-2">
                    <i className={`pi ${state.edit ? "pi-pencil" : "pi-send"} text-primary`} />
                    <span className="font-bold text-900">
                        {state.edit ? "Edit Surat Keluar" : "Tambah Surat Keluar"}
                    </span>
                </div>
            }
            modal
            style={{ width: "58rem", maxWidth: "95vw" }}
            onHide={() => {
                setState((p) => ({ ...p, add: false, edit: false }));
                formik.resetForm();
            }}
            pt={{ header: { className: "border-bottom-1 surface-border pb-3" } }}
        >
            <form onSubmit={formik.handleSubmit} className="flex flex-column gap-1 pt-3 text-sm">
                <div className="grid">
                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="nomor_agenda" className="font-semibold text-900">
                            Nomor Agenda {state.edit && <span className="text-red-500">*</span>}
                        </label>
                        <InputText
                            id="nomor_agenda"
                            className={`w-full ${isFormFieldInvalid("nomor_agenda") ? "p-invalid" : ""}`}
                            value={state.edit ? formik.values.nomor_agenda : "Otomatis saat disimpan"}
                            onChange={(e) => {
                                if (state.edit) formik.setFieldValue("nomor_agenda", e.target.value);
                            }}
                            disabled={!state.edit}
                        />
                        {getFormErrorMessage("nomor_agenda")}
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="nomor_surat" className="font-semibold text-900">
                            Nomor Surat <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="nomor_surat"
                            className={`w-full ${isFormFieldInvalid("nomor_surat") ? "p-invalid" : ""}`}
                            value={formik.values.nomor_surat}
                            onChange={(e) => formik.setFieldValue("nomor_surat", e.target.value)}
                            onBlur={() => formik.setFieldTouched("nomor_surat", true)}
                            placeholder="Contoh: 001/SK/VII/2026"
                        />
                        {getFormErrorMessage("nomor_surat")}
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="tanggal_surat" className="font-semibold text-900">
                            Tanggal Surat <span className="text-red-500">*</span>
                        </label>
                        <Calendar
                            id="tanggal_surat"
                            className={`w-full ${isFormFieldInvalid("tanggal_surat") ? "p-invalid" : ""}`}
                            value={toDateValue(formik.values.tanggal_surat)}
                            onChange={(e) => formik.setFieldValue("tanggal_surat", toDateString(e.value))}
                            onBlur={() => formik.setFieldTouched("tanggal_surat", true)}
                            dateFormat="yy-mm-dd"
                            showIcon
                            placeholder="Pilih tanggal surat"
                        />
                        {getFormErrorMessage("tanggal_surat")}
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="tanggal_kirim" className="font-semibold text-900">Tanggal Kirim</label>
                        <Calendar
                            id="tanggal_kirim"
                            className="w-full"
                            value={toDateValue(formik.values.tanggal_kirim)}
                            onChange={(e) => formik.setFieldValue("tanggal_kirim", toDateString(e.value))}
                            dateFormat="yy-mm-dd"
                            showIcon
                            placeholder="Pilih tanggal kirim"
                        />
                        <small className="p-error">&nbsp;</small>
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="id_jenis_surat" className="font-semibold text-900">
                            Jenis Surat <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="id_jenis_surat"
                            className={`w-full ${isFormFieldInvalid("id_jenis_surat") ? "p-invalid" : ""}`}
                            value={formik.values.id_jenis_surat}
                            options={letterTypeOptions}
                            optionLabel="nama_jenis_surat"
                            optionValue="jenis_surat_id"
                            onChange={(e) => formik.setFieldValue("id_jenis_surat", e.value)}
                            onBlur={() => formik.setFieldTouched("id_jenis_surat", true)}
                            placeholder="Pilih jenis surat"
                            filter
                            showClear
                        />
                        {getFormErrorMessage("id_jenis_surat")}
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="status" className="font-semibold text-900">Status</label>
                        <Dropdown
                            id="status"
                            className="w-full"
                            value={formik.values.status}
                            options={statusOptions}
                            onChange={(e) => formik.setFieldValue("status", e.value)}
                            placeholder="Pilih status"
                        />
                        {getFormErrorMessage("status")}
                    </div>

                    <div className="col-12 flex flex-column gap-1 mb-2">
                        <label htmlFor="perihal" className="font-semibold text-900">
                            Perihal <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="perihal"
                            className={`w-full ${isFormFieldInvalid("perihal") ? "p-invalid" : ""}`}
                            value={formik.values.perihal}
                            onChange={(e) => formik.setFieldValue("perihal", e.target.value)}
                            onBlur={() => formik.setFieldTouched("perihal", true)}
                            placeholder="Perihal surat"
                        />
                        {getFormErrorMessage("perihal")}
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="tujuan" className="font-semibold text-900">
                            Tujuan <span className="text-red-500">*</span>
                        </label>
                        <InputText
                            id="tujuan"
                            className={`w-full ${isFormFieldInvalid("tujuan") ? "p-invalid" : ""}`}
                            value={formik.values.tujuan}
                            onChange={(e) => formik.setFieldValue("tujuan", e.target.value)}
                            onBlur={() => formik.setFieldTouched("tujuan", true)}
                            placeholder="Nama penerima"
                        />
                        {getFormErrorMessage("tujuan")}
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="instansi_tujuan" className="font-semibold text-900">Instansi Tujuan</label>
                        <InputText
                            id="instansi_tujuan"
                            className="w-full"
                            value={formik.values.instansi_tujuan}
                            onChange={(e) => formik.setFieldValue("instansi_tujuan", e.target.value)}
                            placeholder="Nama instansi tujuan"
                        />
                        <small className="p-error">&nbsp;</small>
                    </div>

                    <div className="col-12 md:col-6 flex flex-column gap-1 mb-2">
                        <label htmlFor="media_pengiriman" className="font-semibold text-900">Media Pengiriman</label>
                        <Dropdown
                            id="media_pengiriman"
                            className="w-full"
                            value={formik.values.media_pengiriman}
                            options={mediaPengirimanOptions}
                            onChange={(e) => formik.setFieldValue("media_pengiriman", e.value || "")}
                            placeholder="Pilih media pengiriman"
                            showClear
                        />
                        <small className="p-error">&nbsp;</small>
                    </div>
                </div>

                <Divider className="my-2" />

                <div className="flex justify-content-end gap-2">
                    <Button
                        type="button"
                        label="Batal"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        size="small"
                        onClick={() => {
                            setState((p) => ({ ...p, add: false, edit: false }));
                            formik.resetForm();
                        }}
                    />
                    <Button
                        type="submit"
                        label={state.edit ? "Simpan Perubahan" : "Simpan Surat"}
                        icon={state.edit ? "pi pi-check" : "pi pi-save"}
                        size="small"
                        loading={state.load}
                    />
                </div>
            </form>
        </Dialog>
    );
};

export default Form;
