export interface Voucher {
    _id: string;
    code: string;
    description: string;
    discountValue: number;
    discountType: string;
    minOrderValue: number;
    maxDiscount: number;
    expiresAt: string;
    isActive: boolean;
}