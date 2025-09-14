export interface Voucher {
    _id: string;
    code: string;
    description: string;
    discountValue: number;
    discountType: string;
    minOrderValue: number;
    maxDiscount: number;
    expiresAt: string;
    startsAt: string;
    isActive: boolean;
    voucherType: "timed" | "limited";
    usageLimit: number;
    usageCount: number;
    currentUsage:number;

}