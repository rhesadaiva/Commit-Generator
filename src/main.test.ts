import { assertEquals, assertRejects, assertThrows } from "jsr:@std/assert";
import { stub } from "jsr:@std/testing/mock";
import { Logger } from "./modules/logger.ts";
import { GitService } from "./modules/git.ts";
import { AIService } from "./modules/ai.ts";
import { EditorService } from "./modules/editor.ts";
import { main } from "./main.ts";

// Helper to simulate Deno.args and capture output
async function runMainWithArgs(args: string[]): Promise<{ exitCode?: number }> {
  const originalArgs = Deno.args;
  Deno.args = args;

  try {
    await main();
    return { exitCode: undefined };
  } catch (error) {
    const match = error.message.match(/Simulated Deno.exit\((\d+)\)/);
    return { exitCode: match ? parseInt(match[1]) : 1 };
  } finally {
    Deno.args = originalArgs;
  }
}

// Test suite
Deno.test("main.ts - argument parsing", async () => {
  // Test --help
  const helpStub = stub(Logger, "info");
  await runMainWithArgs(["--help"]);
  assertEquals(helpStub.calls.length, 0); // Ensure no other logs
  helpStub.restore();

  // Test --version
  const versionStub = stub(console, "log");
  await runMainWithArgs(["--version"]);
  assertEquals(versionStub.calls.length, 1);
  versionStub.restore();
});

Deno.test("main.ts - Git repository validation", async () => {
  const gitStub = stub(
    GitService,
    "isGitRepository",
    () => Promise.resolve(false),
  );
  try {
    const result = await runMainWithArgs([]);
    assertEquals(result.exitCode, 1);
  } finally {
    gitStub.restore();
  }
});

Deno.test("main.ts - staged files validation", async () => {
  const gitStub = stub(
    GitService,
    "isGitRepository",
    () => Promise.resolve(true),
  );
  const stagedStub = stub(
    GitService,
    "getStagedFiles",
    () => Promise.resolve([]),
  );
  try {
    const result = await runMainWithArgs([]);
    assertEquals(result.exitCode, 1);
  } finally {
    gitStub.restore();
    stagedStub.restore();
  }
});

Deno.test("main.ts - commit type and language selection", async () => {
  const gitStub = stub(
    GitService,
    "isGitRepository",
    () => Promise.resolve(true),
  );
  const stagedStub = stub(
    GitService,
    "getStagedFiles",
    () => Promise.resolve(["file1.ts"]),
  );
  const diffStub = stub(
    GitService,
    "getStagedDiff",
    () => Promise.resolve("diff content"),
  );
  const aiStub = stub(
    AIService,
    "generateCommit",
    () =>
      Promise.resolve({
        message: "feat: add feature",
        description: "Description",
      }),
  );
  try {
    const result = await runMainWithArgs([]);
    assertEquals(result.exitCode, undefined); // Success case
  } finally {
    gitStub.restore();
    stagedStub.restore();
    diffStub.restore();
    aiStub.restore();
  }
});

Deno.test("main.ts - AI generation failure", async () => {
  const gitStub = stub(
    GitService,
    "isGitRepository",
    () => Promise.resolve(true),
  );
  const stagedStub = stub(
    GitService,
    "getStagedFiles",
    () => Promise.resolve(["file1.ts"]),
  );
  const diffStub = stub(
    GitService,
    "getStagedDiff",
    () => Promise.resolve("diff content"),
  );
  const aiStub = stub(
    AIService,
    "generateCommit",
    () => Promise.reject(new Error("AI failed")),
  );

  const result = await runMainWithArgs([]);
  assertEquals(result.exitCode, 1);
  gitStub.restore();
  stagedStub.restore();
  diffStub.restore();
  aiStub.restore();
});

Deno.test("main.ts - user cancellation", async () => {
  const gitStub = stub(
    GitService,
    "isGitRepository",
    () => Promise.resolve(true),
  );
  const stagedStub = stub(
    GitService,
    "getStagedFiles",
    () => Promise.resolve(["file1.ts"]),
  );
  const diffStub = stub(
    GitService,
    "getStagedDiff",
    () => Promise.resolve("diff content"),
  );
  const aiStub = stub(
    AIService,
    "generateCommit",
    () =>
      Promise.resolve({
        message: "feat: add feature",
        description: "Description",
      }),
  );
  const selectStub = stub(Select, "prompt", () => Promise.resolve("cancel"));

  const result = await runMainWithArgs([]);
  assertEquals(result.exitCode, undefined); // Cancellation is not an error
  gitStub.restore();
  stagedStub.restore();
  diffStub.restore();
  aiStub.restore();
  selectStub.restore();
});

Deno.test("main.ts - editor failure", async () => {
  const gitStub = stub(
    GitService,
    "isGitRepository",
    () => Promise.resolve(true),
  );
  const stagedStub = stub(
    GitService,
    "getStagedFiles",
    () => Promise.resolve(["file1.ts"]),
  );
  const diffStub = stub(
    GitService,
    "getStagedDiff",
    () => Promise.resolve("diff content"),
  );
  const aiStub = stub(
    AIService,
    "generateCommit",
    () =>
      Promise.resolve({
        message: "feat: add feature",
        description: "Description",
      }),
  );
  const selectStub = stub(Select, "prompt", () => Promise.resolve("edit"));
  const editorStub = stub(
    EditorService,
    "openEditor",
    () => Promise.reject(new Error("Editor failed")),
  );

  const result = await runMainWithArgs([]);
  assertEquals(result.exitCode, 1);
  gitStub.restore();
  stagedStub.restore();
  diffStub.restore();
  aiStub.restore();
  selectStub.restore();
  editorStub.restore();
});
