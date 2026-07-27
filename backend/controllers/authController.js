import bcrypt from "bcryptjs";
import { generateTokenForUser, generateTemporaryToken } from "../utils/auth.js";
import User from "../models/user.js";

export async function handleUserLogin(req, res) {
  const { memberId, password } = req.body;

  try {
    if (!memberId || !password) {
      return res.status(400).json({
        message: "Member Id and Password are required",
      });
    }
    const user = await User.findOne({ memberId });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials. User does not exist",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({
        message:
          "This account has been deactivated. Contact Admin for further details.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid Password",
      });
    }

    if (user.isFirstLogin) {
      const tempToken = generateTemporaryToken(user);
      return res
        .cookie("token", tempToken, {
          httpOnly: true,
          sameSite: "none",
          secure: true,
        })
        .status(200)
        .json({
          message: "First Login. Password reset required.",
          redirectToReset: true,
        });
    }

    //Token
    const token = await generateTokenForUser(user);

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .json({
        message: "Login successful!",
        user: {
          id: user._id,
          memberId: user.memberId,
          name: user.name,
          role: user.role,
        },
      });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
}

export async function handleForcedPasswordReset(req, res) {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.trim() === "") {
    return res.status(400).json({
      message: "New Password is required.",
    });
  }
  if (newPassword.length < 8 || newPassword.length > 13) {
    return res
      .status(400)
      .json({ message: "Password must be between 8-13 characters." });
  }

  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.isFirstLogin) {
      return res
        .status(400)
        .json({ message: "Password reset is not required for this account." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isFirstLogin = false;

    await user.save();

    return res.status(200).json({
      message: "Password updated successfully. Account is now active.",
    });
  } catch (error) {
    console.error("Forced reset database error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -_id -isActive -currentBorrowedBooks -createdAt -updatedAt -__v",
    );
    if (!user) {
      return res.status(404).json({ user: null });
    }
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function handleUserLogout(req, res) {
  return res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json({
      message: "Logged out successfully!",
    });
}
