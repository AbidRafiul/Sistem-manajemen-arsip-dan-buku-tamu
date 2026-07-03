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

async function deleteData(endpoint: string, customHeader = {}) {
    try {
        const mergedCustomHeaders = {
            'X-Level': '1',
            ...customHeader,
        };

        const defaultHeader = {
            'X-ENDPOINT': endpoint,
            'x-custom-header': JSON.stringify(mergedCustomHeaders),
        };

        const response = await Axios.delete('', { headers: defaultHeader });

        return response;
    } catch (error: any) {
        throw error;
    }
}

export default deleteData;
