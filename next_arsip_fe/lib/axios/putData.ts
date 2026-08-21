import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_DIR_PATH || '/api/interceptor';

const Axios = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

Axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        return Promise.reject(error);
    }
);

async function putData(endpoint: string, data = {}, customHeader = {}) {
    try {
        let userTz = "Asia/Jakarta";
        try {
            userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (e) {
            console.error("Failed to get timezone", e);
        }

        const mergedCustomHeaders = {
            'X-Level': '1',
            'x-timezone': userTz,
            ...customHeader,
        };

        const defaultHeader = {
            'X-ENDPOINT': endpoint,
            'x-custom-header': JSON.stringify(mergedCustomHeaders),
        };

        const response = await Axios.put('', data, { headers: defaultHeader });

        return response;
    } catch (error: any) {
        throw error;
    }
}

export default putData;
