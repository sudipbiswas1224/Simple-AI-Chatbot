require('dotenv').config()
const app = require('./src/app')
const { createServer } = require("http");
const { Server } = require("socket.io");
const { generateResponse } = require('./src/service/ai.service');
const cors = require('cors')



const httpServer = createServer(app);
const io = new Server(httpServer , {
  cors:{
    origin:'http://localhost:5173'
  }
});






//the server can be connected through socket.io also as well as HTTP

/* 
--this is event based communication
--two types of events -> in-built events(only two events-> 'connection' and 'disconnect') and custom events
--this code means -> when a connection event is performed in the server then run this
*/


//creating the chatHistory
const chatHistory = []

//inbluilt events
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on('disconnect', () => {
    console.log("A user disconnected")
  })



  //custom events
  

  //listening 
  socket.on("user-message", async (data) => {

    chatHistory.push({
      role: "user",
      parts: [{ text: data }]
    })
    // getting the user prompt
    console.log("Received AI message:", data);


    const response = await generateResponse(chatHistory);
    chatHistory.push({
      role: 'model',
      parts: [{ text: response }]
    })

    //sending
    socket.emit('ai-response', { response });
    console.log("AI reponse", response);
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


