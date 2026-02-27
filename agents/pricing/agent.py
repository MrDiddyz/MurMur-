import random
from core.memory.store import memory


class PricingAgent:
    def price(self, base_price):
        adjustment = random.uniform(-0.1, 0.1)
        new_price = base_price * (1 + adjustment)

        expected_sale_prob = 0.5 + adjustment
        actual_sale = random.random()

        memory.log(
            "pricing",
            new_price,
            expected_sale_prob,
            actual_sale,
        )

        return round(new_price, 2)


pricing_agent = PricingAgent()
