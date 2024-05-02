// UserInterface
interface UserInterface {
  username?: string | null;
  email: string;
  externalId: string;
  profileImg?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

// Customer DTO
interface CustomerDTO extends UserInterface {
  fullName: string;
  address?: string | null;
}

// Vendor DTO
interface VendorDTO extends UserInterface {
  fullName: string;
  address?: string | null;
  role: VendorRole;
}

enum VendorRole {
  ADMIN = "ADMIN",
  SELLER = "SELLER",
}

export { UserInterface, CustomerDTO, VendorDTO, VendorRole };
