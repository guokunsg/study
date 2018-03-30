console.debug("Child process running");

process.on('message', m => console.debug("Message from server: " + m.from));
process.send({ from: "child message"});

setInterval(() => process.exit(), 200);