import stripePackage from "stripe";
import handler from "./libs/handler-lib";
import { calculateCost } from "./libs/create-bill-lib";

export const main = handler(async (event) => {
    const billingOptions = JSON.parse(event.body);
    const amount = calculateCost(billingOptions.options);

    const stripe = stripePackage(process.env.stripeSecretKey);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'xcd',
        payment_method_types: ['card'],
        setup_future_usage: 'on_session',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
  });

  return paymentIntent;
});