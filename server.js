// const express = require("express");
// const connectDB = require("./config/db");
// const app = express();

// const cors = require("cors");
// const http = require("http");


// connectDB();

// app.use(express.json());
// app.use(cors());


// // const socketio=require('socket.io')

// // Connect Database


// // Init middleware
// app.use(express.json({ extended: false }));


// app.get("/", (req, res) => {
//   res.send("working");
// });
// const PORT = process.env.PORT || 5000;




// // io.on("connection", (socket) => {
// //   // if(!io.UserSocket)
// //   // io.UserSocket={}
// //   //console.log("connecting the user", socket.id);
// //   //current_socket = socket;
// //   //console.log("current_socket", current_socket.id);
// //   current_socket = socket;

// //   socket.on("join", ({ me, conversation }) => {
// //     console.log("user logged in")
// //     console.log(me, socket.id);
// //     UserSocket[me] = socket;
// //     //console.log("this is usertoken")
// //     //console.log(UserSocket)
// //     //UserSocket["mang2567o"] = "juice";
// //     // console.log(UserSocket, "HELLO ABHISHEK2");

// //     // socket.emit("socket_state", { UserSocket }, (error) => {
// //     //   if (error) {
// //     //     alert(error);
// //     //   }
// //     // });

// //     // console.log(UserSocket[me],me);
// //     // dict[me] = socket;
// //     // console.log("PRINTING USER SOCKET");
// //     // console.log(UserSocket);
// //     if (conversation.length) {
// //       console.log("sockets!!!!!");

// //       conversation.map((conversations) => {
// //         socket.join(conversations._id);
// //       });
// //       //console.log(socket);
// //     }
// //   });
  

// //   socket.on("new_message", ({ text, chatRoomId }) => {
// //     console.log("new message details");
// //     console.log(text);
// //     console.log(chatRoomId);
// //     socket.to(chatRoomId).emit("emit_message", { text });
// //   });
// // });

// // app.use(function (req, res, next) {
// //   req.socket = current_socket;

// //   next();
// // });
// app.use("/api/users", require("./routes/users"));
// app.use("/api/auth", require("./routes/auth"));
// //app.use("/api/event", require("./routes/messages"));

// //io.listen(PORT);
// app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const app = express();
dotenv.config();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
// Connect Database
connectDB();
// Init middleware
app.use(express.json({ extended: false }));
app.get("/", (req, res) => {
  res.send("working");
});
// io.on("connection", (client) => {
//   client.on("subscribeToTimer", (interval) => {
//     console.log("client is subscribing to timer with interval ", interval);
//     setInterval(() => {
//       client.emit("timer", new Date());
//     }, interval);
//   });
// });
app.use("/api/users", require("./routes/users"));
app.use("/api/auth", require("./routes/auth"));
//app.use("/api/auth/fin", require("./routes/auth"));
//app.use("/api/getKeys", require("./routes/users"));
//app.use("/api/event", require("./routes/messages"));
const PORT = process.env.PORT || 5000;
//io.listen(PORT);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));