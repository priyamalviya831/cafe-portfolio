import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  qrId?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
          <div className="max-w-md w-full bg-card shadow-lg rounded-2xl p-8 text-center">

            {/* Icon */}
            <div className="text-5xl mb-4">⚠️</div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Something went wrong
            </h1>

            {/* Message */}
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-5 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition"
              >
                Reload Page
              </button>

              <button
                onClick={() => {
                  const pathSegments = window.location.pathname.split("/");
                  const qrId = pathSegments[1];

                  if (qrId) {
                    window.location.href = `/${qrId}`;
                  } else {
                    window.location.href = "/";
                  }
                }}
                className="px-5 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };