import express from "express";
import path from "path";
import cors from "cors";
import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import { stringToHash, varifyHash } from "bcrypt-inzi";
const SECRET = process.env.SECRET || "topsecret";
const app = express();
const port = process.env.PORT || 5001;
const MongoDBURI =
  process.env.MongoDBURI ||
  "mongodb+srv://abdulrehman1239091:abdul123@cluster0.lux4z9y.mongodb.net/test?retryWrites=true&w=majority";

app.use(
  cors({
    origin: ["http://localhost:3000", "*"],
    credentials: true,
    origin: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const todoUsers = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

let todoSchema = new mongoose.Schema({
  todo: { type: String, required: true },
  owner: { type: mongoose.ObjectId, required: true },
});
const TodoUserModel = new mongoose.model("todoUser", todoUsers);
const todoModel = mongoose.model("todo", todoSchema);

app.post("/api/v1/signup", (req, res) => {
  let body = req.body;

  if (!body.name || !body.email || !body.password) {
    res.status(400).send(
      `required fields missing, request example: 
              {
                  "firstName": "John",
                  "lastName": "Doe",
                  "email": "abc@abc.com",
                  "password": "12345"
              }`
    );
    return;
  }

  req.body.email = req.body.email.toLowerCase();

  // check if user already exist // query email user
  TodoUserModel.findOne({ email: body.email }, (err, user) => {
    if (!err) {
      console.log("user: ", user);

      if (user) {
        // user already exist
        console.log("user already exist: ", user);
        res.status(400).send({
          message: "user already exist, please try a different email",
        });
        return;
      } else {
        // user not already exist

        // bcrypt hash
        stringToHash(body.password).then((hashString) => {
          TodoUserModel.create(
            {
              name: body.name,
              email: body.email,
              password: hashString,
            },
            (err, result) => {
              if (!err) {
                console.log("data saved: ", result);
                res.status(201).send({ message: "user is created" });
              } else {
                console.log("db error: ", err);
                res.status(500).send({ message: "internal server error" });
              }
            }
          );
        });
      }
    } else {
      console.log("db error: ", err);
      res.status(500).send({ message: "db error in query" });
      return;
    }
  });
});

app.post("/api/v1/login", (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase();

  if (!body.email || !body.password) {
    // null check - undefined, "", 0 , false, null , NaN
    res.status(400).send(
      `required fields missing, request example: 
              {
                  "email": "abc@abc.com",
                  "password": "12345"
              }`
    );
    return;
  }

  // check if user exist
  TodoUserModel.findOne(
    { email: body.email },
    "email password",
    (err, data) => {
      if (!err) {
        console.log("data: ", data);

        if (data) {
          // user found
          varifyHash(body.password, data.password).then((isMatched) => {
            console.log("isMatched: ", isMatched);

            if (isMatched) {
              const token = jwt.sign(
                {
                  _id: data._id,
                  email: data.email,
                  iat: Math.floor(Date.now() / 1000) - 30,
                  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
                },
                SECRET
              );

              console.log("token: ", token);

              res.cookie("Token", token, {
                maxAge: 86_400_000,
                httpOnly: true,
                sameSite: "none",
                secure: true,
              });

              res.send({
                message: "login successful",
                profile: {
                  email: data.email,
                  name: data.name,
                  _id: data._id,
                },
              });
              return;
            } else {
              console.log("password did not match");
              res.status(401).send({ message: "Incorrect email or password" });
              return;
            }
          });
        } else {
          // user not already exist
          console.log("user not found");
          res.status(401).send({ message: "Incorrect email or password" });
          return;
        }
      } else {
        console.log("db error: ", err);
        res.status(500).send({ message: "login failed, please try later" });
        return;
      }
    }
  );
});

app.use("/api/v1", (req, res, next) => {
  console.log("req.cookies: ", req.cookies);

  if (!req?.cookies?.Token) {
    res.status(401).send({
      message: "include http-only credentials with every request",
    });
    return;
  }

  jwt.verify(req.cookies.Token, SECRET, function (err, decodedData) {
    if (!err) {
      console.log("decodedData: ", decodedData);

      const nowDate = new Date().getTime() / 1000;

      if (decodedData.exp < nowDate) {
        res.status(401);
        res.cookie("Token", "", {
          maxAge: 1,
          httpOnly: true,
          sameSite: "none",
          secure: true,
        });
        res.send({ message: "token expired" });
      } else {
        console.log("token approved");

        req.body.token = decodedData;
        next();
      }
    } else {
      res.status(401).send("invalid token");
    }
  });
});

const gettingUser = async (req, res) => {
  let _id = "";
  if (req.params.id) {
    _id = req.params.id;
  } else {
    _id = req.body.token._id;
  }

  try {
    const user = await TodoUserModel.findOne(
      { _id: _id },
      "name email -_id"
    ).exec();
    if (!user) {
      res.status(404);
      res.send({});
      return;
    } else {
      res.status(200);
      res.send({ user });
    }
  } catch (error) {
    console.log("Error", error);
    res.status(500);
    res.send({
      message: "Error",
    });
  }
};

app.get("/api/v1/profile", gettingUser);

app.post("/api/v1/item", (req, res) => {
  const body = req.body;

  if (!body.todo) {
    res.status(404);
    res.send({
      message: "All Inputs Are Required",
    });
    return;
  }

  todoModel.create(
    {
      todo: body.todo,
      owner: new mongoose.Types.ObjectId(body.token._id),
    },
    (err, saved) => {
      if (!err) {
        console.log(saved);

        res.send({
          message: "Your item is saved",
        });
      } else {
        console.log("Not Saved");
        res.status(500).send({
          message: "server error",
        });
      }
    }
  );
});

app.get("/api/v1/items", async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.body.token._id);
  try {
    const data = await todoModel
      .find({ owner: userId })
      .select({ owner: 0 }) // projection
      .sort({ _id: -1 })
      .exec();

    res.send({
      message: "Got All Items",
      data: data,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send({
      message: "server error",
    });
  }
});

app.delete("/api/v1/item/:id", (req, res) => {
  const id = req.params.id;

  todoModel.deleteOne({ _id: id }, (err, deletedData) => {
    console.log("deleted: ", deletedData);
    if (!err) {
      if (deletedData.deletedCount !== 0) {
        res.send({
          message: "Item Deleted Successfully!",
        });
      } else {
        res.status(404);
        res.send({
          message: "Could't Find This Item",
        });
      }
    } else {
      res.status(500).send({
        message: "server error",
      });
    }
  });
});

app.put("/api/v1/item/:editId", async (req, res) => {
  const body = req.body;
  const id = req.params.editId;

  if (
    !body.todo
  ) {
    res.status(400).send({
      message: "required parameters missing",
    });
    return;
  }

  try {
    let data = await todoModel
      .findByIdAndUpdate(
        id,
        {
          todo:body.todo
        },
        { new: true }
      )
      .exec();

    console.log("updated: ", data);

    res.send({
      message: "Item modified successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "server error",
    });
  }
});

const __dirname = path.resolve();
app.use("/", express.static(path.join(__dirname, "./web/build")));
app.use("*", express.static(path.join(__dirname, "./web/build")));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

mongoose.connect(MongoDBURI);

mongoose.connection.on("connected", function () {
  console.log("Mongoose is connected");
});

mongoose.connection.on("disconnected", function () {
  console.log("Mongoose is disconnected");
  process.exit(1);
});

mongoose.connection.on("error", function (err) {
  console.log("Mongoose connection error: ", err);
  process.exit(1);
});

process.on("SIGINT", function () {
  console.log("app is terminating");
  mongoose.connection.close(function () {
    console.log("Mongoose default connection closed");
    process.exit(0);
  });
});
