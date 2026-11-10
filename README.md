# Your Gravity Claw workspace

A place for your business to prepare a Gravity Claw rollout, owned by your team.

This template contains setup preferences and an optional profile check. Creating it does not install Gravity Claw, activate a license, deploy a server, or connect GitHub, AI services, Telegram or email to an agent. The Gravity Claw runtime and commercial license are supplied separately through onboarding.

## Get started in your browser

1. **Create your workspace.** From the [Gravity Claw setup guide](https://gravity-claw-landing.vercel.app/#github-setup), choose the self-managed GitHub route. The GitHub form will suggest a repository name and **Private** visibility. Sign in on GitHub, choose your business's organization or account as **Owner**, confirm **Private**, and create the repository from the template. Your organization's repository policies still apply; ask its administrator if creation is restricted.
2. **Bring your setup preferences.** Download `setup-profile.json` from the Gravity Claw setup preview. In your new repository, choose **Add file → Upload files**, upload that file at the repository root to replace the example, and commit the change. No terminal is required. Review the file before committing; it must contain preferences only.
3. **Review with your rollout contact.** If GitHub Actions is allowed in your organization, open the **Actions** tab to see the **Check setup profile** result after your upload. A passing check means the file has the expected structure. It does not verify repository privacy, account ownership, access permissions or service connections. Share the repository link through your agreed onboarding channel; access is granted separately by your administrator.

Prefer help with the technical setup? Choose **Assisted setup** in the [setup guide](https://gravity-claw-landing.vercel.app/#github-setup) and keep the exported brief for your onboarding conversation. You do not need to create a GitHub repository to explore that route.

## What belongs here

`setup-profile.json` records your team name, first focus, preferred personality, AI service preference, channel choices and GitHub setup route. The supplied example is deliberately generic. Replace it with your own exported preferences before the rollout review.

Keep API keys, passwords, bot tokens, license keys, private keys and sensitive business documents out of this repository. Credentials are added through your private onboarding process, after access and permissions are reviewed. A private repository is not a credential vault. The profile check catches some common token formats; it cannot guarantee that a file contains no secrets.

## Ready for rollout review

- Your business owns the new repository and its visibility is **Private**.
- The example profile has been replaced with your exported preferences.
- Your business owner and technical approver have reviewed the choices.
- You have reviewed repository access and organization policy with your administrator.
- Your onboarding contact has the next steps for licensing, runtime deployment and connection tests.

These are review steps, not a declaration that a workspace is activated or integrations are connected.

## Optional check for your IT team

The check uses Node.js built-ins only; there are no packages to install.

```sh
node scripts/validate-profile.mjs setup-profile.json
node --test tests/validate-profile.test.mjs
```

GitHub Actions runs the same commands with read-only repository permissions and no configured secrets. Your organization's Actions policies and usage limits apply. You can use the manual check instead if Actions is disabled.

The [template creation guide](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template) explains GitHub ownership and visibility choices. The [prefilled form fields](https://github.blog/changelog/2023-04-27-pre-fill-form-fields-when-creating-a-new-repo/) keep the handoff short.

This repository is onboarding material. It does not contain the Gravity Claw runtime, grant a software license, or change the terms of your separate commercial agreement.
