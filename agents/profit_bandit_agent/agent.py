class ProfitBanditAgent:
    def execute(self, context):
        return {"agent": "profit_bandit", "status": "ok", "context": context}


profit_bandit_agent = ProfitBanditAgent()
