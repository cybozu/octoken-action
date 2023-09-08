import { TokenCreator } from "../src/TokenCreator";
import nock from "nock";
import { createAppAuth } from "@octokit/auth-app";

jest.mock("@octokit/auth-app");

describe(TokenCreator, () => {
  describe("#getInstallationAccessToken", () => {
    beforeEach(() => {
      // Returns a dummy value from createAppAuth
      (createAppAuth as jest.Mock).mockImplementation(() => {
        return () => ({
          type: "app",
          token: "dummy_jwt",
        });
      });

      // Returns a dummy value from GitHub API
      nock("https://api.github.com")
        .get("/app/installations")
        .reply(200, [
          { id: 1, account: { login: "valid_user" } },
          { id: 2, account: { login: "valid_org" } },
        ])
        .post("/app/installations/2/access_tokens")
        .reply(201, { token: "v1.1234567890dummy" });
    });

    it("returns a token when a valid account is specified", async () => {
      // setup
      const octoken = new TokenCreator({
        appId: 1234,
        privateKey: "test_private_key",
      });

      // exercise & verify
      await expect(
        octoken.getInstallationAccessToken("valid_org"),
      ).resolves.toBe("v1.1234567890dummy");
    });

    it("throws the error when a non-existent account is specified", async () => {
      // setup
      const octoken = new TokenCreator({
        appId: 1234,
        privateKey: "test_private_key",
      });

      // exercise & verify
      await expect(
        octoken.getInstallationAccessToken("non_existent_org"),
      ).rejects.toThrow(
        "Unable to find a installation for the specified account: non_existent_org",
      );
    });
  });
});
