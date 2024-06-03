const { hashPassword, comparePassword } = require("../utils/bcrypt");

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    console.log("hashed password ", hashedPassword);
    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error registering user");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // const match = await comparePassword(password, user.password);
    // if (match) {
    return res.status(200).send("Login successful");
    // } else {
    //   return res.status(400).send("Invalid email or password");
    // }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error logging in user");
  }
};

module.exports = { register, login };
