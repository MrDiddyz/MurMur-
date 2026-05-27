from agents.deploy.agent import DeployAgent
from agents.learning.agent import LearningAgent
from agents.pricing.agent import PricingAgent
from agents.product.agent import ProductAgent
from agents.profit.agent import ProfitAgent
from agents.profit_bandit_agent.agent import ProfitBanditAgent
from agents.web.agent import WebAgent

AGENT_REGISTRY = [
    ProductAgent(),
    WebAgent(),
    DeployAgent(),
    LearningAgent(),
    PricingAgent(),
    ProfitAgent(),
    ProfitBanditAgent(),  # replaces BanditAgent
]
