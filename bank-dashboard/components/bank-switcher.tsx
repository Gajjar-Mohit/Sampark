import { useBank } from "@/contexts/bank-context";
import { BANKS } from "@/lib/bank-config";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { useState, createContext, useContext } from "react";



// Components
export function BankSwitcher() {
  const [open, setOpen] = useState(false);
  const { currentBank, setCurrentBank } = useBank();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-72 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="truncate">{currentBank.name}</span>
        </div>
        <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-10 w-72 mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="p-1">
            <input
              type="text"
              placeholder="Search banks..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="max-h-60 overflow-auto">
            {BANKS.map((bank: any) => (
              <button
                key={bank.id}
                onClick={() => {
                  console.log("Switching to bank:", bank);
                  setCurrentBank(bank);
                  setOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    currentBank.id === bank.id
                      ? "opacity-100 text-blue-600"
                      : "opacity-0"
                  }`}
                />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{bank.name}</span>
                  <span className="text-xs text-gray-500">
                    {bank.shortName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
