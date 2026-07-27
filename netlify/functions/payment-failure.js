/* ANTRA — Pay4U failure return (Netlify serverless function). */
exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body: `<!doctype html><meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <body style="margin:0;background:#0c0a0f;color:#ece6df;font-family:Georgia,serif;
        display:flex;min-height:100vh;align-items:center;justify-content:center;text-align:center">
        <div style="max-width:460px;padding:40px">
          <div style="font-size:52px;margin-bottom:14px">✕</div>
          <h1 style="font-weight:400;color:#c9a86a;margin:0 0 12px">Payment not completed</h1>
          <p style="color:#a89f93;line-height:1.6">No money was taken. You can try again whenever you’re ready.</p>
          <a href="/" style="display:inline-block;margin-top:26px;color:#0c0a0f;background:#c9a86a;
            text-decoration:none;padding:12px 26px;border-radius:10px">Back to Antra</a>
        </div></body>`,
  };
};
