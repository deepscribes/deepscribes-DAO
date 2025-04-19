export type EmailAddress = {
  id: string;
  object: "email_address";
  email_address: string;
  reserved: boolean;
  verification: object; // TODO: Add type
  linked_to: object[]; // TODO: Add type
  matches_sso_connection: boolean;
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
};

export type PhoneNumber = {
  id: string;
  object: "phone_number";
  phone_number: string;
  reserved_for_second_factor: boolean;
  default_second_factor: boolean;
  reserved: boolean;
  verification: object; // TODO: Add type
  linked_to: object[]; // TODO: Add type
  backup_codes: string[];
  created_at: number; // Unix timestamp
  updated_at: number; // Unix timestamp
};

export type ClerkUser = {
  id: string;
  object: string; // Value: "user"
  external_id: string | null;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string; // Deprecated
  image_url: string;
  has_image: boolean;
  public_metadata: Record<string, any>;
  private_metadata: Record<string, any> | null;
  unsafe_metadata: Record<string, any>;
  email_addresses: EmailAddress[];
  phone_numbers: PhoneNumber[];
  web3_wallets: object[]; // TODO: Add type
  passkeys: object[]; // TODO: Add type
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  mfa_enabled_at: number | null; // Unix timestamp
  mfa_disabled_at: number | null; // Unix timestamp
  external_accounts: object[]; // TODO: Add type
  saml_accounts: object[]; // TODO: Add type
  last_sign_in_at: number | null; // Unix timestamp
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  verification_attempts_remaining: number | null;
  updated_at: number; // Unix timestamp
  created_at: number; // Unix timestamp
  delete_self_enabled: boolean;
  create_organization_enabled: boolean;
  create_organizations_limit: number | null;
  last_active_at: number | null; // Unix timestamp
  legal_accepted_at: number | null; // Unix timestamp
};
