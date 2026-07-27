import { verifyToken } from "../utils/auth.js";
import User from "../models/user.js";

export function checkForToken(req, res, next) {
  const token = req.cookies["token"];
  if (!token) return next();
  try {
    const userPayload = verifyToken(token);
    req.user = userPayload;
    next();
  } catch (error) {
    next();
  }
}

export function onlyGrantAccessTo(role) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (req.user.isTemporary) {
      return res.status(403).json({
        message: "Forbidden: Account Restricted.",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }
    next();
  };
}

export async function ensureAuthenticated(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const allowedFirstLoginPaths = ["/reset-password", "/me", "/logout"];
    const isAllowedPath = allowedFirstLoginPaths.some((p) =>
      req.path.endsWith(p),
    );

    if (user.isFirstLogin && !isAllowedPath) {
      return res.status(403).json({
        message: "Password reset required",
        isFirstLogin: true,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
