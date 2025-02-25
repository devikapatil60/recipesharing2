const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log(" No authorization header");
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log(" Token missing in authorization header");
    return res.status(401).json({ message: "Access denied. No token found." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded); // Debugging
    req.user = decoded; //  This ensures req.user is set
    next();
  } catch (error) {
    console.log(" Invalid token:", error.message);
    res.status(400).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
