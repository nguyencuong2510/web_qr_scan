import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  public static maskPhoneNumber(phoneNumber: string): string {
    if (
      !phoneNumber ||
      typeof phoneNumber !== 'string' ||
      phoneNumber.length < 3
    ) {
      return phoneNumber;
    }

    // Mask all characters except the last three digits
    const maskedPart = phoneNumber.slice(0, -3).replace(/\d/g, '*');
    const lastThreeDigits = phoneNumber.slice(-3);

    // Combine the masked part and the last three digits
    return maskedPart + lastThreeDigits;
  }
}
