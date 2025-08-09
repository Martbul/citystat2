import React from "react";
import { View, Text, ScrollView } from "react-native";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  timestamp?: string;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Structured logging
    console.group(
      "%c🚨 ErrorBoundary caught an error",
      "color: red; font-weight: bold;"
    );
    console.log("🕒 Timestamp:", this.state.timestamp);
    console.log("📄 Error message:", error.message);
    console.log("📄 Stack trace:", error.stack);
    console.log("🛠 Component stack:", errorInfo.componentStack);
    console.log("📦 Props snapshot:", this.props);
    console.groupEnd();

    // Optional: send to crash reporting service
    // Sentry.captureException(error, { extra: errorInfo });
  }

  renderDevErrorDetails() {
    if (__DEV__ && this.state.error) {
      return (
        <ScrollView
          style={{
            maxHeight: 200,
            marginTop: 10,
            backgroundColor: "#eee",
            padding: 8,
          }}
        >
          <Text
            style={{ fontSize: 12, fontFamily: "monospace", color: "#333" }}
          >
            {this.state.error.message}
          </Text>
          {this.state.error.stack && (
            <Text
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "#666",
                marginTop: 6,
              }}
            >
              {this.state.error.stack}
            </Text>
          )}
          {this.state.errorInfo?.componentStack && (
            <Text
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                color: "#666",
                marginTop: 6,
              }}
            >
              Component Stack:
              {this.state.errorInfo.componentStack}
            </Text>
          )}
        </ScrollView>
      );
    }
    return null;
  }

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: "#f5f5f5",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Something went wrong
          </Text>
          <Text
            style={{
              textAlign: "center",
              color: "#666",
            }}
          >
            The app encountered an error at {this.state.timestamp}.
          </Text>
          {this.renderDevErrorDetails()}
        </View>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

// import React from 'react';
// import { View, Text } from 'react-native';

// interface Props {
//   children: React.ReactNode;
// }

// interface State {
//   hasError: boolean;
//   error?: Error;
// }

// class ErrorBoundary extends React.Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError(error: Error): State {
//     return { hasError: true, error };
//   }

//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
//     console.log('Error caught:', error, errorInfo);
//     // You can also log to a crash reporting service here
//     // Example: Sentry.captureException(error, { extra: errorInfo });
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <View style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           padding: 20,
//           backgroundColor: '#f5f5f5'
//         }}>
//           <Text style={{
//             fontSize: 18,
//             fontWeight: 'bold',
//             marginBottom: 10,
//             textAlign: 'center'
//           }}>
//             Something went wrong
//           </Text>
//           <Text style={{
//             textAlign: 'center',
//             color: '#666',
//             marginBottom: 20
//           }}>
//             The app encountered an error. Please restart the app.
//           </Text>
//           {__DEV__ && this.state.error && (
//             <Text style={{
//               fontSize: 12,
//               color: '#999',
//               textAlign: 'center',
//               fontFamily: 'monospace'
//             }}>
//               {this.state.error.message}
//             </Text>
//           )}
//         </View>
//       );
//     }

//     return this.props.children;
//   }
// }

// export default ErrorBoundary;

// import React from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
// } from "react-native";
// import { StatusBar } from "expo-status-bar";
// import * as Clipboard from "expo-clipboard";
// import { LinearGradient } from "expo-linear-gradient";

// interface Props {
//   children: React.ReactNode;
//   fallback?: React.ComponentType<ErrorFallbackProps>;
//   onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
// }

// interface State {
//   hasError: boolean;
//   error?: Error;
//   errorInfo?: React.ErrorInfo;
//   errorId?: string;
// }

// interface ErrorFallbackProps {
//   error?: Error;
//   errorInfo?: React.ErrorInfo;
//   resetError: () => void;
//   errorId?: string;
// }

// class ErrorBoundary extends React.Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = {
//       hasError: false,
//       errorId: undefined,
//     };
//   }

//   //TODO: Add function to send the errro to loging servic

//   static getDerivedStateFromError(error: Error): State {
//     // Generate a unique error ID for tracking
//     const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     return {
//       hasError: true,
//       error,
//       errorId,
//     };
//   }

//   componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
//     // Enhanced logging with more context
//     const errorDetails = {
//       message: error.message,
//       stack: error.stack,
//       name: error.name,
//       componentStack: errorInfo.componentStack,
//       errorBoundary: "ErrorBoundary",
//       timestamp: new Date().toISOString(),
//       userAgent: navigator?.userAgent || "Unknown",
//       url: window?.location?.href || "React Native App",
//       errorId: this.state.errorId,
//     };

//     console.group("Error Boundary Caught Error");
//     console.error("Error:", error);
//     console.error("Error Info:", errorInfo);
//     console.error("Error Details:", errorDetails);
//     console.groupEnd();

//     // Store error info in state for display
//     this.setState({ errorInfo });

//     // Call custom error handler if provided
//     this.props.onError?.(error, errorInfo);

//     // Log to crash reporting service
//     // Example integrations:
//     // Sentry.captureException(error, { extra: errorDetails });
//     // Bugsnag.notify(error, event => { event.addMetadata('errorBoundary', errorDetails); });
//     // Firebase Crashlytics: crashlytics().recordError(error);
//   }

//   resetError = (): void => {
//     this.setState({
//       hasError: false,
//       error: undefined,
//       errorInfo: undefined,
//       errorId: undefined,
//     });
//   };

//   copyErrorToClipboard = async (): Promise<void> => {
//     if (this.state.error) {
//       const errorText = `
// Error ID: ${this.state.errorId}
// Time: ${new Date().toLocaleString()}
// Message: ${this.state.error.message}
// Stack: ${this.state.error.stack}
// Component Stack: ${this.state.errorInfo?.componentStack || "N/A"}
//       `.trim();

//       try {
//         await Clipboard.setStringAsync(errorText);
//         console.log("Error details copied to clipboard");
//       } catch (clipboardError) {
//         console.error("Failed to copy to clipboard:", clipboardError);
//       }
//     }
//   };

//   getErrorSeverity = (): "low" | "medium" | "high" => {
//     if (!this.state.error) return "low";

//     const errorMessage = this.state.error.message.toLowerCase();
//     const stack = this.state.error.stack?.toLowerCase() || "";

//     // High severity errors
//     if (
//       errorMessage.includes("network") ||
//       errorMessage.includes("fetch") ||
//       errorMessage.includes("timeout") ||
//       stack.includes("clerk") ||
//       stack.includes("mapbox")
//     ) {
//       return "high";
//     }

//     // Medium severity errors
//     if (
//       errorMessage.includes("render") ||
//       errorMessage.includes("component") ||
//       errorMessage.includes("hook")
//     ) {
//       return "medium";
//     }

//     return "low";
//   };

//   getErrorSuggestion = (): string => {
//     if (!this.state.error) return "";

//     const errorMessage = this.state.error.message.toLowerCase();
//     const stack = this.state.error.stack?.toLowerCase() || "";

//     if (stack.includes("clerk")) {
//       return "This appears to be an authentication error. Check your Clerk configuration and API keys.";
//     }

//     if (stack.includes("mapbox")) {
//       return "This appears to be a Mapbox error. Verify your Mapbox token and permissions.";
//     }

//     if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
//       return "This appears to be a network error. Check your internet connection and API endpoints.";
//     }

//     if (errorMessage.includes("permission")) {
//       return "This appears to be a permissions error. Check app permissions in device settings.";
//     }

//     return "Try restarting the app or contact support if the issue persists.";
//   };

//   render() {
//     if (this.state.hasError) {
//       // Use custom fallback if provided
//       if (this.props.fallback) {
//         const FallbackComponent = this.props.fallback;
//         return (
//           <FallbackComponent
//             error={this.state.error}
//             errorInfo={this.state.errorInfo}
//             resetError={this.resetError}
//             errorId={this.state.errorId}
//           />
//         );
//       }

//       const severity = this.getErrorSeverity();
//       const suggestion = this.getErrorSuggestion();

//       return (
//         <View style={styles.container}>
//           <StatusBar style="dark" />
//           <LinearGradient colors={["#ff6b6b", "#ee5a52"]} style={styles.header}>
//             <Text style={styles.headerTitle}>Oops! Something went wrong</Text>
//             <Text style={styles.headerSubtitle}>
//               Error ID: {this.state.errorId}
//             </Text>
//           </LinearGradient>

//           <ScrollView
//             style={styles.content}
//             showsVerticalScrollIndicator={false}
//           >
//             <View
//               style={[
//                 styles.severityBadge,
//               ]}
//             >
//               <Text style={styles.severityText}>
//                 {severity.toUpperCase()} PRIORITY
//               </Text>
//             </View>

//             <View style={styles.section}>
//               <Text style={styles.sectionTitle}>What happened?</Text>
//               <Text style={styles.description}>
//                 The app encountered an unexpected error and needs to be
//                 restarted.
//               </Text>
//               {suggestion ? (
//                 <Text style={styles.suggestion}>{suggestion}</Text>
//               ) : null}
//             </View>

//             {__DEV__ && this.state.error && (
//               <View style={styles.section}>
//                 <Text style={styles.sectionTitle}>
//                   Error Details (Development)
//                 </Text>
//                 <View style={styles.errorBox}>
//                   <Text style={styles.errorText}>
//                     <Text style={styles.errorLabel}>Message: </Text>
//                     {this.state.error.message}
//                   </Text>
//                   {this.state.error.stack && (
//                     <Text style={styles.errorText}>
//                       <Text style={styles.errorLabel}>Stack: </Text>
//                       {this.state.error.stack.substring(0, 500)}
//                       {this.state.error.stack.length > 500 ? "..." : ""}
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             )}

//             <View style={styles.actions}>
//               <TouchableOpacity
//                 style={[styles.button, styles.primaryButton]}
//                 onPress={this.resetError}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.primaryButtonText}>Try Again</Text>
//               </TouchableOpacity>

//               {__DEV__ && (
//                 <TouchableOpacity
//                   style={[styles.button, styles.secondaryButton]}
//                   onPress={this.copyErrorToClipboard}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.secondaryButtonText}>
//                     Copy Error Details
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>

//             <View style={styles.footer}>
//               <Text style={styles.footerText}>
//                 If this problem persists, please contact support with Error ID:{" "}
//                 {this.state.errorId}
//               </Text>
//             </View>
//           </ScrollView>
//         </View>
//       );
//     }

//     return this.props.children;
//   }
// }

// const { width } = Dimensions.get("window");

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f9fa",
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 30,
//     paddingHorizontal: 20,
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#ffffff",
//     textAlign: "center",
//     marginBottom: 8,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: "#ffffff",
//     opacity: 0.9,
//   },
//   content: {
//     flex: 1,
//     padding: 20,
//   },
//   severityBadge: {
//     alignSelf: "flex-start",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginBottom: 20,
//   },
//   severityHigh: {
//     backgroundColor: "#ff4757",
//   },
//   severityMedium: {
//     backgroundColor: "#ffa502",
//   },
//   severityLow: {
//     backgroundColor: "#747d8c",
//   },
//   severityText: {
//     color: "#ffffff",
//     fontSize: 12,
//     fontWeight: "bold",
//   },
//   section: {
//     marginBottom: 24,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#2c3e50",
//     marginBottom: 12,
//   },
//   description: {
//     fontSize: 16,
//     color: "#5a6c7d",
//     lineHeight: 24,
//     marginBottom: 12,
//   },
//   suggestion: {
//     fontSize: 14,
//     color: "#3498db",
//     fontStyle: "italic",
//     lineHeight: 20,
//   },
//   errorBox: {
//     backgroundColor: "#2c3e50",
//     padding: 16,
//     borderRadius: 8,
//     borderLeftWidth: 4,
//     borderLeftColor: "#e74c3c",
//   },
//   errorText: {
//     fontSize: 12,
//     color: "#ecf0f1",
//     fontFamily: "monospace",
//     marginBottom: 8,
//   },
//   errorLabel: {
//     fontWeight: "bold",
//     color: "#e74c3c",
//   },
//   actions: {
//     marginTop: 20,
//     gap: 12,
//   },
//   button: {
//     paddingVertical: 16,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   primaryButton: {
//     backgroundColor: "#3498db",
//     shadowColor: "#3498db",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 4,
//   },
//   primaryButtonText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   secondaryButton: {
//     backgroundColor: "#ecf0f1",
//     borderWidth: 1,
//     borderColor: "#bdc3c7",
//   },
//   secondaryButtonText: {
//     color: "#2c3e50",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   footer: {
//     marginTop: 40,
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#ecf0f1",
//   },
//   footerText: {
//     fontSize: 12,
//     color: "#95a5a6",
//     textAlign: "center",
//     lineHeight: 18,
//   },
// });

// export default ErrorBoundary;

// // Usage examples:

// // Basic usage (same as before):
// // <ErrorBoundary>
// //   <App />
// // </ErrorBoundary>

// // With custom error handler:
// // <ErrorBoundary
// //   onError={(error, errorInfo) => {
// //     // Send to analytics
// //     analytics.track('Error Boundary Triggered', {
// //       error: error.message,
// //       stack: error.stack,
// //       componentStack: errorInfo.componentStack
// //     });
// //   }}
// // >
// //   <App />
// // </ErrorBoundary>

// // With custom fallback component:
// // const CustomErrorFallback: React.FC<ErrorFallbackProps> = ({
// //   error,
// //   resetError,
// //   errorId
// // }) => (
// //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
// //     <Text>Custom error UI</Text>
// //     <TouchableOpacity onPress={resetError}>
// //       <Text>Reset</Text>
// //     </TouchableOpacity>
// //   </View>
// // );
// //
// // <ErrorBoundary fallback={CustomErrorFallback}>
// //   <App />
// // </ErrorBoundary>

// // import React from 'react';
// // import { View, Text } from 'react-native';

// // interface Props {
// //   children: React.ReactNode;
// // }

// // interface State {
// //   hasError: boolean;
// //   error?: Error;
// // }

// // class ErrorBoundary extends React.Component<Props, State> {
// //   constructor(props: Props) {
// //     super(props);
// //     this.state = { hasError: false };
// //   }

// //   static getDerivedStateFromError(error: Error): State {
// //     return { hasError: true, error };
// //   }

// //   componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
// //     console.log('Error caught:', error, errorInfo);
// //     // You can also log to a crash reporting service here
// //     // Example: Sentry.captureException(error, { extra: errorInfo });
// //   }

// //   render() {
// //     if (this.state.hasError) {
// //       return (
// //         <View style={{
// //           flex: 1,
// //           justifyContent: 'center',
// //           alignItems: 'center',
// //           padding: 20,
// //           backgroundColor: '#f5f5f5'
// //         }}>
// //           <Text style={{
// //             fontSize: 18,
// //             fontWeight: 'bold',
// //             marginBottom: 10,
// //             textAlign: 'center'
// //           }}>
// //             Something went wrong
// //           </Text>
// //           <Text style={{
// //             textAlign: 'center',
// //             color: '#666',
// //             marginBottom: 20
// //           }}>
// //             The app encountered an error. Please restart the app.
// //           </Text>
// //           {__DEV__ && this.state.error && (
// //             <Text style={{
// //               fontSize: 12,
// //               color: '#999',
// //               textAlign: 'center',
// //               fontFamily: 'monospace'
// //             }}>
// //               {this.state.error.message}
// //             </Text>
// //           )}
// //         </View>
// //       );
// //     }

// //     return this.props.children;
// //   }
// // }

// // export default ErrorBoundary;
