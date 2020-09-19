import csvtojsonV2 from "csvtojson";
import moment from "moment";

const budgetFilePath = "./data/budget.csv";
const investmentsFilePath = "./data/investments.csv";

let output = [];

let budget = await csvtojsonV2().fromFile(budgetFilePath);
let investments = await csvtojsonV2().fromFile(investmentsFilePath);

let budgetForAll = {};

const arrayToObject = (array) =>
  array.reduce((obj, item) => {
    const key = item.Sector.length ? item.Sector : item["Time Period"];
    if (key === "Month" || key === "Year") {
      budgetForAll[key] = item;
    } else {
      obj[key] = item;
    }
    return obj;
  }, {});

let _budget = arrayToObject(budget);

const budgetDefaultRules = _budget;
const budgetDefaultRulesForAll = budgetForAll;

const getMonth = (date) => {
  return moment(date, "DD-MM-YYYY").toDate().getMonth() + 1;
};

const validateInvestments = (investments) => {
  let totalInvestmentForMonth = 0;
  let previousMonth = 1;
  const validate = () => {
    for (let index = 0; index < investments.length; index++) {
      const investment = investments[index];
      const monthOfInvestment = getMonth(investment.Date);

      if (_budget[investment["Sector"]]) {
        //Continue for same month
        if (monthOfInvestment === previousMonth) {
          if (
            investment["Sector"].Sector === _budget[investment["Sector"].Sector]
          ) {
            //Compare
            if (
              (investment["Amount"] <= _budget[investment["Sector"]].Amount &&
                totalInvestmentForMonth <=
                  budgetDefaultRulesForAll["Month"].Amount) ||
              totalInvestmentForMonth <= budgetDefaultRules["FinTech"].Amount
            ) {
              //Do
              totalInvestmentForMonth += parseInt(investment["Amount"]);
              _budget[investment["Sector"]].Amount =
                _budget[investment["Sector"]].Amount - investment["Amount"];
              previousMonth = monthOfInvestment;
            } else {
              output.push(index + 1);
            }
          }
        } else {
          //Reset all rules
          totalInvestmentForMonth = 0;
          _budget = budgetDefaultRules;
          budgetForAll = budgetDefaultRulesForAll;
          if (
            investment["Sector"].Sector === _budget[investment["Sector"].Sector]
          ) {
            //Compare
            if (
              investment["Amount"] <= _budget[investment["Sector"]].Amount &&
              totalInvestmentForMonth <=
                budgetDefaultRulesForAll["Month"].Amount
            ) {
              //Do
              totalInvestmentForMonth += parseInt(investment["Amount"]);
              _budget[investment["Sector"]].Amount =
                _budget[investment["Sector"]].Amount - investment["Amount"];
              previousMonth = monthOfInvestment;
            } else {
              output.push(index + 1);
            }
          }
        }
      } else {
        //Search in common budget (budgetForAll) which are not present in rule
        totalInvestmentForMonth = 0;
        _budget = budgetDefaultRules;
        budgetForAll = budgetDefaultRulesForAll;
        if (
          investment.Amount <= budgetForAll["Month"].Amount &&
          totalInvestmentForMonth <= budgetDefaultRulesForAll["Month"].Amount
        ) {
          //Do investment
          totalInvestmentForMonth += parseInt(investment["Amount"]);
          budgetForAll["Month"].Amount =
            budgetForAll["Month"].Amount - investment["Amount"];
          previousMonth = monthOfInvestment;
        } else {
          output.push(index + 1);
        }
      }
    }
  };
  validate();
};

validateInvestments(investments);
console.log(output);
