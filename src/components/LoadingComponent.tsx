import { LoaderPinwheel } from "lucide-react";

function LoadingComponent() {
  return (
    <div className="flex items-center justify-center h-screen w-screen absolute top-0 left-0 bg-black bg-opacity-50 z-50">
      <LoaderPinwheel className="text-yellow-500 animate-spin w-12 h-12" />
    </div>
  );
}

export default LoadingComponent;
