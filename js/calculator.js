/**
 * Safra Finance calculator
 * Tariff config + decimal ROUND_HALF_UP engine + UI binder.
 * Matches САФРА_ТЗ_калькулятори_В3 / control Excel.
 */

/* -------------------------------------------------------------------------- */
/* Decimal arithmetic (ROUND_HALF_UP to 0.01)                                  */
/* -------------------------------------------------------------------------- */

class Dec {
  /**
   * @param {string|number|bigint|Dec} n
   * @param {number} [scale]
   */
  constructor(n, scale = 0) {
    if (n instanceof Dec) {
      this.n = n.n;
      this.s = n.s;
      return;
    }
    if (typeof n === "bigint") {
      this.n = n;
      this.s = scale;
      return;
    }
    const raw = String(n).trim();
    let neg = false;
    let s = raw;
    if (s[0] === "-") {
      neg = true;
      s = s.slice(1);
    }
    if (/e/i.test(s)) {
      const num = Number(raw);
      neg = num < 0;
      s = Math.abs(num).toLocaleString("en-US", {
        useGrouping: false,
        maximumFractionDigits: 20,
      });
    }
    const [i, f = ""] = s.split(".");
    this.s = f.length;
    this.n = BigInt(`${neg ? "-" : ""}${i || "0"}${f}`);
  }

  static from(v) {
    return v instanceof Dec ? v : new Dec(v);
  }

  align(other) {
    const a = this;
    const b = Dec.from(other);
    if (a.s === b.s) return [a, b];
    if (a.s > b.s) {
      return [a, new Dec(b.n * 10n ** BigInt(a.s - b.s), a.s)];
    }
    return [new Dec(a.n * 10n ** BigInt(b.s - a.s), b.s), b];
  }

  add(other) {
    const [a, b] = this.align(other);
    return new Dec(a.n + b.n, a.s);
  }

  sub(other) {
    const [a, b] = this.align(other);
    return new Dec(a.n - b.n, a.s);
  }

  mul(other) {
    const b = Dec.from(other);
    return new Dec(this.n * b.n, this.s + b.s);
  }

  /** Truncating division with `prec` fractional digits (round separately). */
  div(other, prec = 24) {
    const b = Dec.from(other);
    if (b.n === 0n) throw new Error("division_by_zero");
    const numer = this.n * 10n ** BigInt(b.s + prec);
    const denom = b.n * 10n ** BigInt(this.s);
    return new Dec(numer / denom, prec);
  }

  /** ROUND_HALF_UP — ties away from zero. */
  roundHalfUp(dp = 2) {
    if (this.s === dp) return new Dec(this.n, this.s);
    if (this.s < dp) {
      return new Dec(this.n * 10n ** BigInt(dp - this.s), dp);
    }
    const drop = this.s - dp;
    const div = 10n ** BigInt(drop);
    const abs = this.n < 0n ? -this.n : this.n;
    let q = abs / div;
    const r = abs % div;
    if (r * 2n >= div) q += 1n;
    if (this.n < 0n) q = -q;
    return new Dec(q, dp);
  }

  powInt(exp) {
    if (exp === 0) return new Dec(1);
    if (exp < 0) return new Dec(1).div(this.powInt(-exp), 40);
    let base = new Dec(this.n, this.s);
    let result = new Dec(1);
    let e = exp;
    while (e > 0) {
      if (e & 1) result = result.mul(base);
      base = base.mul(base);
      e >>= 1;
    }
    return result;
  }

  toFixed(dp) {
    const r = this.roundHalfUp(dp);
    const abs = r.n < 0n ? -r.n : r.n;
    const sc = 10n ** BigInt(dp);
    const wh = abs / sc;
    const fr = abs % sc;
    return `${r.n < 0n ? "-" : ""}${wh}.${fr.toString().padStart(dp, "0")}`;
  }

  toMoneyNumber() {
    return Number(this.roundHalfUp(2).toFixed(2));
  }

  eq(other) {
    const [a, b] = this.align(other);
    return a.n === b.n;
  }
}

function money(value) {
  return Dec.from(value).roundHalfUp(2);
}

function roundHalfUpMoney(value) {
  return money(value).toMoneyNumber();
}

/* -------------------------------------------------------------------------- */
/* Schemes & tariff config                                                    */
/* -------------------------------------------------------------------------- */

const CALCULATOR_SCHEMES = Object.freeze({
  ANNUITY: "annuity",
  CLASSIC: "classic",
  INTEREST_ONLY: "interest_only", // BULLET
  BULLET: "interest_only",
});

const COLLATERAL_TYPES = Object.freeze({
  CAR: "car",
  RESIDENTIAL_REAL_ESTATE: "residential_real_estate",
});

/** HTML segment values → collateral ids */
const COLLATERAL_HTML_MAP = Object.freeze({
  auto: COLLATERAL_TYPES.CAR,
  car: COLLATERAL_TYPES.CAR,
  realty: COLLATERAL_TYPES.RESIDENTIAL_REAL_ESTATE,
  residential_real_estate: COLLATERAL_TYPES.RESIDENTIAL_REAL_ESTATE,
});

/**
 * Demo tariff catalogue (control Excel rates).
 * NOT used for calculation until activated via activateDemoTariffs() / setActiveTariff().
 * All min/max / LTV / schemes live here — not hardcoded in formulas.
 */
const CALCULATOR_TARIFFS = Object.freeze({
  leasing: Object.freeze({
    id: "leasing",
    annualRate: 0.288,
    oneTimeFee: 8_000,
    insuranceOther: 30_000,
    minAssetValue: 10_000,
    maxAssetValue: 10_000_000,
    defaultAssetValue: 950_000,
    assetStep: 10_000,
    minAdvancePercent: 20,
    maxAdvancePercent: 70,
    advanceStep: 5,
    defaultAdvancePercent: 25,
    minMonths: 12,
    maxMonths: 60,
    defaultMonths: 36,
    allowsBullet: false,
    defaultScheme: CALCULATOR_SCHEMES.ANNUITY,
    schemes: Object.freeze([
      CALCULATOR_SCHEMES.ANNUITY,
      CALCULATOR_SCHEMES.CLASSIC,
    ]),
  }),

  business: Object.freeze({
    id: "business",
    annualRate: 0.2825,
    oneTimeFee: 8_000,
    insuranceOther: 30_000,
    allowsBullet: true,
    minMonths: 3,
    maxMonths: 60,
    defaultMonths: 36,
    defaultScheme: CALCULATOR_SCHEMES.ANNUITY,
    schemes: Object.freeze([
      CALCULATOR_SCHEMES.ANNUITY,
      CALCULATOR_SCHEMES.CLASSIC,
      CALCULATOR_SCHEMES.INTEREST_ONLY,
    ]),
    purchase: Object.freeze({
      minAssetValue: 10_000,
      maxAssetValue: 10_000_000,
      defaultAssetValue: 950_000,
      assetStep: 10_000,
      minDownPaymentPercent: 0,
      maxDownPaymentPercent: 70,
      downPaymentStep: 5,
      defaultDownPaymentPercent: 25,
    }),
    workingCapital: Object.freeze({
      minAmount: 50_000,
      maxAmount: 50_000_000,
      defaultAmount: 1_000_000,
      amountStep: 10_000,
    }),
  }),

  individual: Object.freeze({
    id: "individual",
    annualRate: 0.36,
    oneTimeFee: 8_000,
    insuranceOther: 30_000,
    minMonths: 3,
    maxMonths: 36,
    defaultMonths: 36,
    allowsBullet: false,
    defaultScheme: CALCULATOR_SCHEMES.ANNUITY,
    schemes: Object.freeze([
      CALCULATOR_SCHEMES.ANNUITY,
      CALCULATOR_SCHEMES.CLASSIC,
    ]),
    defaultCollateral: COLLATERAL_TYPES.CAR,
    collaterals: Object.freeze({
      [COLLATERAL_TYPES.CAR]: Object.freeze({
        id: COLLATERAL_TYPES.CAR,
        ltv: 0.7,
        maxAmount: 10_000_000,
        minMarketValue: 100_000,
        maxMarketValue: 50_000_000,
        defaultMarketValue: 2_000_000,
        marketStep: 1_000,
        minLoan: 0,
      }),
      [COLLATERAL_TYPES.RESIDENTIAL_REAL_ESTATE]: Object.freeze({
        id: COLLATERAL_TYPES.RESIDENTIAL_REAL_ESTATE,
        ltv: 0.7,
        maxAmount: 15_000_000,
        minMarketValue: 200_000,
        maxMarketValue: 50_000_000,
        defaultMarketValue: 2_000_000,
        marketStep: 1_000,
        minLoan: 0,
      }),
    }),
  }),
});

/**
 * Product view of active tariff (flat fields for UI + resolvePrincipal).
 * Rate / schemes always come from parent tariff.
 */
const CALCULATOR_PRODUCTS = Object.freeze({
  leasing: Object.freeze({
    id: "leasing",
    tariffId: "leasing",
    annualRate: CALCULATOR_TARIFFS.leasing.annualRate,
    minAssetValue: CALCULATOR_TARIFFS.leasing.minAssetValue,
    maxAssetValue: CALCULATOR_TARIFFS.leasing.maxAssetValue,
    defaultAssetValue: CALCULATOR_TARIFFS.leasing.defaultAssetValue,
    assetStep: CALCULATOR_TARIFFS.leasing.assetStep,
    minAdvancePercent: CALCULATOR_TARIFFS.leasing.minAdvancePercent,
    maxAdvancePercent: CALCULATOR_TARIFFS.leasing.maxAdvancePercent,
    advanceStep: CALCULATOR_TARIFFS.leasing.advanceStep,
    defaultAdvancePercent: CALCULATOR_TARIFFS.leasing.defaultAdvancePercent,
    minMonths: CALCULATOR_TARIFFS.leasing.minMonths,
    maxMonths: CALCULATOR_TARIFFS.leasing.maxMonths,
    defaultMonths: CALCULATOR_TARIFFS.leasing.defaultMonths,
    allowsBullet: CALCULATOR_TARIFFS.leasing.allowsBullet,
    defaultScheme: CALCULATOR_TARIFFS.leasing.defaultScheme,
    schemes: CALCULATOR_TARIFFS.leasing.schemes,
  }),

  business_purchase_asset: Object.freeze({
    id: "business_purchase_asset",
    tariffId: "business",
    annualRate: CALCULATOR_TARIFFS.business.annualRate,
    minAssetValue: CALCULATOR_TARIFFS.business.purchase.minAssetValue,
    maxAssetValue: CALCULATOR_TARIFFS.business.purchase.maxAssetValue,
    defaultAssetValue: CALCULATOR_TARIFFS.business.purchase.defaultAssetValue,
    assetStep: CALCULATOR_TARIFFS.business.purchase.assetStep,
    minDownPaymentPercent: CALCULATOR_TARIFFS.business.purchase.minDownPaymentPercent,
    maxDownPaymentPercent: CALCULATOR_TARIFFS.business.purchase.maxDownPaymentPercent,
    downPaymentStep: CALCULATOR_TARIFFS.business.purchase.downPaymentStep,
    defaultDownPaymentPercent:
      CALCULATOR_TARIFFS.business.purchase.defaultDownPaymentPercent,
    minMonths: CALCULATOR_TARIFFS.business.minMonths,
    maxMonths: CALCULATOR_TARIFFS.business.maxMonths,
    defaultMonths: CALCULATOR_TARIFFS.business.defaultMonths,
    allowsBullet: CALCULATOR_TARIFFS.business.allowsBullet,
    defaultScheme: CALCULATOR_TARIFFS.business.defaultScheme,
    schemes: CALCULATOR_TARIFFS.business.schemes,
  }),

  business_working_capital: Object.freeze({
    id: "business_working_capital",
    tariffId: "business",
    annualRate: CALCULATOR_TARIFFS.business.annualRate,
    minAmount: CALCULATOR_TARIFFS.business.workingCapital.minAmount,
    maxAmount: CALCULATOR_TARIFFS.business.workingCapital.maxAmount,
    defaultAmount: CALCULATOR_TARIFFS.business.workingCapital.defaultAmount,
    amountStep: CALCULATOR_TARIFFS.business.workingCapital.amountStep,
    minMonths: CALCULATOR_TARIFFS.business.minMonths,
    maxMonths: CALCULATOR_TARIFFS.business.maxMonths,
    defaultMonths: CALCULATOR_TARIFFS.business.defaultMonths,
    allowsBullet: CALCULATOR_TARIFFS.business.allowsBullet,
    defaultScheme: CALCULATOR_TARIFFS.business.defaultScheme,
    schemes: CALCULATOR_TARIFFS.business.schemes,
  }),

  individual_secured_loan: Object.freeze({
    id: "individual_secured_loan",
    tariffId: "individual",
    annualRate: CALCULATOR_TARIFFS.individual.annualRate,
    minMonths: CALCULATOR_TARIFFS.individual.minMonths,
    maxMonths: CALCULATOR_TARIFFS.individual.maxMonths,
    defaultMonths: CALCULATOR_TARIFFS.individual.defaultMonths,
    allowsBullet: CALCULATOR_TARIFFS.individual.allowsBullet,
    defaultScheme: CALCULATOR_TARIFFS.individual.defaultScheme,
    schemes: CALCULATOR_TARIFFS.individual.schemes,
    defaultCollateral: CALCULATOR_TARIFFS.individual.defaultCollateral,
    collaterals: CALCULATOR_TARIFFS.individual.collaterals,
  }),
});

/** Runtime active tariffs. Empty until activateDemoTariffs() / setActiveTariff(). */
const activeTariffRegistry = Object.create(null);

function setActiveTariff(tariffId, tariff) {
  if (!tariffId || !tariff) return;
  activeTariffRegistry[tariffId] = tariff;
}

function clearActiveTariffs() {
  Object.keys(activeTariffRegistry).forEach((key) => {
    delete activeTariffRegistry[key];
  });
}

/** Activate demo catalogue for UI / local verification. Not implied by mere presence of CALCULATOR_TARIFFS. */
function activateDemoTariffs() {
  Object.keys(CALCULATOR_TARIFFS).forEach((id) => {
    setActiveTariff(id, CALCULATOR_TARIFFS[id]);
  });
}

function getActiveTariff(productId) {
  const product = CALCULATOR_PRODUCTS[productId];
  if (!product) return null;
  return activeTariffRegistry[product.tariffId] || null;
}

function hasActiveTariff(productId) {
  return getActiveTariff(productId) != null;
}

/**
 * Effective product config from active tariff only.
 * Returns null when no active tariff — caller must not fall back to demo rates.
 */
function getEffectiveProduct(productId) {
  const shell = CALCULATOR_PRODUCTS[productId];
  const tariff = getActiveTariff(productId);
  if (!shell || !tariff) return null;

  if (productId === "leasing") {
    return {
      ...shell,
      annualRate: tariff.annualRate,
      minAssetValue: tariff.minAssetValue,
      maxAssetValue: tariff.maxAssetValue,
      defaultAssetValue: tariff.defaultAssetValue,
      assetStep: tariff.assetStep,
      minAdvancePercent: tariff.minAdvancePercent,
      maxAdvancePercent: tariff.maxAdvancePercent,
      advanceStep: tariff.advanceStep,
      defaultAdvancePercent: tariff.defaultAdvancePercent,
      minMonths: tariff.minMonths,
      maxMonths: tariff.maxMonths,
      defaultMonths: tariff.defaultMonths,
      allowsBullet: Boolean(tariff.allowsBullet),
      defaultScheme: tariff.defaultScheme || shell.defaultScheme,
      schemes: tariff.schemes || shell.schemes,
    };
  }

  if (productId === "business_purchase_asset") {
    const purchase = tariff.purchase || {};
    return {
      ...shell,
      annualRate: tariff.annualRate,
      minAssetValue: purchase.minAssetValue ?? shell.minAssetValue,
      maxAssetValue: purchase.maxAssetValue ?? shell.maxAssetValue,
      defaultAssetValue: purchase.defaultAssetValue ?? shell.defaultAssetValue,
      assetStep: purchase.assetStep ?? shell.assetStep,
      minDownPaymentPercent:
        purchase.minDownPaymentPercent ?? shell.minDownPaymentPercent,
      maxDownPaymentPercent:
        purchase.maxDownPaymentPercent ?? shell.maxDownPaymentPercent,
      downPaymentStep: purchase.downPaymentStep ?? shell.downPaymentStep,
      defaultDownPaymentPercent:
        purchase.defaultDownPaymentPercent ?? shell.defaultDownPaymentPercent,
      minMonths: tariff.minMonths ?? shell.minMonths,
      maxMonths: tariff.maxMonths ?? shell.maxMonths,
      defaultMonths: tariff.defaultMonths ?? shell.defaultMonths,
      allowsBullet: Boolean(tariff.allowsBullet),
      defaultScheme: tariff.defaultScheme || shell.defaultScheme,
      schemes: tariff.schemes || shell.schemes,
    };
  }

  if (productId === "business_working_capital") {
    const wc = tariff.workingCapital || {};
    return {
      ...shell,
      annualRate: tariff.annualRate,
      minAmount: wc.minAmount ?? shell.minAmount,
      maxAmount: wc.maxAmount ?? shell.maxAmount,
      defaultAmount: wc.defaultAmount ?? shell.defaultAmount,
      amountStep: wc.amountStep ?? shell.amountStep,
      minMonths: tariff.minMonths ?? shell.minMonths,
      maxMonths: tariff.maxMonths ?? shell.maxMonths,
      defaultMonths: tariff.defaultMonths ?? shell.defaultMonths,
      allowsBullet: Boolean(tariff.allowsBullet),
      defaultScheme: tariff.defaultScheme || shell.defaultScheme,
      schemes: tariff.schemes || shell.schemes,
    };
  }

  if (productId === "individual_secured_loan") {
    return {
      ...shell,
      annualRate: tariff.annualRate,
      minMonths: tariff.minMonths ?? shell.minMonths,
      maxMonths: tariff.maxMonths ?? shell.maxMonths,
      defaultMonths: tariff.defaultMonths ?? shell.defaultMonths,
      allowsBullet: Boolean(tariff.allowsBullet),
      defaultScheme: tariff.defaultScheme || shell.defaultScheme,
      schemes: tariff.schemes || shell.schemes,
      defaultCollateral: tariff.defaultCollateral || shell.defaultCollateral,
      collaterals: tariff.collaterals || shell.collaterals,
    };
  }

  return {
    ...shell,
    annualRate: tariff.annualRate,
    allowsBullet: Boolean(tariff.allowsBullet),
  };
}

function resolveCollateralType(input) {
  const raw = input?.collateralType ?? input?.collateral ?? COLLATERAL_TYPES.CAR;
  return COLLATERAL_HTML_MAP[raw] || COLLATERAL_TYPES.CAR;
}

function getCollateralTariff(product, collateralType) {
  const type = resolveCollateralType({ collateralType });
  return (
    product.collaterals?.[type] ||
    product.collaterals?.[product.defaultCollateral] ||
    null
  );
}

function allowedSchemesForProduct(product) {
  const schemes = [...(product.schemes || [])];
  if (!product.allowsBullet) {
    return schemes.filter((s) => s !== CALCULATOR_SCHEMES.INTEREST_ONLY);
  }
  return schemes;
}

function isBulletScheme(scheme) {
  return (
    scheme === CALCULATOR_SCHEMES.INTEREST_ONLY ||
    scheme === "bullet" ||
    scheme === "BULLET"
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function clampNumber(value, min, max) {
  if (!isFiniteNumber(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Snap to step. Exact midpoint between steps rounds UP.
 * Example: step 10000, 1_235_000 → 1_240_000; 1_234_567 → 1_230_000.
 */
function snapToStep(value, step) {
  if (!isFiniteNumber(value)) return value;
  const safeStep = step > 0 ? step : 1;
  const ratio = value / safeStep;
  const lower = Math.floor(ratio);
  const frac = ratio - lower;
  // frac < 0.5 → down; frac >= 0.5 (incl. exact midpoint) → up
  if (frac < 0.5) return lower * safeStep;
  return (lower + 1) * safeStep;
}

function snapAmount(value, min, max, step) {
  if (!isFiniteNumber(value)) value = min;
  const snapped = snapToStep(value, step > 0 ? step : 1);
  return clampNumber(snapped, min, max);
}

/**
 * Snap percent to step (e.g. 5), then clamp to [min, max].
 * 23% → 25% with step 5. Values below min (e.g. advance 15) → tariff min.
 */
function normalizePercentStep(value, min, max, step = 5) {
  if (!isFiniteNumber(value)) value = min;
  const safeStep = step > 0 ? step : 1;
  const snapped = snapToStep(value, safeStep);
  return clampNumber(snapped, min, max);
}

/** Guard: closing balance must never go negative. */
function resolveMonthParts(openingBalance, proposedPrincipalPart, interest, isLast) {
  const opening = openingBalance.roundHalfUp(2);
  const interestMoney = interest.roundHalfUp(2);

  if (isLast) {
    const principalPart = opening;
    return {
      principalPart,
      payment: principalPart.add(interestMoney).roundHalfUp(2),
      closingBalance: money(0),
    };
  }

  let principalPart = proposedPrincipalPart.roundHalfUp(2);
  let closingBalance = opening.sub(principalPart).roundHalfUp(2);

  if (closingBalance.n < 0n) {
    principalPart = opening;
    closingBalance = money(0);
  }

  return {
    principalPart,
    payment: principalPart.add(interestMoney).roundHalfUp(2),
    closingBalance,
  };
}

function buildEmptyResult(overrides = {}) {
  return {
    principal: 0,
    monthlyPayment: 0,
    firstPayment: 0,
    lastPayment: 0,
    totalInterest: 0,
    totalRepayment: 0,
    annualRate: 0,
    monthlyRate: 0,
    months: 0,
    downPaymentAmount: 0,
    maxAvailableLoan: 0,
    schedule: [],
    error: null,
    ...overrides,
  };
}

/* -------------------------------------------------------------------------- */
/* Schedule builders (decimal, ROUND_HALF_UP 0.01)                            */
/* -------------------------------------------------------------------------- */

function buildScheduleAnnuity(principalInput, annualRate, months) {
  const principal = money(principalInput);
  const rate = Dec.from(annualRate);
  const r = rate.div(12, 40);
  // A = P*r/(1-(1+r)^(-n)); when rate=0 → equal principal parts P/n
  let A;
  if (rate.n === 0n) {
    A = principal.div(months, 40);
  } else {
    const one = new Dec(1);
    const onePlusR = one.add(r);
    const pow = onePlusR.powInt(months);
    const invPow = one.div(pow, 40);
    const denom = one.sub(invPow);
    A = principal.mul(r).div(denom, 40);
  }

  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    const interest = openingBalance.mul(rate).div(12, 40).roundHalfUp(2);
    const isLast = month === months;
    const proposedPrincipal = isLast
      ? openingBalance
      : A.sub(interest);
    const parts = resolveMonthParts(
      openingBalance,
      proposedPrincipal,
      interest,
      isLast,
    );

    balance = parts.closingBalance;
    schedule.push({
      month,
      openingBalance: openingBalance.toMoneyNumber(),
      payment: parts.payment.toMoneyNumber(),
      principalPart: parts.principalPart.toMoneyNumber(),
      interest: interest.toMoneyNumber(),
      closingBalance: parts.closingBalance.toMoneyNumber(),
    });
  }

  return { schedule, annuityPayment: A.toMoneyNumber() };
}

function buildScheduleClassic(principalInput, annualRate, months) {
  const principal = money(principalInput);
  const rate = Dec.from(annualRate);
  const regularPrincipal = principal.div(months, 40).roundHalfUp(2);

  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    const interest = openingBalance.mul(rate).div(12, 40).roundHalfUp(2);
    const isLast = month === months;
    const parts = resolveMonthParts(
      openingBalance,
      isLast ? openingBalance : regularPrincipal,
      interest,
      isLast,
    );

    balance = parts.closingBalance;
    schedule.push({
      month,
      openingBalance: openingBalance.toMoneyNumber(),
      payment: parts.payment.toMoneyNumber(),
      principalPart: parts.principalPart.toMoneyNumber(),
      interest: interest.toMoneyNumber(),
      closingBalance: parts.closingBalance.toMoneyNumber(),
    });
  }

  return { schedule, regularPrincipal: regularPrincipal.toMoneyNumber() };
}

/** BULLET / INTEREST_ONLY */
function buildScheduleBullet(principalInput, annualRate, months) {
  const principal = money(principalInput);
  const rate = Dec.from(annualRate);

  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= months; month += 1) {
    const openingBalance = balance;
    const interest = openingBalance.mul(rate).div(12, 40).roundHalfUp(2);
    const isLast = month === months;
    const parts = resolveMonthParts(
      openingBalance,
      isLast ? openingBalance : money(0),
      interest,
      isLast,
    );

    balance = parts.closingBalance;
    schedule.push({
      month,
      openingBalance: openingBalance.toMoneyNumber(),
      payment: parts.payment.toMoneyNumber(),
      principalPart: parts.principalPart.toMoneyNumber(),
      interest: interest.toMoneyNumber(),
      closingBalance: parts.closingBalance.toMoneyNumber(),
    });
  }

  return { schedule };
}

function summarizeSchedule(schedule, principal, annualRate, months, extras = {}) {
  let totalInterest = money(0);
  let totalRepayment = money(0);

  for (const row of schedule) {
    totalInterest = totalInterest.add(row.interest);
    totalRepayment = totalRepayment.add(row.payment);
  }

  const firstPayment = schedule[0]?.payment ?? 0;
  const lastPayment = schedule[schedule.length - 1]?.payment ?? 0;
  const monthlyRate = Dec.from(annualRate).div(12, 40).toMoneyNumber();

  return {
    principal: money(principal).toMoneyNumber(),
    monthlyPayment: firstPayment,
    firstPayment,
    lastPayment,
    totalInterest: totalInterest.toMoneyNumber(),
    totalRepayment: totalRepayment.toMoneyNumber(),
    annualRate,
    monthlyRate,
    months,
    downPaymentAmount: 0,
    maxAvailableLoan: 0,
    schedule,
    error: null,
    ...extras,
  };
}

/**
 * Pure schedule calculation for a fixed principal + rate + scheme.
 * Used by product calculator and Excel control tests.
 */
function calculateLoanSchedule({ principal, annualRate, months, scheme }) {
  if (!isFiniteNumber(months) || months <= 0) {
    return buildEmptyResult({ error: "invalid_months" });
  }

  if (!isFiniteNumber(principal) && !(principal instanceof Dec)) {
    return buildEmptyResult({
      annualRate: isFiniteNumber(annualRate) ? annualRate : 0,
      months,
      error: "invalid_principal",
    });
  }

  const principalMoney = money(principal).toMoneyNumber();
  if (principalMoney <= 0) {
    return buildEmptyResult({
      annualRate: isFiniteNumber(annualRate) ? annualRate : 0,
      monthlyRate: isFiniteNumber(annualRate)
        ? Dec.from(annualRate).div(12, 40).toMoneyNumber()
        : 0,
      months,
      error: "invalid_principal",
    });
  }

  if (!isFiniteNumber(annualRate) || annualRate < 0) {
    return buildEmptyResult({
      principal: principalMoney,
      months,
      error: "invalid_rate",
    });
  }

  if (scheme === CALCULATOR_SCHEMES.CLASSIC) {
    const { schedule } = buildScheduleClassic(principalMoney, annualRate, months);
    return summarizeSchedule(schedule, principalMoney, annualRate, months, {
      monthlyPayment: null,
    });
  }

  if (
    scheme === CALCULATOR_SCHEMES.INTEREST_ONLY ||
    scheme === "bullet" ||
    scheme === "BULLET"
  ) {
    const { schedule } = buildScheduleBullet(principalMoney, annualRate, months);
    return summarizeSchedule(schedule, principalMoney, annualRate, months, {
      monthlyPayment: null,
    });
  }

  const { schedule, annuityPayment } = buildScheduleAnnuity(
    principalMoney,
    annualRate,
    months,
  );
  return summarizeSchedule(schedule, principalMoney, annualRate, months, {
    monthlyPayment: schedule[0]?.payment ?? annuityPayment,
  });
}

/* -------------------------------------------------------------------------- */
/* Principal resolution                                                       */
/* -------------------------------------------------------------------------- */

function resolvePrincipal(productId, input, product) {
  if (productId === "business_purchase_asset") {
    const assetValue = snapAmount(
      input.assetValue,
      product.minAssetValue,
      product.maxAssetValue,
      product.assetStep || 10_000,
    );
    const downPaymentPercent = normalizePercentStep(
      input.downPaymentPercent,
      product.minDownPaymentPercent,
      product.maxDownPaymentPercent,
      product.downPaymentStep || 5,
    );
    const downPaymentAmount = roundHalfUpMoney(
      Dec.from(assetValue).mul(downPaymentPercent).div(100, 40),
    );
    const principal = roundHalfUpMoney(
      Dec.from(assetValue).sub(downPaymentAmount),
    );
    return {
      principal,
      downPaymentAmount,
      maxAvailableLoan: 0,
      assetValue,
      downPaymentPercent,
    };
  }

  if (productId === "leasing") {
    const assetValue = snapAmount(
      input.assetValue,
      product.minAssetValue,
      product.maxAssetValue,
      product.assetStep || 10_000,
    );
    const advancePercent = normalizePercentStep(
      input.advancePercent,
      product.minAdvancePercent,
      product.maxAdvancePercent,
      product.advanceStep || 5,
    );
    const downPaymentAmount = roundHalfUpMoney(
      Dec.from(assetValue).mul(advancePercent).div(100, 40),
    );
    const principal = roundHalfUpMoney(
      Dec.from(assetValue).sub(downPaymentAmount),
    );
    return {
      principal,
      downPaymentAmount,
      maxAvailableLoan: 0,
      assetValue,
      advancePercent,
    };
  }

  if (productId === "business_working_capital") {
    // Down payment / advance is absent for WC — ignore if passed.
    const principal = snapAmount(
      input.principal ?? input.amount,
      product.minAmount,
      product.maxAmount,
      product.amountStep || 10_000,
    );
    return {
      principal,
      downPaymentAmount: 0,
      maxAvailableLoan: 0,
      ignoredDownPayment: true,
      ignoredAdvance: true,
    };
  }

  if (productId === "individual_secured_loan") {
    const collateralType = resolveCollateralType(input);
    const collateral = getCollateralTariff(product, collateralType);
    if (!collateral) {
      return {
        principal: 0,
        downPaymentAmount: 0,
        maxAvailableLoan: 0,
        error: "unknown_collateral",
      };
    }

    const marketValue = snapAmount(
      input.marketValue,
      collateral.minMarketValue,
      collateral.maxMarketValue,
      collateral.marketStep || 1_000,
    );
    const maxLoanByLtv = roundHalfUpMoney(
      Dec.from(marketValue).mul(collateral.ltv),
    );
    const maxAvailableLoan = roundHalfUpMoney(
      Math.min(maxLoanByLtv, collateral.maxAmount),
    );
    let requestedLoan = input.requestedLoan;

    if (!isFiniteNumber(requestedLoan)) {
      requestedLoan = maxAvailableLoan;
    } else {
      requestedLoan = snapAmount(
        requestedLoan,
        collateral.minLoan ?? 0,
        maxAvailableLoan,
        collateral.marketStep || 1_000,
      );
    }

    // requestedLoan > collateralValue * LTV → clamp to available
    const principal = roundHalfUpMoney(
      clampNumber(requestedLoan, collateral.minLoan ?? 0, maxAvailableLoan),
    );

    return {
      principal,
      downPaymentAmount: roundHalfUpMoney(Dec.from(marketValue).sub(principal)),
      maxAvailableLoan,
      marketValue,
      requestedLoan: principal,
      collateralType,
      ltv: collateral.ltv,
      clampedByLtv: isFiniteNumber(input.requestedLoan)
        ? input.requestedLoan > maxAvailableLoan
        : false,
    };
  }

  return {
    principal: 0,
    downPaymentAmount: 0,
    maxAvailableLoan: 0,
    error: "unknown_product",
  };
}

/**
 * Pure product calculation entry point.
 * Rate / limits come ONLY from active tariff — never from bare demo catalogue.
 */
function calculateCalculator(productId, input = {}) {
  if (!CALCULATOR_PRODUCTS[productId]) {
    return buildEmptyResult({ error: "unknown_product" });
  }

  const product = getEffectiveProduct(productId);
  if (!product) {
    return buildEmptyResult({ error: "no_active_tariff" });
  }

  const tariff = getActiveTariff(productId);
  const annualRate = tariff.annualRate;

  const resolved = resolvePrincipal(productId, input, product);
  if (resolved.error) {
    return buildEmptyResult({ error: resolved.error });
  }

  if (!isFiniteNumber(input.months) || input.months <= 0) {
    return buildEmptyResult({
      annualRate,
      monthlyRate: Dec.from(annualRate).div(12, 40).toMoneyNumber(),
      error: "invalid_months",
    });
  }

  const months = clampNumber(input.months, product.minMonths, product.maxMonths);
  const schemes = allowedSchemesForProduct(product);
  let scheme = schemes.includes(input.scheme) ? input.scheme : product.defaultScheme;
  let schemeRejected = false;

  if (isBulletScheme(input.scheme) && !product.allowsBullet) {
    scheme = product.defaultScheme;
    schemeRejected = true;
  } else if (isBulletScheme(scheme) && !product.allowsBullet) {
    scheme = product.defaultScheme;
    schemeRejected = true;
  }

  const result = calculateLoanSchedule({
    principal: resolved.principal,
    annualRate,
    months,
    scheme,
  });

  return {
    ...result,
    scheme,
    downPaymentAmount: resolved.downPaymentAmount,
    maxAvailableLoan: resolved.maxAvailableLoan,
    meta: {
      ...resolved,
      scheme,
      schemeRejected,
      tariffId: product.tariffId,
      monthsInput: input.months,
      monthsClamped: months !== input.months,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* UI helpers                                                                 */
/* -------------------------------------------------------------------------- */

function formatMoneyUa(value, withDot = false) {
  const amount = roundHalfUpMoney(value);
  const formatted = amount.toLocaleString("uk-UA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/\u00A0/g, " ");
  return withDot ? `${formatted} грн.` : `${formatted} грн`;
}

function formatPercentUa(value) {
  return `${Math.round(Number(value) || 0)}%`;
}

function formatRateUa(annualRate) {
  let display = Dec.from(annualRate).mul(100).toFixed(2).replace(/\.?0+$/, "");
  if (display.endsWith(".")) display = display.slice(0, -1);
  return `${display} % річних`;
}

function parseDigits(value) {
  const digits = String(value ?? "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : NaN;
}

/**
 * Parse money from formatted UA input like "950 000,00 грн.".
 * Do NOT strip all non-digits — that turns "950 000,00" into 95000000.
 */
function parseMoneyInput(value) {
  let s = String(value ?? "").trim();
  if (!s) return NaN;
  s = s
    .replace(/грн\.?/gi, "")
    .replace(/\u00A0/g, " ")
    .replace(/\s/g, "")
    .replace(/[^\d.,-]/g, "");
  if (!s || s === "-" || s === "." || s === ",") return NaN;

  if (s.includes(",") && s.includes(".")) {
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }

  const num = Number(s);
  return Number.isFinite(num) ? num : NaN;
}

function parsePercentInput(value) {
  const cleaned = String(value ?? "").replace(",", ".").replace(/[^\d.]/g, "");
  if (!cleaned) return NaN;
  return Number(cleaned);
}

function termLabelUa(months) {
  const value = Math.round(months);
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return `${value} місяць`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${value} місяці`;
  }
  return `${value} місяців`;
}

function schemeLabelUa(scheme) {
  if (scheme === CALCULATOR_SCHEMES.CLASSIC) return "Класичний";
  if (scheme === CALCULATOR_SCHEMES.INTEREST_ONLY) return "В кінці строку";
  return "Ануїтет";
}

function setRangeProgress(range) {
  if (!range) return;
  const min = Number(range.min);
  const max = Number(range.max);
  const value = Number(range.value);
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;
  range.style.setProperty("--progress", `${progress}%`);
}

/* -------------------------------------------------------------------------- */
/* UI binder                                                                  */
/* -------------------------------------------------------------------------- */

function initCalculatorRoot(root) {
  const productSwitchInputs = [...root.querySelectorAll("[data-calculator-product-switch]")];
  let productId =
    root.getAttribute("data-calculator-product") ||
    productSwitchInputs.find((input) => input.checked)?.value ||
    productSwitchInputs[0]?.value;

  if (!productId || !CALCULATOR_PRODUCTS[productId]) return;

  const panels = [...root.querySelectorAll("[data-calculator-panel]")];
  const stateByProduct = {};

  function activeProductId() {
    if (productSwitchInputs.length) {
      return (
        productSwitchInputs.find((input) => input.checked)?.value ||
        productSwitchInputs[0].value
      );
    }
    return productId;
  }

  function syncPanels() {
    const current = activeProductId();
    productId = current;
    root.setAttribute("data-calculator-product", current);
    panels.forEach((panel) => {
      const match = panel.getAttribute("data-calculator-panel") === current;
      panel.hidden = !match;
    });
  }

  function syncCollateralPanels() {
    const type = readCollateralType();
    const key = type === COLLATERAL_TYPES.RESIDENTIAL_REAL_ESTATE ? "realty" : "auto";
    root.querySelectorAll("[data-calculator-collateral-panel]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-calculator-collateral-panel") !== key;
    });
  }

  function qs(sel) {
    const panel = root.querySelector(
      `[data-calculator-panel="${activeProductId()}"]:not([hidden])`,
    );
    return (panel || root).querySelector(sel);
  }

  function qsa(sel) {
    const panel = root.querySelector(
      `[data-calculator-panel="${activeProductId()}"]:not([hidden])`,
    );
    return [...(panel || root).querySelectorAll(sel)];
  }

  function activeProduct() {
    return (
      getEffectiveProduct(activeProductId()) ||
      CALCULATOR_PRODUCTS[activeProductId()]
    );
  }

  function readCollateralType() {
    const checked = root.querySelector(
      'input[name="secured-collateral"]:checked, [data-calculator-collateral]:checked',
    );
    if (!checked) {
      return CALCULATOR_PRODUCTS.individual_secured_loan.defaultCollateral;
    }
    return resolveCollateralType({ collateralType: checked.value });
  }

  function createDefaultState(id) {
    const product =
      getEffectiveProduct(id) || CALCULATOR_PRODUCTS[id];
    const schemes = allowedSchemesForProduct(product);
    const schemeFromDom = qsa("[data-calculator-scheme]").find((el) => el.checked)?.value;
    const scheme = schemes.includes(schemeFromDom)
      ? schemeFromDom
      : product.defaultScheme;

    if (id === "business_purchase_asset") {
      return {
        assetValue: product.defaultAssetValue,
        downPaymentPercent: product.defaultDownPaymentPercent,
        months: product.defaultMonths,
        scheme,
      };
    }

    if (id === "leasing") {
      return {
        assetValue: product.defaultAssetValue,
        advancePercent: product.defaultAdvancePercent,
        months: product.defaultMonths,
        scheme,
      };
    }

    if (id === "business_working_capital") {
      return {
        principal: product.defaultAmount,
        months: product.defaultMonths,
        scheme,
      };
    }

    if (id === "individual_secured_loan") {
      const collateralType = readCollateralType();
      const collateral = getCollateralTariff(product, collateralType);
      const maxAvailableLoan = roundHalfUpMoney(
        Math.min(
          roundHalfUpMoney(Dec.from(collateral.defaultMarketValue).mul(collateral.ltv)),
          collateral.maxAmount,
        ),
      );
      return {
        collateralType,
        marketValue: collateral.defaultMarketValue,
        requestedLoan: maxAvailableLoan,
        months: product.defaultMonths,
        scheme,
      };
    }

    return { months: product.defaultMonths, scheme };
  }

  function ensureState() {
    const id = activeProductId();
    if (!stateByProduct[id]) {
      stateByProduct[id] = createDefaultState(id);
    }
    return stateByProduct[id];
  }

  function syncSchemeRadios() {
    const product = activeProduct();
    const schemes = allowedSchemesForProduct(product);
    const state = ensureState();

    qsa("[data-calculator-scheme]").forEach((input) => {
      const label = input.closest("label") || input.parentElement;
      const allowed = schemes.includes(input.value);
      if (label) label.hidden = !allowed;
      input.disabled = !allowed;
      if (!allowed && input.checked) {
        input.checked = false;
      }
    });

    if (!schemes.includes(state.scheme)) {
      state.scheme = product.defaultScheme;
    }

    const current = qsa("[data-calculator-scheme]").find(
      (el) => el.value === state.scheme && !el.disabled,
    );
    if (current) current.checked = true;
    else {
      const fallback = qsa("[data-calculator-scheme]").find((el) => !el.disabled);
      if (fallback) {
        fallback.checked = true;
        state.scheme = fallback.value;
      }
    }
  }

  function applyProductLimitsToControls() {
    const product = activeProduct();
    const id = activeProductId();
    const termRange = qs("[data-calculator-term-range]");
    if (termRange) {
      termRange.min = String(product.minMonths);
      termRange.max = String(product.maxMonths);
    }

    const setBound = (key, text) => {
      qsa(`[data-calculator-bound="${key}"]`).forEach((el) => {
        el.textContent = text;
      });
    };

    setBound("term-min", `${product.minMonths} міс.`);
    setBound("term-max", `${product.maxMonths} міс.`);

    if (id === "business_purchase_asset" || id === "leasing") {
      const assetRange = qs("[data-calculator-asset-range]");
      if (assetRange) {
        assetRange.min = String(product.minAssetValue);
        assetRange.max = String(product.maxAssetValue);
        assetRange.step = String(product.assetStep);
      }
      const percentRange =
        id === "leasing"
          ? qs("[data-calculator-advance-range]")
          : qs("[data-calculator-down-range]");
      const minPercent =
        id === "leasing" ? product.minAdvancePercent : product.minDownPaymentPercent;
      const maxPercent =
        id === "leasing" ? product.maxAdvancePercent : product.maxDownPaymentPercent;
      const step =
        id === "leasing"
          ? product.advanceStep || 5
          : product.downPaymentStep || 5;
      if (percentRange) {
        percentRange.min = String(minPercent);
        percentRange.max = String(maxPercent);
        percentRange.step = String(step);
      }
      setBound("asset-min", formatMoneyUa(product.minAssetValue, true));
      setBound("asset-max", formatMoneyUa(product.maxAssetValue, true));
      if (id === "leasing") {
        setBound("advance-min", `${minPercent}%`);
        setBound("advance-max", `${maxPercent}%`);
      } else {
        setBound("down-min", `${minPercent}%`);
        setBound("down-max", `${maxPercent}%`);
      }
    }

    if (id === "business_working_capital") {
      const amountRange = qs("[data-calculator-amount-range]");
      if (amountRange) {
        amountRange.min = String(product.minAmount);
        amountRange.max = String(product.maxAmount);
        amountRange.step = String(product.amountStep);
      }
      setBound("amount-min", formatMoneyUa(product.minAmount, true));
      setBound("amount-max", formatMoneyUa(product.maxAmount, true));
    }

    if (id === "individual_secured_loan") {
      const state = ensureState();
      const collateral = getCollateralTariff(product, state.collateralType);
      const marketRange = qs("[data-calculator-market-range]");
      if (marketRange && collateral) {
        marketRange.min = String(collateral.minMarketValue);
        marketRange.max = String(collateral.maxMarketValue);
        marketRange.step = String(collateral.marketStep);
      }
      if (collateral) {
        setBound("market-min", formatMoneyUa(collateral.minMarketValue, true));
        setBound("market-max", formatMoneyUa(collateral.maxMarketValue, true));
        setBound("loan-min", formatMoneyUa(collateral.minLoan ?? 0, true));
      }
    }

    syncSchemeRadios();
  }

  function updateStateFromSource(source, { commit = true } = {}) {
    const product = activeProduct();
    const id = activeProductId();
    const state = ensureState();

    const schemeInput = qsa("[data-calculator-scheme]").find((el) => el.checked);
    if (schemeInput && !schemeInput.disabled) {
      state.scheme = schemeInput.value;
    }

    if (source === "term-input") {
      const parsed = parseDigits(qs("[data-calculator-term-input]")?.value);
      if (isFiniteNumber(parsed)) {
        state.months = commit
          ? clampNumber(parsed, product.minMonths, product.maxMonths)
          : parsed;
      }
    } else if (source === "term-range") {
      state.months = clampNumber(
        Number(qs("[data-calculator-term-range]")?.value),
        product.minMonths,
        product.maxMonths,
      );
    }

    if (id === "business_purchase_asset" || id === "leasing") {
      const minPercent =
        id === "leasing" ? product.minAdvancePercent : product.minDownPaymentPercent;
      const maxPercent =
        id === "leasing" ? product.maxAdvancePercent : product.maxDownPaymentPercent;
      const step =
        id === "leasing"
          ? product.advanceStep || 5
          : product.downPaymentStep || 5;
      const percentKey = id === "leasing" ? "advancePercent" : "downPaymentPercent";
      const assetStep = product.assetStep || 10_000;

      if (source === "asset-input") {
        const parsed = parseMoneyInput(qs("[data-calculator-asset-input]")?.value);
        if (isFiniteNumber(parsed)) {
          state.assetValue = commit
            ? snapAmount(
                parsed,
                product.minAssetValue,
                product.maxAssetValue,
                assetStep,
              )
            : clampNumber(parsed, product.minAssetValue, product.maxAssetValue);
        }
      } else if (source === "asset-range") {
        state.assetValue = snapAmount(
          Number(qs("[data-calculator-asset-range]")?.value),
          product.minAssetValue,
          product.maxAssetValue,
          assetStep,
        );
      }

      if (source === "percent-input") {
        const parsed = parsePercentInput(
          qs(
            id === "leasing"
              ? "[data-calculator-advance-percent]"
              : "[data-calculator-down-percent]",
          )?.value,
        );
        if (isFiniteNumber(parsed)) {
          state[percentKey] = commit
            ? normalizePercentStep(parsed, minPercent, maxPercent, step)
            : clampNumber(parsed, minPercent, maxPercent);
        }
      } else if (source === "percent-range") {
        state[percentKey] = normalizePercentStep(
          Number(
            qs(
              id === "leasing"
                ? "[data-calculator-advance-range]"
                : "[data-calculator-down-range]",
            )?.value,
          ),
          minPercent,
          maxPercent,
          step,
        );
      } else if (source === "down-input") {
        const amountInput = qs(
          id === "leasing"
            ? "[data-calculator-advance-input]"
            : "[data-calculator-down-input]",
        );
        const parsed = parseMoneyInput(amountInput?.value);
        if (isFiniteNumber(parsed) && state.assetValue > 0) {
          const amount = clampNumber(
            parsed,
            (state.assetValue * minPercent) / 100,
            (state.assetValue * maxPercent) / 100,
          );
          const rawPercent = (amount / state.assetValue) * 100;
          state[percentKey] = commit
            ? normalizePercentStep(rawPercent, minPercent, maxPercent, step)
            : clampNumber(rawPercent, minPercent, maxPercent);
        }
      }

      // Finalize snap only on commit / non-typing sources — otherwise typing is rewritten.
      if (commit || (source !== "asset-input" && source !== "percent-input" && source !== "down-input")) {
        state[percentKey] = normalizePercentStep(
          state[percentKey],
          minPercent,
          maxPercent,
          step,
        );
        if (source !== "asset-input" || commit) {
          state.assetValue = snapAmount(
            state.assetValue,
            product.minAssetValue,
            product.maxAssetValue,
            assetStep,
          );
        }
      }
    }

    if (id === "business_working_capital") {
      const amountStep = product.amountStep || 10_000;
      if (source === "amount-input") {
        const parsed = parseMoneyInput(qs("[data-calculator-amount-input]")?.value);
        if (isFiniteNumber(parsed)) {
          state.principal = commit
            ? snapAmount(parsed, product.minAmount, product.maxAmount, amountStep)
            : clampNumber(parsed, product.minAmount, product.maxAmount);
        }
      } else if (source === "amount-range") {
        state.principal = snapAmount(
          Number(qs("[data-calculator-amount-range]")?.value),
          product.minAmount,
          product.maxAmount,
          amountStep,
        );
      } else if (commit) {
        state.principal = snapAmount(
          state.principal,
          product.minAmount,
          product.maxAmount,
          amountStep,
        );
      }
    }

    if (id === "individual_secured_loan") {
      if (source === "collateral" || source === "init" || source === "product") {
        state.collateralType = readCollateralType();
      }

      const collateral = getCollateralTariff(product, state.collateralType);

      if (source === "market-input") {
        const parsed = parseMoneyInput(qs("[data-calculator-market-input]")?.value);
        if (isFiniteNumber(parsed)) {
          state.marketValue = commit
            ? snapAmount(
                parsed,
                collateral.minMarketValue,
                collateral.maxMarketValue,
                collateral.marketStep,
              )
            : clampNumber(
                parsed,
                collateral.minMarketValue,
                collateral.maxMarketValue,
              );
        }
      } else if (source === "market-range") {
        state.marketValue = snapAmount(
          Number(qs("[data-calculator-market-range]")?.value),
          collateral.minMarketValue,
          collateral.maxMarketValue,
          collateral.marketStep,
        );
      } else if (commit) {
        state.marketValue = snapAmount(
          state.marketValue,
          collateral.minMarketValue,
          collateral.maxMarketValue,
          collateral.marketStep,
        );
      }

      const maxAvailableLoan = roundHalfUpMoney(
        Math.min(
          roundHalfUpMoney(Dec.from(state.marketValue).mul(collateral.ltv)),
          collateral.maxAmount,
        ),
      );

      if (source === "loan-input") {
        const parsed = parseMoneyInput(qs("[data-calculator-loan-input]")?.value);
        if (isFiniteNumber(parsed)) {
          state.requestedLoan = commit
            ? snapAmount(
                parsed,
                collateral.minLoan ?? 0,
                maxAvailableLoan,
                collateral.marketStep,
              )
            : clampNumber(parsed, collateral.minLoan ?? 0, maxAvailableLoan);
        }
      } else if (source === "loan-range") {
        state.requestedLoan = snapAmount(
          Number(qs("[data-calculator-loan-range]")?.value),
          collateral.minLoan ?? 0,
          maxAvailableLoan,
          collateral.marketStep,
        );
      } else if (
        source === "market-input" ||
        source === "market-range" ||
        source === "collateral" ||
        source === "product" ||
        source === "init" ||
        commit
      ) {
        state.requestedLoan = clampNumber(
          state.requestedLoan,
          collateral.minLoan ?? 0,
          maxAvailableLoan,
        );
      }
    }

    if (commit || source === "term-range") {
      state.months = clampNumber(state.months, product.minMonths, product.maxMonths);
    } else if (source !== "term-input" && isFiniteNumber(state.months)) {
      state.months = clampNumber(state.months, product.minMonths, product.maxMonths);
    }
  }

  function paintControls(state, result, { preserve = null } = {}) {
    const product = activeProduct();
    const id = activeProductId();

    const termInput = qs("[data-calculator-term-input]");
    const termRange = qs("[data-calculator-term-range]");
    if (termInput && preserve !== "term-input") {
      termInput.value = String(state.months);
    }
    if (termRange) {
      termRange.value = String(
        clampNumber(state.months, product.minMonths, product.maxMonths),
      );
      setRangeProgress(termRange);
    }

    if (id === "business_purchase_asset" || id === "leasing") {
      const percentKey = id === "leasing" ? "advancePercent" : "downPaymentPercent";
      const percent = state[percentKey];
      const downPaymentAmount = roundHalfUpMoney(
        Dec.from(state.assetValue).mul(percent).div(100, 40),
      );
      const minPercent =
        id === "leasing" ? product.minAdvancePercent : product.minDownPaymentPercent;
      const maxPercent =
        id === "leasing" ? product.maxAdvancePercent : product.maxDownPaymentPercent;
      const step =
        id === "leasing"
          ? product.advanceStep || 5
          : product.downPaymentStep || 5;

      const assetInput = qs("[data-calculator-asset-input]");
      const assetRange = qs("[data-calculator-asset-range]");
      const percentInput = qs(
        id === "leasing"
          ? "[data-calculator-advance-percent]"
          : "[data-calculator-down-percent]",
      );
      const amountInput = qs(
        id === "leasing"
          ? "[data-calculator-advance-input]"
          : "[data-calculator-down-input]",
      );
      const percentRange = qs(
        id === "leasing"
          ? "[data-calculator-advance-range]"
          : "[data-calculator-down-range]",
      );

      if (assetInput && preserve !== "asset-input") {
        assetInput.value = formatMoneyUa(state.assetValue, true);
      }
      if (assetRange) {
        assetRange.value = String(state.assetValue);
        setRangeProgress(assetRange);
      }
      if (percentInput && preserve !== "percent-input") {
        percentInput.value = formatPercentUa(percent);
      }
      if (amountInput && preserve !== "down-input") {
        amountInput.value = formatMoneyUa(downPaymentAmount, true);
      }
      if (percentRange) {
        percentRange.min = String(minPercent);
        percentRange.max = String(maxPercent);
        percentRange.step = String(step);
        percentRange.value = String(percent);
        setRangeProgress(percentRange);
      }
    }

    if (id === "business_working_capital") {
      const amountInput = qs("[data-calculator-amount-input]");
      const amountRange = qs("[data-calculator-amount-range]");
      if (amountInput && preserve !== "amount-input") {
        amountInput.value = formatMoneyUa(state.principal, true);
      }
      if (amountRange) {
        amountRange.value = String(state.principal);
        setRangeProgress(amountRange);
      }
    }

    if (id === "individual_secured_loan") {
      const marketInput = qs("[data-calculator-market-input]");
      const marketRange = qs("[data-calculator-market-range]");
      const loanInput = qs("[data-calculator-loan-input]");
      const loanRange = qs("[data-calculator-loan-range]");
      const maxAvailableLoan = result.maxAvailableLoan;
      const collateral = getCollateralTariff(product, state.collateralType);

      if (marketInput && preserve !== "market-input") {
        marketInput.value = formatMoneyUa(state.marketValue, true);
      }
      if (marketRange && collateral) {
        marketRange.min = String(collateral.minMarketValue);
        marketRange.max = String(collateral.maxMarketValue);
        marketRange.step = String(collateral.marketStep);
        marketRange.value = String(state.marketValue);
        setRangeProgress(marketRange);
      }
      if (loanInput && preserve !== "loan-input") {
        loanInput.value = formatMoneyUa(state.requestedLoan, true);
      }
      if (loanRange) {
        loanRange.min = String(collateral?.minLoan ?? 0);
        loanRange.max = String(Math.max(0, maxAvailableLoan));
        loanRange.value = String(state.requestedLoan);
        setRangeProgress(loanRange);
      }
    }
  }

  function renderResult(result, scheme) {
    const setText = (key, text) => {
      root.querySelectorAll(`[data-calculator-out="${key}"]`).forEach((el) => {
        el.textContent = text;
      });
    };

    const product = activeProductId();
    const tariff = getActiveTariff(product) || {};
    const fee = roundHalfUpMoney(tariff.oneTimeFee || 0);
    const insurance = roundHalfUpMoney(tariff.insuranceOther || 0);

    setText("principal", formatMoneyUa(result.principal));
    setText("finance", formatMoneyUa(result.principal));
    setText("down", formatMoneyUa(result.downPaymentAmount));
    setText("maxLoan", formatMoneyUa(result.maxAvailableLoan));
    setText("term", termLabelUa(result.months));
    setText("rate", formatRateUa(result.annualRate));
    setText("scheme", schemeLabelUa(scheme));
    setText("interest", formatMoneyUa(result.totalInterest));
    setText("totalCredit", formatMoneyUa(result.totalRepayment));
    setText("fee", formatMoneyUa(fee));
    setText("insurance", formatMoneyUa(insurance));
    setText(
      "total",
      formatMoneyUa(
        money(result.totalRepayment)
          .add(result.downPaymentAmount || 0)
          .add(fee)
          .add(insurance)
          .toMoneyNumber(),
      ),
    );
    setText("firstPayment", formatMoneyUa(result.firstPayment));
    setText("lastPayment", formatMoneyUa(result.lastPayment));
    const paymentValue =
      result.monthlyPayment != null
        ? result.monthlyPayment
        : scheme === CALCULATOR_SCHEMES.CLASSIC
          ? result.firstPayment
          : null;
    setText(
      "payment",
      paymentValue == null ? "—" : `${formatMoneyUa(paymentValue)}/міс`,
    );

    root.querySelectorAll("[data-calculator-show-scheme]").forEach((el) => {
      const allowed = el.getAttribute("data-calculator-show-scheme").split(/\s+/);
      el.hidden = !allowed.includes(scheme);
    });

    root.querySelectorAll('[data-calculator-row="down"]').forEach((el) => {
      el.hidden = !(
        product === "business_purchase_asset" ||
        product === "leasing" ||
        product === "individual_secured_loan"
      );
    });
    root.querySelectorAll('[data-calculator-row="maxLoan"]').forEach((el) => {
      // Max loan is shown in the params column for secured; not in the result list.
      el.hidden = true;
    });
  }

  function buildCalcInput(state) {
    const id = activeProductId();
    const product = activeProduct();
    const input = {
      months: clampNumber(state.months, product.minMonths, product.maxMonths),
      scheme: state.scheme,
    };

    if (id === "business_purchase_asset") {
      input.assetValue = state.assetValue;
      input.downPaymentPercent = state.downPaymentPercent;
    } else if (id === "leasing") {
      input.assetValue = state.assetValue;
      input.advancePercent = state.advancePercent;
    } else if (id === "business_working_capital") {
      input.principal = state.principal;
    } else if (id === "individual_secured_loan") {
      input.marketValue = state.marketValue;
      input.requestedLoan = state.requestedLoan;
      input.collateralType = state.collateralType;
    }

    return input;
  }

  const TYPING_SOURCES = new Set([
    "asset-input",
    "down-input",
    "percent-input",
    "amount-input",
    "market-input",
    "loan-input",
    "term-input",
  ]);

  function recalculate(source, { commit = true } = {}) {
    const isTyping = TYPING_SOURCES.has(source) && !commit;
    syncPanels();
    syncCollateralPanels();
    // Update state from DOM first — syncSchemeRadios must see the new scheme,
    // otherwise it snaps radios back to the previous state.scheme.
    updateStateFromSource(source, { commit: !isTyping });
    applyProductLimitsToControls();

    const state = ensureState();
    const input = buildCalcInput(state);
    const result = calculateCalculator(activeProductId(), input);

    paintControls(state, result, {
      preserve: isTyping ? source : null,
    });
    renderResult(result, state.scheme);
  }

  function bindField(selector, source, events = ["input", "change", "blur"]) {
    root.querySelectorAll(selector).forEach((el) => {
      events.forEach((eventName) => {
        el.addEventListener(eventName, () => {
          // Text fields: format/snap only on blur|change. Ranges: commit on every input.
          const commit = eventName !== "input" || !TYPING_SOURCES.has(source);
          recalculate(source, { commit });
        });
      });
    });
  }

  productSwitchInputs.forEach((input) => {
    input.addEventListener("change", () => recalculate("product", { commit: true }));
  });

  root.querySelectorAll('input[name="secured-collateral"]').forEach((input) => {
    input.addEventListener("change", () => {
      syncCollateralPanels();
      recalculate("collateral", { commit: true });
    });
  });

  bindField("[data-calculator-scheme]", "scheme", ["change"]);
  bindField("[data-calculator-asset-input]", "asset-input");
  bindField("[data-calculator-asset-range]", "asset-range", ["input"]);
  bindField("[data-calculator-down-input]", "down-input");
  bindField("[data-calculator-down-percent]", "percent-input");
  bindField("[data-calculator-down-range]", "percent-range", ["input"]);
  bindField("[data-calculator-advance-input]", "down-input");
  bindField("[data-calculator-advance-percent]", "percent-input");
  bindField("[data-calculator-advance-range]", "percent-range", ["input"]);
  bindField("[data-calculator-amount-input]", "amount-input");
  bindField("[data-calculator-amount-range]", "amount-range", ["input"]);
  bindField("[data-calculator-market-input]", "market-input");
  bindField("[data-calculator-market-range]", "market-range", ["input"]);
  bindField("[data-calculator-loan-input]", "loan-input");
  bindField("[data-calculator-loan-range]", "loan-range", ["input"]);
  bindField("[data-calculator-term-input]", "term-input");
  bindField("[data-calculator-term-range]", "term-range", ["input"]);

  recalculate("init", { commit: true });
}

/* -------------------------------------------------------------------------- */
/* Control Excel automatic tests                                              */
/* -------------------------------------------------------------------------- */

function assertScheduleInvariants(result, principal, months) {
  const { schedule, totalInterest, totalRepayment } = result;
  const errors = [];

  if (schedule.length !== months) {
    errors.push(`schedule.length ${schedule.length} !== ${months}`);
  }

  const lastClose = schedule[schedule.length - 1]?.closingBalance;
  if (lastClose !== 0) {
    errors.push(`last closingBalance ${lastClose} !== 0`);
  }

  for (const row of schedule) {
    if (row.closingBalance < 0) {
      errors.push(`month ${row.month} negative closingBalance ${row.closingBalance}`);
    }
  }

  let sumPrincipal = money(0);
  let sumInterest = money(0);
  let sumPayment = money(0);

  for (const row of schedule) {
    sumPrincipal = sumPrincipal.add(row.principalPart);
    sumInterest = sumInterest.add(row.interest);
    sumPayment = sumPayment.add(row.payment);
  }

  if (!sumPrincipal.eq(principal)) {
    errors.push(`sum(principalPart) ${sumPrincipal.toMoneyNumber()} !== ${principal}`);
  }
  if (!sumInterest.eq(totalInterest)) {
    errors.push(`sum(interest) ${sumInterest.toMoneyNumber()} !== ${totalInterest}`);
  }
  if (!sumPayment.eq(totalRepayment)) {
    errors.push(`sum(payment) ${sumPayment.toMoneyNumber()} !== ${totalRepayment}`);
  }

  return errors;
}

function pushCheck(results, name, ok, got, detail) {
  results.push({
    name,
    ok: Boolean(ok),
    mismatches: ok ? [] : [detail || `got ${JSON.stringify(got)}`],
    got,
  });
}

/** Business-rule suite (checks 1–12 from QA list). */
function runBusinessRuleTests() {
  const results = [];
  const wasActive = { ...activeTariffRegistry };
  clearActiveTariffs();
  activateDemoTariffs();

  try {
    // 1. Leasing advance 23% → 25%
    {
      const r = calculateCalculator("leasing", {
        assetValue: 1_000_000,
        advancePercent: 23,
        months: 36,
        scheme: "annuity",
      });
      pushCheck(
        results,
        "1. Leasing advance 23% → 25%",
        r.meta.advancePercent === 25 && !r.error,
        r.meta.advancePercent,
      );
    }

    // 2. Leasing advance < 20 → min tariff
    {
      const r = calculateCalculator("leasing", {
        assetValue: 1_000_000,
        advancePercent: 15,
        months: 36,
        scheme: "annuity",
      });
      pushCheck(
        results,
        "2. Leasing advance < 20 → min 20",
        r.meta.advancePercent === 20 && !r.error,
        r.meta.advancePercent,
      );
    }

    // 3. Individual term 60 → clamp max 36
    {
      const r = calculateCalculator("individual_secured_loan", {
        marketValue: 2_000_000,
        requestedLoan: 100_000,
        months: 60,
        scheme: "annuity",
        collateralType: "car",
      });
      pushCheck(
        results,
        "3. Individual term 60 → clamp 36",
        r.months === 36 && r.meta.monthsClamped === true && !r.error,
        { months: r.months, monthsClamped: r.meta.monthsClamped },
      );
    }

    // 4. Leasing Bullet unavailable
    {
      const product = getEffectiveProduct("leasing");
      const schemes = allowedSchemesForProduct(product);
      const r = calculateCalculator("leasing", {
        assetValue: 1_000_000,
        advancePercent: 25,
        months: 36,
        scheme: "interest_only",
      });
      pushCheck(
        results,
        "4. Leasing Bullet unavailable",
        !schemes.includes("interest_only") &&
          !product.allowsBullet &&
          r.scheme === "annuity" &&
          r.meta.schemeRejected === true,
        { schemes, scheme: r.scheme, rejected: r.meta.schemeRejected },
      );
    }

    // 5. Individual Bullet unavailable
    {
      const product = getEffectiveProduct("individual_secured_loan");
      const schemes = allowedSchemesForProduct(product);
      const r = calculateCalculator("individual_secured_loan", {
        marketValue: 2_000_000,
        requestedLoan: 100_000,
        months: 12,
        scheme: "interest_only",
        collateralType: "car",
      });
      pushCheck(
        results,
        "5. Individual Bullet unavailable",
        !schemes.includes("interest_only") &&
          !product.allowsBullet &&
          r.scheme === "annuity" &&
          r.meta.schemeRejected === true,
        { schemes, scheme: r.scheme, rejected: r.meta.schemeRejected },
      );
    }

    // 6. Business Bullet only if tariff allows
    {
      const withBullet = getEffectiveProduct("business_purchase_asset");
      const okAllow =
        withBullet.allowsBullet &&
        allowedSchemesForProduct(withBullet).includes("interest_only");
      const rAllow = calculateCalculator("business_purchase_asset", {
        assetValue: 1_000_000,
        downPaymentPercent: 30,
        months: 36,
        scheme: "interest_only",
      });

      clearActiveTariffs();
      setActiveTariff("business", {
        ...CALCULATOR_TARIFFS.business,
        allowsBullet: false,
        schemes: Object.freeze([
          CALCULATOR_SCHEMES.ANNUITY,
          CALCULATOR_SCHEMES.CLASSIC,
        ]),
      });
      setActiveTariff("leasing", CALCULATOR_TARIFFS.leasing);
      setActiveTariff("individual", CALCULATOR_TARIFFS.individual);

      const denied = getEffectiveProduct("business_purchase_asset");
      const rDeny = calculateCalculator("business_purchase_asset", {
        assetValue: 1_000_000,
        downPaymentPercent: 30,
        months: 36,
        scheme: "interest_only",
      });

      // restore demo business tariff
      setActiveTariff("business", CALCULATOR_TARIFFS.business);

      pushCheck(
        results,
        "6. Business Bullet only if tariff allows",
        okAllow &&
          rAllow.scheme === "interest_only" &&
          !denied.allowsBullet &&
          rDeny.scheme === "annuity" &&
          rDeny.meta.schemeRejected === true,
        {
          allowScheme: rAllow.scheme,
          denyScheme: rDeny.scheme,
          denyAllowsBullet: denied.allowsBullet,
        },
      );
    }

    // 7. Working capital ignores down payment
    {
      const r = calculateCalculator("business_working_capital", {
        principal: 120_000,
        downPaymentPercent: 50,
        advancePercent: 50,
        months: 12,
        scheme: "annuity",
      });
      pushCheck(
        results,
        "7. Working capital down payment ignored",
        r.downPaymentAmount === 0 &&
          r.meta.ignoredDownPayment === true &&
          r.principal === 120_000 &&
          !r.error,
        {
          down: r.downPaymentAmount,
          principal: r.principal,
          ignored: r.meta.ignoredDownPayment,
        },
      );
    }

    // 8. Individual loan > LTV → clamp
    {
      const marketValue = 1_000_000;
      const ltv = CALCULATOR_TARIFFS.individual.collaterals.car.ltv;
      const maxLoan = roundHalfUpMoney(marketValue * ltv);
      const r = calculateCalculator("individual_secured_loan", {
        marketValue,
        requestedLoan: maxLoan + 500_000,
        months: 12,
        scheme: "annuity",
        collateralType: "car",
      });
      pushCheck(
        results,
        "8. Individual requestedLoan > LTV → clamp",
        r.principal === maxLoan &&
          r.maxAvailableLoan === maxLoan &&
          r.meta.clampedByLtv === true,
        {
          principal: r.principal,
          maxAvailableLoan: r.maxAvailableLoan,
          clampedByLtv: r.meta.clampedByLtv,
        },
      );
    }

    // 9. No active tariff → cannot use demo-rate
    {
      clearActiveTariffs();
      const r = calculateCalculator("leasing", {
        assetValue: 1_000_000,
        advancePercent: 25,
        months: 12,
        scheme: "annuity",
      });
      const ok =
        r.error === "no_active_tariff" &&
        r.principal === 0 &&
        r.annualRate === 0 &&
        r.schedule.length === 0;
      activateDemoTariffs();
      pushCheck(results, "9. No active tariff → error (no demo-rate calc)", ok, {
        error: r.error,
        annualRate: r.annualRate,
        principal: r.principal,
      });
    }

    // 10. Manual amount business 1 234 567 → 1 230 000 (step 10 000)
    {
      const r = calculateCalculator("business_working_capital", {
        principal: 1_234_567,
        months: 12,
        scheme: "annuity",
      });
      pushCheck(
        results,
        "10. Business amount 1 234 567 → 1 230 000",
        r.principal === 1_230_000,
        r.principal,
      );
    }

    // 11. Exact midpoint → round up
    {
      const mid = snapToStep(1_235_000, 10_000);
      const pctMid = normalizePercentStep(22.5, 0, 70, 5);
      pushCheck(
        results,
        "11. Exact midpoint rounds up",
        mid === 1_240_000 && pctMid === 25,
        { amount: mid, percent: pctMid },
      );
    }

    // 12. Last payment: never negative closingBalance
    {
      const schedules = [
        calculateLoanSchedule({
          principal: 700000,
          annualRate: 0.288,
          months: 36,
          scheme: "annuity",
        }),
        calculateLoanSchedule({
          principal: 700000,
          annualRate: 0.288,
          months: 36,
          scheme: "classic",
        }),
        calculateLoanSchedule({
          principal: 700000,
          annualRate: 0.2825,
          months: 36,
          scheme: "interest_only",
        }),
        calculateLoanSchedule({
          principal: 120000,
          annualRate: 0.36,
          months: 12,
          scheme: "annuity",
        }),
      ];
      const negatives = [];
      for (const result of schedules) {
        for (const row of result.schedule) {
          if (row.closingBalance < 0) {
            negatives.push(row);
          }
        }
        if (result.schedule.at(-1).closingBalance !== 0) {
          negatives.push({ last: result.schedule.at(-1).closingBalance });
        }
      }
      pushCheck(
        results,
        "12. Never negative closingBalance / last = 0",
        negatives.length === 0,
        { negatives },
      );
    }
  } finally {
    clearActiveTariffs();
    Object.keys(wasActive).forEach((id) => setActiveTariff(id, wasActive[id]));
    if (Object.keys(activeTariffRegistry).length === 0) {
      activateDemoTariffs();
    }
  }

  const failed = results.filter((r) => !r.ok);
  return {
    ok: failed.length === 0,
    passed: results.filter((r) => r.ok).length,
    total: results.length,
    results,
    failed,
  };
}

function runExcelControlTests() {
  activateDemoTariffs();

  const cases = [
    {
      name: "LEASING P=700000 R=0.288 n=12 annuity",
      args: { principal: 700000, annualRate: 0.288, months: 12, scheme: "annuity" },
      expect: {
        first: 67828.47,
        last: 67828.44,
        interest: 113941.61,
        total: 813941.61,
      },
    },
    {
      name: "LEASING P=700000 R=0.288 n=36 annuity",
      args: { principal: 700000, annualRate: 0.288, months: 36, scheme: "annuity" },
      expect: {
        first: 29257.89,
        last: 29258.13,
        interest: 353284.28,
        total: 1053284.28,
      },
    },
    {
      name: "LEASING P=700000 R=0.288 n=36 classic",
      args: { principal: 700000, annualRate: 0.288, months: 36, scheme: "classic" },
      expect: {
        first: 36244.44,
        last: 19911.27,
        interest: 310800.07,
        total: 1010800.07,
      },
    },
    {
      name: "BUSINESS PURCHASE P=700000 R=0.2825 n=36 annuity",
      args: { principal: 700000, annualRate: 0.2825, months: 36, scheme: "annuity" },
      expect: {
        first: 29049.14,
        last: 29049.03,
        interest: 345768.93,
        total: 1045768.93,
      },
    },
    {
      name: "BUSINESS PURCHASE P=700000 R=0.2825 n=36 classic",
      args: { principal: 700000, annualRate: 0.2825, months: 36, scheme: "classic" },
      expect: {
        first: 35923.61,
        last: 19902.36,
        interest: 304864.65,
        total: 1004864.65,
      },
    },
    {
      name: "BUSINESS BULLET P=700000 R=0.2825 n=36",
      args: {
        principal: 700000,
        annualRate: 0.2825,
        months: 36,
        scheme: "interest_only",
      },
      expect: {
        first: 16479.17,
        last: 716479.17,
        interest: 593250.12,
        total: 1293250.12,
      },
    },
    {
      name: "WORKING CAPITAL P=120000 R=0.2825 n=12 annuity",
      args: { principal: 120000, annualRate: 0.2825, months: 12, scheme: "annuity" },
      expect: {
        first: 11595.4,
        last: 11595.42,
        interest: 19144.82,
        total: 139144.82,
      },
    },
    {
      name: "INDIVIDUAL P=120000 R=0.36 n=12 annuity",
      args: { principal: 120000, annualRate: 0.36, months: 12, scheme: "annuity" },
      expect: {
        first: 12055.45,
        last: 12055.46,
        interest: 24665.41,
        total: 144665.41,
      },
    },
    {
      name: "INDIVIDUAL P=120000 R=0.36 n=36 annuity",
      args: { principal: 120000, annualRate: 0.36, months: 36, scheme: "annuity" },
      expect: {
        first: 5496.46,
        last: 5496.18,
        interest: 77872.28,
        total: 197872.28,
      },
    },
  ];

  const results = [];

  for (const testCase of cases) {
    const result = calculateLoanSchedule(testCase.args);
    const { expect } = testCase;
    const mismatches = [];

    if (result.firstPayment !== expect.first) {
      mismatches.push(`first ${result.firstPayment} !== ${expect.first}`);
    }
    if (result.lastPayment !== expect.last) {
      mismatches.push(`last ${result.lastPayment} !== ${expect.last}`);
    }
    if (result.totalInterest !== expect.interest) {
      mismatches.push(`interest ${result.totalInterest} !== ${expect.interest}`);
    }
    if (result.totalRepayment !== expect.total) {
      mismatches.push(`total ${result.totalRepayment} !== ${expect.total}`);
    }

    mismatches.push(
      ...assertScheduleInvariants(
        result,
        testCase.args.principal,
        testCase.args.months,
      ),
    );

    results.push({
      name: testCase.name,
      ok: mismatches.length === 0,
      mismatches,
      got: {
        first: result.firstPayment,
        last: result.lastPayment,
        interest: result.totalInterest,
        total: result.totalRepayment,
      },
    });
  }

  const snap = normalizePercentStep(23, 0, 70, 5);
  results.push({
    name: "normalizePercentStep 23 → 25",
    ok: snap === 25,
    mismatches: snap === 25 ? [] : [`got ${snap}`],
    got: { snap },
  });

  results.push({
    name: "tariff demo rates (catalogue)",
    ok:
      CALCULATOR_TARIFFS.leasing.annualRate === 0.288 &&
      CALCULATOR_TARIFFS.business.annualRate === 0.2825 &&
      CALCULATOR_TARIFFS.individual.annualRate === 0.36,
    mismatches: [],
    got: {
      leasing: CALCULATOR_TARIFFS.leasing.annualRate,
      business: CALCULATOR_TARIFFS.business.annualRate,
      individual: CALCULATOR_TARIFFS.individual.annualRate,
    },
  });

  const businessRules = runBusinessRuleTests();
  for (const row of businessRules.results) {
    results.push(row);
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  return {
    ok: failed.length === 0,
    passed,
    total: results.length,
    results,
    failed,
    businessRules,
  };
}

function assertDownPaymentClamp100Percent() {
  activateDemoTariffs();
  const assetValue = 100_000;
  const result = calculateCalculator("business_purchase_asset", {
    assetValue,
    downPaymentPercent: 100,
    months: 36,
    scheme: CALCULATOR_SCHEMES.ANNUITY,
  });

  const expectedPercent = 70;
  const expectedDown = roundHalfUpMoney(assetValue * 0.7);
  const expectedPrincipal = roundHalfUpMoney(assetValue - expectedDown);
  const ok =
    result.meta.downPaymentPercent === expectedPercent &&
    result.downPaymentAmount === expectedDown &&
    result.principal === expectedPrincipal;

  return {
    ok,
    assetValue,
    inputDownPaymentPercent: 100,
    clampedDownPaymentPercent: result.meta.downPaymentPercent,
    downPaymentAmount: result.downPaymentAmount,
    principal: result.principal,
    expectedPrincipal,
    expectedDown,
  };
}

function initCalculator() {
  activateDemoTariffs();
  document.querySelectorAll("[data-calculator]").forEach((root) => {
    initCalculatorRoot(root);
  });
}

window.Dec = Dec;
window.CALCULATOR_SCHEMES = CALCULATOR_SCHEMES;
window.CALCULATOR_TARIFFS = CALCULATOR_TARIFFS;
window.CALCULATOR_PRODUCTS = CALCULATOR_PRODUCTS;
window.COLLATERAL_TYPES = COLLATERAL_TYPES;
window.getActiveTariff = getActiveTariff;
window.getEffectiveProduct = getEffectiveProduct;
window.hasActiveTariff = hasActiveTariff;
window.setActiveTariff = setActiveTariff;
window.clearActiveTariffs = clearActiveTariffs;
window.activateDemoTariffs = activateDemoTariffs;
window.calculateLoanSchedule = calculateLoanSchedule;
window.calculateCalculator = calculateCalculator;
window.normalizePercentStep = normalizePercentStep;
window.snapToStep = snapToStep;
window.snapAmount = snapAmount;
window.runExcelControlTests = runExcelControlTests;
window.runBusinessRuleTests = runBusinessRuleTests;
window.assertDownPaymentClamp100Percent = assertDownPaymentClamp100Percent;
window.initCalculator = initCalculator;

document.addEventListener("DOMContentLoaded", () => {
  initCalculator();
});
