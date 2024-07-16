async function fetchTransactions() {
  try {
    let response = await fetch("http://localhost:3000/data");
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function displayTransactions() {
  const data = await fetchTransactions();
  const tableBody = $("#tableBody");

  if (!data || !Array.isArray(data.transactions)) {
    console.error("Invalid data format or no transactions found.");
    return;
  }

  tableBody.empty();

  data.transactions.forEach((transaction, index) => {
    const customer = data.customers.find(
      (c) => c.id === transaction.customer_id
    );
    const customerName = customer ? customer.name : "Unknown Customer";

    const row = `
      <tr>
        <th scope="row">${index + 1}</th>
        <td>${customerName}</td>
        <td>${transaction.date}</td>
        <td>${transaction.amount}</td>
      </tr>
    `;

    tableBody.append(row);
  });

  updateChart(data.transactions);

  $("#customerFilter, #amountFilter").on("keyup", function () {
    const customerFilterValue = $("#customerFilter").val().trim().toLowerCase();
    const amountFilterValue = $("#amountFilter").val().trim().toLowerCase();

    const filteredTransactions = data.transactions.filter((transaction) => {
      const customer = data.customers.find(
        (c) => c.id === transaction.customer_id
      );
      const customerName = customer ? customer.name.toLowerCase() : "";
      const transactionAmount = transaction.amount.toString().toLowerCase();

      const customerNameMatch = customerName.includes(customerFilterValue);
      const amountMatch = transactionAmount.includes(amountFilterValue);

      return customerNameMatch && amountMatch;
    });

    tableBody.empty();

    filteredTransactions.forEach((transaction, index) => {
      const customer = data.customers.find(
        (c) => c.id === transaction.customer_id
      );
      const customerName = customer ? customer.name : "Unknown Customer";

      const row = `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${customerName}</td>
          <td>${transaction.date}</td>
          <td>${transaction.amount}</td>
        </tr>
      `;

      tableBody.append(row);
    });

    const filteredTransactionsByCustomer = data.transactions.filter(
      (transaction) => {
        const customer = data.customers.find(
          (c) => c.id === transaction.customer_id
        );
        const customerName = customer ? customer.name.toLowerCase() : "";

        return customerName.includes(customerFilterValue);
      }
    );

    updateChart(filteredTransactionsByCustomer);
  });
}

function updateChart(transactions) {
  const chartData = {};
  transactions.forEach((transaction) => {
    const date = transaction.date;
    const amount = transaction.amount;

    if (!chartData[date]) {
      chartData[date] = 0;
    }
    chartData[date] += amount;
  });

  const chartLabels = Object.keys(chartData);
  const chartAmounts = Object.values(chartData);

  const ctx = document.getElementById("transactionChart").getContext("2d");

  if (window.myChart instanceof Chart) {
    window.myChart.destroy();
  }

  window.myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartLabels,
      datasets: [
        {
          label: "Total Transaction Amount",
          data: chartAmounts,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

$(document).ready(function () {
  displayTransactions();
});
