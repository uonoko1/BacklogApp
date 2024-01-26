import axios from 'axios';

axios.defaults.baseURL = `${process.env.REACT_APP_API_URL}/api/`;
axios.defaults.withCredentials = true;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalConfig = error.config;
        if (
            error.response.status === 401 &&
            originalConfig.url === '/auth/refresh'
        ) {
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            await axios.get('/auth/refresh');
            return await axios(originalConfig);
        }
        return Promise.reject(error);
    }
);
export default axios;