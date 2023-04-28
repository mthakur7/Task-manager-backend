require("dotenv").config({ path: "./config.env" });
require("./db/conn");
const User = require("./models/users");
const express = require("express");
const app = express();
const port = 2300 || process.env.PORT;
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const bcrypt = require("bcryptjs");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/about", auth, (req, res) => {
  res.send(req.rootUser);
});

app.get("/getdata", auth, (req, res) => {
  res.send(req.rootUser);
});

app.post("/createTask", auth, async (req, res) => {
  try {
    const { name, task, date, priority } = req.body;
    if (!name || !task || !date || !priority) {
      return res.json({ error: "pls fill contact form" });
    }

    const userContact = await User.findOne({ _id: req.userID });

    if (userContact) {
      const userTask = await userContact.addTask(name, task, date, priority);
      await userContact.save();
      res.status(201).json({ task: "task successully" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/delTask", auth, async (req, res) => {
  try {
    const userContact = await User.findOne({ _id: req.userID });

    if (userContact) {
      const del = await userContact.delTask(req.body.id);
      await userContact.save();
      res.status(201).json({ task: "deleted successully" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/updateTask", auth, async (req, res) => {
  try {
    const { id, name, task, date, priority, completed } = req.body;

    const userContact = await User.findOne({ _id: req.userID });

    if (userContact) {
      const del = await userContact.updateTask(
        id,
        name,
        task,
        date,
        priority,
        completed
      );
      await userContact.save();
      res.status(201).json({ task: "updated successully" });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/logout", auth, async (req, res) => {
  try {
    req.rootUser.tokens = [];

    res.clearCookie("jwt", { path: "/" });

    await req.rootUser.save();
    res.status(200).send("user logged out");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmpassword, gender } = req.body;
    if (!name || !email || !password || !confirmpassword || !gender) {
      return res.status(422).json({ erorr: "pls fill the form" });
    }

    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "user already exists" });
    } else {
      if (password === confirmpassword) {
        const user = new User({
          name: name,
          email: email,
          password: password,
          confirmpassword: confirmpassword,
          gender: gender,
        });

        const token = await user.generateAuthToken();

        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 600000),
          httpOnly: true,
        });

        const userData = await user.save();

        res.status(201).json({ task: "user registered" });
      } else {
        res.status(422).json({ task: "password doesn't match" });
      }
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "pls fill details" });
    }

    const userExist = await User.findOne({ email: email });
    if (!userExist) {
      res.status(400).json({ error: "user doesn't exist" });
    } else {
      const isMatch = await bcrypt.compare(password, userExist.password);

      const token = await userExist.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 600000),
        httpOnly: true,
      });

      if (isMatch) {
        res.status(201).json({ task: "user loggedin" });
      } else {
        res.status(400).json({ error: "invalid password" });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`app started at ${port}`);
});
