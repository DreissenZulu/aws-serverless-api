import handler from "./libs/handler-lib";
const aws = require('aws-sdk');
const ses = new aws.SES({ region: 'us-west-2' });

function generateEmail(postData) {
    return `
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
        <p><strong>Total Cost:</strong> ${postData.currency2} ${postData.amount2} + ${postData.currency2} ${postData.fee} processing fee</p>
        <br />
        <p>Please keep this email for your records.</p>
        <br />
        <p>Sincerely,</p>
        <p>- The Organic Moringa Team</p>
  `;
};

async function post(data) {
    const { url } = data;

    delete data.url;

    const params = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };

    const response = await fetch(url, params);

    if (response.status < 200 && response.status >= 300) {
        const res = await response.json();

        throw new Error(res);
    }

    return response.json();
}

function sendEmail(name, email, subject, content) {
    url = "https://ztfgyay7nh.execute-api.us-west-2.amazonaws.com/dev/email/send";

    data = {
        url,
        email,
        name,
        subject,
        content
    };

    post(data)
        .then((res) => {
            console.log(res);
        })
        .catch(error => {
            console.log(error);
        });
}

export const main = handler(async (event) => {
    // Convert IPN post data to an object
    let rawPost = JSON.parse(`{"${decodeURI(event.body).replace(/"/g, '\\"').replace(/%40/g, '"@"').replace(/&/g, '","').replace(/=/g, '":"')} "}`);
    rawPost.buyer_name.replace(/\+/g, " ");
    rawPost.item_name.replace(/\+/g, " ");

    // Send the email when the IPN posts the "completed" status
    if (rawPost.status === "100" && rawPost.ipn_type === "api") {
        // Generate email body
        const htmlBody = generateEmail(rawPost);

        sendEmail(rawPost.buyer_name, rawPost.email, "Your Cryptocurrency Payment Has Been Received!", htmlBody);

    }
    return;
});