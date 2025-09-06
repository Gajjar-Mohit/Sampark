import prisma from "../db";
import { generateIFSCCode } from "../utils/ifsc_code_generator";

const paisaVasoolBankBranches = [
  "Thoda Aur Refill Branch",
  "Full Paisa Chowk Branch",
  "Chatori Galli Branch",
  "Matka Market Branch",
  "Bindaas Bazaar Branch",
  "Ek Cutting Circle Branch",
  "Saste Nashe Nagar Branch",
  "Thali Tiffin Tower Branch",
  "Beedi Bazaar Branch",
  "Biryani Junction Branch",
];

async function seedBranchs(name: string) {
  const ifscCode = generateIFSCCode();
  await prisma.branch.create({
    data: {
      name,
      code: ifscCode,
    },
  });
}

async function seedBranchsData() {
  for (const branch of paisaVasoolBankBranches) {
    await seedBranchs(branch);
    console.log(branch + " created successfully");
  }
}

seedBranchsData();
