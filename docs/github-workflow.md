# GitHub Workflow

This project should stay organized through small branches and commits.

## First Remote Setup

If you already have a repo:

```powershell
git remote add origin https://github.com/<owner>/<repo>.git
git branch -M main
git push -u origin main
```

If you want a new repo, create it on GitHub first, then run the same commands with the new URL.

## Revision Pattern

Use branches for each meaningful change:

```powershell
git switch -c codex/<short-change-name>
git status
git add .
git commit -m "Describe the change"
git push -u origin codex/<short-change-name>
```

Then open a pull request on GitHub.

## Suggested Issues

- Wire OpenClaw live endpoints.
- Wire Hermes Agent live endpoints.
- Add Cloudflare Access policy notes for your domain.
- Add persistent secret storage using your preferred vault.
- Add role-based access for operator/admin modes.
- Add agent heartbeat polling and alert notifications.
