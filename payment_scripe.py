import os
import stripe
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

STRIPE_API_KEY = os.getenv("STRIPE_API_KEY")


if not STRIPE_API_KEY:
    print("⚠️ Warning: STRIPE_API_KEY not found in .env file")

else:
    stripe.api_key = STRIPE_API_KEY


def create_link_stripe(
        amount: int,
        currency: str = "usd",
        product_name: str = "Payment",
        success_url: str = "http://localhost:8000/success",
        cancel_url: str = "http://localhost:8000/cancel"
) -> Optional[str]:
    if not STRIPE_API_KEY:
        print("❌ Stripe API key not configured")
        return None

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": currency,
                        "product_data": {
                            "name": product_name,
                        },
                        "unit_amount": amount,
                    },
                    "quantity": 1,
                },
            ],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
        )
        return checkout_session.url
    except Exception as e:
        print(f"❌ Stripe error: {e}")
        return None
