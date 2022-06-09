export class Payment {

    id: number;
    icon: string;
    lockStatus: string;
    lockDate: Date;
    lockQtr: string;
    fsaReportId: number;
    fsaCppPurchaseOrderId: number;
    fsaCppItemId: number;
    paymentDate: Date;
    deliveryDate:  Date;
    qtyDelivered: number;
    paymentAmount: number;
    paymentNumber: number;
    paymentCheckNum: number;
    correction: number;
    auditDifference: number;
    lateFeeAmt: number;
    lateFeeCheckNum: number;
    lateFeeCheckDate: Date;
    fsaRefundAmount: number;
    fsaRefundCheckNum: number;
    fsaRefundDate: Date;
    fsaAlloc: number;
    facAlloc: number;
    ffcaAlloc: number;
    totalAlloc: number;
    comment: string;
    markAsDeleted: string;
    updatedBy: string;
    updatedDate: string;
    createdBy: string;
    createdDate: Date;
    

}
