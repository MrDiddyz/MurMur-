import { runTeacherAgent } from "../../agents/teacher/src/index";

const result = runTeacherAgent({ prompt: "hello" });
if (!result.content.includes("hello")) {
  throw new Error("Teacher smoke test failed");
}
