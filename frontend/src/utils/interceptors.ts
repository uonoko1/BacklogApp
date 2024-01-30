import axios from 'axios';

axios.defaults.baseURL = `${process.env.REACT_APP_API_URL}/api/`;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalConfig = error.config;
        const errorCode = error.response?.data?.code;
        if (
            errorCode === 'token_expired' &&
            originalConfig.url === '/auth/refresh'
        ) {
            return Promise.reject(error);
        }

        if (errorCode === 'token_expired' && !originalConfig._retry) {
            originalConfig._retry = true;
            await axios.get('/auth/refresh');
            return await axios(originalConfig);
        }
        return Promise.reject(error);
    }
);
export default axios;