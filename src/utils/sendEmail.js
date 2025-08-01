const { SendEmailCommand } = require("@aws-sdk/client-ses");
const {sesClient} = require('./sesClient')

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: [
        /* more items */
      ],
      ToAddresses: [
        toAddress,
        /* more To-email addresses */
      ],
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
        Text: {
          Charset: "UTF-8",
          Data: "Sample Html body text",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [
      /* more items */
    ],
  });
};


const run = async (subject, body, toEmailId) => {
  const sendEmailCommand = createSendEmailCommand(
    "gokulkandasamyy@gmail.com",
    "gokulkandasamyy@piqme.live",
    subject,
    body
  );

  try {
    const response = await sesClient.send(sendEmailCommand);
    return response; // ✅ Return response here
  } catch (caught) {
    if (caught instanceof Error && caught.name === "MessageRejected") {
      return caught;
    }
    throw caught;
  }
};


module.exports =  { run };