# From a GitHub issue to a pull request

Cabin Week uses Claude Code in GitHub Actions. A Claude Pro subscription can authenticate the action; GitHub Copilot is not needed. Claude prepares the change, but the repository owner reviews and merges it.

| Start with | What happens |
|---|---|
| **Build ticket** | For one small, well-defined change. Opening the form as the repository owner starts Claude automatically. For a submission from someone else, review the issue first, then add `build-ticket` as the owner (remove it first if already present). |
| **Idea** | For work that needs discussion. The `idee` label starts the refine agent for trusted contributors. Discuss the proposal with `@claude`, then put the agreed plan in the issue description under `## What to change` and `## Acceptance criteria`. The owner adds `klaar-om-te-bouwen` to start the build. |

Both routes use the issue description as it was when work started, not the comment thread. If the build stops because the description is incomplete, edit it and remove and re-add the build label. If a PR already exists, work on that PR instead of starting another build.

## What blocks a change

1. **Before Claude starts:** only the repository owner's issue or label event can start a build. Both issue sections must be nonempty.
2. **Before a PR is opened:** the build workflow checks the changed paths and runs `npm test`. Automated changes can cover the web game, its tests and documentation. Dependencies, Android-native code, the privacy policy, workflows and release tooling require a separate manual PR. If a check fails, see **Actions → Agent: build**; the workflow does not open a PR.
3. **Before merging:** inspect the diff and the acceptance criteria. If GitHub shows **Approve workflows to run** on the PR, inspect the diff first and then approve the workflow runs. The PR's **Play every day** check tests the change against `main`. Optionally add `agent-review` or `agent-speeltest` to request feedback; neither replaces your review. Merge in GitHub yourself. The normal website deployment runs after that.

## One-time setup

1. **Protect Android signing before enabling the agent.** Follow [Android signing setup](android-key.md#5-put-the-key-in-github) to put the existing key and password in the `android-release` environment restricted to `main`. After the workflow change is merged, confirm that a build on `main` signs successfully, then remove the repository-level copies. Do not approve agent PR workflows until those copies are gone.
2. **Install the [Claude GitHub App](https://github.com/apps/claude)** for `w3nl/cabin-week` only. Run `claude setup-token` locally while signed in with Claude Pro. In **Settings → Secrets and variables → Actions**, add the token as `CLAUDE_CODE_OAUTH_TOKEN`. Do not paste it in an issue, PR or chat. Alternatively, use `ANTHROPIC_API_KEY` from the Claude Console instead. See [Anthropic's setup guide](https://code.claude.com/docs/en/github-actions).
3. In **Settings → Actions → General → Workflow permissions**, enable **Allow GitHub Actions to create and approve pull requests** so the build can open a PR. Leave the default token permissions read-only; the workflow requests the permissions it needs. No personal GitHub token is required for this build route.
4. After the workflow changes are on `main`, run **Actions → Labels for the agents → Run workflow** once. Then protect `main` with a ruleset that requires a pull request and the **Play every day** status check. If you are the sole maintainer, do not require a separate approving reviewer that you cannot supply.
5. Open a small documentation-only **Build ticket** as the owner. Check that the **Agent: build** run starts, that it opens a single PR linking the issue, and that **Play every day** runs after any approval prompt. Review and merge it manually.
