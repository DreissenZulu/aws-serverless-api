import handler from "./libs/handler-lib";
const axios = require('axios');

// Generate email body with data from IPN response
function generateEmail(postData) {
    return `
        <p>Dear ${postData.buyer_name},</p>
        <p>Thank you for your commitment to the development of a sustainable and environmentally friendly industry. This email confirms that your payment to Caribbean Organic Moringa Standards has successfully completed. Your order details are as follows below:</p>
        <br />
        <p>Items Selected:</p>
        <ul>
            ${postData.item_name.includes('syscontrol') ? '<li>NCD 185 System Control Fee</li>' : ''}
            ${postData.item_name.includes('filemanage') ? '<li>NCD 55 File Management Fee</li>' : ''}
            ${postData.item_name.includes('recert') ? '<li>NCD 700 Recertification Fee</li>' : ''}
            ${postData.item_name.includes('undertwo') ? '<li>NCD 350 Certification for Crops Under Two Acres</li>' : ''}
            ${postData.item_name.includes('overtwo') ? '<li>NCD 550 Certification for Crops Over Two Acres</li>' : ''}
        </ul>
        <br />
        <p><strong>Total in Fiat Currency:</strong> ${postData.currency1} ${postData.amount1}</p>
        <p><strong>Payment Method:</strong> Cryptocurrency</p>
        <p><strong>Total Cost:</strong> ${postData.currency2} ${postData.amount2} + ${postData.currency2} ${postData.fee} processing fee</p>
        <br />
        <p>Please keep this email for your records.</p>
        <br />
        <p>Sincerely,</p>
        <p>- The Organic Moringa Team</p>
    `;
};

export const main = handler(async (event) => {
    // Convert IPN post data to an object
    let rawPost = JSON.parse(`{"${decodeURI(event.body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"')} "}`);
    // Remove URI encoded characters that could not be parsed
    rawPost.buyer_name = rawPost.buyer_name.replace(/\+/g, " ");
    rawPost.item_name = rawPost.item_name.replace(/\+/g, " ");
    rawPost.email = rawPost.email.replace("%40", "@");

    // Send the email when the IPN posts the "completed" status
    if (rawPost.status === "100" && rawPost.ipn_type === "api") {
        // Generate email body
        console.log("Payment Status Complete. Sending email...");
        const htmlBody = generateEmail(rawPost);
        const url = "https://ztfgyay7nh.execute-api.us-west-2.amazonaws.com/dev/email/send";

        // Given the name, email, subject, and email content, post data to SES handler
        let sendEmail = await axios.post(url,
            {
                email: rawPost.email,
                name: rawPost.buyer_name,
                subject: "Your Cryptocurrency Payment Has Been Received!",
                content: htmlBody
            }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        console.log(`Status Code: ${sendEmail.status}`);
        console.log(`Status Text: ${sendEmail.statusText}`);
    };
});