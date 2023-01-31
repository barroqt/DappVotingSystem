# Project 3

Unit tests for the voting project.
The contract has been tested following these steps:

- Test functions, events and reverts related to voters (add and get)
- Test functions, events and reverts related to proposals (add and get)
- Test functions, events and reverts related to the vote session. Defined a scenario before each test: 3 voters, one proposal each, they all vote for the third one.
- Test the end-to-end workflow. Test reverts and events.
  - Test genesis proposal at first step
  - Defined a scenario for testing the vote tally: 3 voters, one proposal each. Voter 1 votes for the 2nd proposal, the two others vote for the 3rd one.

## Prerequisites

- Yarn

### Run local node

```zsh
yarn hardhat node
```

### Deploy locally

```zsh
yarn hardhat deploy --network localhost
```

### Run tests

```zsh
yarn hardhat test
```

### Run test coverage

```zsh
yarn hardhat coverage
```
