import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
    this.props.onError?.(error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
            accessible={false}
          />
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>
            Ocorreu um erro inesperado. Tente novamente.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={this.handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
          >
            <Text style={styles.retryText}>Tentar novamente</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.gray[50],
    paddingHorizontal: spacing.phi5,
  },
  title: {
    ...typography.h2,
    color: colors.gray[900],
    marginTop: spacing.phi4,
  },
  message: {
    ...typography.body,
    color: colors.gray[500],
    textAlign: "center",
    marginTop: spacing.phi2,
    marginBottom: spacing.phi5,
  },
  retryButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.phi5,
    paddingVertical: spacing.phi3,
    borderRadius: 12,
  },
  retryText: {
    ...typography.body,
    color: colors.white,
    fontWeight: "600",
  },
});
