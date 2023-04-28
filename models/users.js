const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    Unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  tasks: [
    {
      id: {
        type: Number,
      },
      name: {
        type: String,
      },

      task: {
        type: String,
      },
      date: {
        type: Date,
      },
      priority: {
        type: String,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.methods.generateAuthToken = async function () {
  try {
    console.log(this._id);

    const token = jwt.sign(
      { _id: this._id.toString() },
      process.env.SECRET_KEY
    );

    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (error) {
    res.send("the error part" + error);
    console.log("the error part" + error);
  }
};

userSchema.methods.addTask = async function (name, task, date, priority) {
  try {
    this.tasks = this.tasks.concat({
      name: name,
      task: task,
      date: date,
      priority: priority,
    });
    await this.save();
    return this.tasks;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.delTask = async function (id) {
  try {
    this.tasks = this.tasks.filter((ele) => {
      console.log("mongo", ele._id, "kk", id);
      return ele._id.toString() != id;
    });
    await this.save();
    return this.tasks;
  } catch (err) {
    console.log(err);
  }
};

userSchema.methods.updateTask = async function (
  id,
  name,
  task,
  date,
  priority,
  completed
) {
  try {
    let l = this.tasks.length;
    for (let x = 0; x < l; x++) {
      console.log(this.tasks[x]._id.toString(), ",,", id);
      if (this.tasks[x]._id.toString() == id) {
        this.tasks[x].name = name;
        this.tasks[x].task = task;
        this.tasks[x].date = date;
        this.tasks[x].priority = priority;
        this.tasks[x].completed = completed;
        console.log("uuuu", this.tasks[x]);
        break;
      }
    }

    await this.save();
    return this.tasks;
  } catch (err) {
    console.log(err);
  }
};

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = new mongoose.model("User", userSchema);
module.exports = User;
