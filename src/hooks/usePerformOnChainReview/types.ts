import { Address } from "viem";

// Enums and types
export enum ProgressStatus {
  IS_SUCCESS = "IS_SUCCESS",
  IN_PROGRESS = "IN_PROGRESS",
  IS_ERROR = "IS_ERROR",
  NOT_STARTED = "NOT_STARTED",
}

export interface Step {
  name: string;
  description: string;
  status: ProgressStatus;
}

export enum RoundCategory {
  QuadraticFunding,
  Direct,
}

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  APPEAL = "APPEAL",
  IN_REVIEW = "IN_REVIEW",
  CANCELLED = "CANCELLED",
}

export interface ReviewBody {
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
}
