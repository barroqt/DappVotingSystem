import {
  Button,
  Text,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";

export const Job = ({ event, takeJob, payJob }) => {
  const { address } = useAccount();
  return (
    <Flex h="15vh" p="2rem" justifyContent="space-between" alignItems="center">
      <Text>Voting DApp</Text>
      <Flex
        direction={{ base: "column", xl: "row" }}
        justifyContent="space-between"
        alignItems="center"
        width="25%"
      >
        <Link href="/">Home</Link>
        <Link href="/addaproposal">Add a Proposal</Link>
      </Flex>
    </Flex>
  );
};
