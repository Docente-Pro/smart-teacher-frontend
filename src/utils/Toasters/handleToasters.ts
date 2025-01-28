import { toast } from "sonner";

type typeOfToast = "success" | "error" | "warning" | "info";

export function handleToaster(message: string, type: typeOfToast) {
  switch (type) {
    case "success":
      toast.success(message, {
        style: {
          background: "green",
          color: "#fff",
        },
        className: "class",
      });
      break;
    case "error":
      toast.error(message, {
        style: {
          background: "red",
          color: "#fff",
        },
        className: "class",
      });
      break;
    case "warning":
      toast.warning(message, {
        style: {
          background: "yellow",
          color: "#fff",
        },
        className: "class",
      });
      break;
    case "info":
      toast.info(message, {
        style: {
          background: "blue",
          color: "#fff",
        },
        className: "class",
      });
      break;
    default:
      break;
  }
}
