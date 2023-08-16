module.exports = async ({ github, context }) => {
  try {
    const { title, number } = context.payload.pull_request;

    const conventionalCommitRegex =
      /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\([\w ,-]+\))?(!?:\s+)([\w ]+[\s\S]*)/i;

    if (!title) {
      console.log("No title found, ending run.");
      return;
    }

    const match = title.match(conventionalCommitRegex);
    if (match && match.length > 1) {
      // commit type is in the first match group
      const typeLabel = getLabelName(match[1]);

      await github.rest.issues.addLabels({
        issue_number: number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        labels: [typeLabel],
      });

      function getLabelName(type) {
        switch (type) {
          case "feat":
            return "enhancement";
          case "fix":
            return "bug";
          case "docs":
            return "docs";
          case "test":
            return "testing";
          case "refactor":
            return "refactor";
          case "tooling":
            return "tooling";
          default:
            return "chore";
        }
      }
    }
  } catch (e) {
    console.error(
      "Unable to label pull request, the author likely does not have write permissions\n",
      e,
    );
  }
};
