'use client'

import React, { useState, useRef } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { useRouter } from "next/navigation";
import getData from "@/lib/axios/getData";
import { showError } from "@/lib/tools/generalTools";
import {
    apiEndpointDocumentSearch,
    apiEndpointDocumentPreview
} from "../components/endpoints";
import { SearchResultData } from "../components/interfaces";
import SearchResult from "./components/display/searchResult";

const SearchPage = () => {
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const [query, setQuery] = useState('');
    const [mode, setMode] = useState<'all' | 'metadata' | 'content'>('all');
    const [load, setLoad] = useState(false);
    const [results, setResults] = useState<SearchResultData[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    // Preview state
    const [previewUrl, setPreviewUrl] = useState('');
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const modeOptions: { id: 'all' | 'metadata' | 'content'; label: string; icon: string; desc: string }[] = [
        { id: 'all', label: 'Semua Mode', icon: 'pi-globe', desc: 'Metadata + Konten Teks OCR' },
        { id: 'metadata', label: 'Metadata Saja', icon: 'pi-tag', desc: 'Judul, Nomor, PIC & Kategori' },
        { id: 'content', label: 'Isi Dokumen (OCR)', icon: 'pi-file-word', desc: 'Khusus Pencarian Teks Berkas' }
    ];

    const quickKeywords = ['Kontrak', 'Vendor', 'SOP', 'Kerjasama', 'Laporan', 'Keuangan', 'PKS', 'SK'];

    const handleSearch = async (overrideQuery?: string, overrideMode?: 'all' | 'metadata' | 'content') => {
        const q = (overrideQuery !== undefined ? overrideQuery : query).trim();
        const m = overrideMode || mode;

        if (!q) return;

        setLoad(true);
        setHasSearched(true);
        try {
            const res = await getData(apiEndpointDocumentSearch, {
                q: q,
                mode: m
            });
            if (res.data?.status === 'success') {
                setResults(res.data.data || []);
            } else {
                showError(toast, res.data?.message || 'Gagal mencari dokumen');
            }
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal melakukan pencarian dokumen');
        } finally {
            setLoad(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    const handleFetchPreviewUrl = async (fileName: string) => {
        if (!fileName) {
            showError(toast, 'Berkas dokumen tidak tersedia');
            return;
        }
        setLoad(true);
        try {
            const res = await getData(apiEndpointDocumentPreview, { file_name: fileName });
            if (res.data?.status === 'success') {
                setPreviewUrl(res.data.preview_url);
                setIsPreviewVisible(true);
            } else {
                showError(toast, res.data?.message || 'Gagal mengambil URL preview');
            }
        } catch (error: any) {
            const e = error?.response?.data || error;
            showError(toast, e?.message || 'Gagal memproses pratinjau dokumen');
        } finally {
            setLoad(false);
        }
    };

    return (
        <>
            <Toast ref={toast} position="top-right" />

            {/* Top Navigation & Breadcrumb */}
            <div className="flex align-items-center justify-content-between mb-3">
                <Button
                    type="button"
                    icon="pi pi-arrow-left"
                    label="Kembali ke Daftar Arsip"
                    className="p-button-text p-button-secondary font-semibold p-0"
                    onClick={() => router.push('/edms/archive_document')}
                />
                <div className="flex align-items-center gap-2">
                    <Tag value="Enterprise Full-Text Search" severity="info" icon="pi pi-shield" />
                </div>
            </div>

            {/* Main Search Panel */}
            <div
                className="card p-4 md:p-5 mb-4 border-round-2xl shadow-2 surface-card border-1 border-gray-200"
                style={{
                    background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'
                }}
            >
                {/* Title & Description */}
                <div className="mb-4">
                    <div className="flex align-items-center gap-3 mb-2">
                        <div
                            className="flex align-items-center justify-content-center border-round-xl text-white shadow-2"
                            style={{
                                width: '3rem',
                                height: '3rem',
                                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                            }}
                        >
                            <i className="pi pi-search text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-900 m-0 tracking-tight">
                                Pencarian Dokumen & OCR Full-Text
                            </h2>
                            <p className="text-600 text-sm mt-1 mb-0">
                                Cari dokumen berdasarkan metadata, nomor, PIC, serta <span className="font-semibold text-blue-600">isi teks di dalam berkas PDF/Gambar Scan</span> secara real-time.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="flex flex-column gap-4">
                    {/* Search Input Field Container */}
                    <div
                        className="flex align-items-center p-2 border-round-xl border-1 surface-border bg-white shadow-1"
                        style={{ transition: 'all 0.2s ease-in-out' }}
                    >
                        <i className="pi pi-search text-xl text-400 ml-3 mr-2" />
                        <InputText
                            placeholder="Ketik kata kunci pencarian (Contoh: Kontrak Vendor ABC, Perjanjian Kerjasama, SOP 2026...)"
                            className="p-inputtext-lg border-none shadow-none text-900 font-medium w-full text-base"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ background: 'transparent' }}
                            autoFocus
                        />
                        {query && (
                            <Button
                                type="button"
                                icon="pi pi-times"
                                text
                                rounded
                                severity="secondary"
                                onClick={() => {
                                    setQuery('');
                                    setHasSearched(false);
                                    setResults([]);
                                }}
                                className="mr-2"
                            />
                        )}
                        <Button
                            type="submit"
                            label="Cari Dokumen"
                            icon="pi pi-search"
                            className="p-button-lg px-4 font-bold border-round-lg shadow-2"
                            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', border: 'none' }}
                            loading={load}
                        />
                    </div>

                    {/* Controls Row: Mode Selector + Quick Keywords */}
                    <div className="flex flex-column lg:flex-row align-align-items-center lg:align-items-center justify-content-between gap-4 pt-1">
                        {/* Scope Selector */}
                        <div className="flex flex-column gap-2 w-full lg:w-auto">
                            <span className="text-xs font-bold text-500 uppercase tracking-wider">
                                Mode Pencarian:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {modeOptions.map((opt) => {
                                    const isSelected = mode === opt.id;
                                    return (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => {
                                                setMode(opt.id);
                                                if (query.trim()) {
                                                    handleSearch(query, opt.id);
                                                }
                                            }}
                                            className={`flex align-items-center gap-2 px-3 py-2 border-round-lg cursor-pointer transition-all border-1 text-sm ${
                                                isSelected
                                                    ? 'bg-blue-50 border-blue-400 text-blue-700 font-bold shadow-1'
                                                    : 'bg-white border-gray-300 text-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <i className={`pi ${opt.icon} ${isSelected ? 'text-blue-600' : 'text-400'}`} />
                                            <span>{opt.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quick Keyword Pills */}
                        <div className="flex flex-column gap-2 w-full lg:w-auto">
                            <span className="text-xs font-bold text-500 uppercase tracking-wider">
                                Kata Kunci Cepat:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {quickKeywords.map((tag) => (
                                    <span
                                        key={tag}
                                        onClick={() => {
                                            setQuery(tag);
                                            handleSearch(tag, mode);
                                        }}
                                        className="px-3 py-1 border-round-3xl text-xs font-semibold text-700 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-all border-1 border-gray-200"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Results or Empty State */}
            {hasSearched ? (
                <div className="card p-4 md:p-5 border-round-2xl shadow-2 surface-card border-1 border-gray-200">
                    <SearchResult
                        results={results}
                        load={load}
                        onPreview={handleFetchPreviewUrl}
                    />
                </div>
            ) : (
                /* Initial Helpful Enterprise Workspace View */
                <div className="card p-6 border-round-2xl shadow-1 surface-card border-1 border-gray-200 text-center">
                    <div className="max-w-30rem mx-auto">
                        <div
                            className="inline-flex align-items-center justify-content-center border-round-circle mb-3 surface-100"
                            style={{ width: '4rem', height: '4rem' }}
                        >
                            <i className="pi pi-filter-fill text-2xl text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold text-900 mb-2">Pencarian Arsip Dokumen Cerdas</h3>
                        <p className="text-600 text-sm mb-4 leading-relaxed">
                            Masukkan kata kunci di atas untuk mencari seluruh metadata dokumen, klasifikasi retensi, maupun isi teks berkas yang telah diekstrak secara otomatis dengan teknologi OCR.
                        </p>

                        <div className="grid text-left surface-50 p-3 border-round-xl border-1 border-gray-200">
                            <div className="col-12 md:col-4 flex align-align-items-center gap-2">
                                <i className="pi pi-check-circle text-blue-600 mt-1" />
                                <div>
                                    <div className="font-bold text-xs text-800">OCR Automatic Parsing</div>
                                    <div className="text-xs text-500">PDF & Gambar Scan diekstrak otomatis</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4 flex align-align-items-center gap-2">
                                <i className="pi pi-check-circle text-blue-600 mt-1" />
                                <div>
                                    <div className="font-bold text-xs text-800">Multi-Tenant Scoping</div>
                                    <div className="text-xs text-500">Sesuai hak akses kantor terpilih</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-4 flex align-align-items-center gap-2">
                                <i className="pi pi-check-circle text-blue-600 mt-1" />
                                <div>
                                    <div className="font-bold text-xs text-800">Exact Match Snippet</div>
                                    <div className="text-xs text-500">Pratinjau potongan teks yang cocok</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Dialog */}
            <Dialog
                visible={isPreviewVisible}
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-file-pdf text-blue-600 text-xl" />
                        <span className="font-bold text-900">Pratinjau Berkas Dokumen</span>
                    </div>
                }
                modal
                style={{ width: '64rem', maxWidth: '95vw' }}
                onHide={() => {
                    setIsPreviewVisible(false);
                    setPreviewUrl('');
                }}
            >
                <div className="pt-2">
                    {previewUrl ? (
                        <iframe
                            src={previewUrl}
                            width="100%"
                            height="650px"
                            style={{ border: 'none', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                            title="Preview Dokumen"
                        />
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center py-6 text-color-secondary">
                            <i className="pi pi-spin pi-spinner text-4xl text-blue-600 mb-3" />
                            <span className="font-medium text-sm">Memuat berkas dokumen...</span>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default SearchPage;
