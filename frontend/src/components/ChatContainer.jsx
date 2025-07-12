import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";



const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setMessages,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const { toggleLikeMessage } = useChatStore();

  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser._id);
    subscribeToMessages();

    socket.emit("join", {
      userId: authUser._id,
      receiverId: selectedUser._id,
    });

    socket.on("typing", (data) => {
      if (data.senderId === selectedUser._id) {
        setIsTyping(true);
        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      unsubscribeFromMessages();
      socket.off("typing");
    };
  }, [selectedUser?._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleLike = (messageId) => {
  toggleLikeMessage(messageId); // No need for try/catch here
};

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>

            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col group relative max-w-[80%]">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              <div className="flex items-center justify-between">
                {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

                <button
                  onClick={() => handleLike(message._id)}
                  className={`ml-2 transition-opacity ${
                    message.likes.includes(authUser._id)
                      ? "opacity-100 text-rose-500"
                      : "opacity-0 group-hover:opacity-100 text-zinc-400"
                  }`}
                >
                  <Heart
                    size={16}
                    fill={message.likes.includes(authUser._id) ? "red" : "none"}
                    stroke={message.likes.includes(authUser._id) ? "red" : "currentColor"}
                  />
                </button>
              </div>

              {message.likes.length > 0 && (
                <span className="text-xs mt-1 text-rose-500">{message.likes.length} like{message.likes.length > 1 ? "s" : ""}</span>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-bubble bg-base-300 animate-pulse">
              Typing...
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
