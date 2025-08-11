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

  const prevMessageCount = useRef(0);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      // Only scroll if a new message is added
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCount.current = messages.length;
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
        {messages.map((message) => {
          const isOwnMessage = message.senderId === authUser._id;
          const hasLiked = message.likes.includes(authUser._id);

          return (
            <div
              key={message._id}
              className={`chat ${isOwnMessage ? "chat-end" : "chat-start"} group`}
            >
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isOwnMessage
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

              <div className="flex items-end gap-2">
                {isOwnMessage && (
                  <button
                    onClick={() => handleLike(message._id)}
                    className={`transition-opacity ${
                      hasLiked
                        ? "opacity-100 text-rose-500"
                        : "opacity-0 group-hover:opacity-100 text-zinc-400"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={hasLiked ? "red" : "none"}
                      stroke={hasLiked ? "red" : "currentColor"}
                    />
                  </button>
                )}

                <div
                  className={`chat-bubble relative max-w-[80%] px-4 py-2 rounded-2xl shadow-md
                    ${isOwnMessage ? "bg-primary text-primary-content" : "bg-base-300 text-base-content"}
                  `}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-lg mb-2"
                    />
                  )}
                  {message.text && (
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  )}

                  {message.likes.length > 0 && (
                    <div className="absolute -bottom-3 -right-3">
                      <Heart size={12} fill="red" stroke="red" className="drop-shadow-sm" />
                    </div>
                  )}
                </div>

                {!isOwnMessage && (
                  <button
                    onClick={() => handleLike(message._id)}
                    className={`transition-opacity ${
                      hasLiked
                        ? "opacity-100 text-rose-500"
                        : "opacity-0 group-hover:opacity-100 text-zinc-400"
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={hasLiked ? "red" : "none"}
                      stroke={hasLiked ? "red" : "currentColor"}
                    />
                  </button>
                )}
              </div>
            </div>
          );
        })}


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
