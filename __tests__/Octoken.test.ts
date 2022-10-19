import { getInput, setFailed, setOutput, setSecret } from "@actions/core";
import { run } from "../src/Octoken";
import { TokenCreator } from "../src/TokenCreator";

jest.mock("@actions/core");

let mockGetInstallationAccessToken = jest.fn();

jest.mock("../src/TokenCreator", () => {
  return {
    TokenCreator: jest.fn().mockImplementation(() => {
      return {
        getInstallationAccessToken: mockGetInstallationAccessToken,
      };
    }),
  };
});

describe("Octoken", () => {
  describe(".run", () => {
    let inputs: Record<string, string>;

    beforeEach(() => {
      // Returns a dummy value from core.getInput
      inputs = {
        github_app_id: "1234",
        github_app_private_key: "dummy_key",
        target_account: "test_org",
      };
      (getInput as jest.Mock).mockImplementation((name) => inputs[name]);

      // Revert core.setFailed to the original implementation
      const { setFailed: originalSetFailed } = jest.requireActual(
        "@actions/core"
      );
      (setFailed as jest.Mock).mockImplementation(originalSetFailed);
    });

    it("outputs the token settings", async () => {
      // setup
      mockGetInstallationAccessToken = jest
        .fn()
        .mockImplementation(async () => {
          return "dummy_token";
        });

      // exercise
      await run();

      // verify
      expect(TokenCreator).toHaveBeenCalledTimes(1);
      expect(TokenCreator).toHaveBeenCalledWith({
        appId: 1234,
        privateKey: "dummy_key",
      });

      expect(mockGetInstallationAccessToken).toHaveBeenCalledTimes(1);
      expect(mockGetInstallationAccessToken).toHaveBeenCalledWith("test_org");

      expect(setSecret).toHaveBeenCalledWith("dummy_token");
      expect(setOutput).toHaveBeenCalledWith("token", "dummy_token");

      expect(process.exitCode).toBeUndefined();
    });

    it("outputs the token settings for the specified account", async () => {
      // setup
      inputs.target_account = "other_org";

      mockGetInstallationAccessToken = jest
        .fn()
        .mockImplementation(async () => {
          return "dummy_token_for_other_org";
        });

      // exercise
      await run();

      // verify
      expect(TokenCreator).toHaveBeenCalledTimes(1);
      expect(TokenCreator).toHaveBeenCalledWith({
        appId: 1234,
        privateKey: "dummy_key",
      });

      expect(mockGetInstallationAccessToken).toHaveBeenCalledTimes(1);
      expect(mockGetInstallationAccessToken).toHaveBeenCalledWith("other_org");

      expect(setSecret).toHaveBeenCalledWith("dummy_token_for_other_org");
      expect(setOutput).toHaveBeenCalledWith(
        "token",
        "dummy_token_for_other_org"
      );

      expect(process.exitCode).toBeUndefined();
    });

    it("sets the error status when an error occurs", async () => {
      // setup
      mockGetInstallationAccessToken = jest
        .fn()
        .mockImplementation(async () => {
          throw new Error("test error");
        });

      // exercise
      await run();

      // verify
      expect(setFailed).toHaveBeenCalledTimes(1);
      expect(setFailed).toHaveBeenCalledWith("test error");

      expect(process.exitCode).toBe(1);
    });
  });
});
