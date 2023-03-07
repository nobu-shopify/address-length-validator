import React, { useState, useEffect } from 'react';
import {
  render,
  Banner,
  BlockStack,
  Checkbox,
  useAttributes,
  useApplyAttributeChange,
  useBuyerJourneyIntercept,
  useExtensionApi,
  useExtensionCapability,
  useShippingAddress,
} from '@shopify/checkout-ui-extensions-react';

render('Checkout::Dynamic::Render', () => <App />);

function App() {

  // isGift Checkbox
  const [isGift, setChecked] = useState(false);
  const handleChange = () => {
    setChecked(!isGift);
    console.log("isGift", isGift);
  };
  const applyAttributeChange = useApplyAttributeChange();
  const attributeUpdate = () => { 
    applyAttributeChange({
      key: "is_gift",
      value: `${isGift}`,
    });
    const attribute = useAttributes();
    console.log("attribute", attribute);
  };



  // Address validator
  const {extensionPoint} = useExtensionApi();
  const address = useShippingAddress();
//  console.log("address", address.address1, address.address2);

  const [validationError, setValidationError] = useState("");
  const [showErrorBanner, setShowErrorBanner] = useState(false);

  const canBlockProgress = useExtensionCapability("block_progress");
  const label = canBlockProgress ? "住所長さチェック" : "住所長さチェック (optional)";

  useEffect(() => {
    if (canBlockProgress && isAddressSet() && !isAddressValid()) {
      showValidationErrors();
      return;
    }
    clearValidationErrors();
  }, [address.address1, address.address2]);

  // Address length check
  function isAddressSet() {
    return address.address1 !== undefined; // addrerss1 is mandatory field
  }

  function isAddressValid() {
    let val = true;
    // console.log("address_len", address.address1?.length, address.address2?.length);
    if (address.address1 && address.address1.length > 10) val = false;
    if (address.address2 && address.address2.length > 10) val = false;
    return val;
  }

  function showValidationErrors() {
    setShowErrorBanner(true);
  }

  function clearValidationErrors() {
    setValidationError("");
    setShowErrorBanner(false);
  }

  // Buyer journey interceptor
  useBuyerJourneyIntercept(() => {
    // Block condition #1
    if (!isAddressSet()) {
      return {
        behavior: "block",
        reason: "住所が入力されていません",
        perform: (result) => {
          // If we were able to block progress, set a validation error
          if (result.behavior === "block") {
            setValidationError("住所を入力してください");
          }
        },
      };
    }
    // Block condition #2
    if (!isAddressValid()) {
      return {
        behavior: "block",
        reason: `住所が長すぎます`,
        perform: (result) => {
          // If progress can be blocked, then set a validation error, and show the banner
          if (result.behavior === "block") {
            showValidationErrors();
          }
        },
      };
    }
    return {
      behavior: "allow",
      perform: () => {
        // Ensure any errors are hidden
        clearValidationErrors();
      },
    };
  });

  return (
    <BlockStack>
      <Banner status="info" title="住所は日本語で入力してください。Enter address in Japanese."/>
      {showErrorBanner && (
        <Banner status="critical" title="住所が長すぎます！ １０文字以下のみ受け付けます。">
          address1({address?.address1?.length}) 
          address2({address?.address2?.length}) 
        </Banner>
      )}
      <Checkbox checked={isGift} onChange={ () => { handleChange(); }}>
        これはギフトです。
      </Checkbox>
    </BlockStack>
  );
}

/*
      {!showErrorBanner && (
        <Banner status="info" title="住所長さOK。"/> 
      )}

      <Checkbox checked={isGift} onChange={ () => { handleChange(); attributeUpdate(); }}>

*/

