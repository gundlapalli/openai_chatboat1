import { num } from "https://cdn.jsdelivr.net/npm/@gramex/ui/dist/format.js";
import { createChart } from "./chart.js";
import {
  hideLoader,
  scrollToBottom,
  addExcelButtonListener,
} from "./common.js";

export const getResultAndRender = async (question, mainDiv) => {
  try {
    // const response = await fetch(`query?question=${question}`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    // });

    // const formData = new FormData(event.target);
    const sqlResponse = await fetch("query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question }),
    });
   
    const sqlData = await sqlResponse.json();
    const queryString = sqlData['sql']
    const resultResponse = await fetch("result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sqlData),
    });
    const resultData = await resultResponse.json();

    if (!resultResponse.ok) {
      mainDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-16">Sorry! It's not a valid query, please try asking another query</div>`,
      );
      mainDiv.querySelector(".relevantQuestion").remove();
      hideLoader();
      scrollToBottom();
      return;
    }

    // const data = await sqlData.json();
    // const result = data.slice(0, -1);
    const result = resultData?.result || "";

    if (result.length > 0) {
      const tableHtml = `
        <ul class="list-group">
          <li class="list-group-item d-flex justify-content-between align-items-center">
            Result
            <span class="badge bg-primary rounded-pill">
              <button class="btn btn-sm button-excel" title="Export Table Data To Excel">
                <i class="bi bi-download text-white"></i>
              </button>
            </span>
          </li>
        </ul>
        <div class="tableDiv">
          <table class="table table-bordered">
            <thead>
              <tr>${Object.keys(result[0])
                .map((key) => `<th>${key}</th>`)
                .join("")}</tr>
            </thead>
            <tbody>
              ${result
                .map(
                  (row) => `
                <tr>${Object.values(row)
                  .map(
                    (value) => `<td>${isNaN(value) ? value : num(value)}</td>`,
                  )
                  .join("")}</tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <button class="btn btn-primary btn-sm mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${mainDiv.id}" aria-expanded="false" aria-controls="collapse${mainDiv.id}">
          View query
        </button>
        <div class="collapse" id="collapse${mainDiv.id}">
          <div class="card card-body">${queryString}</div>
        </div>
      `;

      createChart(result, mainDiv);
      mainDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-16">${tableHtml}</div>`,
      );
      const excelButton = mainDiv.querySelector(".button-excel");
      addExcelButtonListener(excelButton);
    } else {
      mainDiv.insertAdjacentHTML(
        "beforeend",
        `<div class="fs-16">Sorry! It's not a valid query, please try asking another query</div>`,
      );
      mainDiv.querySelector(".relevantQuestion").remove();
    }

    document.querySelector("[name='question']").value = "";
  } catch (error) {
    console.error("There was a problem with the POST request:", error);
  } finally {
    scrollToBottom();
    hideLoader();
  }
};
