const ajaxCall = (key, url, prompt) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      dataType: "json",
      data: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
        temperature: 0.7,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      crossDomain: true,
      success: function (response, status, xhr) {
        resolve({ response, status, xhr });
      },
      error: function (xhr, status, error) {
        const err = new Error("xhr error");
        err.status = xhr.status;
        reject(err);
      },
    });
  });
};

const url = "https://api.openai.com/v1/chat/completions";

(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style></style>
    <div id="root" style="width: 100%; height: 100%;"></div>
  `;

  class MainWebComponent extends HTMLElement {
    async post(apiKey, prompt) {
      const { response } = await ajaxCall(apiKey, url, prompt);
      return response.choices[0].message.content;
    }

    /**
     * Accepts a comma-separated string and triggers download as Excel-compatible .csv
     * @param {string} csvData - The comma-separated string (e.g., "Header1,Header2\\nRow1,Row2")
     * @param {string} [filename] - Optional filename (default: "summary.csv")
     */
    exportToExcel(csvData, filename) {
      if (!csvData) return;

      var blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      var downloadLink = document.createElement("a");
      var url = URL.createObjectURL(blob);
      downloadLink.setAttribute("href", url);
      downloadLink.setAttribute("download", filename || "summary.csv");
      downloadLink.style.display = "none";
      this.shadowRoot.appendChild(downloadLink);
      downloadLink.click();
      this.shadowRoot.removeChild(downloadLink);
    }
  }

  customElements.define("custom-widget", MainWebComponent);
})();
