import { DirectGrantsLiteStrategy, DonationVotingMerkleDistributionDirectTransferStrategyAbi, DonationVotingMerkleDistributionStrategy } from "@allo-team/allo-v2-sdk";
import { Abi } from "viem";

// todo: args === gitcoin-ui types: ReviewBody (PR: par-462)
// see: src/features/checker/pages/SubmitFinalEvaluationPage/types.ts
export const reviewRecipients = async (args: {
    roundId: string;
    strategyAddress: Address;
    applicationsToUpdate: {
      index: number;
      status: ApplicationStatus;
    }[];
    currentApplications: {
      index: number;
      status: ApplicationStatus;
    }[];
    strategy?: RoundCategory;
  }) => {
      let strategyInstance;

      switch (args.strategy) {
        case RoundCategory.QuadraticFunding: {
          strategyInstance = new DonationVotingMerkleDistributionStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
            address: args.strategyAddress,
          });
          break;
        }

        case RoundCategory.Direct: {
          strategyInstance = new DirectGrantsLiteStrategy({
            chain: this.chainId,
            poolId: BigInt(args.roundId),
            address: args.strategyAddress,
          });
          break;
        }

        default:
          throw new Error("Invalid strategy");
      }

      let totalApplications = 0n;
      try {
        totalApplications = await strategyInstance.recipientsCounter();
      } catch (error) {
        totalApplications = BigInt(args.currentApplications.length + 1);
      }

      const rows = buildUpdatedRowsOfApplicationStatuses({
        applicationsToUpdate: args.applicationsToUpdate,
        currentApplications: args.currentApplications,
        statusToNumber: applicationStatusToNumber,
        bitsPerStatus: 4,
      });

      // todo: use wagmi
      const txResult = await sendTransaction(this.transactionSender, {
        address: args.strategyAddress,
        abi: DonationVotingMerkleDistributionDirectTransferStrategyAbi as Abi,
        functionName: "reviewRecipients",
        args: [rows, totalApplications],
      });

      emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      let receipt: TransactionReceipt;
      try {
        receipt = await this.transactionSender.wait(txResult.value);
        emit("transactionStatus", success(receipt));
      } catch (err) {
        const result = new AlloError("Failed to update application status");
        emit("transactionStatus", error(result));
        return error(result);
      }

      await this.waitUntilIndexerSynced({
        chainId: this.chainId,
        blockNumber: receipt.blockNumber,
      });

      emit("indexingStatus", success(undefined));

      return success(undefined);
    }

    function applicationStatusToNumber(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return 1n;
    case "APPROVED":
      return 2n;
    case "REJECTED":
      return 3n;
    case "APPEAL":
      return 4n;
    case "IN_REVIEW":
      return 5n;
    case "CANCELLED":
      return 6n;

    default:
      throw new Error(`Unknown status ${status}`);
  }
}

// ==== this should all work =====
    export function buildUpdatedRowsOfApplicationStatuses(args: {
  applicationsToUpdate: {
    index: number;
    status: ApplicationStatus;
  }[];
  currentApplications: {
    index: number;
    status: ApplicationStatus;
  }[];
  statusToNumber: (status: ApplicationStatus) => bigint;
  bitsPerStatus: number;
}): { index: bigint; statusRow: bigint }[] {
  if (args.bitsPerStatus > 1 && args.bitsPerStatus % 2 !== 0) {
    throw new Error("bitsPerStatus must be a multiple of 2");
  }

  const applicationsPerRow = 256 / args.bitsPerStatus;

  const rowsToUpdate = Array.from(
    new Set(
      args.applicationsToUpdate.map(({ index }) => {
        return Math.floor(index / applicationsPerRow);
      })
    )
  );

  const updatedApplications = args.currentApplications.map((app) => {
    const updatedApplication = args.applicationsToUpdate.find(
      (appToUpdate) => appToUpdate.index === app.index
    );

    if (updatedApplication) {
      return { ...app, status: updatedApplication.status };
    }

    return app;
  });

  return rowsToUpdate.map((rowIndex) => {
    return {
      index: BigInt(rowIndex),
      statusRow: buildRowOfApplicationStatuses({
        rowIndex,
        applications: updatedApplications,
        statusToNumber: args.statusToNumber,
        bitsPerStatus: args.bitsPerStatus,
      }),
    };
  });
}

function buildRowOfApplicationStatuses({
  rowIndex,
  applications,
  statusToNumber,
  bitsPerStatus,
}: {
  rowIndex: number;
  applications: { index: number; status: ApplicationStatus }[];
  statusToNumber: (status: ApplicationStatus) => bigint;
  bitsPerStatus: number;
}) {
  const applicationsPerRow = 256 / bitsPerStatus;
  const startApplicationIndex = rowIndex * applicationsPerRow;
  let row = 0n;

  for (let columnIndex = 0; columnIndex < applicationsPerRow; columnIndex++) {
    const applicationIndex = startApplicationIndex + columnIndex;
    const application = applications.find(
      (app) => app.index === applicationIndex
    );

    if (application === undefined) {
      continue;
    }

    const status = statusToNumber(application.status);

    const shiftedStatus = status << BigInt(columnIndex * bitsPerStatus);
    row |= shiftedStatus;
  }

  return row;
}