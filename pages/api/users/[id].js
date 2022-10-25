import { connect } from "../../../utils/connection";

const handler = async (req, res) => {
  //capture request method, we type it as a key of ResponseFunc to reduce typing later
  const method = req.method;

  //function for catch errors
  const catcher = (error, status = 400) => { 
    res.status(status).send({error});
  }

  // Potential Responses
  const handleCase = {
    // RESPONSE FOR GET REQUESTS
    GET: async (req, res) => {
      try{
        const { User, Message } = await connect(); // connect to database
        const { id } = req.query;

        console.log("entered: ", id)

        const userRecord = await User.findOne({_id: id})
        if(!userRecord) throw new Error("user not found")

        const totalMessages = await Message.estimatedDocumentCount({_userId: id})

        const user = userRecord.toObject();
        Reflect.deleteProperty(user, "password");
        Reflect.deleteProperty(user, "__v");

        const userDetails = {
          ...user,
          totalMessages
        }

        return res.status(200).json({userDetails});
      }catch(error){
        console.log('error: ', error);
        catcher(error.message);
      }
    },
  };

  // Check if there is a response for the particular method, if so invoke it, if not response with an error
  const response = handleCase[method];
  if (response) await response(req, res);
  else res.status(400).json({ error: "No Response for This Request" });
};

export default handler;