import fs from "fs";
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
console.log(_budget);
console.log(budgetForAll);

const budgetDefaultRules = _budget;
const budgetDefaultRulesForALl = budgetForAll;

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
        if (monthOfInvestment === previousMonth) {
          if (
            investment["Sector"].Sector === _budget[investment["Sector"].Sector]
          ) {
            console.log("Found investment in", investment["Sector"]);
            //Compare
            //Fix bug here
            console.log(
              "Total investment -------------------------------- ",
              totalInvestmentForMonth
            );
            console.log(
              "Rule amount --------------------------------------",
              budgetDefaultRules[investment["Sector"]].Amount
            );

            console.log(
              "Rule amount --------------------------------------",
              budgetDefaultRulesForALl
            );

            if (budgetDefaultRules[investment["Sector"]] === "FinTech") {
              console.log("Got it");
            }

            if (
              (investment["Amount"] <= _budget[investment["Sector"]].Amount &&
                totalInvestmentForMonth <=
                  budgetDefaultRulesForALl["Month"].Amount) ||
              totalInvestmentForMonth <= budgetDefaultRules["FinTech"].Amount
            ) {
              console.log("Month of investment", monthOfInvestment);
              console.log("Valid", index);
              //Do
              totalInvestmentForMonth += parseInt(investment["Amount"]);
              _budget[investment["Sector"]].Amount =
                _budget[investment["Sector"]].Amount - investment["Amount"];

              console.log("Remaining", _budget[investment["Sector"]].Amount);
              console.log("Investment in this month", totalInvestmentForMonth);
              console.log("=================================================");
              previousMonth = monthOfInvestment;
              console.log("Before month", previousMonth);
            } else {
              console.log("Error ()()(((((((((((((((((((((((((((((((((((((");
              console.log("Not valid", index);
              output.push(index + 1);
            }
          }
        } else {
          //Reset all rules
          console.log(
            "Started ====================================== Different Month"
          );
          totalInvestmentForMonth = 0;
          _budget = budgetDefaultRules;
          budgetForAll = budgetDefaultRulesForALl;
          if (
            investment["Sector"].Sector === _budget[investment["Sector"].Sector]
          ) {
            console.log("Found investment in", investment["Sector"]);
            //Compare

            console.log("```````````````````````````````````````````````");
            console.log("Total investment", totalInvestmentForMonth);
            console.log("Rule", budgetDefaultRulesForALl["Month"]);
            if (
              investment["Amount"] <= _budget[investment["Sector"]].Amount &&
              totalInvestmentForMonth <=
                budgetDefaultRulesForALl["Month"].Amount
            ) {
              console.log("Month of investment", monthOfInvestment);
              console.log("Valid", index);
              //Do
              totalInvestmentForMonth += parseInt(investment["Amount"]);
              _budget[investment["Sector"]].Amount =
                _budget[investment["Sector"]].Amount - investment["Amount"];

              console.log("Remaining", _budget[investment["Sector"]].Amount);
              console.log("Investment in this month", totalInvestmentForMonth);
              console.log("=================================================");
              previousMonth = monthOfInvestment;
              console.log("Before month", previousMonth);
            } else {
              console.log("Not valid", index);
              output.push(index + 1);
            }
          }
        }
      } else {
        //Search in common budget (budgetForALl) which are not present in rule
        console.log(investment);
        totalInvestmentForMonth = 0;
        _budget = budgetDefaultRules;
        budgetForAll = budgetDefaultRulesForALl;

        console.log("-----------------------------------");
        console.log(_budget[investment["Sector"]]);
        if (
          investment.Amount <= budgetForAll["Month"].Amount &&
          totalInvestmentForMonth <= budgetDefaultRulesForALl["Month"].Amount
        ) {
          console.log("Making investment");
          console.log("Month of investment", monthOfInvestment);
          console.log("Valid", index);
          //Do investment
          console.log("Found investment in", investment["Sector"]);
          totalInvestmentForMonth += parseInt(investment["Amount"]);
          budgetForAll["Month"].Amount =
            budgetForAll["Month"].Amount - investment["Amount"];
          console.log("Remaining", budgetForAll["Month"].Amount);
          console.log("Investment in this month", totalInvestmentForMonth);
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

/* const monthOfInvestment = moment(investment.Date, "DD-MM-YYYY").toDate().getMonth() + 1; */
