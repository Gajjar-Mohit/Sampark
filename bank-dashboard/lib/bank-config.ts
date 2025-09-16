export interface BankConfig {
  id: string
  name: string
  url: string
  shortName: string
}

export const BANKS: BankConfig[] = [
  {
    id: "babu-rao-ganpatrao",
    name: "Babu Rao Ganpatrao Bank",
    url: "http://localhost:3001",
    shortName: "BRG Bank",
  },
  {
    id: "chai-pani",
    name: "Chai Pani Bank",
    url: "http://localhost:3002",
    shortName: "CP Bank",
  },
  {
    id: "chinta-mat-karo",
    name: "Chinta Mat Karo Bank",
    url: "http://localhost:3003",
    shortName: "CMK Bank",
  },
  {
    id: "paisa-vasul",
    name: "Paisa Vasul Bank",
    url: "http://localhost:3004",
    shortName: "PV Bank",
  },
]

export const DEFAULT_BANK = BANKS[0]
