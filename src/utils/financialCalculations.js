/**
 * InvestWise - Financial Appraisal Calculation Engine
 * Implements rigorous mathematical algorithms for NPV, IRR, Payback Period, ROI, and Break-Even Analysis.
 */

/**
 * Calculates Net Present Value (NPV)
 * @param {number} initialInvestment - Outflow at Year 0 (positive number)
 * @param {Array<number>} cashFlows - Array of net cash flows for years 1..n
 * @param {number} discountRate - Percentage (e.g. 10 for 10%)
 * @returns {object} { npv, pvOfInflows, profitabilityIndex, discountedCashFlows, isProfitable }
 */
export function calculateNPV(initialInvestment, cashFlows, discountRate) {
  const r = (Number(discountRate) || 0) / 100;
  const c0 = Number(initialInvestment) || 0;
  
  const discountedCashFlows = cashFlows.map((cf, idx) => {
    const year = idx + 1;
    const factor = Math.pow(1 + r, year);
    const dcf = (Number(cf) || 0) / factor;
    return {
      year,
      nominal: Number(cf) || 0,
      discountFactor: factor > 0 ? 1 / factor : 0,
      discounted: dcf,
    };
  });

  const pvOfInflows = discountedCashFlows.reduce((sum, item) => sum + item.discounted, 0);
  const npv = pvOfInflows - c0;
  const profitabilityIndex = c0 > 0 ? pvOfInflows / c0 : (pvOfInflows > 0 ? Infinity : 0);

  return {
    npv,
    pvOfInflows,
    profitabilityIndex,
    discountedCashFlows,
    isProfitable: npv > 0,
  };
}

/**
 * Evaluates NPV for a continuous rate r (as decimal)
 */
function npvAtRate(c0, cashFlows, r) {
  let sum = -c0;
  for (let i = 0; i < cashFlows.length; i++) {
    const year = i + 1;
    sum += (Number(cashFlows[i]) || 0) / Math.pow(1 + r, year);
  }
  return sum;
}

/**
 * Evaluates derivative of NPV with respect to r
 */
function npvDerivative(cashFlows, r) {
  let sum = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    const year = i + 1;
    sum -= (year * (Number(cashFlows[i]) || 0)) / Math.pow(1 + r, year + 1);
  }
  return sum;
}

/**
 * Calculates Internal Rate of Return (IRR) using Hybrid Newton-Raphson + Bisection
 * @param {number} initialInvestment - Initial outflow (positive number)
 * @param {Array<number>} cashFlows - Array of net cash flows for years 1..n
 * @returns {object} { irr, status, message }
 */
export function calculateIRR(initialInvestment, cashFlows) {
  const c0 = Number(initialInvestment) || 0;
  const flows = cashFlows.map((c) => Number(c) || 0);

  if (c0 <= 0) {
    return { irr: null, status: 'invalid', message: 'Initial investment must be greater than zero.' };
  }

  const positiveFlows = flows.filter((c) => c > 0);
  if (positiveFlows.length === 0) {
    return { irr: null, status: 'no_return', message: 'No positive cash inflows generated.' };
  }

  const totalInflow = flows.reduce((sum, c) => sum + c, 0);
  if (totalInflow <= 0) {
    return { irr: null, status: 'negative_return', message: 'Total cash flows are negative or zero.' };
  }

  // Check sign changes for Descartes rule of signs
  const fullFlows = [-c0, ...flows];
  let signChanges = 0;
  for (let i = 1; i < fullFlows.length; i++) {
    if ((fullFlows[i - 1] < 0 && fullFlows[i] > 0) || (fullFlows[i - 1] > 0 && fullFlows[i] < 0)) {
      signChanges++;
    }
  }

  // Newton-Raphson Attempt
  let rate = 0.12; // Initial guess 12%
  const maxIterations = 80;
  const tolerance = 1e-6;
  let converged = false;

  for (let i = 0; i < maxIterations; i++) {
    if (rate <= -0.999) rate = -0.99;
    const npv = npvAtRate(c0, flows, rate);
    if (Math.abs(npv) < tolerance) {
      converged = true;
      break;
    }
    const deriv = npvDerivative(flows, rate);
    if (Math.abs(deriv) < 1e-9) {
      break; // Derivative flat, switch to bisection
    }
    const nextRate = rate - npv / deriv;
    if (Math.abs(nextRate - rate) < tolerance) {
      rate = nextRate;
      converged = true;
      break;
    }
    rate = nextRate;
  }

  // If Newton-Raphson didn't settle nicely within reasonable bounds (-0.9 to 10.0), use Bisection
  if (!converged || rate < -0.9 || rate > 10.0 || isNaN(rate)) {
    let low = -0.95;
    let high = 5.0; // 500%
    const npvLow = npvAtRate(c0, flows, low);
    const npvHigh = npvAtRate(c0, flows, high);

    // If root is bracketed
    if (npvLow * npvHigh <= 0) {
      for (let i = 0; i < 100; i++) {
        const mid = (low + high) / 2;
        const npvMid = npvAtRate(c0, flows, mid);
        if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) {
          rate = mid;
          converged = true;
          break;
        }
        if (npvLow * npvMid < 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
    }
  }

  if (converged && !isNaN(rate) && rate > -1.0) {
    const irrPercentage = rate * 100;
    return {
      irr: Math.round(irrPercentage * 100) / 100,
      rateDecimal: rate,
      status: 'success',
      hasMultipleRoots: signChanges > 1,
      message: signChanges > 1 ? 'Multiple sign changes detected; this is the primary internal rate.' : 'Valid IRR identified.',
    };
  }

  return {
    irr: null,
    status: 'unconverged',
    message: 'Could not calculate a unique rate of return within standard bounds (-90% to 500%).',
  };
}

/**
 * Calculates Payback Period (both Undiscounted and Discounted)
 * @param {number} initialInvestment - Outflow at Year 0
 * @param {Array<number>} cashFlows - Array of net cash flows
 * @param {number} discountRate - Percentage for discounted payback
 * @returns {object} { paybackYears, isRecovered, discountedPaybackYears, isDiscountedRecovered, cumulativeCashFlows }
 */
export function calculatePaybackPeriod(initialInvestment, cashFlows, discountRate = 10) {
  const c0 = Number(initialInvestment) || 0;
  const r = (Number(discountRate) || 0) / 100;

  let cumulative = 0;
  let cumulativeDiscounted = 0;
  let paybackYears = null;
  let discountedPaybackYears = null;

  const cumulativeCashFlows = [];

  for (let i = 0; i < cashFlows.length; i++) {
    const year = i + 1;
    const nominal = Number(cashFlows[i]) || 0;
    const factor = Math.pow(1 + r, year);
    const discounted = factor > 0 ? nominal / factor : 0;

    const prevCumulative = cumulative;
    cumulative += nominal;

    const prevCumulativeDiscounted = cumulativeDiscounted;
    cumulativeDiscounted += discounted;

    // Check undiscounted recovery
    if (paybackYears === null && cumulative >= c0 && c0 > 0) {
      if (nominal > 0) {
        const unrecovered = c0 - prevCumulative;
        const fraction = Math.min(Math.max(unrecovered / nominal, 0), 1);
        paybackYears = Math.round(((year - 1) + fraction) * 100) / 100;
      } else {
        paybackYears = year;
      }
    }

    // Check discounted recovery
    if (discountedPaybackYears === null && cumulativeDiscounted >= c0 && c0 > 0) {
      if (discounted > 0) {
        const unrecovered = c0 - prevCumulativeDiscounted;
        const fraction = Math.min(Math.max(unrecovered / discounted, 0), 1);
        discountedPaybackYears = Math.round(((year - 1) + fraction) * 100) / 100;
      } else {
        discountedPaybackYears = year;
      }
    }

    cumulativeCashFlows.push({
      year,
      nominal,
      cumulative,
      discounted,
      cumulativeDiscounted,
      balanceRemaining: Math.max(0, c0 - cumulative),
      discountedBalanceRemaining: Math.max(0, c0 - cumulativeDiscounted),
    });
  }

  return {
    paybackYears,
    isRecovered: paybackYears !== null,
    discountedPaybackYears,
    isDiscountedRecovered: discountedPaybackYears !== null,
    cumulativeCashFlows,
  };
}

/**
 * Calculates Return on Investment (ROI)
 * @param {number} initialInvestment - Initial project cost
 * @param {number} totalInflows - Sum of all benefits/inflows
 * @param {number} totalOperatingCosts - Sum of all annual operational costs
 * @param {number} years - Duration in years
 * @returns {object} { netProfit, totalCost, roiPercentage, capitalRoiPercentage, annualizedRoi }
 */
export function calculateROI(initialInvestment, totalInflows, totalOperatingCosts = 0, years = 5) {
  const c0 = Number(initialInvestment) || 0;
  const benefits = Number(totalInflows) || 0;
  const opex = Number(totalOperatingCosts) || 0;
  const n = Math.max(Number(years) || 1, 1);

  const totalCost = c0 + opex;
  const netProfit = benefits - totalCost;

  // ROI on Total Cost: (Net Profit / Total Cost) * 100
  const roiPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

  // ROI on Initial Capital Investment: (Net Cash Flow / Initial Investment) * 100
  const capitalRoiPercentage = c0 > 0 ? ((benefits - opex - c0) / c0) * 100 : 0;

  // Annualized ROI = ((1 + Total ROI / 100) ^ (1 / n) - 1) * 100
  let annualizedRoi = null;
  if (totalCost > 0 && benefits > 0) {
    const totalReturnRatio = benefits / totalCost;
    if (totalReturnRatio > 0) {
      annualizedRoi = (Math.pow(totalReturnRatio, 1 / n) - 1) * 100;
    }
  }

  return {
    netProfit,
    totalBenefits: benefits,
    totalCost,
    totalOperatingCosts: opex,
    roiPercentage: Math.round(roiPercentage * 100) / 100,
    capitalRoiPercentage: Math.round(capitalRoiPercentage * 100) / 100,
    annualizedRoi: annualizedRoi !== null ? Math.round(annualizedRoi * 100) / 100 : 0,
  };
}

/**
 * Calculates Break-Even Analysis
 * @param {number} fixedCosts - Total annual fixed costs
 * @param {number} sellingPrice - Selling price per unit
 * @param {number} variableCost - Variable cost per unit
 * @param {number} projectedSalesUnits - Optional projected unit sales
 * @returns {object} { contributionMargin, contributionMarginRatio, breakEvenUnits, breakEvenRevenue, marginOfSafetyUnits, marginOfSafetyPercentage, isValid, errorMessage }
 */
export function calculateBreakEven(fixedCosts, sellingPrice, variableCost, projectedSalesUnits = 0) {
  const fc = Number(fixedCosts) || 0;
  const p = Number(sellingPrice) || 0;
  const v = Number(variableCost) || 0;
  const qProj = Number(projectedSalesUnits) || 0;

  if (p <= 0) {
    return {
      isValid: false,
      errorMessage: 'Selling price per unit must be greater than zero.',
      contributionMargin: 0,
      contributionMarginRatio: 0,
      breakEvenUnits: 0,
      breakEvenRevenue: 0,
    };
  }

  if (p <= v) {
    return {
      isValid: false,
      errorMessage: 'Selling price must be strictly greater than variable cost per unit for positive contribution margin.',
      contributionMargin: p - v,
      contributionMarginRatio: ((p - v) / p) * 100,
      breakEvenUnits: Infinity,
      breakEvenRevenue: Infinity,
    };
  }

  const contributionMargin = p - v;
  const contributionMarginRatio = (contributionMargin / p) * 100;
  const breakEvenUnits = fc > 0 ? Math.ceil(fc / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * p;

  let marginOfSafetyUnits = 0;
  let marginOfSafetyPercentage = 0;

  if (qProj > 0) {
    marginOfSafetyUnits = Math.max(0, qProj - breakEvenUnits);
    marginOfSafetyPercentage = qProj > 0 ? (marginOfSafetyUnits / qProj) * 100 : 0;
  }

  return {
    isValid: true,
    fixedCosts: fc,
    sellingPrice: p,
    variableCost: v,
    contributionMargin: Math.round(contributionMargin * 100) / 100,
    contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
    breakEvenUnits,
    breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
    marginOfSafetyUnits,
    marginOfSafetyPercentage: Math.round(marginOfSafetyPercentage * 100) / 100,
  };
}

/**
 * Runs complete analysis suite on a project object
 * @param {object} project 
 * @returns {object} Calculated metrics bundle
 */
export function analyzeProject(project) {
  const initial = Number(project.initialInvestment) || 0;
  const discountRate = Number(project.discountRate) || 10;
  const duration = Number(project.duration) || (project.cashFlows?.length || 5);

  // Derive net cash flows
  const cashFlows = (project.cashFlows || []).map((cf) => {
    if (typeof cf === 'number') return cf;
    const inflow = Number(cf.inflow) || 0;
    const outflow = Number(cf.outflow) || 0;
    return inflow - outflow;
  });

  const totalInflows = (project.cashFlows || []).reduce((sum, cf) => {
    return sum + (typeof cf === 'number' ? (cf > 0 ? cf : 0) : Number(cf.inflow || 0));
  }, 0);

  const totalOpex = (project.cashFlows || []).reduce((sum, cf) => {
    return sum + (typeof cf === 'number' ? 0 : Number(cf.outflow || 0));
  }, 0);

  const npvResult = calculateNPV(initial, cashFlows, discountRate);
  const irrResult = calculateIRR(initial, cashFlows);
  const paybackResult = calculatePaybackPeriod(initial, cashFlows, discountRate);
  const roiResult = calculateROI(initial, totalInflows, totalOpex, duration);
  const breakEvenResult = calculateBreakEven(
    project.fixedCosts || 0,
    project.sellingPrice || 0,
    project.variableCost || 0,
    project.projectedUnits || 0
  );

  // Overall feasibility evaluation
  let feasibilityScore = 0;
  const reasons = [];

  if (npvResult.npv > 0) {
    feasibilityScore += 30;
    reasons.push('Positive NPV adds enterprise value.');
  } else {
    reasons.push('Negative NPV indicates value destruction at current discount rate.');
  }

  if (irrResult.irr !== null && irrResult.irr >= discountRate) {
    feasibilityScore += 25;
    reasons.push(`IRR (${irrResult.irr}%) exceeds hurdle rate (${discountRate}%).`);
  } else if (irrResult.irr !== null) {
    reasons.push(`IRR (${irrResult.irr}%) is below hurdle rate (${discountRate}%).`);
  }

  if (paybackResult.isRecovered && paybackResult.paybackYears <= duration * 0.7) {
    feasibilityScore += 20;
    reasons.push(`Capital recovered within ${paybackResult.paybackYears} years.`);
  } else if (paybackResult.isRecovered) {
    feasibilityScore += 10;
    reasons.push(`Payback achieved near the end of project lifecycle (${paybackResult.paybackYears} years).`);
  } else {
    reasons.push('Investment is not recouped within the analysis horizon.');
  }

  if (roiResult.roiPercentage > 15) {
    feasibilityScore += 15;
    reasons.push(`Healthy ROI of ${roiResult.roiPercentage}%.`);
  } else if (roiResult.roiPercentage > 0) {
    feasibilityScore += 8;
    reasons.push(`Modest positive ROI of ${roiResult.roiPercentage}%.`);
  }

  if (breakEvenResult.isValid && breakEvenResult.breakEvenUnits > 0) {
    feasibilityScore += 10;
    reasons.push(`Break-even volume requires ${breakEvenResult.breakEvenUnits.toLocaleString()} units.`);
  }

  let verdict = 'Viable';
  let badgeColor = 'emerald';
  if (feasibilityScore >= 75) {
    verdict = 'Highly Attractive';
    badgeColor = 'emerald';
  } else if (feasibilityScore >= 50) {
    verdict = 'Financially Viable';
    badgeColor = 'teal';
  } else if (feasibilityScore >= 30) {
    verdict = 'Marginal / High Risk';
    badgeColor = 'amber';
  } else {
    verdict = 'Unviable / Reject';
    badgeColor = 'rose';
  }

  return {
    npv: npvResult,
    irr: irrResult,
    payback: paybackResult,
    roi: roiResult,
    breakEven: breakEvenResult,
    feasibility: {
      score: feasibilityScore,
      verdict,
      badgeColor,
      reasons,
    },
  };
}
