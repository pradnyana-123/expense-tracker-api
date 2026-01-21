import { SetMetadata } from "@nestjs/common";

export const Public = () => SetMetadata("public_access", "public");
