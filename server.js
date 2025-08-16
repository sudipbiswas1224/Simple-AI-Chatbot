require('dotenv').config()
const app = require('./src/app')
const { createServer } = require("http");
const { Server } = require("socket.io");
const { generateResponse } = require('./src/service/ai.service');



const httpServer = createServer(app);
const io = new Server(httpServer);


//the server can be connected through socket.io also as well as HTTP

/* 
--this is event based communication
--two types of events -> in-built events(only two events-> 'connection' and 'disconnect') and custom events
--this code means -> when a connection event is performed in the server then run this
*/


//inbluilt events
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on('disconnect', () => {
    console.log("A user disconnected")
  })



  //custom events
  socket.on('message', (data) => {
    console.log(data);
  })

  socket.on("aimessage",async (data)=>{
    console.log("Received AI message:",data.prompt);
    const response = await generateResponse(data.prompt);
    socket.emit('ai-message-response', {response});
    console.log("AI reponse",response);
  })
});


/* 
.on means that we are listening for an event
.emit means that we are sending an event
*/







/* 
io -> means server
socket -> single user 
*/

httpServer.listen(3000, () => {
  console.log("Server is running on port 3000");
})


