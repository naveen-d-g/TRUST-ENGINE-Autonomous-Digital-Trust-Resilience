
import axios from 'axios';

const SIM_API_URL = "http://localhost:5000/api/v1/sim";

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.access_token ? { Authorization: `Bearer ${user.access_token}` } : {};
};

const SimulationService = {
    startSimulation: async () => {
        try {
            const response = await axios.post(`${SIM_API_URL}/start`, {}, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to start simulation", error);
            throw error;
        }
    },

    recordEvent: async (simulationId, eventType, metadata = {}) => {
        try {
            const response = await axios.post(`${SIM_API_URL}/event`, {
                simulation_id: simulationId,
                event_type: eventType,
                features: metadata
            }, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to record event", error);
            throw error;
        }
    },

    endSimulation: async (simulationId) => {
        try {
            const response = await axios.post(`${SIM_API_URL}/end`, {
                simulation_id: simulationId
            }, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to end simulation", error);
            throw error;
        }
    },

    getSimulation: async (simulationId) => {
        try {
            const response = await axios.get(`${SIM_API_URL}/${simulationId}`, { headers: getAuthHeaders() });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch simulation", error);
            throw error;
        }
    }
};

export default SimulationService;
