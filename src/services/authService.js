import api from "./api";

// Refresh token yordamida yangi access token olish
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    throw new Error("Refresh token topilmadi!");
  }

  try {
    const response = await api.post("/refresh", { refreshToken });
    // Handle both possible response field names for compatibility
    const newAccessToken = response.data.access || response.data.accessToken;
    if (!newAccessToken) {
      throw new Error("Access token not found in refresh response");
    }
    localStorage.setItem("accessToken", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    throw new Error("Refresh token bilan yangilashda xato!");
  }
};