import * as UIkit from "uikit";
import { Lang } from "./lang";
export const logify = (setting, msg) => {
  let direction = "rtl";
  if (msg)
    if (!Lang.isUnicode(msg)) {
      direction = "ltr";
    }
  UIkit.notification({
    message: `<span style = "direction: ${direction} !important; 
        text-align: ${direction === "rtl" ? "right" : "left"}">
        <span uk-icon="icon: ${
          setting["icon"]
            ? setting["icon"]
            : setting?.status
            ? setting.status === "warning" || setting.status === "danger"
              ? "circle-wrong"
              : "circle-correct"
            : "circle-correct"
        }" ></span>
        <span 
         style="font-size: 13px; " > ${msg} </span>
          </span>`,
    status: setting["status"] || "primary",
    timeout: setting["timeout"] || 3500,
    pos: setting["pos"] || "bottom-center",
  });
};
