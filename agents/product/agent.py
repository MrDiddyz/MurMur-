class ProductAgent:
    def analyze(self, product):
        product["quality_score"] = 0.85
        product["story"] = "Curated luxury vintage item"
        return product


product_agent = ProductAgent()
