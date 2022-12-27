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

        it("should revert with an error if voter registration phase is not open", async function () {
          // Set workflow status to the next stage
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

        it("should revert with an error if proposal registration phase is not open", async function () {
          // Set workflow status to the next stage
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
        beforeEach(async () => {
          await deployments.fixture(["Voting"]);
          voting = await ethers.getContract("Voting");
          // Add 3 voters
          await voting.addVoter(voter1.address);
          await voting.addVoter(voter2.address);
          await voting.addVoter(voter3.address);

          // start proposal phase
          await voting.startProposalsRegistering();

          // Add one proposal per voter
          await voting.connect(voter1).addProposal("Proposal number 1");
          await voting.connect(voter2).addProposal("Proposal number 2");
          await voting.connect(voter3).addProposal("Proposal number 3");

          // end proposal phase and start voting session
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
        });

        // it("should cast a vote", async function () {
        //   await expect(voting.connect(voter1).setVote(3)).to.emit(
        //     voting,
        //     "Voted"
        //   );

        //   assert(voting.voters[voter1].votedProposalId === 3);
        //   assert(voting.voters[voter1].hasVoted === true);

        //   // add votes to the 3rd proposal
        //   await voting.connect(voter2).setVote(3);
        //   await voting.connect(voter3).setVote(3);
        //   assert(voting.proposalsArray[3].voteCount === 3);
        // });

        // it("should revert with an error if the caller is not whitelisted", async function () {
        //   await expect(voting.setVote(1)).to.be.revertedWith(
        //     "You're not a voter"
        //   );
        // });

        it("should revert with an error if the caller has already voted", async function () {
          // Vote once then expect the second vote to fail
          await voting.connect(voter1).setVote(3);
          await expect(voting.connect(voter1).setVote(3)).to.be.revertedWith(
            "You have already voted"
          );
        });

        it("should revert with an error if the proposal does not exist", async function () {
          await expect(voting.connect(voter1).setVote(4)).to.be.revertedWith(
            "Proposal not found"
          );
        });

        it("should revert with an error if the voting session is not open", async function () {
          // Set workflow status to the next stage
          await voting.endVotingSession();
          await expect(voting.connect(voter1).setVote(2)).to.be.revertedWith(
            "Voting session havent started yet"
          );
        });
      });

      //////////////////////////////
      //  State
      //////////////////////////////
      describe("Workflow state", function () {
        beforeEach(async () => {
          await deployments.fixture(["Voting"]);
          voting = await ethers.getContract("Voting");
        });

        it("should go through the entire workflow", async function () {
          // console.log((await voting.workflowStatus()).toString());
          await expect(voting.startProposalsRegistering()).to.emit(
            voting,
            "WorkflowStatusChange"
          );

          // Test enum value to confirm the right workflow status is set
          let currentState = await voting.workflowStatus();
          assert(currentState.toString() === "1");

          await expect(voting.endProposalsRegistering()).to.emit(
            voting,
            "WorkflowStatusChange"
          );

          // Test enum value to confirm the right workflow status is set
          currentState = await voting.workflowStatus();
          assert(currentState.toString() === "2");

          await expect(voting.startVotingSession()).to.emit(
            voting,
            "WorkflowStatusChange"
          );

          // Test enum value to confirm the right workflow status is set
          currentState = await voting.workflowStatus();
          assert(currentState.toString() === "3");

          await expect(voting.endVotingSession()).to.emit(
            voting,
            "WorkflowStatusChange"
          );

          // Test enum value to confirm the right workflow status is set
          currentState = await voting.workflowStatus();
          assert(currentState.toString() === "4");

          await expect(voting.tallyVotes()).to.emit(
            voting,
            "WorkflowStatusChange"
          );

          // Test enum value to confirm the right workflow status is set
          currentState = await voting.workflowStatus();
          assert(currentState.toString() === "5");
        });

        describe("Start proposal registering", function () {
          it("should set a genesis proposal", async function () {});

          it("should revert with an error if the current workflow status is not RegisteringVoters", async function () {
            // Change workflow to fail second try
            await voting.startProposalsRegistering();
            await expect(voting.startProposalsRegistering()).to.be.revertedWith(
              "Registering proposals cant be started now"
            );
          });
        });

        describe("End proposal registering", function () {
          it("should revert with an error if the current workflow status is not ProposalsRegistrationStarted", async function () {
            // Fails at first try because the state has never been updated
            await expect(voting.endProposalsRegistering()).to.be.revertedWith(
              "Registering proposals havent started yet"
            );
          });
        });

        describe("Start voting session", function () {
          it("should revert with an error if the current workflow status is not ProposalsRegistrationEnded", async function () {
            // Fails at first try because the state has never been updated
            await expect(voting.startVotingSession()).to.be.revertedWith(
              "Registering proposals phase is not finished"
            );
          });
        });

        describe("End voting session", function () {
          it("should revert with an error if the current workflow status is not VotingSessionStarted", async function () {
            // Fails at first try because the state has never been updated
            await expect(voting.endVotingSession()).to.be.revertedWith(
              "Voting session havent started yet"
            );
          });
        });

        describe("Tally votes", function () {
          it("should store the proposal with the most votes", async function () {});

          it("should revert with an error if the current workflow status is not VotingSessionEnded", async function () {
            // Fails at first try because the state has never been updated
            await expect(voting.tallyVotes()).to.be.revertedWith(
              "Current status is not voting session ended"
            );
          });
        });
      });
    });
