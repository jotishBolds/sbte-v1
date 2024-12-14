// types/college.ts
export interface College {
  id: string;
  name: string;
  address: string;
  establishedOn: string; // Date in ISO format (YYYY-MM-DD)
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  IFSCCode?: string;
  AccountNo?: string;
  AccountHolderName?: string;
  UPIID?: string;
  logo?: string; // URL to the logo image
  abbreviation: string;
}
