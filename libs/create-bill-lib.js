export function calculateCost (billingOptions) {
    const sysFee = billingOptions.sysControl * 185;
    const fileManageFee = billingOptions.fileManage * 55;
    const recertFee = billingOptions.recertFee * 700;
    const underTwoFee = billingOptions.underTwoAcres * 350;
    const overTwoFee = billingOptions.overTwoAcres * 550;

    console.log(( sysFee + fileManageFee + recertFee + underTwoFee + overTwoFee ));
    return ( sysFee + fileManageFee + recertFee + underTwoFee + overTwoFee );
}