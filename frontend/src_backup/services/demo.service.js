import axios from 'axios';

const DEMO_API_URL = "http://localhost:5000/api/v1/demo";

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.access_token ? { Authorization: `Bearer ${user.access_token}` } : {};
};

const DemoService = {
    startDemo: async () => {
        try {
            const response = await axios.post(`${DEMO_API_URL}/start`, {}, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to start demo", error);
            throw error;
        }
    },

    recordEvent: async (demoId, eventType, metadata = {}) => {
        try {
            const response = await axios.post(`${DEMO_API_URL}/event`, {
                demo_session_id: demoId,
                event_type: eventType,
                features: metadata
            }, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to record event", error);
            throw error;
        }
    },

    endDemo: async (demoId) => {
        try {
            const response = await axios.post(`${DEMO_API_URL}/end`, {
                demo_session_id: demoId
            }, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to end demo", error);
            throw error;
        }
    },

    // Admin/Analyst only
    getAllDemoSessions: async (limit = 20, offset = 0) => {
        try {
            const response = await axios.get(`${DEMO_API_URL}/sessions`, { 
                headers: getAuthHeaders(),
                params: { limit, offset }
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch demo sessions", error);
            throw error;
        }
    },
    
    getDemoDetails: async (demoId) => {
        try {
            const response = await axios.get(`${DEMO_API_URL}/${demoId}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch demo details", error);
            throw error;
        }
    }
};

export default DemoService;
