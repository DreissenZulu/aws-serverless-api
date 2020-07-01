import handler from "./libs/handler-lib";
const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'us-west-2' });

function generateEmail(postData) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
      </head>
      <body>
        <p>Hi ${postData.buyer_name},</p>
        <p>This email confirms that your payment to Caribbean Organic Moringa Standards has successfully completed. Your order details are as follows below:</p>
        <br />
        <p>Items Selected:</p>
        <ul>
            ${postData.item_name.contains('syscontrol') ? '<li>System Control</li>' : ''}
            ${postData.item_name.contains('filemanage') ? '<li>File Management</li>' : ''}
            ${postData.item_name.contains('recert') ? '<li>Recertification</li>' : ''}
            ${postData.item_name.contains('undertwo') ? '<li>Certification for Crops Under Two Acres</li>' : ''}
            ${postData.item_name.contains('overtwo') ? '<li>Certification for Crops Over Two Acres</li>' : ''}
        </ul>
        <br />
        <p><strong>Total Cost:</strong> ${postData.currency2} ${postData.amount2 + postData.fee}</p>
        <br />
        <p>Please keep this email for your records.</p>
        <br />
        <p>Sincerely,</p>
        <p>- The Organic Moringa Team</p>
      </body>
    </html>
  `;
};

function generateText(postData) {
    return `
    Hi ${postData.buyer_name},
    This email confirms that your payment to Caribbean Organic Moringa Standards has successfully completed. Your order details are as follows below:
    
    Items Selected:
        ${postData.item_name.contains('syscontrol') ? '- System Control' : ''}
        ${postData.item_name.contains('filemanage') ? '- File Management' : ''}
        ${postData.item_name.contains('recert') ? '- Recertification' : ''}
        ${postData.item_name.contains('undertwo') ? '- Certification for Crops Under Two Acres' : ''}
        ${postData.item_name.contains('overtwo') ? '- Certification for Crops Over Two Acres' : ''}

    Total Cost: ${postData.currency2} ${postData.amount2 + postData.fee}
    
    Please keep this email for your records.

    Sincerely,
    - The Organic Moringa Team
    `
};

export const main = handler(async (event, context, callback) => {
    const senderEmail = process.env.SENDER_EMAIL;

    // Convert IPN post data to an object
    let rawPost = JSON.parse(`{"${decodeURI(event.body).replace(/"/g, '\\"').replace(/%40/g, '"@"').replace(/&/g, '","').replace(/=/g, '":"')} "}`);
    rawPost.buyer_name.replace(/\+/g, " ");
    rawPost.item_name.replace(/\+/g, " ");

    // Send the email when the IPN posts the "completed" status
    if (rawPost.status === "100" && rawPost.ipn_type === "api") {
        // Generate email body
        const htmlBody = generateEmail(rawPost);
        const textBody = generateText(rawPost);

        const params = {
            Destination: {
                ToAddresses: [rawPost.email]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlBody
                    },
                    Text: {
                        Charset: "UTF-8",
                        Data: textBody
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "Your Cryptocurrency Payment Has Been Received!"
                }
            },
            Source: "Team at COMS <team@organicmoringa.com>"
        };

        ses.sendEmail(params, function (err, data) {
            callback(null, { err: err, data: data });
            if (err) {
                console.log(err);
                context.fail(err);
            } else {
                console.log(data);
                context.succeed(event);
            }
        });
    }
    return;
});