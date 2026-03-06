export type ToolHandler = (input: Record<string, unknown>) => Promise<unknown>;

export type RegisteredTool = {
  name: string;
  description: string;
  handler: ToolHandler;
};

export class ToolRegistry {
  private readonly tools = new Map<string, RegisteredTool>();

  register(tool: RegisteredTool): void {
    this.tools.set(tool.name, tool);
  }

  get(name: string): RegisteredTool {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`Tool not registered: ${name}`);
    }

    return tool;
  }

  list(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }
}
