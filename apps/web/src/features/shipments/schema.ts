import { z } from "zod";
import { isValidStellarAddress } from "@/lib/format";

export const createShipmentSchema = z.object({
  sender: z
    .string()
    .min(1, "Sender address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  carrier: z
    .string()
    .min(1, "Carrier address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  warehouse: z
    .string()
    .min(1, "Warehouse address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  inspector: z
    .string()
    .min(1, "Inspector address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  receiver: z
    .string()
    .min(1, "Receiver address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  origin: z.string().min(2, "Origin is required").max(120),
  destination: z.string().min(2, "Destination is required").max(120),
  cargoHash: z
    .string()
    .min(8, "Cargo hash must be at least 8 characters")
    .max(128),
});

export type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

export const registerOrgSchema = z.object({
  account: z
    .string()
    .min(1, "Account address is required")
    .refine(isValidStellarAddress, "Invalid Stellar address"),
  name: z.string().min(2, "Organization name is required").max(64),
  roles: z.array(z.number()).min(1, "Select at least one role"),
});

export type RegisterOrgFormValues = z.infer<typeof registerOrgSchema>;

export const handoffSchema = z.object({
  fromParty: z.string().refine(isValidStellarAddress, "Invalid from address"),
  toParty: z.string().refine(isValidStellarAddress, "Invalid to address"),
  stage: z.number().int().min(1).max(5),
  proofHash: z.string().min(8).max(128),
});

export type HandoffFormValues = z.infer<typeof handoffSchema>;

export const inspectionSchema = z.object({
  passed: z.boolean(),
  notesHash: z.string().min(8).max(128),
});

export type InspectionFormValues = z.infer<typeof inspectionSchema>;
