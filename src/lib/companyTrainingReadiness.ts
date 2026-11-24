import { capacityReview, type CapacityApproval, type CapacityPlan } from './companyTraining';

// Future server and UI adapter. No browser result can authorize a DB transition.
export type CompanyReadinessEvidence = {
  programmeVersion: string;
  programmeApprovedVersion: string | null;
  capacity: CapacityPlan | null;
  capacityApproval: CapacityApproval | null;
  criticalResources: { id: string; confirmed: boolean }[];
  criticalResourceListVerified: boolean;
  acceptedProgrammeVersion: string | null;
  confirmedOrder: boolean;
};
export function companyReadiness(evidence: CompanyReadinessEvidence | null) {
  const missing: string[] = [];
  if (!evidence) return { ready: false, missing: ['Yrityskoulutuksen valmistelutiedot puuttuvat'] };
  if (!evidence.confirmedOrder) missing.push('Vahvistettu tilaus puuttuu');
  if (!evidence.programmeVersion || evidence.programmeApprovedVersion !== evidence.programmeVersion) missing.push('Ohjelmaversion hyväksyntä puuttuu tai on vanhentunut');
  if (!evidence.capacity || evidence.capacity.programmeVersion !== evidence.programmeVersion) missing.push('Voimassa olevan ohjelmaversion kapasiteetti puuttuu');
  else missing.push(...capacityReview(evidence.capacity, evidence.capacityApproval).reasons);
  if (!evidence.criticalResourceListVerified) missing.push('Kriittisten resurssien luettelo tarkistamatta');
  for (const resource of evidence.criticalResources) if (!resource.confirmed) missing.push(`Resurssi vahvistamatta: ${resource.id}`);
  if (evidence.acceptedProgrammeVersion !== evidence.programmeVersion) missing.push('Tuotannon vastaanotto puuttuu tai koskee vanhaa versiota');
  return { ready: missing.length === 0, missing };
}