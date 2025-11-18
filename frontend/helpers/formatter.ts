export const formatter = Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const commaFormatter = Intl.NumberFormat("en-US", {
  notation: "standard",
});

export const longDecimalsFormatter = Intl.NumberFormat("en-US", {
  notation: "standard",
  maximumSignificantDigits: 8,
});

export const commaFormatterDecimals = Intl.NumberFormat("en-US", {
  notation: "standard",
  maximumSignificantDigits: 2,
});

export const commaFormatterNoDecimals = Intl.NumberFormat("en-US", {
  notation: "standard",
  maximumFractionDigits: 0,
});

export const moneyFormatter = Intl.NumberFormat("en-US", {
  notation: "compact",
  currency: "USD",
  style: "currency",
  maximumSignificantDigits: 3,
});

export const percentFormatter = Intl.NumberFormat("en-US", {
  notation: "compact",
  style: "percent",
  maximumFractionDigits: 1,
});

export const percentFormatterCommas = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  style: "decimal",
  maximumFractionDigits: 1,
});
