import stripePackage from "stripe";
import handler from "./libs/handler-lib";

export const main = handler(async (event) => {
    const billingOptions = JSON.parse(event.body);

    const stripe = stripePackage(process.env.stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.update(billingOptions.piID, {
        receipt_email: billingOptions.email
  });

  return paymentIntent;
});