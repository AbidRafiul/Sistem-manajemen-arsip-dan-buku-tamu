'use client';

import PreviewCustom from '@/app/components/print_components/previewCustom';
import { PrintProps } from '../interfaces';
import { AddPageInfo } from '@/lib/tools/printTools/accPdf';
import { CustomTableParams } from '@/types/print-tools';
import autoTable from 'jspdf-autotable';

const Print = ({ state, setState, formik, getData, toast, dataRekap, setDataRekap }: PrintProps) => {
    const handleCustomTable = async ({ doc, marginTopInMm = 10, marginLeftInMm = 10, marginRightInMm = 10, marginBottomInMm = 10 }: CustomTableParams) => {
        // Left margin
        const pageWidth = doc.internal.pageSize.width;
        let y = marginTopInMm;
        const left = marginLeftInMm;
        const lineHeight = 6;

        const nama_pengguna = state.session?.user.nama_pengguna || '';
        if (!Array.isArray(dataRekap.data) || dataRekap.data.length === 0) return;

        const vaData1 = dataRekap.data;

        const tableHead1 = Object.keys(vaData1[0]);
        const tableData1 = vaData1.map((row) => tableHead1.map((key) => row[key]));

        autoTable(doc, {
            startY: 45 + y,
            head: [tableHead1],
            body: tableData1,
            theme: 'plain',
            margin: {
                top: marginTopInMm,
                left: marginLeftInMm,
                right: marginRightInMm,
                bottom: marginBottomInMm + 10
            },
            styles: {
                lineColor: [0, 0, 0],
                lineWidth: 0.1,
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontSize: 8
            },
            columnStyles: {
                ...dataRekap?.columnStyles
            },
            headStyles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center'
            },
            didDrawPage: () => {
                AddPageInfo({ doc, nama_pengguna, marginRightInMm });
            }
        });

        const finalY = doc.previousAutoTable?.finalY || y;
        y = finalY - 100;
        return y;
    };

    return (
        <>
            <PreviewCustom dataRekap={dataRekap} setDataRekap={setDataRekap} toast={toast} handleCustomTable={handleCustomTable} pdfOnly={true} />
        </>
    );
};

export default Print;
