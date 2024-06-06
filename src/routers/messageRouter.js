
const express = require('express');
const router = new express.Router();
const { startClient, sendMessage,clients,startClienttest,getClientStatus  } = require("../services/WhatsappClient")
const multer  = require('multer')
const upload = multer()

// دالة موحدة للاستجابة
const sendResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    status: statusCode === 200,
    data: data || {},
    message: message || '',
  });
};
router.get('/', (req, res) => {
  res.send('Hello World!');
});
/*
router.post("/message", upload.single("file"), (req, res) => {
  console.log(req.body.clientId);
  const file = req.file
  const clientId = req.body.clientId;
  const phoneNumber=req.body.phoneNumber;
  const message=req.body.message;
  const response = {
    status: true,
    send_message: 1,
    faild_jop: 0,
    message: 'Message sent'
  };
  if (!clients[clientId]) {
    console.log('clientId==null');
    startClient(clientId);
    setTimeout(() => {
      sendMessage(phoneNumber, message, clientId, file);
      res.send('Message sent');
    }, 40000);
  }else{

  
    sendMessage(phoneNumber, message, clientId, file);
    //res.send('Message sent');
    res.json(response);
  }
 
})*/
router.post("/message", upload.single("file"), (req, res) => {
  const { clientId, phoneNumber, message } = req.body;
  const file = req.file;

  if (!clients[clientId]) {
    startClient(clientId);
    setTimeout(() => {
      const sendMessageResult = sendMessage(phoneNumber, message, clientId, file);
      if (sendMessageResult && typeof sendMessageResult.then === 'function') {
        sendMessageResult
          .then(() => {
            sendResponse(res, 200, { send_message: 1, failed_job: 0 }, 'Message sent after client initialization');
          })
          .catch(error => {
            sendResponse(res, 500, null, `Failed to send message: ${error.message}`);
          });
      } else {
        sendResponse(res, 200, { send_message: 1, failed_job: 0 }, 'Message sent after client initialization');
      }
    }, 40000);
  } else {
    const sendMessageResult = sendMessage(phoneNumber, message, clientId, file);
    if (sendMessageResult && typeof sendMessageResult.then === 'function') {
      sendMessageResult
        .then(() => {
          sendResponse(res, 200, { send_message: 1, failed_job: 0 }, 'Message sent');
        })
        .catch(error => {
          sendResponse(res, 500, null, `Failed to send message: ${error.message}`);
        });
    } else {
      sendResponse(res, 200, { send_message: 1, failed_job: 0 }, 'Message sent');
    }
  }
});
router.get('/:id/start', (req, res) => {
  startClient(req.params.id)
  res.send()
})

router.post('/:id/starttest', async (req, res) => {
  try {
    const qrCode = await startClienttest(req.params.id);
    if (qrCode) {
      res.json({ qrCode });
    } else {
      res.status(404).send('Failed to generate QR code');
    }
  } catch (error) {
    res.status(500).send(`Error starting client: ${error.message}`);
  }
});
router.get("/:id/status", (req, res) => {
  const status = getClientStatus(req.params.id);
  res.json({ connected: status });
});


module.exports = router