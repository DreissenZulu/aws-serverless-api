import handler from "./libs/handler-lib";

export const main = handler(async (event) => {
    // Function created by Filip Dimitrovski
    const request = event.body + `&key=${process.env.COIN_PAYMENTS_KEY}`;
    const encryptedKey = require('crypto')
        .createHmac('sha512', process.env.COIN_PAYMENTS_SECRET_KEY)
        .update(request)
        .digest('hex');
    return {
        hmacSig: encryptedKey,
        request: request
    };
});