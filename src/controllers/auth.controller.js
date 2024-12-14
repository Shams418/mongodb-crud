import Joi from "joi"; //istifadeci melumatlarinin validasiyasi üçüün
import bcrypt from "bcrypt"; ///hash emeliyyatini temin edir
import { User } from "../models/authmodel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"; //e-poçt göndermek üçün modul
import { appConfig } from "../../consts.js";
import crypto, { randomUUID } from "crypto";
import { error } from "console";
import moment from "moment";
import {v4 as uuidv4} from 'uuid'

const register = async (req, res, next) => {
  // 1. validation
  const validData = await Joi.object({
    fullname: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
    confirm_password: Joi.ref("password"),
  })
    .validateAsync(req.body, { abortEarly: false })
    .catch((err) => {
      console.log("err", err);
      const errorList = err.details.map((item) => item.message);
      return res.status(422).json({
        message: "Validasiya xetasi bash verdi!",
        error: errorList,
      });
    });

  const existsUser = await User.findOne({
    email: validData.email,
  });
  if (existsUser) {
    return res.json({
      message: `${validData.email} - sistemde movcuddur!`,
    });
  }

  // 2. hash password
  validData.password = await bcrypt.hash(validData.password, 10);

  // 3. complete register
  const newUser = await User.create(validData);
  res.status(201).json(newUser);
};

const login = async (req, res, next) => {
  // 1. validate
  const validData = await Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().min(6).max(16).required(),
  })
    .validateAsync(req.body, { abortEarly: false })
    .catch((err) => {
      return res.status(422).json({
        message: "Xeta bash verdi!",
        error: err.details.map((item) => item.message),
      });
    });

  // 2. find user
  const user = await User.findOne({
    email: validData.email,
  });
  if (!user) {
    return res.status(401).json({
      message: "Email ve ya shifre sehvdir!",
    });
  }

  // 3. Check password
  const isValidPassword = await bcrypt.compare(
    validData.password,
    user.password
  );
  if (!isValidPassword) {
    return res.status(401).json({
      message: "Email ve ya shifre sehvdir!",
    });
  }

  const jwt_payload = {
    sub: user._id,
  };

  // 4. create jwt_token
  const new_token = jwt.sign(jwt_payload, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "1d",
  });

  // //console.log(req.user);

  // jwt.verify("asdasdas", process.env.JWT_SECRET)

  res.json({
    access_token: new_token,
  });
};
const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: appConfig.email,
    pass: appConfig.email_pass,
  },
  secure: true,
});
const verifyEmail = async (req, res, next) => {
  const user = req.user;
  if(user.isVerifiedEmail) return res.json({message:" email is already verified"})
  const code = Math.floor(Math.random() * 600000);
  //  const codeExpiredIn = new Date(Date.now() + 5 * 60 * 100);
  const codeExpiredIn = moment().add(appConfig.verifyExpiredIN, "minute");

  user.verify_code = code;
  user.verifyExpiredIn = codeExpiredIn;
  await user.save();

  const mailData = {
    from: appConfig.email, // sender address
    to: user.email, // list of receivers
    subject: "Sending Email using Node.js",
    text: `Salam ${user.verify_code}`,
    ///html: `<b>kod : ${user.verify_code}</b><br> This is our first message sent with Nodemailer<br/>`,
  };
  //rabbit mq
  transporter.sendMail(mailData, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
      return res.status(500).json({
        message: error.message,
        error,
      });
    } else {
      console.log("Email sent: ", info);
      return res.json({
        message: `Check your email .It will expire in ${appConfig.verifyExpiredIN} minutes`,
      });
    }
  });
};
const checkVerifyCode = async (req, res, next) => {
 try {
    const validData = await Joi.object({
      code: Joi.length(6)
        .regex(/^[0-9]+$/)
        .required(),
    }).validateAsync(req.body, { abortEarly: false });

    const user = req.user;
    if (!verify_code)
      return res.status(404).json({
        message: "Veritification code is not found",
      });
    if (user.verifyExpiredIn < new Date())
      return res.status(404).json({
        message: "Veritification code is expired ",
      });

    if ((user.verify_code = Number(validData.code)))
      return res.status(400).json({
        message: "Veritificition code is incorrect",
      });

    user.isVerifiedEmail = true;
    user.verify_code = null;
    user.verifyExpiredIn = null;
    await user.save();
    return res.json({ message: "Code verified" });
  } catch (error) {
    console.error("Error:", error);
  }
  res.status(500).json({
    message: error.message,
    error,
  });
};
const forgetPass = async (req, res, next) => {
  try {
    const validData = await Joi.object({
      email: Joi.string().trim().email().required(),
    }).validate(req.body, { abortEarly: false });
    const user = await User.findOne(validData.email);
    if (!user) {
      return res.status(404).json({
        message: "user with this email does not exist",
      });
    }
    //create token
    const newtoken = uuidv4()
    const tokenExpiredIn = moment().add(appConfig.verifyExpiredIN,"minute")
    user.reset_token = newtoken
    user.tokenExpiredIN = tokenExpiredIn
    await user.save()
    //send email
    const reseturl = `${appConfig.clientBaseUrl}/verify?token=${newtoken}`
    const mailData = {
      from: appConfig.email, // sender address
      to: user.email, // list of receivers
      subject: "Sending Email using Node.js",
      text: `Salam ${reseturl}`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return res.status(500).json({ message: 'Error sending email', error });
      }
      return res.status(200).json({ message: 'Password reset email sent successfully.' });
  });

    } catch (err) {
      next
    }
};

export const AuthContoller = () => ({
  login,
  register,
  verifyEmail,
  checkVerifyCode,
  forgetPass,
});
