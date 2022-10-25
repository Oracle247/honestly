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
    POST: async (req, res) => {
      try{
        const { User, Message } = await connect(); // connect to database
        const { id } = req.query;
        const { message } = req.body;

        console.log("entered: ", id);

        const userRecord = await User.findOne({_id: id})
        if(!userRecord) throw new Error("user not found")

        const messageDetails = {
          message,
          _userId: id
        }

        const newMessage = new Message(messageDetails)
        await newMessage
          .save()
          .then( async (message) => {
            res.status(200).json({message: "message added successfully"})
          })
          .catch( async (error) => {
            catcher(error.message)
          });
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