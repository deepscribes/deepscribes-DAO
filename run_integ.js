// If .env.integ exists, run the command with dotenv
// Otherwise, run the command without dotenv (we're in CI so env variables are set)
require("fs").existsSync(".env.integ")
  ? require("child_process").execSync(
      "npx dotenv -e .env.integ -- npm run test:integration",
      { stdio: "inherit" },
    )
  : require("child_process").execSync("npm run test:integration", {
      stdio: "inherit",
    });
