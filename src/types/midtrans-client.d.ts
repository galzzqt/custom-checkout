// src/types/midtrans-client.d.ts
declare module 'midtrans-client' {
  interface SnapOptions {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface CustomerDetails {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    billing_address: {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postal_code: string;
      country_code: string;
    };
  }

  interface TransactionParameter {
    transaction_details: TransactionDetails;
    credit_card?: {
      secure: boolean;
    };
    customer_details: CustomerDetails;
  }

  class Snap {
    constructor(options: SnapOptions);
    createTransaction(parameter: TransactionParameter): Promise<{ token: string }>;
  }

  const snap: {
    Snap: typeof Snap;
  };

  export = snap;
}