import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import select from "daisyui/components/select";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingStatus: {}, // { userId: true/false }

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // ✅ Listen for new incoming messages
    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    // ✅ Listen for typing indicator
    socket.on("typing", ({ senderId }) => {
      get().setTypingStatus(senderId, true);

      // Auto clear after 2 seconds
      setTimeout(() => {
        get().setTypingStatus(senderId, false);
      }, 2000);
    });

    socket.on("messageLiked", (updatedMessage) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        ),
      }));
    });
},


  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageLiked");
  },

  setTypingStatus: (userId, isTyping) =>
  set((state) => ({
    typingStatus: {
      ...state.typingStatus,
      [userId]: isTyping,
    },
  })),

  
  toggleLikeMessage: async (messageId) => {
  try {
    const res = await axiosInstance.patch(`/messages/like/${messageId}`);
    const updatedMessage = res.data;

    // Update message in the messages array
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      ),
    }));
  } catch (error) {
    console.error("Failed to like message:", error);
    toast.error("Failed to like message");
  }
}

,




  setSelectedUser: (selectedUser) => set({ selectedUser }),
  
}));