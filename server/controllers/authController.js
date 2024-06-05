const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { hashPassword, comparePassword } = require("../utils/bcrypt");

const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await hashPassword(password);
    console.log("hashed password ", hashedPassword);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log("new user ", newUser);
    // const allUsers = await prisma.user.findMany();
    // console.log("all users ", allUsers);
    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error registering user");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        sentMessages: true,
        receivedMessages: true,
      },
    });
    if (user === null) {
      return res.status(400).send("Invalid email or password");
    }
    console.log("user ", user);
    const match = await comparePassword(password, user.password);
    if (match) {
      return res.status(200).send({ message: "Login successful", user: user });
    } else {
      return res.status(400).send("Invalid email or password");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error logging in user");
  }
};

module.exports = { register, login };
