import * as core from "@actions/core";
import * as github from "@actions/github";
import { TokenCreator } from "./TokenCreator";

export const run = async (): Promise<void> => {
  try {
    const appId = parseInt(
      core.getInput("github_app_id", { required: true }),
      10
    );
    const privateKey = core.getInput("github_app_private_key", {
      required: true,
    });
    const targetAccountName =
      core.getInput("target_account") || github.context.repo.owner;

    const tokenCreator = new TokenCreator({ appId, privateKey });

    const iat = await tokenCreator.getInstallationAccessToken(
      targetAccountName
    );

    core.setSecret(iat);
    core.setOutput("token", iat);
  } catch (error) {
    core.setFailed(error.message);
  }
};
