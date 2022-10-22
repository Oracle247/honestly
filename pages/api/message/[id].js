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
        Message.find({}, { certificate: 0 })
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
      const { Message } = await connect(); // connect to database

      let { tag, name, choice, secondChoice } = req.body;
      name = name.toLowerCase();
      
      // res.json(await User.create(req.body).catch(catcher))
    },
    
  };

  // Check if there is a response for the particular method, if so invoke it, if not response with an error
  const response = handleCase[method];
  if (response) await response(req, res);
  else res.status(400).json({ error: "No Response for This Request" });
};

export default handler;