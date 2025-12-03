use std::fs;

use once_cell::sync::Lazy;
use serde::Deserialize;

#[derive(Debug, Deserialize, Clone)]
pub struct Banks {
    #[serde(rename = "CMK")]
    pub cmk: Bank,
    #[serde(rename = "CPB")]
    pub cpb: Bank,
    #[serde(rename = "PVB")]
    pub pvb: Bank,
    #[serde(rename = "BRG")]
    pub brg: Bank,
}

#[derive(Debug, Deserialize, Clone)]
pub struct Bank {
    pub ifsc_code_prefix: String,
    pub iin: String,
    pub nth_to_bank: String,
    pub bank_to_nth: String,
    pub nth_to_bank_group: String,
    pub bank_to_nth_group: String,
    pub name: String,
    pub mmid_prefix: String,
}

impl Banks {
    pub fn load() -> Result<Self, String> {
        let content = fs::read_to_string("config/banks.toml")
            .map_err(|e| format!("Failed to read banks config: {}", e))?;

        toml::from_str(&content).map_err(|e| format!("Failed to parse banks config: {}", e))
    }
    pub fn get_bank_by_code(&self, code: &str) -> Bank {
        if code == "cmk" || code == "CMK" {
            self.cmk.clone()
        } else if code == "brg" || code == "BRG" {
            self.brg.clone()
        } else if code == "cpb" || code == "CPB" {
            self.cpb.clone()
        } else {
            self.pvb.clone()
        }
    }
}

pub static BANKS: Lazy<Banks> =
    Lazy::new(|| Banks::load().expect("Failed to load banks configuration"));
