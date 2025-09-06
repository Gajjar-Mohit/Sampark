import prisma from "../db";
import { generateIFSCCode } from "../utils/ifsc_code_generator";

const babuRaoGanpatraoBankBranches = [
  "Idhar Udhar Chowk Branch",
  "Hera Pheri Nagar Branch",
  "Double Paisa Colony Branch",
  "Kharcha Kam Area Branch",
  "Chashma Bazaar Branch",
  "Aila Re Galli Branch",
  "Pagalpan Society Branch",
  "Galti Se Investment Branch",
  "Ullu Banav Circle Branch",
  "Bhaiyya Bhaiyya Tower Branch",
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
  for (const branch of babuRaoGanpatraoBankBranches) {
    await seedBranchs(branch);
    console.log(branch + " created successfully");
  }
}

seedBranchsData();
