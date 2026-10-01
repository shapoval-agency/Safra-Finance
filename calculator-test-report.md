# Safra Finance — отчёт по контрольным тестам калькулятора

| | |
|---|---|
| Спецификация | САФРА_ТЗ_калькулятори_В3 |
| Реализация | `js/calculator.js` |
| Раннер | `node js/calculator.excel.test.js` |
| Дата | 2026-10-01 |
| Node.js | v20.20.2 |
| Округление | ROUND_HALF_UP до 0.01 грн |
| **Итог** | **PASS** |

## Сводка

- Existing (Excel + business rules): **23/23**
- Robustness / edge cases: **36/36**
- Overall: **59/59**

## Existing checks

| Проверка | Статус |
|---|---|
| LEASING P=700000 R=0.288 n=12 annuity | PASS |
| LEASING P=700000 R=0.288 n=36 annuity | PASS |
| LEASING P=700000 R=0.288 n=36 classic | PASS |
| BUSINESS PURCHASE P=700000 R=0.2825 n=36 annuity | PASS |
| BUSINESS PURCHASE P=700000 R=0.2825 n=36 classic | PASS |
| BUSINESS BULLET P=700000 R=0.2825 n=36 | PASS |
| WORKING CAPITAL P=120000 R=0.2825 n=12 annuity | PASS |
| INDIVIDUAL P=120000 R=0.36 n=12 annuity | PASS |
| INDIVIDUAL P=120000 R=0.36 n=36 annuity | PASS |
| normalizePercentStep 23 → 25 | PASS |
| tariff demo rates (catalogue) | PASS |
| 1. Leasing advance 23% → 25% | PASS |
| 2. Leasing advance < 20 → min 20 | PASS |
| 3. Individual term 60 → clamp 36 | PASS |
| 4. Leasing Bullet unavailable | PASS |
| 5. Individual Bullet unavailable | PASS |
| 6. Business Bullet only if tariff allows | PASS |
| 7. Working capital down payment ignored | PASS |
| 8. Individual requestedLoan > LTV → clamp | PASS |
| 9. No active tariff → error (no demo-rate calc) | PASS |
| 10. Business amount 1 234 567 → 1 230 000 | PASS |
| 11. Exact midpoint rounds up | PASS |
| 12. Never negative closingBalance / last = 0 | PASS |

## Robustness / edge cases

| Проверка | Статус |
|---|---|
| R1. ZERO RATE annuity | PASS |
| R2. ROUNDING STRESS annuity | PASS |
| R2. ROUNDING STRESS classic | PASS |
| R3. Leasing term 12 | PASS |
| R3. Leasing term 60 | PASS |
| R3. Leasing term 11 → min 12 | PASS |
| R3. Leasing term 61 → max 60 | PASS |
| R3. Business term 3 | PASS |
| R3. Business term 60 | PASS |
| R3. Business term 2 → min 3 | PASS |
| R3. Business term 61 → max 60 | PASS |
| R3. Individual term 3 | PASS |
| R3. Individual term 36 | PASS |
| R3. Individual term 2 → min 3 | PASS |
| R3. Individual term 37 → max 36 | PASS |
| R4. Leasing amount = minAsset | PASS |
| R4. Leasing amount = maxAsset | PASS |
| R4. Leasing amount < min → clamp | PASS |
| R4. Leasing amount > max → clamp | PASS |
| R4. Business WC amount = min | PASS |
| R4. Business WC amount = max | PASS |
| R4. Business WC amount < min → clamp | PASS |
| R4. Business WC amount > max → clamp | PASS |
| R4. Business purchase amount = minAsset | PASS |
| R4. Business purchase amount = maxAsset | PASS |
| R4. Individual LTV caps over maxAmount | PASS |
| R4. Individual amount at min market / loan=0 handled | PASS |
| R5. principal = NaN | PASS |
| R5. principal = Infinity | PASS |
| R5. principal = -1000 | PASS |
| R5. principal = "" | PASS |
| R5. months = 0 | PASS |
| R5. months = NaN | PASS |
| R5. annualRate = NaN | PASS |
| R5. annualRate = Infinity | PASS |
| R5. annualRate < 0 | PASS |

## Как воспроизвести

```bash
node js/calculator.excel.test.js
```
