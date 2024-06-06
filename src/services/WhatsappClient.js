//const { Client, LocalAuth } = require("whatsapp-web.js")
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require("qrcode-terminal")
//const { MessageMedia } = require("whatsapp-web.js")

const  clients = {}
const qrCodes = {}; 
const clientStatus = {}; 
function startClient(id) {
    if (clients[id]) {
        console.log(`Client ${id} is already started`);
        return;
      }
    clients[id] = new Client({
        authStrategy: new LocalAuth({
            clientId: id
        }),
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
        }
    })

    clients[id].initialize().catch(err => console.log(err))
    
    clients[id].on("qr", (qr) => {
        console.log(qr)
        qrcode.generate(qr, { small: true })
    })
    clients[id].on("ready", () => console.log("Client is ready!"))
    // Listening to all incoming messages
    clients[id].on('message_create', message => {
	//console.log(message.body);
    if (message.body === '1') {
		console.log(message.body);
		clients[id].sendMessage(message.from, 'مركز الحيفي يرحب بكم لحجز موعد اضغط لرقم 2  ');
	}else if (message.body === '2') {
		console.log(message.body);
		clients[id].sendMessage(message.from, ' تم استلام الطلب موعد الحجز يوم الاثبين الموافق 12-4- 2024 صباحا ');
	}
    else{
        console.log('modd');
        
    }
    
});

    
    clients[id].on("message", async (msg) => {
        try {
            console.log(msg);
            console.log(process.env.PROCCESS_MESSAGE_FROM_CLIENT);
          //  if (process.env.PROCCESS_MESSAGE_FROM_CLIENT && msg.from != "status@broadcast") {
                const contact = await msg.getContact()
                console.log(contact, msg.from)
          //  }
        } catch (error) {
            console.error(error)
        }
    })
}
function startClienttest(id) {
    return new Promise((resolve, reject) => {
        if (clients[id]) {
            console.log(`Client ${id} is already started`);
            return resolve(qrCodes[id]);
        }

        clients[id] = new Client({
            authStrategy: new LocalAuth({
                clientId: id
            }),
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
            }
        });

        clients[id].initialize().catch(err => {
            console.log(err);
            reject(err);
        });
        
        clients[id].on("qr", (qr) => {
            console.log(`QR code for client ${id}: ${qr}`);
            qrcode.generate(qr, { small: true });
            qrCodes[id] = qr; // Store the QR code
            resolve(qr);
        });

        clients[id].on("ready", () => {
            console.log(`Client ${id} is ready!`);
            clientStatus[id] = true;
        });

        clients[id].on("disconnected", () => {
            console.log(`Client ${id} disconnected`);
            clientStatus[id] = false;
        });


        // Other event listeners...
    });
}

function sendMessage(phoneNumber, message, clientId, file) {
    console.log(clients[clientId]);
    const number = `967${phoneNumber}@c.us`;
    // message = 'Please choose an option:\n1. Service\n2. Info';
    if(file) {
        const messageFile = new MessageMedia(file.mimetype, file.buffer.toString('base64'))
        clients[Number(clientId)].sendMessage(number, messageFile)
    } else {
        clients[clientId].sendMessage(number, message);
    }
}
function getClientStatus(clientId) {
    return clientStatus[clientId] || false;
}

module.exports = { startClient, sendMessage, clients,startClienttest,getClientStatus };