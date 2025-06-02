const ajaxCall = (key, url, prompt) => {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      type: "POST",
      dataType: "json",
      data: JSON.stringify({
        model: "gpt-4o-mini",  // ✅ USE GPT-4O MINI
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
  }

  customElements.define("custom-widget", MainWebComponent);
})();
