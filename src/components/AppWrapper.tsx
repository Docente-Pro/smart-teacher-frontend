import { ErrorBoundary } from "./ErrorBoundary";
import { BrowserRouter } from "react-router";
import { CustomAuth0Provider } from "@/providers/CustomAuth0Provider";
import { App } from "./App";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const AppWrapper = () => {
  // Config for Tanstack Query
  const queryClient = new QueryClient();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <CustomAuth0Provider>
            <App />
            <Toaster />
          </CustomAuth0Provider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
