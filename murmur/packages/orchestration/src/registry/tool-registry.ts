import type { ToolDefinition } from "@murmur/shared";

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  register<TInput, TOutput>(tool: ToolDefinition<TInput, TOutput>): this {
    this.tools.set(tool.name, tool as ToolDefinition);
    return this;
  }

  get(name: string): ToolDefinition {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`Tool not found: ${name}`);
    return tool;
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()];
  }
}
