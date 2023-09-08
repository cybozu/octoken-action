import * as core from "@actions/core";
import * as github from "@actions/github";
import { createAppAuth } from "@octokit/auth-app";

type TokenCreatorOption = {
  appId: number;
  privateKey: string;
};

export class TokenCreator {
  private readonly appId: number;
  private readonly privateKey: string;

  constructor({ appId, privateKey }: TokenCreatorOption) {
    this.appId = appId;
    this.privateKey = privateKey;
  }

  async getInstallationAccessToken(targetAccountName: string): Promise<string> {
    const auth = createAppAuth({
      appId: this.appId,
      privateKey: this.privateKey,
    });
    const appAuthentication = await auth({ type: "app" });
    const jwt = appAuthentication.token;

    const octokit = github.getOctokit(jwt);

    const listInstallationsResponse = await octokit.apps.listInstallations();
    const targetInstallation = listInstallationsResponse.data.find(
      (installation) => installation.account.login === targetAccountName,
    );
    if (targetInstallation === undefined) {
      throw new Error(
        `Unable to find a installation for the specified account: ${targetAccountName}`,
      );
    }

    const createInstallationAccessTokenResponse =
      await octokit.apps.createInstallationAccessToken({
        installation_id: targetInstallation.id,
      });
    const iatData = createInstallationAccessTokenResponse.data;
    core.info(
      `Installation Access Token has been generated (Expiration: ${iatData.expires_at})`,
    );

    return iatData.token;
  }
}
