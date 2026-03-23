export function openRisePayWindow(options: {
  title: string;
  qrCode?: string | null;
  checkoutUrl?: string | null;
  transactionId?: string | null;
  status?: string | null;
}) {
  if (options.checkoutUrl) {
    window.open(options.checkoutUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (!options.qrCode) {
    throw new Error("Rise Pay nao retornou checkoutUrl nem qrCode.");
  }

  const popup = window.open("", "_blank", "noopener,noreferrer");
  if (!popup) {
    throw new Error("Nao foi possivel abrir a janela de pagamento.");
  }

  const escapedQr = options.qrCode
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  popup.document.write(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${options.title}</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #081120;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 24px;
          }
          .card {
            width: 100%;
            max-width: 760px;
            background: #0f172a;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 24px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          h1 {
            margin-top: 0;
            font-size: 28px;
          }
          p {
            color: #cbd5e1;
            line-height: 1.6;
          }
          textarea {
            width: 100%;
            min-height: 220px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.12);
            background: #020617;
            color: #e2e8f0;
            padding: 16px;
            font-size: 14px;
            resize: vertical;
            box-sizing: border-box;
          }
          .meta {
            display: grid;
            gap: 12px;
            margin: 18px 0;
          }
          .meta div {
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 12px;
            padding: 12px 14px;
          }
          button {
            margin-top: 16px;
            background: #22c55e;
            color: #081120;
            border: 0;
            border-radius: 12px;
            padding: 12px 18px;
            font-weight: bold;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${options.title}</h1>
          <p>Copie o codigo PIX abaixo e finalize o pagamento no app do seu banco.</p>
          <div class="meta">
            ${options.transactionId ? `<div><strong>Transacao:</strong> ${options.transactionId}</div>` : ""}
            ${options.status ? `<div><strong>Status:</strong> ${options.status}</div>` : ""}
          </div>
          <textarea id="pix-code" readonly>${escapedQr}</textarea>
          <button id="copy-btn">Copiar codigo PIX</button>
        </div>
        <script>
          const btn = document.getElementById("copy-btn");
          const field = document.getElementById("pix-code");
          btn.addEventListener("click", async () => {
            try {
              await navigator.clipboard.writeText(field.value);
              btn.textContent = "Codigo copiado";
            } catch (err) {
              field.select();
              document.execCommand("copy");
              btn.textContent = "Codigo copiado";
            }
          });
        </script>
      </body>
    </html>
  `);
  popup.document.close();
}
