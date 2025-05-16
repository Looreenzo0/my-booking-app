import Role from "../models/Role";

export const seedRoles = async () => {
  const roles = ["admin", "user"];
  for (const name of roles) {
    const existing = await Role.findOne({ name });
    if (!existing) {
      await new Role({ name }).save();
      console.log(`Seeded role: ${name}`);
    }
  }
};
