import { EventEmitter } from 'events';
import { DirectGrantsLiteStrategy, DonationVotingMerkleDistributionDirectTransferStrategyAbi, DonationVotingMerkleDistributionStrategy } from "@allo-team/allo-v2-sdk";
import { Abi, Address, TransactionReceipt } from "viem";

enum RoundCategory {
  QuadraticFunding,
  Direct
}

enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  APPEAL = "APPEAL",
  IN_REVIEW = "IN_REVIEW",
  CANCELLED = "CANCELLED"
}

function applicationStatusToNumber(status: ApplicationStatus): bigint {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 1n;
    case ApplicationStatus.APPROVED:
      return 2n;
    case ApplicationStatus.REJECTED:
      return 3n;
    case ApplicationStatus.APPEAL:
      return 4n;
    case ApplicationStatus.IN_REVIEW:
      return 5n;
    case ApplicationStatus.CANCELLED:
      return 6n;
    default:
      throw new Error(`Unknown status ${status}`);
  }
}

// Custom class to handle the review recipients logic
class ReviewRecipients extends EventEmitter {
  async execute(args: {
    roundId: string;
    strategyAddress: Address;
    applicationsToUpdate: { index: number; status: ApplicationStatus }[];
    currentApplications: { index: number; status: ApplicationStatus }[];
    strategy?: RoundCategory;
    
  }, chainId: number): Promise<{ status: "success" } | { status: "error"; error: Error }> {
    let strategyInstance;

    switch (args.strategy) {
      case RoundCategory.QuadraticFunding: {
        strategyInstance = new DonationVotingMerkleDistributionStrategy({
          chain: chainId,
          poolId: BigInt(args.roundId),
          address: args.strategyAddress,
        });
        break;
      }
      case RoundCategory.Direct: {
        strategyInstance = new DirectGrantsLiteStrategy({
          chain: chainId,
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

    try {
      const txResult = await args.transactionSender.sendTransaction({
        address: args.strategyAddress,
        abi: DonationVotingMerkleDistributionDirectTransferStrategyAbi as Abi,
        functionName: "reviewRecipients",
        args: [rows, totalApplications],
      });

      this.emit("transaction", txResult);

      if (txResult.type === "error") {
        return txResult;
      }

      let receipt: TransactionReceipt;
      try {
        receipt = await args.transactionSender.wait(txResult.value);
        this.emit("transactionStatus", { status: "success", receipt });
      } catch (err) {
        const errorResult = new Error("Failed to update application status");
        this.emit("transactionStatus", { status: "error", error: errorResult });
        return { status: "error", error: errorResult };
      }

      await waitUntilIndexerSynced({
        chainId: chainId,
        blockNumber: receipt.blockNumber,
      });

      this.emit("indexingStatus", { status: "success" });

      return { status: "success" };
    } catch (error) {
      this.emit("transaction", { type: "error", error });
      return { status: "error", error: error as Error};
    }
  }
}

// Function to simulate waiting until indexer is synced
async function waitUntilIndexerSynced({ chainId, blockNumber }: { chainId: number, blockNumber: BigInt }) {
  // todo: Implementation of waiting logic
}

// =========== Do not touch this code ===========

function buildUpdatedRowsOfApplicationStatuses(args: {
  applicationsToUpdate: { index: number; status: ApplicationStatus }[];
  currentApplications: { index: number; status: ApplicationStatus }[];
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

// Function to create and execute the reviewRecipients process
export function reviewRecipients(args: {
  roundId: string;
  strategyAddress: Address;
  applicationsToUpdate: { index: number; status: ApplicationStatus }[];
  currentApplications: { index: number; status: ApplicationStatus }[];
  strategy?: RoundCategory;
  chainId: number;
  transactionSender: any;
}): ReviewRecipients {
  const reviewRecipientsInstance = new ReviewRecipients();
  reviewRecipientsInstance.execute(args);
  return reviewRecipientsInstance;
}
