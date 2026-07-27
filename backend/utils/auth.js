import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function generateTemporaryToken(user) {
  const payload = {
    id: user._id,
    isTemporary: true,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "10m" });
}

export function generateTokenForUser(user) {
  const payload = {
    id: user._id,
    role: user.role,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  return token;
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
