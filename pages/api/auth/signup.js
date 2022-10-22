const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import getConfig from 'next/config';
import { connect } from "../../../utils/connection";

const { serverRuntimeConfig } = getConfig();

const handler = async (req, res) => {
  const method = req.method;
  const catcher = (error, status = 400) => { 
    res.status(status).send({error});
  }

  const generateTokens = (user) =>{
    try {
      console.log(`Generate Access Token: User ID ${user._id}`);
      const accessToken = jwt.sign(
        {
          uid: user._id,
          name: user.name,
        },
        serverRuntimeConfig.secret,
        {
          expiresIn: "50m",
        }
      );

      console.log(`Generate Refresh Token: User ID ${user._id}`);
      const refreshToken = jwt.sign({ id: user._id }, serverRuntimeConfig.secret, {
        expiresIn: "4w",
      });
      return { accessToken, refreshToken };
    } catch ({ message }) {
      throw new Error(`500---${message}`);
    }
  }

  // Potential Responses
  const handleCase = {
    // RESPONSE POST REQUESTS
    POST: async (req, res) => {
      try{
        const { User } = await connect(); // connect to database
        let { password, username } = req.body;
        username = username.toLowerCase()

        const saltRounds = 10;

        const hashedPassword = await bcrypt.hash(
          password,
          saltRounds
        );

        const userRecord = await User.findOne({username});
        if(userRecord) throw new Error("User already registered");

        const newUser = await User.create({
          username,
          password: hashedPassword,
        });

        const token = generateTokens(newUser);
        const {accessToken, refreshToken} = token;

        if (!newUser) {
          throw new Error("User cannot be created");
        }

        const user = newUser.toObject();
        Reflect.deleteProperty(user, "password");

        // return { user, token };
        console.log("User created", user);
        return res.status(200).json({ user, accessToken, refreshToken });
      } catch (error) {
        catcher(error.message, 409);
      }
    },
    
  };

  // Check if there is a response for the particular method, if so invoke it, if not response with an error
  const response = handleCase[method];
  if (response) await response(req, res);
  else res.status(400).json({ error: "No Response for This Request" });
}

export default handler;