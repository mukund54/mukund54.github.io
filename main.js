const ajaxCall = (url, prompt) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({ prompt: prompt }),
      success: function (response) {
        resolve(response.summary);
      },
      error: function (xhr, status, error) {
        console.error("❌ Summarize call failed:", xhr.status, error);
        reject(new Error("Proxy call failed."));
      }
    });
  });
};

const uploadCsvCall = (url, csvData, filename) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        csv: csvData,
        filename: filename || "summary.csv"
      }),
      success: function (response) {
        resolve(response.file_id);
      },
      error: function (xhr, status, error) {
        console.error("❌ CSV upload failed:", xhr.status, error);
        reject(new Error("CSV upload to Drive failed."));
      }
    });
  });
};

(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <style></style>
    <div id="root" style="width: 100%; height: 100%;"></div>
  `;

  class MainWebComponent extends HTMLElement {
    /**
     * Calls Flask proxy to summarize the input prompt.
     * @param {string} proxyUrl - URL of the Flask server /summarize
     * @param {string} prompt - Full prompt text to send
     * @returns {Promise<string>}
     */
    async summarize(proxyUrl, prompt) {
      return await ajaxCall(proxyUrl, prompt);
    }

    /**
     * Export comma-separated string as a downloadable CSV file
     * @param {string} csvData - The CSV-formatted string
     * @param {string} filename - Optional filename
     */
    exportToExcel(csvData, filename) {
      if (!csvData) return;

      try {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const csvUrl = URL.createObjectURL(blob);
        link.href = csvUrl;
        link.download = filename || "export.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error("❌ Export to Excel failed:", e.message);
        throw new Error("Export to Excel failed.");
      }
    }

    /**
     * Uploads CSV data to Google Drive via Flask proxy
     * @param {string} proxyUrl - URL of the Flask server /upload-csv
     * @param {string} csvData - The CSV-formatted string
     * @param {string} filename - Name to save the file as
     * @returns {Promise<string>} - Google Drive file ID
     */
    async uploadToDrive(proxyUrl, csvData, filename) {
      return await uploadCsvCall(proxyUrl, csvData, filename);
    }
  }

  customElements.define("custom-widget", MainWebComponent);
})();
