class WebAgent:
    def execute(self, context):
        return {"agent": "web", "status": "ok", "context": context}


web_agent = WebAgent()
