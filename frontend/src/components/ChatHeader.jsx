import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { authUser, onlineUsers, blockUser } = useAuthStore();

  const isBlocked =
    authUser?.blockedUsers?.includes(selectedUser._id) ||
    selectedUser?.blockedUsers?.includes(authUser._id);

  const youBlocked = authUser?.blockedUsers?.includes(selectedUser._id);
  const theyBlocked = selectedUser?.blockedUsers?.includes(authUser._id);

  const handleBlockToggle = async () => {
    await blockUser(selectedUser._id);
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        {/* Left side: user avatar and info */}
        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
            </div>
          </div>
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
            {(isBlocked || theyBlocked) && (
              <div className="text-xs text-red-500 mt-0.5">
                {isBlocked
                  ? "You have blocked this user"
                  : "You are blocked by this user"}
              </div>
            )}
          </div>
        </div>

        {/* Right side: block/unblock button + close */}
        <div className="flex items-center gap-2">
          {!theyBlocked && (
            <button
              className="btn btn-xs btn-outline"
              onClick={handleBlockToggle}
            >
              {isBlocked ? "Unblock" : "Block"}
            </button>
          )}

          <button onClick={() => setSelectedUser(null)}>
            <X />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
