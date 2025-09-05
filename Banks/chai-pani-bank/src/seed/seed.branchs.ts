import prisma from "../db";
import { generateIFSCCode } from "../utils/ifsc_code_generator";

const chaiPaniBankBranches = [
  "Cutting Chai Chowk Branch",
  "Full Glass Pani Nagar Branch",
  "Biskoot Bazaar Branch",
  "Tapri Junction Branch",
  "Matka Chowk Branch",
  "Kulhad Corner Branch",
  "Thodi Aur Refill Branch",
  "Chhota Peg Colony Branch",
  "Extra Pyaali Puram Branch",
  "Chatori Galli Branch",
  "Adda No. 420 Branch",
  "Garam Gilaas Gate Branch",
  "Lassi Lane Branch",
  "Gupshup Chowk Branch",
  "Masala Pouch Market Branch",
  "Doodh Doodh Doodh Dairy Branch",
  "Samosa Street Branch",
  "Pav Bhaji Path Branch",
  "Chatori Chauraha Branch",
  "Chai With Extra Sugar Square Branch",
];

async function seedBranchs(name: string) {
  const ifscCode = generateIFSCCode();
  return await prisma.branch.create({
    data: {
      name,
      code: ifscCode,
    },
  });
}

async function seedBranchsData() {
  for (const branch of chaiPaniBankBranches) {
    await seedBranchs(branch);
    console.log(branch + " created successfully");
  }
}

seedBranchsData();