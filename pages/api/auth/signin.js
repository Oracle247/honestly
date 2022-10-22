const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import getConfig from 'next/config';
import { connect } from "../../../utils/connection";


import { apiHandler } from 'helpers/api';

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

        const userRecord = await User.findOne({ username });
        if(!userRecord) throw new Error("User not registered");

        const validPassword = await bcrypt.compare(password, userRecord.password);
        if(!validPassword) throw new Error("Invalid password");

        const tokens = generateTokens(userRecord);
        const {accessToken, refreshToken} = tokens;
  
        const user = userRecord.toObject();
        Reflect.deleteProperty(user, "password");

        return res.status(200).json({ user, accessToken, refreshToken });
      } catch (error){
        catcher(error);
      }
    },
    
  };

  // Check if there is a response for the particular method, if so invoke it, if not response with an error
  const response = handleCase[method];
  if (response) await response(req, res);
  else res.status(400).json({ error: "No Response for This Request" });
}

export default handler;