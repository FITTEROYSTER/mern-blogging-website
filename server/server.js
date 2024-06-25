import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import User from "./Schema/User.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import restart from "nodemon";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccountKey from "./mern--blogsite-firebase-adminsdk-1ve40-87276781eb.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";

const server = express();
let PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json());
server.use(cors());

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

//Checks for username in DB to see if exists.
const generateUsername = async (email) => {
  let username = email.split("@")[0];

  //Looks throught DB to see if username exists, if not, it return the first part of the email
  let isUsernameNotUniqe = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUsernameNotUniqe ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;

  //validating data from frontend
  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Full name must be atleast 3 letters long." });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Enter email" });
  }
  if (!emailRegex.test(email)) {
    return res.status(403).json({ error: "Incorrect email address" });
  }
  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password should be 6-20 letter, must contain a number, an uppercase, lowercase and special character.",
    });
  }
  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUsername(email);
    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });

    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u));
      })

      .catch((err) => {
        if (err.code == 11000) {
          return res.status(500).json({ error: "Email elaready exists" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "Email not found" });
      }
      bcrypt.compare(password, user.personal_info.password, (err, result) => {
        if (err) {
          return res
            .status(403)
            .json({ error: "Error occured while login, please try again" });
        }
        if (!result) {
          return res.status(403).json({ error: "incorrect password" });
        } else {
          return res.status(200).json(formatDatatoSend(user));
        }
      });
    })

    .catch((err) => {
      console.log(err);
      return res.status(403).json({ error: "Email not found" });
    });
});

server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;
  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { name, email, picture } = decodedUser;

      picture = picture.replace("s96-c", "s384-c");

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_into.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        // login
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without Google. Please login with password.",
          });
        } else {
          //sign up
          let username = await generateUsername(email);

          user = new User({
            personal_info: {
              fullname: name,
              email,
              profile_img: picture,
              username,
            },
            google_auth: true,
          });
          await user
            .save()
            .then((u) => {
              user = u;
            })
            .catch((err) => {
              return res.status(500).json({ error: err.message });
            });
        }
        return res.status(200).json(formatDatatoSend(user));
      }
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with Google. Try a different account.",
      });
    });
});

server.listen(PORT, () => {
  console.log(`listening on port ` + PORT);
});
