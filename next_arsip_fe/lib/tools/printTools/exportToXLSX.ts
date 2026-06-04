import { XLSXProps } from "@/types/print-tools";
import * as XLSX from "xlsx";

export const exportToXLSX = <T>({
    data, fileName, removeFields = ["File" as keyof T]
}: XLSXProps<T>): void => {
    try {
        if (!data || data.length === 0) {
            console.log("Data kosong");
            return;
        }

        const cleanedData = data.map((row) => {
            const copy = { ...row };
            removeFields.forEach((f) => {
                delete copy[f];
            });
            return copy;
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(cleanedData);

        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, fileName);
    } catch (error) {
        console.log("Error XLSX : ", error)
    }
}