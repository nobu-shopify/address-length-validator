use shopify_function::prelude::*;
use shopify_function::Result;

use serde::{Serialize};

// Use the shopify_function crate to generate structs for the function input and output
generate_types!(
    query_path = "./input.graphql",
    schema_path = "./schema.graphql"
);

// gid://shopify/PaymentCustomization/14024760

// Use the shopify_function crate to declare your function entrypoint
#[shopify_function]
fn function(input: input::ResponseData) -> Result<output::FunctionResult> {
    let no_changes = output::FunctionResult { operations: vec![] };

    // Get country from cart attribute
    // Default is "Japan"
    let browser_country = match input.cart.attribute {
        Some(attribute) => attribute.value,
        None => Some("Japan".to_string()),
    };
    eprintln!("Country: {:?}", browser_country);

    // Get country isoCode
    // let country_code = input.localization.country.iso_code;

    // No change if country is Japan
    //if country_code == input::CountryCode::JP {
    if browser_country == Some("Japan".to_string()) {
        eprintln!("Country is Japan, no need to hide the payment method.");
        return Ok(no_changes);
    }

    eprintln!("Country is NOT Japan, will hide payment methods.");

    // Find the payment method to hide, and create a hide output operation from it
    // (this will be None if not found)
    let hide_payment_method = input.payment_methods
        .iter()
        // COD
        .find(|&method| method.name.contains(&"Cash on Delivery".to_string()))
        .map(|method| output::HideOperation {
            payment_method_id: method.id.to_string()
        });

    let hide_payment_method_sp = input.payment_methods
        .iter()
        // Shopify Payments
        .find(|&method| method.name.contains(&"Shopify Payments".to_string()))
        .map(|method| output::HideOperation {
            payment_method_id: method.id.to_string()
        });

    let hide_payment_method_np = input.payment_methods
        .iter()
        // NP後払い
        .find(|&method| method.name.contains(&"NP後払い".to_string()))
        .map(|method| output::HideOperation {
            payment_method_id: method.id.to_string()
        });

    let hide_payment_method_bank = input.payment_methods
        .iter()
        // Bank Deposit
        .find(|&method| method.name.contains(&"Bank Deposit".to_string()))
        .map(|method| output::HideOperation {
            payment_method_id: method.id.to_string()
        });

    // The shopify_function crate serializes your function result and writes it to STDOUT
    Ok(output::FunctionResult { operations: vec![
        output::Operation {
            hide: hide_payment_method,
            move_: None,
            rename: None
        },
        output::Operation {
            hide: hide_payment_method_sp,
            move_: None,
            rename: None
        },
        output::Operation {
            hide: hide_payment_method_np,
            move_: None,
            rename: None
        },
        output::Operation {
            hide: hide_payment_method_bank,
            move_: None,
            rename: None
        }
    ] })
}

#[cfg(test)]
mod tests;
