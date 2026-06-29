import { formatPrice } from "@/lib/formatters";

export const infinitePayInstallmentRates = [
  { installments: 1, label: "Crédito à vista", rate: 0.0269 },
  { installments: 2, label: "2x", rate: 0.0394 },
  { installments: 3, label: "3x", rate: 0.0446 },
  { installments: 4, label: "4x", rate: 0.0498 },
  { installments: 5, label: "5x", rate: 0.0549 },
  { installments: 6, label: "6x", rate: 0.0599 },
  { installments: 7, label: "7x", rate: 0.0651 },
  { installments: 8, label: "8x", rate: 0.0699 },
  { installments: 9, label: "9x", rate: 0.0751 },
  { installments: 10, label: "10x", rate: 0.0799 },
  { installments: 11, label: "11x", rate: 0.0849 },
  { installments: 12, label: "12x", rate: 0.0899 }
] as const;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateInstallments(orderTotal: number) {
  return infinitePayInstallmentRates.map((option) => {
    const finalTotal = roundMoney(orderTotal * (1 + option.rate));
    const installmentAmount = roundMoney(finalTotal / option.installments);

    return {
      ...option,
      finalTotal,
      installmentAmount,
      formattedInstallmentAmount: formatPrice(installmentAmount),
      formattedFinalTotal: formatPrice(finalTotal)
    };
  });
}
