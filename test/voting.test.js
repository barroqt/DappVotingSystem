const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Voting smart contract unit tests", function () {
      let voting;

      before(async () => {
        accounts = await ethers.getSigners();
        const [owner, voter1, voter2] = accounts;
      });

      beforeEach(async () => {
        await deployments.fixture(["Voting"]);
        voting = await ethers.getContract("Voting");
      });

      //////////////////////////////
      //  Voters
      //////////////////////////////

      describe("Add voter", function () {
        it("should add a voter", async function () {});

        it("should revert with an error if the caller is not the owner", async function () {});

        it("should revert with an error if voter registration is closed", async function () {});

        it("should revert with an error if the voter is already registered", async function () {});
      });

      describe("Get voter", function () {
        it("should return the right voter", async function () {});

        it("should revert with an error if the caller is not whitelisted", async function () {});
      });

      //////////////////////////////
      //  Proposals
      //////////////////////////////

      describe("Add proposal", function () {
        it("should add a proposal", async function () {});

        it("should revert with an error if the caller is not whitelisted", async function () {});

        it("should revert with an error if proposal registration is closed", async function () {});

        it("should revert with an error if there is no description", async function () {});
      });

      describe("Get proposal", function () {
        it("should return the right proposal", async function () {});

        it("should revert with an error if the caller is not whitelisted", async function () {});
      });

      //////////////////////////////
      //  Votes
      //////////////////////////////

      describe("Set vote", function () {
        it("should cast a vote", async function () {});

        it("should revert with an error if the caller is not whitelisted", async function () {});

        it("should revert with an error if the caller has already voted", async function () {});

        it("should revert with an error if the proposal does not exist", async function () {});
      });

      //////////////////////////////
      //  State
      //////////////////////////////

      describe("Start proposal registering", function () {
        it("should set a genesis proposal", async function () {});

        it("should change the workflow status to ProposalsRegistrationStarted", async function () {});

        it("should revert with an error if the current workflow status is not RegisteringVoters", async function () {});
      });

      describe("End proposal registering", function () {
        it("should change the workflow status to ProposalsRegistrationEnded", async function () {});

        it("should revert with an error if the current workflow status is not ProposalsRegistrationStarted", async function () {});
      });

      describe("Start voting session", function () {
        it("should change the workflow status to VotingSessionStarted", async function () {});

        it("should revert with an error if the current workflow status is not ProposalsRegistrationEnded", async function () {});
      });

      describe("End voting session", function () {
        it("should change the workflow status to VotingSessionEnded", async function () {});

        it("should revert with an error if the current workflow status is not VotingSessionStarted", async function () {});
      });

      describe("Tally votes", function () {
        it("should store the proposal with the most votes", async function () {});

        it("should change the workflow status to VotesTallied", async function () {});

        it("should revert with an error if the current workflow status is not VotingSessionEnded", async function () {});
      });
    });
