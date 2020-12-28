import { run } from "../src/Octoken";
import { TokenCreator } from "../src/TokenCreator";

const mockWrite = jest
  .spyOn(process.stdout, "write")
  .mockImplementation(() => true);

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
    const OLD_ENV = process.env;

    beforeEach(() => {
      process.env = { ...OLD_ENV };

      process.env.INPUT_GITHUB_APP_ID = "1234";
      process.env.INPUT_GITHUB_APP_PRIVATE_KEY = "dummy_key";
      process.env.GITHUB_REPOSITORY = "test_org/test_repo";
    });

    afterEach(() => {
      // cleanup mock
      mockWrite.mockClear();

      // cleanup environment variables
      jest.resetModules();
      process.env = OLD_ENV;
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

      expect(mockWrite).toHaveBeenCalledTimes(2);
      expect(mockWrite).toHaveBeenNthCalledWith(1, "::add-mask::dummy_token\n");
      expect(mockWrite).toHaveBeenNthCalledWith(
        2,
        "::set-output name=token::dummy_token\n"
      );

      expect(process.exitCode).toBeUndefined();
    });

    it("outputs the token settings for the specified account", async () => {
      // setup
      process.env.INPUT_TARGET_ACCOUNT = "other_org";

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

      expect(mockWrite).toHaveBeenCalledTimes(2);
      expect(mockWrite).toHaveBeenNthCalledWith(
        1,
        "::add-mask::dummy_token_for_other_org\n"
      );
      expect(mockWrite).toHaveBeenNthCalledWith(
        2,
        "::set-output name=token::dummy_token_for_other_org\n"
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
      expect(mockWrite).toHaveBeenCalledTimes(1);
      expect(mockWrite).toHaveBeenCalledWith("::error::test error\n");

      expect(process.exitCode).toBe(1);
    });
  });
});
