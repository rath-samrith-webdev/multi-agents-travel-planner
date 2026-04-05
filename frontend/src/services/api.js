// This service represents the integration point for our FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api';

export const generateTrip = async (tripData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Unknown error from server.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating trip:", error);
    throw error;
  }
};

export const getTrip = async (tripId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching trip:", error);
    throw error;
  }
};

export const modifyPlanChat = async (tripId, message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/trips/chat?trip_id=${tripId}&message=${encodeURIComponent(message)}`, {
      method: 'POST',
    });
    return await response.json();
  } catch (error) {
    console.error("Error in chat modification:", error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
