/**
 * Modo temporário de integração: tratar dados já visíveis na app como válidos no backend
 * (atividades com chave estável appStableKey + snapshot na primeira reserva).
 */
function useExistingAppDataAsReal() {
  const v = (process.env.USE_EXISTING_APP_DATA_AS_REAL || "").trim().toLowerCase();
  if (!v) return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return v === "true" || v === "1" || v === "yes";
}

module.exports = {
  useExistingAppDataAsReal,
};
