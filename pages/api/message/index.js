import { connect } from "../../../utils/connection";

const handler = async (req, res) => {
  //capture request method, we type it as a key of ResponseFunc to reduce typing later
  const method = req.method;

  //function for catch errors
  const catcher = (error) => res.status(400).json({ error });

  // Potential Responses
  const handleCase = {
    // RESPONSE FOR GET REQUESTS
    GET: async (req, res) => {
      // return res.status(200).json("Users");
      // console.log("no na here");
      const { Message } = await connect(); // connect to database
      Promise.all([
        Message.find({})
          .sort([["date", -1]])
          .limit(20),
        Message.countDocuments(),
      ])
        .then((result) => {
          console.log(result[1]);
          return res.status(200).json(result);
        }) // return Users
        .catch(catcher); // catch errorserrx
    },

    // RESPONSE POST REQUESTS
    POST: async (req, res) => {
      const { Message, User } = await connect(); // connect to database
      let { message, username } = req.body;
      username = username.toLowerCase()

      const user = await User.findOne({username: username});
      if(!user) catcher({error: "user not found"});

      const details = {
        message,
        _userID: user._id
      } 

			const newMessage = new Message(details);
      await newMessage
        .save()
        .then(async (message) => {
          res.status(200).json(message);
        })
        .catch(catcher);

      
      // res.json(await User.create(req.body).catch(catcher))
    },
    
  };

  // Check if there is a response for the particular method, if so invoke it, if not response with an error
  const response = handleCase[method];
  if (response) await response(req, res);
  else res.status(400).json({ error: "No Response for This Request" });
};

export default handler;