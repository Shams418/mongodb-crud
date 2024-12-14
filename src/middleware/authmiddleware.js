import jwt from "jsonwebtoken";
import { appConfig } from "../../consts.js";
import { User } from "../models/authmodel.js";
export const useAuth = async (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(401).json({ message: "token tapilmadi" });
  const access_token = req.headers.authorization;
  if (!access_token.startsWith("Bearer "))
    return res.json("bearer token daxil et");
  const token = access_token.split(" ")[1];
  if (!token) return res.status(400).json("token yoxdur");
  try {
    const jwtResult = jwt.verify(token, appConfig.jwt_secret);
    const user = await User.findById(jwtResult.sub).select("_id email fullname verify_code");
    if (!user) return res.json("user tapilmadi");
    req.user = user;
    console.log(req.user);

    next();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
""