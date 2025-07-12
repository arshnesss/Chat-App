import { getReceiverSocketId, io } from "../lib/socket.js"; // ✅ already used for messages
import User from "../models/user.model.js";

export const toggleBlockUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userIdToBlock } = req.params;

    console.log("🔁 Block request from:", currentUserId, "to block:", userIdToBlock);

    if (currentUserId.toString() === userIdToBlock) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      console.error("User not found:", currentUserId);
      return res.status(404).json({ message: "User not found" });
    }

    const isBlocked = currentUser.blockedUsers.includes(userIdToBlock);
    console.log("📦 Is already blocked:", isBlocked);

    if (isBlocked) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter(
        (id) => id.toString() !== userIdToBlock
      );
    } else {
      currentUser.blockedUsers.push(userIdToBlock);
    }

    await currentUser.save();
    console.log("✅ Blocked users after update:", currentUser.blockedUsers);

    res.status(200).json({ blockedUsers: currentUser.blockedUsers });
  } catch (error) {
    console.error("toggleBlockUser error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
