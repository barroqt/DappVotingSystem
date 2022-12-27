const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Voting smart contract unit tests", function () {
      let voting;
      let accounts;

      before(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        voter1 = accounts[1];
        voter2 = accounts[2];
        voter3 = accounts[3];
      });

      //////////////////////////////
      //  Voters
      //////////////////////////////

      describe("Add voter", function () {
        beforeEach(async () => {
          await deployments.fixture(["Voting"]);
          voting = await ethers.getContract("Voting");
        });

        it("should add a voter", async function () {
          await expect(voting.addVoter(voter1.address)).to.emit(
            voting,
            "VoterRegistered"
          );

          // Testing getVoter
          const voter = await voting.connect(voter1).getVoter(voter1.address);
          assert(voter.isRegistered === true);
        });

        it("should revert with an error if the caller is not the owner", async function () {
          await expect(
            voting.connect(voter1).addVoter(voter1.address)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should revert with an error if voter registration is closed", async function () {
          // Set status to the next stage
          await voting.startProposalsRegistering();
          await expect(voting.addVoter(voter1.address)).to.be.revertedWith(
            "Voters registration is not open yet"
          );
        });

        it("should revert with an error if the voter is already registered", async function () {
          // Add voter once then expect the second try to fail
          await voting.addVoter(voter1.address);
          await expect(voting.addVoter(voter1.address)).to.be.revertedWith(
            "Already registered"
          );
        });
      });

      describe("Get voter", function () {
        it("should revert with an error if the caller is not whitelisted", async function () {
          await expect(voting.getVoter(voter1.address)).to.be.revertedWith(
            "You're not a voter"
          );
        });
      });

      //////////////////////////////
      //  Proposals
      //////////////////////////////

      describe("Add proposal", function () {
        beforeEach(async () => {
          await deployments.fixture(["Voting"]);
          voting = await ethers.getContract("Voting");
          await voting.addVoter(voter1.address);
          await voting.startProposalsRegistering();
        });

        it("should add a proposal", async function () {
          console.log((await voting.workflowStatus()).toString());
          await expect(
            voting.connect(voter1).addProposal("Proposal number 1")
          ).to.emit(voting, "ProposalRegistered");

          // Testing getOneProposal
          // proposal should be at id 1, after genesis
          const proposal = await voting.connect(voter1).getOneProposal(1);
          assert(proposal.description === "Proposal number 1");
        });

        it("should revert with an error if the caller is not whitelisted", async function () {
          await expect(
            voting.addProposal("Proposal number 1")
          ).to.be.revertedWith("You're not a voter");
        });

        it("should revert with an error if proposal registration is closed", async function () {
          // Set status to the next stage
          await voting.endProposalsRegistering();
          await expect(
            voting.connect(voter1).addProposal("Proposal number 1")
          ).to.be.revertedWith("Proposals are not allowed yet");
        });

        it("should revert with an error if there is no description", async function () {
          await expect(
            voting.connect(voter1).addProposal("")
          ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
        });
      });

      describe("Get proposal", function () {
        it("should revert with an error if the caller is not whitelisted", async function () {
          await expect(voting.getOneProposal(1)).to.be.revertedWith(
            "You're not a voter"
          );
        });
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
