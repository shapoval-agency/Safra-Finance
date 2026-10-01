/**
 * Node runner for Excel control tests + robustness / edge cases
 * (САФРА_ТЗ_калькулятори_В3).
 *
 * Usage: node js/calculator.excel.test.js
 */

const fs = require("fs");
const path = require("path");

const code = fs
  .readFileSync(path.join(__dirname, "calculator.js"), "utf8")
  .replace(/document\.addEventListener\([\s\S]*$/, "")
  .replace(/window\./g, "global.");

eval(code);

/* -------------------------------------------------------------------------- */
/* Helpers for robustness suite (do not alter existing Excel suite)           */
/* -------------------------------------------------------------------------- */

function pushResult(results, name, ok, got, mismatches = []) {
  results.push({
    name,
    ok: Boolean(ok),
    mismatches: ok ? [] : mismatches.length ? mismatches : [`got ${JSON.stringify(got)}`],
    got,
  });
}

function isBadNumber(value) {
  return typeof value === "number" && !Number.isFinite(value);
}

function moneyFieldsFinite(result) {
  const fields = [
    result.principal,
    result.monthlyPayment,
    result.firstPayment,
    result.lastPayment,
    result.totalInterest,
    result.totalRepayment,
  ];
  return fields.every((v) => v == null || Number.isFinite(v));
}

function assertScheduleMoneyPrecision(schedule, errors) {
  for (const row of schedule) {
    for (const key of [
      "openingBalance",
      "principalPart",
      "interest",
      "payment",
      "closingBalance",
    ]) {
      const value = row[key];
      if (isBadNumber(value)) {
        errors.push(`month ${row.month} ${key}=${value}`);
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        const cents = Math.round(value * 100);
        if (Math.abs(value * 100 - cents) > 1e-8) {
          errors.push(`month ${row.month} ${key} not 0.01 precision: ${value}`);
        }
      }
    }
    if (row.closingBalance < 0) {
      errors.push(`month ${row.month} negative closingBalance ${row.closingBalance}`);
    }
  }
}

function sumSchedule(schedule) {
  let sumPrincipal = money(0);
  let sumInterest = money(0);
  let sumPayment = money(0);
  for (const row of schedule) {
    sumPrincipal = sumPrincipal.add(row.principalPart);
    sumInterest = sumInterest.add(row.interest);
    sumPayment = sumPayment.add(row.payment);
  }
  return {
    sumPrincipal: sumPrincipal.toMoneyNumber(),
    sumInterest: sumInterest.toMoneyNumber(),
    sumPayment: sumPayment.toMoneyNumber(),
  };
}

function runRobustnessTests() {
  activateDemoTariffs();
  const results = [];

  /* ---- 1. ZERO RATE ---- */
  {
    let threw = null;
    let result = null;
    try {
      result = calculateLoanSchedule({
        principal: 1_200_000,
        annualRate: 0,
        months: 12,
        scheme: "annuity",
      });
    } catch (error) {
      threw = error;
    }

    const mismatches = [];
    if (threw) mismatches.push(`threw: ${threw.message}`);
    if (!result) {
      pushResult(results, "R1. ZERO RATE annuity", false, null, mismatches);
    } else {
      const sums = sumSchedule(result.schedule);
      const lastClose = result.schedule.at(-1)?.closingBalance;
      if (result.error) mismatches.push(`error=${result.error}`);
      if (result.monthlyPayment !== 100_000) {
        mismatches.push(`monthlyPayment ${result.monthlyPayment} !== 100000`);
      }
      if (result.firstPayment !== 100_000) {
        mismatches.push(`firstPayment ${result.firstPayment} !== 100000`);
      }
      if (result.lastPayment !== 100_000) {
        mismatches.push(`lastPayment ${result.lastPayment} !== 100000`);
      }
      if (result.totalInterest !== 0) {
        mismatches.push(`totalInterest ${result.totalInterest} !== 0`);
      }
      if (result.totalRepayment !== 1_200_000) {
        mismatches.push(`totalRepayment ${result.totalRepayment} !== 1200000`);
      }
      if (result.schedule.length !== 12) {
        mismatches.push(`schedule.length ${result.schedule.length} !== 12`);
      }
      if (sums.sumPrincipal !== 1_200_000) {
        mismatches.push(`sum(principalPart) ${sums.sumPrincipal} !== 1200000`);
      }
      if (sums.sumInterest !== 0) {
        mismatches.push(`sum(interest) ${sums.sumInterest} !== 0`);
      }
      if (sums.sumPayment !== 1_200_000) {
        mismatches.push(`sum(payment) ${sums.sumPayment} !== 1200000`);
      }
      if (lastClose !== 0) {
        mismatches.push(`last closingBalance ${lastClose} !== 0`);
      }
      if (!moneyFieldsFinite(result)) mismatches.push("non-finite money fields");
      assertScheduleMoneyPrecision(result.schedule, mismatches);

      pushResult(
        results,
        "R1. ZERO RATE annuity",
        mismatches.length === 0,
        {
          first: result.firstPayment,
          last: result.lastPayment,
          interest: result.totalInterest,
          total: result.totalRepayment,
        },
        mismatches,
      );
    }
  }

  /* ---- 2. ROUNDING STRESS ---- */
  for (const scheme of ["annuity", "classic"]) {
    const mismatches = [];
    let threw = null;
    let result = null;
    try {
      result = calculateLoanSchedule({
        principal: 123_457,
        annualRate: 0.2825,
        months: 37,
        scheme,
      });
    } catch (error) {
      threw = error;
    }

    if (threw) {
      pushResult(
        results,
        `R2. ROUNDING STRESS ${scheme}`,
        false,
        null,
        [`threw: ${threw.message}`],
      );
      continue;
    }

    const sums = sumSchedule(result.schedule);
    if (result.schedule.length !== 37) {
      mismatches.push(`schedule.length ${result.schedule.length} !== 37`);
    }
    if (sums.sumPrincipal !== 123457) {
      mismatches.push(`sum(principalPart) ${sums.sumPrincipal} !== 123457`);
    }
    if (sums.sumInterest !== result.totalInterest) {
      mismatches.push(
        `sum(interest) ${sums.sumInterest} !== ${result.totalInterest}`,
      );
    }
    if (sums.sumPayment !== result.totalRepayment) {
      mismatches.push(
        `sum(payment) ${sums.sumPayment} !== ${result.totalRepayment}`,
      );
    }
    if (result.schedule.at(-1)?.closingBalance !== 0) {
      mismatches.push(
        `last closingBalance ${result.schedule.at(-1)?.closingBalance} !== 0`,
      );
    }
    assertScheduleMoneyPrecision(result.schedule, mismatches);
    if (!moneyFieldsFinite(result)) mismatches.push("non-finite money fields");

    pushResult(
      results,
      `R2. ROUNDING STRESS ${scheme}`,
      mismatches.length === 0,
      {
        interest: result.totalInterest,
        total: result.totalRepayment,
        sumPrincipal: sums.sumPrincipal,
      },
      mismatches,
    );
  }

  /* ---- 3. TERM BOUNDARIES ---- */
  {
    const termCases = [
      {
        name: "R3. Leasing term 12",
        productId: "leasing",
        input: {
          assetValue: 1_000_000,
          advancePercent: 25,
          months: 12,
          scheme: "annuity",
        },
        expectMonths: 12,
        expectClamped: false,
      },
      {
        name: "R3. Leasing term 60",
        productId: "leasing",
        input: {
          assetValue: 1_000_000,
          advancePercent: 25,
          months: 60,
          scheme: "annuity",
        },
        expectMonths: 60,
        expectClamped: false,
      },
      {
        name: "R3. Leasing term 11 → min 12",
        productId: "leasing",
        input: {
          assetValue: 1_000_000,
          advancePercent: 25,
          months: 11,
          scheme: "annuity",
        },
        expectMonths: 12,
        expectClamped: true,
      },
      {
        name: "R3. Leasing term 61 → max 60",
        productId: "leasing",
        input: {
          assetValue: 1_000_000,
          advancePercent: 25,
          months: 61,
          scheme: "annuity",
        },
        expectMonths: 60,
        expectClamped: true,
      },
      {
        name: "R3. Business term 3",
        productId: "business_purchase_asset",
        input: {
          assetValue: 1_000_000,
          downPaymentPercent: 25,
          months: 3,
          scheme: "annuity",
        },
        expectMonths: 3,
        expectClamped: false,
      },
      {
        name: "R3. Business term 60",
        productId: "business_purchase_asset",
        input: {
          assetValue: 1_000_000,
          downPaymentPercent: 25,
          months: 60,
          scheme: "annuity",
        },
        expectMonths: 60,
        expectClamped: false,
      },
      {
        name: "R3. Business term 2 → min 3",
        productId: "business_purchase_asset",
        input: {
          assetValue: 1_000_000,
          downPaymentPercent: 25,
          months: 2,
          scheme: "annuity",
        },
        expectMonths: 3,
        expectClamped: true,
      },
      {
        name: "R3. Business term 61 → max 60",
        productId: "business_purchase_asset",
        input: {
          assetValue: 1_000_000,
          downPaymentPercent: 25,
          months: 61,
          scheme: "annuity",
        },
        expectMonths: 60,
        expectClamped: true,
      },
      {
        name: "R3. Individual term 3",
        productId: "individual_secured_loan",
        input: {
          marketValue: 2_000_000,
          requestedLoan: 100_000,
          months: 3,
          scheme: "annuity",
          collateralType: "car",
        },
        expectMonths: 3,
        expectClamped: false,
      },
      {
        name: "R3. Individual term 36",
        productId: "individual_secured_loan",
        input: {
          marketValue: 2_000_000,
          requestedLoan: 100_000,
          months: 36,
          scheme: "annuity",
          collateralType: "car",
        },
        expectMonths: 36,
        expectClamped: false,
      },
      {
        name: "R3. Individual term 2 → min 3",
        productId: "individual_secured_loan",
        input: {
          marketValue: 2_000_000,
          requestedLoan: 100_000,
          months: 2,
          scheme: "annuity",
          collateralType: "car",
        },
        expectMonths: 3,
        expectClamped: true,
      },
      {
        name: "R3. Individual term 37 → max 36",
        productId: "individual_secured_loan",
        input: {
          marketValue: 2_000_000,
          requestedLoan: 100_000,
          months: 37,
          scheme: "annuity",
          collateralType: "car",
        },
        expectMonths: 36,
        expectClamped: true,
      },
    ];

    for (const testCase of termCases) {
      const mismatches = [];
      let result;
      try {
        result = calculateCalculator(testCase.productId, testCase.input);
      } catch (error) {
        pushResult(results, testCase.name, false, null, [`threw: ${error.message}`]);
        continue;
      }

      const sums = sumSchedule(result.schedule);
      if (result.error) mismatches.push(`error=${result.error}`);
      if (result.months !== testCase.expectMonths) {
        mismatches.push(`months ${result.months} !== ${testCase.expectMonths}`);
      }
      if (result.schedule.length !== testCase.expectMonths) {
        mismatches.push(
          `schedule.length ${result.schedule.length} !== ${testCase.expectMonths}`,
        );
      }
      if (Boolean(result.meta?.monthsClamped) !== testCase.expectClamped) {
        mismatches.push(
          `monthsClamped ${result.meta?.monthsClamped} !== ${testCase.expectClamped}`,
        );
      }
      if (result.schedule.at(-1)?.closingBalance !== 0) {
        mismatches.push(
          `last closingBalance ${result.schedule.at(-1)?.closingBalance} !== 0`,
        );
      }
      if (sums.sumPrincipal !== result.principal) {
        mismatches.push(
          `sum(principalPart) ${sums.sumPrincipal} !== ${result.principal}`,
        );
      }

      pushResult(
        results,
        testCase.name,
        mismatches.length === 0,
        {
          months: result.months,
          clamped: result.meta?.monthsClamped,
          principal: result.principal,
        },
        mismatches,
      );
    }
  }

  /* ---- 4. AMOUNT BOUNDARIES ---- */
  {
    const lease = getEffectiveProduct("leasing");
    const purchase = getEffectiveProduct("business_purchase_asset");
    const wc = getEffectiveProduct("business_working_capital");
    const individual = getEffectiveProduct("individual_secured_loan");
    const car = individual.collaterals.car;

    const amountCases = [
      {
        name: "R4. Leasing amount = minAsset",
        productId: "leasing",
        input: {
          assetValue: lease.minAssetValue,
          advancePercent: 25,
          months: 12,
          scheme: "annuity",
        },
        expectPrincipalInRange: true,
        min: lease.minAssetValue,
        max: lease.maxAssetValue,
        field: "assetValue",
      },
      {
        name: "R4. Leasing amount = maxAsset",
        productId: "leasing",
        input: {
          assetValue: lease.maxAssetValue,
          advancePercent: 25,
          months: 12,
          scheme: "annuity",
        },
        expectPrincipalInRange: true,
        min: lease.minAssetValue,
        max: lease.maxAssetValue,
        field: "assetValue",
      },
      {
        name: "R4. Leasing amount < min → clamp",
        productId: "leasing",
        input: {
          assetValue: lease.minAssetValue - 1,
          advancePercent: 25,
          months: 12,
          scheme: "annuity",
        },
        expectNormalizedAsset: lease.minAssetValue,
        min: lease.minAssetValue,
        max: lease.maxAssetValue,
        field: "assetValue",
      },
      {
        name: "R4. Leasing amount > max → clamp",
        productId: "leasing",
        input: {
          assetValue: lease.maxAssetValue + 10_000,
          advancePercent: 25,
          months: 12,
          scheme: "annuity",
        },
        expectNormalizedAsset: lease.maxAssetValue,
        min: lease.minAssetValue,
        max: lease.maxAssetValue,
        field: "assetValue",
      },
      {
        name: "R4. Business WC amount = min",
        productId: "business_working_capital",
        input: {
          principal: wc.minAmount,
          months: 12,
          scheme: "annuity",
        },
        expectPrincipal: wc.minAmount,
      },
      {
        name: "R4. Business WC amount = max",
        productId: "business_working_capital",
        input: {
          principal: wc.maxAmount,
          months: 12,
          scheme: "annuity",
        },
        expectPrincipal: wc.maxAmount,
      },
      {
        name: "R4. Business WC amount < min → clamp",
        productId: "business_working_capital",
        input: {
          principal: wc.minAmount - 1,
          months: 12,
          scheme: "annuity",
        },
        expectPrincipal: wc.minAmount,
      },
      {
        name: "R4. Business WC amount > max → clamp",
        productId: "business_working_capital",
        input: {
          principal: wc.maxAmount + 10_000,
          months: 12,
          scheme: "annuity",
        },
        expectPrincipal: wc.maxAmount,
      },
      {
        name: "R4. Business purchase amount = minAsset",
        productId: "business_purchase_asset",
        input: {
          assetValue: purchase.minAssetValue,
          downPaymentPercent: 0,
          months: 12,
          scheme: "annuity",
        },
        expectNormalizedAsset: purchase.minAssetValue,
      },
      {
        name: "R4. Business purchase amount = maxAsset",
        productId: "business_purchase_asset",
        input: {
          assetValue: purchase.maxAssetValue,
          downPaymentPercent: 0,
          months: 12,
          scheme: "annuity",
        },
        expectNormalizedAsset: purchase.maxAssetValue,
      },
    ];

    for (const testCase of amountCases) {
      const mismatches = [];
      let result;
      try {
        result = calculateCalculator(testCase.productId, testCase.input);
      } catch (error) {
        pushResult(results, testCase.name, false, null, [`threw: ${error.message}`]);
        continue;
      }

      if (result.error) mismatches.push(`error=${result.error}`);
      if (result.schedule.at(-1)?.closingBalance !== 0) {
        mismatches.push(
          `last closingBalance ${result.schedule.at(-1)?.closingBalance} !== 0`,
        );
      }

      if (testCase.expectPrincipal != null && result.principal !== testCase.expectPrincipal) {
        mismatches.push(
          `principal ${result.principal} !== ${testCase.expectPrincipal}`,
        );
      }
      if (
        testCase.expectNormalizedAsset != null &&
        result.meta.assetValue !== testCase.expectNormalizedAsset
      ) {
        mismatches.push(
          `assetValue ${result.meta.assetValue} !== ${testCase.expectNormalizedAsset}`,
        );
      }
      if (testCase.min != null && testCase.field === "assetValue") {
        const asset = result.meta.assetValue;
        if (asset < testCase.min || asset > testCase.max) {
          mismatches.push(`assetValue ${asset} outside [${testCase.min}, ${testCase.max}]`);
        }
      }
      if (testCase.productId === "business_working_capital") {
        if (result.principal < wc.minAmount || result.principal > wc.maxAmount) {
          mismatches.push(
            `principal ${result.principal} outside [${wc.minAmount}, ${wc.maxAmount}]`,
          );
        }
      }

      pushResult(
        results,
        testCase.name,
        mismatches.length === 0,
        {
          principal: result.principal,
          assetValue: result.meta?.assetValue,
        },
        mismatches,
      );
    }

    // Individual: maxAvailableLoan = min(tariff.maxAmount, collateral * LTV)
    {
      const marketValue = 1_000_000;
      const maxByLtv = roundHalfUpMoney(Dec.from(marketValue).mul(car.ltv));
      const maxAvailable = Math.min(maxByLtv, car.maxAmount);
      const mismatches = [];
      let result;
      try {
        result = calculateCalculator("individual_secured_loan", {
          marketValue,
          requestedLoan: car.maxAmount, // exceeds LTV cap, not tariff max alone
          months: 12,
          scheme: "annuity",
          collateralType: "car",
        });
      } catch (error) {
        pushResult(results, "R4. Individual LTV caps over maxAmount", false, null, [
          `threw: ${error.message}`,
        ]);
      }

      if (result) {
        if (result.error) mismatches.push(`error=${result.error}`);
        if (result.maxAvailableLoan !== maxAvailable) {
          mismatches.push(
            `maxAvailableLoan ${result.maxAvailableLoan} !== ${maxAvailable}`,
          );
        }
        if (result.principal !== maxAvailable) {
          mismatches.push(`principal ${result.principal} !== ${maxAvailable}`);
        }
        if (result.principal > maxByLtv) {
          mismatches.push(`principal bypassed LTV ${maxByLtv}`);
        }
        if (result.schedule.at(-1)?.closingBalance !== 0) {
          mismatches.push(
            `last closingBalance ${result.schedule.at(-1)?.closingBalance} !== 0`,
          );
        }
        pushResult(
          results,
          "R4. Individual LTV caps over maxAmount",
          mismatches.length === 0,
          {
            principal: result.principal,
            maxAvailableLoan: result.maxAvailableLoan,
            maxByLtv,
            tariffMax: car.maxAmount,
          },
          mismatches,
        );
      }
    }

    {
      const mismatches = [];
      const result = calculateCalculator("individual_secured_loan", {
        marketValue: car.minMarketValue,
        requestedLoan: 0,
        months: 12,
        scheme: "annuity",
        collateralType: "car",
      });
      // principal 0 may be invalid_principal — either clamp to 0 with error or empty schedule
      const okEmpty =
        result.error === "invalid_principal" ||
        (result.principal === 0 && result.schedule.length === 0);
      const okValid =
        !result.error &&
        result.principal >= 0 &&
        result.schedule.at(-1)?.closingBalance === 0;
      if (!(okEmpty || okValid)) {
        mismatches.push(
          `unexpected result error=${result.error} principal=${result.principal}`,
        );
      }
      if (!moneyFieldsFinite(result)) mismatches.push("non-finite money fields");
      pushResult(
        results,
        "R4. Individual amount at min market / loan=0 handled",
        mismatches.length === 0,
        { error: result.error, principal: result.principal },
        mismatches,
      );
    }
  }

  /* ---- 5. INVALID USER INPUT ---- */
  {
    const invalidCases = [
      {
        name: "R5. principal = NaN",
        args: { principal: NaN, annualRate: 0.18, months: 12, scheme: "annuity" },
        expectError: "invalid_principal",
      },
      {
        name: "R5. principal = Infinity",
        args: {
          principal: Infinity,
          annualRate: 0.18,
          months: 12,
          scheme: "annuity",
        },
        expectError: "invalid_principal",
      },
      {
        name: "R5. principal = -1000",
        args: {
          principal: -1000,
          annualRate: 0.18,
          months: 12,
          scheme: "annuity",
        },
        expectError: "invalid_principal",
      },
      {
        name: "R5. principal = \"\"",
        args: { principal: "", annualRate: 0.18, months: 12, scheme: "annuity" },
        expectError: "invalid_principal",
      },
      {
        name: "R5. months = 0",
        args: { principal: 100_000, annualRate: 0.18, months: 0, scheme: "annuity" },
        expectError: "invalid_months",
      },
      {
        name: "R5. months = NaN",
        args: {
          principal: 100_000,
          annualRate: 0.18,
          months: NaN,
          scheme: "annuity",
        },
        expectError: "invalid_months",
      },
      {
        name: "R5. annualRate = NaN",
        args: {
          principal: 100_000,
          annualRate: NaN,
          months: 12,
          scheme: "annuity",
        },
        expectError: "invalid_rate",
      },
      {
        name: "R5. annualRate = Infinity",
        args: {
          principal: 100_000,
          annualRate: Infinity,
          months: 12,
          scheme: "annuity",
        },
        expectError: "invalid_rate",
      },
      {
        name: "R5. annualRate < 0",
        args: {
          principal: 100_000,
          annualRate: -0.1,
          months: 12,
          scheme: "annuity",
        },
        expectError: "invalid_rate",
      },
    ];

    for (const testCase of invalidCases) {
      const mismatches = [];
      let result = null;
      let threw = null;
      try {
        result = calculateLoanSchedule(testCase.args);
      } catch (error) {
        threw = error;
      }

      if (threw) {
        pushResult(results, testCase.name, false, null, [`threw: ${threw.message}`]);
        continue;
      }

      if (result.error !== testCase.expectError) {
        mismatches.push(`error ${result.error} !== ${testCase.expectError}`);
      }
      if (result.schedule.length !== 0) {
        mismatches.push(`schedule.length ${result.schedule.length} !== 0`);
      }
      if (!moneyFieldsFinite(result)) {
        mismatches.push("non-finite money fields in result");
      }
      for (const row of result.schedule) {
        if (row.closingBalance < 0) {
          mismatches.push(`negative closingBalance ${row.closingBalance}`);
        }
      }

      pushResult(
        results,
        testCase.name,
        mismatches.length === 0,
        { error: result.error, scheduleLength: result.schedule.length },
        mismatches,
      );
    }
  }

  const failed = results.filter((row) => !row.ok);
  return {
    ok: failed.length === 0,
    passed: results.filter((row) => row.ok).length,
    total: results.length,
    results,
    failed,
  };
}

function writeReports(existing, robustness) {
  const overallOk = existing.ok && robustness.ok;
  const allResults = [
    ...existing.results.map((row) => ({ ...row, suite: "existing" })),
    ...robustness.results.map((row) => ({ ...row, suite: "robustness" })),
  ];

  let md = "";
  md += `# Safra Finance — отчёт по контрольным тестам калькулятора\n\n`;
  md += `| | |\n|---|---|\n`;
  md += `| Спецификация | САФРА_ТЗ_калькулятори_В3 |\n`;
  md += `| Реализация | \`js/calculator.js\` |\n`;
  md += `| Раннер | \`node js/calculator.excel.test.js\` |\n`;
  md += `| Дата | ${new Date().toISOString().slice(0, 10)} |\n`;
  md += `| Node.js | ${process.version} |\n`;
  md += `| Округление | ROUND_HALF_UP до 0.01 грн |\n`;
  md += `| **Итог** | **${overallOk ? "PASS" : "FAIL"}** |\n\n`;

  md += `## Сводка\n\n`;
  md += `- Existing (Excel + business rules): **${existing.passed}/${existing.total}**\n`;
  md += `- Robustness / edge cases: **${robustness.passed}/${robustness.total}**\n`;
  md += `- Overall: **${existing.passed + robustness.passed}/${existing.total + robustness.total}**\n\n`;

  md += `## Existing checks\n\n`;
  md += `| Проверка | Статус |\n|---|---|\n`;
  for (const row of existing.results) {
    md += `| ${row.name} | ${row.ok ? "PASS" : "FAIL"} |\n`;
  }
  md += `\n`;

  md += `## Robustness / edge cases\n\n`;
  md += `| Проверка | Статус |\n|---|---|\n`;
  for (const row of robustness.results) {
    md += `| ${row.name} | ${row.ok ? "PASS" : "FAIL"} |\n`;
  }
  md += `\n`;

  md += `## Как воспроизвести\n\n`;
  md += "```bash\nnode js/calculator.excel.test.js\n```\n";

  fs.writeFileSync(path.join(__dirname, "..", "calculator-test-report.md"), md);
  fs.writeFileSync(
    path.join(__dirname, "..", "calculator-test-report.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        overall: overallOk ? "PASS" : "FAIL",
        existing,
        robustness,
        results: allResults,
      },
      null,
      2,
    ),
  );
}

/* -------------------------------------------------------------------------- */
/* Run                                                                        */
/* -------------------------------------------------------------------------- */

const existing = runExcelControlTests();
const robustness = runRobustnessTests();

console.log("=== Existing checks (Excel + business rules) ===");
for (const row of existing.results) {
  const mark = row.ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${row.name}`);
  if (!row.ok) {
    for (const msg of row.mismatches) console.log(`      - ${msg}`);
  }
}

console.log("");
console.log("=== Robustness / edge cases ===");
for (const row of robustness.results) {
  const mark = row.ok ? "PASS" : "FAIL";
  console.log(`${mark}  ${row.name}`);
  if (!row.ok) {
    for (const msg of row.mismatches) console.log(`      - ${msg}`);
  }
}

writeReports(existing, robustness);

console.log("");
if (existing.ok) {
  console.log(`All ${existing.total} existing checks passed.`);
} else {
  console.log(`${existing.failed.length}/${existing.total} existing checks failed.`);
}

if (robustness.ok) {
  console.log(`All ${robustness.total} robustness checks passed.`);
} else {
  console.log(
    `${robustness.failed.length}/${robustness.total} robustness checks failed.`,
  );
}

const overallOk = existing.ok && robustness.ok;
const overallTotal = existing.total + robustness.total;
const overallPassed = existing.passed + robustness.passed;
console.log(
  overallOk
    ? `Overall: PASS (${overallPassed}/${overallTotal}).`
    : `Overall: FAIL (${overallPassed}/${overallTotal}).`,
);

process.exit(overallOk ? 0 : 1);
