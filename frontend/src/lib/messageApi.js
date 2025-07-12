// lib/messageApi.js or api/messageApi.js
import { axiosInstance } from "../lib/axios";

export const toggleLikeMessage = async (messageId) => {
  const res = await axiosInstance.patch(`/messages/like/${messageId}`);
  return res.data;
};
