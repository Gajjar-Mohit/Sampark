import prisma from "../db";
import { generateIFSCCode } from "../utils/ifsc_code_generator";

const chintaMatKaroBankBranches = [
  "Aram Se Chowk Branch",
  "Bindass Bazaar Branch",
  "Mast Mauj Nagar Branch",
  "Chhodo Na Colony Branch",
  "Fikr Not Square Branch",
  "Chillax Corner Branch",
  "Bas Ho Jayega Junction Branch",
  "Sab Theek Hai Colony Branch",
  "No Tension Puram Branch",
  "Befikar Galli Branch",
  "Mast Hai Na Market Branch",
  "Sab Changa Si Gate Branch",
  "Carefree Lane Branch",
  "Moj Masti Chowk Branch",
  "Easy Peasy Path Branch",
  "Khulke Jiyo Dairy Branch",
  "Relax Street Branch",
  "Fattu Mat Bano Path Branch",
  "Tension Free Chauraha Branch",
  "Aaram Ki Dukan Square Branch",
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
  for (const branch of chintaMatKaroBankBranches) {
    await seedBranchs(branch);
  }
}

seedBranchsData();
