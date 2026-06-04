import { MenuModel } from "@/types";
import { Toast } from "primereact/toast";
import { RefObject } from "react";


const showSuccess = (toast: RefObject<Toast>, detail: string) => {
    toast?.current?.show({ severity: "success", summary: "Success", detail: detail, life: 3000 });
};

const showError = (toast: RefObject<Toast>, detail: string) => {
    toast?.current?.show({ severity: "warn", summary: "Warning", detail: detail, life: 3000 });
};

const findMatchingItem = (menuData: Array<MenuModel>, url: string) => {
    for (const item of menuData) {
        if (item.to && new RegExp(`^${item.to}(/|$)`).test(url)) {
            return true;
        }
        if (item.items) {
            if (findMatchingItem(item.items, url)) return true;
        }
    }
    return false;
}

const findToValuesRecursive = (data: Array<MenuModel>, searchToValue: string) => {
    const matching = [] as Array<MenuModel>;

    function search(items: Array<MenuModel>) {
        for (const item of items) {
            if (item.to === searchToValue) matching.push(item);
            if (item.items) search(item.items);
        }
    }

    search(data);
    return matching;
}




export { showSuccess, showError, findMatchingItem, findToValuesRecursive }