import React from 'react';
import { Tag } from 'primereact/tag';

const AppFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="layout-footer" aria-label="Footer Aplikasi">

            <div className="flex flex-column sm:flex-row justify-content-between align-items-center w-full gap-3 text-sm">

                {/* Brand & Copyright Info */}
                <div className="flex align-items-center gap-2 flex-wrap justify-content-center sm:justify-content-start">
                    <span className="font-semibold text-900" style={{ letterSpacing: '-0.01em' }}>
                        Arsipku
                    </span>
                    <span className="text-300 hidden xs:inline">|</span>
                    <span className="text-600 font-medium hidden sm:inline">
                        Sistem Manajemen Arsip &amp; Buku Tamu
                    </span>
                    <span className="text-400">&copy;</span>
                    <span className="text-500 font-medium">
                        {currentYear}
                    </span>
                    <span className="text-500 font-semibold text-xs tracking-wider uppercase" style={{ marginLeft: '100rem' }}>
                        v1.2.0
                    </span>
                </div>

                {/* Status Badges & Versioning */}
                {/* <div className="flex align-items-center gap-3">
                    <div className="flex align-items-center">
                        <Tag
                            value="Sistem Aktif"
                            severity="success"
                            rounded
                            icon="pi pi-check-circle"
                            style={{
                                background: 'rgba(34, 197, 94, 0.08)',
                                color: '#22C55E',
                                border: '1px solid rgba(34, 197, 94, 0.15)',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '0.2rem 0.6rem'
                            }}
                        />
                    </div>
                    <span className="text-300">|</span>
                    <span className="text-500 font-semibold text-xs tracking-wider uppercase">
                        v1.2.0
                    </span>
                </div> */}

            </div>
        </footer>
    );
};

export default AppFooter;

