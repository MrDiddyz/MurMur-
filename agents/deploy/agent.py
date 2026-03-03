class DeployAgent:
    def execute(self, context):
        return {"agent": "deploy", "status": "ok", "context": context}


deploy_agent = DeployAgent()
