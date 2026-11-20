# The agent workflow: from idea to pull request

Ideas for *TripScouts* go past a small team of AI agents (Claude, in GitHub Actions). You decide at two moments: **approving the plan** and **merging the pull request**.

```
 You            Refine agent       You               Build agent         Tests (+ on demand review      You
 ───            ────────────       ───               ───────────         and playtest)                  ───
 Open an   ──▶  explores and  ──▶  discuss with ──▶  builds on a    ──▶  look at the code, play  ──▶   merge
 "Idea"         answers with       @claude, add      branch, runs        the new part; "Play the
 issue          a plan             the label         all tests,          game" runs all tests
                (uitgewerkt)       klaar-om-te-      opens a PR
                                   bouwen
```

The label names are Dutch (they come from the original project); they work the same.

| Step | Who | Starts on | What happens | Workflow |
|---|---|---|---|---|
| 1. Idea | you | | Open an issue with the **Idea** form. It gets the label `idee`. | |
| 2. Refine | refine agent | the label `idee` | Reads the code and answers with a plan: how it works, which files, acceptance criteria, test plan, open questions. Adds `uitgewerkt`. Changes no code. | `agent-refine.yml` |
| Discuss | you + Claude | `@claude …` in the issue | Ask questions, change the plan, until you are happy. | `claude.yml` |
| 3. Build | build agent | **you add `klaar-om-te-bouwen`** (ready to build) | Builds the plan on `agent/issue-N`, adds tests, runs `npm test` until it passes, updates the docs, opens a PR with the label `agent-pr` that closes the issue. | `agent-build.yml` |
| 4. Review (on demand) | review agent | **you put the label `agent-review` on the PR** (or Actions → Run workflow) | Checks the change against AGENTS.md and the acceptance criteria. Leaves comments and a ✅/❌ summary. | `agent-review.yml` |
| 5. Test | "Play the game" (always) + playtest agent (on demand: label `agent-speeltest`) | the PR | All Playwright tests run on every PR. On request, the playtest agent plays the changed parts on computer and phone size, in English and Dutch, and reports with screenshots. | `tests.yml`, `agent-playtest.yml` |
| Improve | you + Claude | `@claude …` on the PR | For example "@claude fix the review comments". Claude pushes to the branch and starts the tests again. | `claude.yml` |
| Done | you | | Merge the PR. The issue closes, and *Publish the game* publishes the new version. | `pages.yml` |

## One-time setup

1. **GitHub Pages:** Settings → Pages → Source: **GitHub Actions**. See [domain.md](domain.md).
2. **Give the agents access to Claude.** Add **one** of these repository secrets (Settings → Secrets and variables → Actions → New repository secret):
   - `CLAUDE_CODE_OAUTH_TOKEN`: uses your Claude Pro or Max subscription. Make it on your computer with:
     ```bash
     claude setup-token
     ```
   - `ANTHROPIC_API_KEY`: pay per use, via https://console.anthropic.com.
   Without either, the agent workflows fail; *Play the game* still works.
3. **Let workflows open pull requests.** Settings → Actions → General → Workflow permissions: **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**.
4. **Create the labels.** Actions → **Labels for the agents** → Run workflow.
5. **Optional, recommended: `AGENT_GITHUB_TOKEN`.** Pull requests opened with the default Actions token do not start other workflows (a GitHub safety rule). The build agent works around that by starting the tests itself. With a fine-grained personal access token as `AGENT_GITHUB_TOKEN` (this repository only; Contents, Pull requests and Issues: read and write), the PR is opened in your name and everything starts by itself.
6. **Optional: protect `main`.** Settings → Branches → a rule for `main` that requires the check **Play every day**.
7. **Renovate:** install the Renovate app for this repository; `renovate.json` keeps Playwright and the actions up to date.

## Good to know

- **Who can start agents:** only the owner, members and collaborators of the repository. Issues and comments from others are ignored.
- **Costs:** each step is one Claude session. Refining and review are small; building can take a while for big ideas. Small, clear ideas work best.
- **The plan is the contract:** the build agent follows the plan of the refine agent *plus everything decided in the issue*.
- **Review and playtest are on demand.** Put the label `agent-review` or `agent-speeltest` on a PR; to run again, remove the label and add it back.
- **Where everything is:** the agents' instructions are the `prompt` in each workflow file. The project knowledge they rely on is in [AGENTS.md](../AGENTS.md); keep it up to date and every agent gets better.
