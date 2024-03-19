# Octoken

> [!WARNING]
> **Please note: This action has been archived and should no longer be used. Please, migrate your workflows to the [actions/create-github-app-token](https://github.com/actions/create-github-app-token), which is being actively maintained by the official GitHub organization.**

This action makes it easy to get a token for your GitHub App.

[![GitHub Actions status](https://github.com/cybozu/octoken-action/workflows/Continuous%20Integration/badge.svg)](https://github.com/cybozu/octoken-action/actions?query=workflow%3A%22Continuous+Integration%22)

## Usage

### Pre-requisites

[Create a GitHub App](https://docs.github.com/en/free-pro-team@latest/developers/apps/creating-a-github-app) and install it on the users or organizations you want to access from within Workflow.

Then, [generate a private key](https://docs.github.com/en/free-pro-team@latest/developers/apps/authenticating-with-github-apps#generating-a-private-key) and save it as is in [encrypted secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets).

### Inputs

- `github_app_id` - ID of the GitHub App used to create the Access Token
- `github_app_private_key` - A private key of the GitHub App used to create the Access Token (Refers to the value stored in encrypted secrets)
- `target_account` (Optional) - The target user or organization that you want to access with the token (Default: The owner of the repository in which the Workflow is running)

### Outputs

- `token` - An installation access token created

### Example workflow

```yaml
name: Using GitHub App token

on: push

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: cybozu/octoken-action@v1
        id: create-iat
        with:
          github_app_id: 12345
          github_app_private_key: ${{ secrets.GH_APP_PRIVATE_KEY }}
          target_account: cybozu

      - name: Use Installation Access Token
        env:
          IAT: ${{ steps.create-iat.outputs.token }}
        run: |
          curl --include --fail -H "Authorization: token ${IAT}" https://api.github.com/installation/repositories
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
